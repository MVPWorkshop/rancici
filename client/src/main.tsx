import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setup } from "./dojo/generated/setup.ts";
import { DojoProvider } from "./dojo/DojoContext.tsx";
import { dojoConfig } from "../dojoConfig.ts";
import { connect } from "starknetkit"
import { Account } from "starknet";

async function init() {
    const rootElement = document.getElementById("root");
    if (!rootElement) throw new Error("React root not found");
    const root = ReactDOM.createRoot(rootElement as HTMLElement);

    // // Let the user pick a wallet (on button click)
    // const starknet = await connect()

    // if (!starknet) {
    // throw Error("User rejected wallet selection or silent connect found nothing")
    // }

    // starknet.wallet?.enable()

    // let account: Account | undefined = undefined;
    // // Check if connection was successful
    // if(starknet.wallet?.isConnected) {
    //     account = await starknet.wallet.account;
    // }

    // if(!account?.address) {
    //     throw new Error("account not found")
    // }
    const setupResult = await setup(dojoConfig());

    root.render(
        <React.StrictMode>
            <DojoProvider value={setupResult}>
                <App />
            </DojoProvider>
        </React.StrictMode>
    );
}

init();
