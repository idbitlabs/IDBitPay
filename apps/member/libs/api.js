export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";


export async function api(path, opts) {
const res = await fetch(`${API_BASE}${path}`, {
headers: { "Content-Type": "application/json" },
...opts,
});
if (!res.ok) throw new Error(`API ${res.status}`);
return res.json();
}