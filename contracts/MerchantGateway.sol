// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * MerchantGatewayUpgradable with Staking Revenue Route (flat 0.3%)
 * - UUPS upgradable
 * - Flat fee default 0.3% (feeBps = 30)
 * - 100% fee dikirim ke staking pool (transfer atau transfer+notify)
 */

import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

interface IStakingReceiver {
    // Sesuaikan dengan staking kamu: bisa notifyRevenue / notifyRewardAmount / addReward
    function notifyRevenue(uint256 amount) external;
}

contract MerchantGatewayUp is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;

    IERC20Upgradeable public token;        // IDT
    uint16  public feeBps;                 // default 30 (0.3%)
    uint16  public constant MAX_FEE_BPS = 1000; // guard 10%
    mapping(address => bool) public isMerchant;

    // Staking receiver
    address public stakingReceiver;        // kontrak staking tujuan
    enum ForwardMode { TransferOnly, TransferAndNotify }
    ForwardMode public forwardMode;        // default TransferOnly (lebih aman)

    // Penampung fee (kalau pakai batch/sweep)
    uint256 public accruedFee;             // total fee tersimpan di gateway (IDT)

    event MerchantSet(address indexed merchant, bool active);
    event FeeSet(uint16 feeBps);
    event StakingReceiverSet(address indexed receiver, ForwardMode mode);
    event Payment(
        address indexed payer,
        address indexed merchant,
        uint256 grossAmount,
        uint256 feeAmount,
        string  invoiceId,
        string  memo,
        bytes32 qrHash
    );
    event FeeRoutedToStaking(uint256 amount, bool immediate);
    event Swept(uint256 amount);

    // ===== initializer =====
    function initialize(
        address _token,
        address _owner,
        uint16  _feeBps,          // pasang 30 (0.3%)
        address _stakingReceiver,  // kontrak staking
        ForwardMode _mode          // TransferOnly / TransferAndNotify
    ) external initializer {
        require(_token != address(0), "ZERO_TOKEN");
        require(_owner != address(0), "ZERO_OWNER");
        require(_feeBps <= MAX_FEE_BPS, "FEE_TOO_HIGH");

        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        token = IERC20Upgradeable(_token);
        feeBps = _feeBps;
        stakingReceiver = _stakingReceiver;
        forwardMode = _mode;

        _transferOwnership(_owner);

        emit FeeSet(_feeBps);
        emit StakingReceiverSet(_stakingReceiver, _mode);
    }

    function _authorizeUpgrade(address newImpl) internal override onlyOwner {}

    // ===== Admin =====
    function setMerchant(address merchant, bool active) external onlyOwner {
        require(merchant != address(0), "ZERO_ADDR");
        isMerchant[merchant] = active;
        emit MerchantSet(merchant, active);
    }

    function setFeeBps(uint16 bps) external onlyOwner {
        require(bps <= MAX_FEE_BPS, "FEE_TOO_HIGH");
        feeBps = bps;
        emit FeeSet(bps);
    }

    function setStakingReceiver(address receiver, ForwardMode mode_) external onlyOwner {
        require(receiver != address(0), "ZERO_ADDR");
        stakingReceiver = receiver;
        forwardMode = mode_;
        emit StakingReceiverSet(receiver, mode_);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // ===== Core =====
    function pay(
        address merchant,
        uint256 amount,
        string calldata invoiceId,
        string calldata memo,
        bytes32 qrHash
    ) external whenNotPaused nonReentrant {
        require(isMerchant[merchant], "MERCHANT_NOT_ACTIVE");
        require(amount > 0, "ZERO_AMOUNT");

        // tarik dana dari payer
        token.safeTransferFrom(msg.sender, address(this), amount);

        // hitung fee + net
        uint256 fee = (amount * feeBps) / 10_000;
        uint256 net = amount - fee;

        // route fee ke staking (langsung / simpan lalu sweep)
        if (fee > 0) {
            _routeFeeToStaking(fee);
        }

        // kirim net ke merchant
        token.safeTransfer(merchant, net);

        emit Payment(msg.sender, merchant, amount, fee, invoiceId, memo, qrHash);
    }

    function payMerchantToMerchant(
        address toMerchant,
        uint256 amount,
        string calldata invoiceId,
        string calldata memo,
        bytes32 qrHash
    ) external whenNotPaused nonReentrant {
        require(isMerchant[msg.sender], "SENDER_NOT_MERCHANT");
        require(isMerchant[toMerchant], "RECIPIENT_NOT_MERCHANT");
        require(amount > 0, "ZERO_AMOUNT");

        token.safeTransferFrom(msg.sender, address(this), amount);

        uint256 fee = (amount * feeBps) / 10_000;
        uint256 net = amount - fee;

        if (fee > 0) {
            _routeFeeToStaking(fee);
        }

        token.safeTransfer(toMerchant, net);

        emit Payment(msg.sender, toMerchant, amount, fee, invoiceId, memo, qrHash);
    }

    // ===== Routing fee =====
    function _routeFeeToStaking(uint256 fee) internal {
        address recv = stakingReceiver;
        require(recv != address(0), "NO_STAKING");

        if (forwardMode == ForwardMode.TransferOnly) {
            // Kumpulkan dulu, admin panggil sweep() periodik → lebih murah gas per transaksi
            accruedFee += fee;
            emit FeeRoutedToStaking(fee, false);
        } else {
            // Transfer + optional notify (langsung memperkaya pool)
            token.safeTransfer(recv, fee);

            // Coba panggil notifyRevenue kalau ada (non-revert jika function tidak ada)
            (bool ok, ) = recv.call(abi.encodeWithSelector(IStakingReceiver.notifyRevenue.selector, fee));
            // jika staking tidak punya notifyRevenue(), panggilan akan gagal → biarkan silent fail? atau require?
            // kita biarkan OK=false tetap lanjut, agar kompatibel; pencatatan tetap melalui event.
            emit FeeRoutedToStaking(fee, true);
        }
    }

    // Sweep fee terkumpul (jika mode TransferOnly)
    function sweep() external nonReentrant whenNotPaused {
        require(stakingReceiver != address(0), "NO_STAKING");
        uint256 amt = accruedFee;
        require(amt > 0, "NO_FEE");
        accruedFee = 0;

        token.safeTransfer(stakingReceiver, amt);

        // coba notifyRevenue(amt)
        (bool ok, ) = stakingReceiver.call(abi.encodeWithSelector(IStakingReceiver.notifyRevenue.selector, amt));
        // boleh diabaikan jika tidak ada method-nya

        emit Swept(amt);
    }

    // Rescue (jaga2)
    function recoverERC20(address erc20, uint256 amt, address to) external onlyOwner {
        require(to != address(0), "ZERO_ADDR");
        IERC20Upgradeable(erc20).safeTransfer(to, amt);
    }

    uint256[40] private __gap;
}
