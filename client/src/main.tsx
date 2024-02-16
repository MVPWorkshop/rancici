// import ReactDOM from "react-dom/client";

// import App from "./App.tsx";

// import "./style/index.css";

// const init = async () => {
//   const rootElement = document.getElementById("root");
//   if (!rootElement) throw new Error("React root not found");
//   const root = ReactDOM.createRoot(rootElement as HTMLElement);

//   root.render(<App />);
// };

// init();
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./style/index.css";
import { setup } from "./dojo/generated/setup.ts";
import { DojoProvider } from "./dojo/DojoContext.tsx";
import { dojoConfig } from "../dojoConfig.ts";
import { connect } from "starknetkit"
import { Account } from "starknet";

async function init() {
    const rootElement = document.getElementById("root");
    if (!rootElement) throw new Error("React root not found");
    const root = ReactDOM.createRoot(rootElement as HTMLElement);
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