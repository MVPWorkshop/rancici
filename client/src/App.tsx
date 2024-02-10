import { Entity , getComponentValue, getComponentEntities} from "@dojoengine/recs";
import { useEffect, useState } from "react";
import "./App.css";
import { useDojo } from "./dojo/useDojo";
import { Account, BigNumberish, RpcProvider } from "starknet";
import { CLIENT_RENEG_LIMIT } from "tls";
import BattleComponent from "./Battle";
import { battleEventEmitter } from './dojo/createSystemCalls';
import { useComponentValue } from "@latticexyz/react";


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

    // const [clipboardStatus, setClipboardStatus] = useState({
    //     message: "",
    //     isError: false,
    // });

    const [battleId, setBattleId]= useState(-1);

    const [battleEntities, setBattleEntities] = useState<any[]>(Array.from(getComponentEntities(Battle)));

    useEffect(() => {
        const handleNewBattleCreated = () => {
            setBattleEntities(Array.from(getComponentEntities(Battle)));
        };

        battleEventEmitter.on('newBattleCreated', handleNewBattleCreated);

        return () => {
            battleEventEmitter.off('newBattleCreated', handleNewBattleCreated);
        };
    }, []);

    useEffect(() => {
        const handleBattleUpdate= (updatedBattleId: Entity) => {
            const updatedBattleEntity = getComponentValue(Battle, updatedBattleId);
            if(updatedBattleEntity){
                setBattleEntities(prevBattleEntities => {
                    const existingIndex = prevBattleEntities.findIndex(entity => entity.id == updatedBattleEntity.id);
                    if (existingIndex !== -1) {
                        const updatedEntities = [...prevBattleEntities];
                        updatedEntities[existingIndex] = updatedBattleEntity;
                        console.log("if");
                        return updatedEntities;
                       
                    } else {
                        console.log("else");
                        return [...prevBattleEntities, updatedBattleEntity];
                    }
                });
            }
        };
    
        battleEventEmitter.on('battleUpdated', handleBattleUpdate);

        return () => {
            battleEventEmitter.off('battleUpdated', handleBattleUpdate);
        };
    }, [battleEntities]);
    

    // const handleRestoreBurners = async () => {
    //     try {
    //         await account?.applyFromClipboard();
    //         setClipboardStatus({
    //             message: "Burners restored successfully!",
    //             isError: false,
    //         });
    //     } catch (error) {
    //         setClipboardStatus({
    //             message: `Failed to restore burners from clipboard`,
    //             isError: true,
    //         });
    //     }
    // };

    // useEffect(() => {
    //     if (clipboardStatus.message) {
    //         const timer = setTimeout(() => {
    //             setClipboardStatus({ message: "", isError: false });
    //         }, 3000);

    //         return () => clearTimeout(timer);
    //     }
    // }, [clipboardStatus.message]);


    return (
        <>
            {/* <div>
                <h2>{masterAccount.address}</h2>
                <h2>{account.account.address}</h2>
            </div> */}
            {/* <button onClick={account?.create}>
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
            </div> */}

            <div className="container">
                <div className="card">
                    <button onClick={() => createBattle(masterAccount)} className="button-style">Create Battle</button>
                </div>
            </div>
            <div className="container">
                <div className="card">
                    <button onClick={() => joinBattle(secondAccount, battleId)} className="button-style">Join Battle</button>
                    {battleId > -1 && (<p className="text-style">Chosen battle ID: {battleId}</p>)}
                </div>
            </div>
            <div className="container">
                <div className="card">
                    <button onClick={() => startBattle(masterAccount, battleId)} className="button-style">START</button>
                    {battleId > - 1 && (<p className="text-style">Chosen battle ID: {battleId}</p>)}
                </div>
            </div>
            <div className="container">
                {battleEntities.length > 0 && (
                    <h3>Click on the battle you wish to join/start:</h3>
                )}
                {battleEntities.map(entity => {
                    const val = getComponentValue(Battle, entity);
                    return val ? (
                        <BattleComponent key={Number(val.id)} battleId={val.id} joined={val.player1 !== val.player2} started={val.started} setBattleIdValue={setBattleId} />
                    ) : <></>;
                })}
            </div>
        </>
    );
}

export default App;
