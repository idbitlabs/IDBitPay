import ToastProvider from "../components/ToastProvider";
import Header from "../components/Header";


export default function App({ Component, pageProps }){
return (
<ToastProvider>
<Header />
<Component {...pageProps} />
</ToastProvider>
);
}