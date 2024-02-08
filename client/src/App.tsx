import { useComponentValue } from "@dojoengine/react";
import { Entity , getComponentValue} from "@dojoengine/recs";
import { useEffect, useState } from "react";
import "./App.css";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useDojo } from "./dojo/useDojo";
import { Account, BigNumberish, RpcProvider } from "starknet";
import { CLIENT_RENEG_LIMIT } from "tls";


function App() {
    const {
        setup: {
            systemCalls: { createBattle, joinBattle, startBattle },
            clientComponents: { Backpack, Battle, BattleConfig, Item },
        },
        account,
        masterAccount,
        secondAccount
    } = useDojo();

    const [clipboardStatus, setClipboardStatus] = useState({
        message: "",
        isError: false,
    });

    // entity id we are syncing
    const entityId = getEntityIdFromKeys([
        BigInt(masterAccount.address),
    ]) as Entity; 

    console.log("Entity id: " + entityId);
    // get current component values
    // const battleId = getComponentValue (Battle, entityId);
    //  console.log("Battle id: " + battleId);

    const handleRestoreBurners = async () => {
        try {
            await account?.applyFromClipboard();
            setClipboardStatus({
                message: "Burners restored successfully!",
                isError: false,
            });
        } catch (error) {
            setClipboardStatus({
                message: `Failed to restore burners from clipboard`,
                isError: true,
            });
        }
    };

    useEffect(() => {
        if (clipboardStatus.message) {
            const timer = setTimeout(() => {
                setClipboardStatus({ message: "", isError: false });
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [clipboardStatus.message]);

    return (
        <>
            <div>
                <h2>{masterAccount.address}</h2>
                <h2>{account.account.address}</h2>
            </div>
            <button onClick={account?.create}>
                {account?.isDeploying ? "deploying burner" : "create burner"}
            </button>
            {account && account?.list().length > 0 && (
                <button onClick={async () => await account?.copyToClipboard()}>
                    Save Burners to Clipboard
                </button>
            )}
            <button onClick={handleRestoreBurners}>
                Restore Burners from Clipboard
            </button>
            {clipboardStatus.message && (
                <div className={clipboardStatus.isError ? "error" : "success"}>
                    {clipboardStatus.message}
                </div>
            )}

            <div className="card">
                select signer:{" "}
                <select
                    value={account ? account.account.address : ""}
                    onChange={(e) => account.select(e.target.value)}
                >
                    {account?.list().map((account, index) => {
                        return (
                            <option value={account.address} key={index}>
                                {account.address}
                            </option>
                        );
                    })}
                </select>
                <div>
                    <button onClick={() => account.clear()}>
                        Clear burners
                    </button>
                </div>
            </div>

            <div className="card"> 
                <button onClick={() => createBattle(masterAccount)}>Create Battle</button>
            </div>

            <div className="card">
                <div>
                    <button onClick={() => joinBattle(secondAccount, 0)}>
                         Join Battle {secondAccount.address}
                    </button>
                </div>
                <div>
                    <button
                        onClick={() => startBattle(masterAccount, 0)
                        }
                    >
                        START
                    </button>
                </div>
            </div>
        </>
    );
}

export default App;
