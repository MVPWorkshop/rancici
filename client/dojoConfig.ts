import { Account, RpcProvider } from "starknet";
import manifest from "../contracts/target/dev/manifest.json";

const {
    VITE_PUBLIC_NODE_URL,
    VITE_PUBLIC_TORII,
    VITE_PUBLIC_MASTER_ADDRESS,
    VITE_PUBLIC_MASTER_PRIVATE_KEY,
    VITE_PUBLIC_ACCOUNT_CLASS_HASH,
    VITE_PUBLIC_SECOND_ACCOUNT_ADDRESS,
    VITE_PUBLIC_SECOND_ACCOUNT_PRIVATE_KEY
} = import.meta.env;

export type Config = ReturnType<typeof dojoConfig>;

export function dojoConfig() {

    const rpcProvider = new RpcProvider({
        nodeUrl: import.meta.env.VITE_PUBLIC_NODE_URL!,
    });

    const account = new Account(
        rpcProvider,
        VITE_PUBLIC_MASTER_ADDRESS,
        VITE_PUBLIC_MASTER_PRIVATE_KEY
    );

    const secondAccount = new Account(
        rpcProvider,
        VITE_PUBLIC_SECOND_ACCOUNT_ADDRESS,
        VITE_PUBLIC_SECOND_ACCOUNT_PRIVATE_KEY
    );

    return {
        rpcUrl: VITE_PUBLIC_NODE_URL || "http://localhost:5050",
        toriiUrl: VITE_PUBLIC_TORII || "http://0.0.0.0:8080",
        account, 
        accountClassHash:
            VITE_PUBLIC_ACCOUNT_CLASS_HASH ||
            "0x05400e90f7e0ae78bd02c77cd75527280470e2fe19c54970dd79dc37a9d3645c",
        manifest,
        secondAccount
    };
}
