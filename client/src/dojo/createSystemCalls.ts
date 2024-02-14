import { Account, BigNumberish } from "starknet";
import { ClientComponents } from "./createClientComponents";
import { ContractComponents } from "./generated/contractComponents";
import type { IWorld } from "./generated/generated";
import { EventEmitter } from "events";
import { getEvents, setComponentsFromEvents, getEntityIdFromKeys} from "@dojoengine/utils";
import { Entity, getComponentValue } from "@dojoengine/recs";

export const battleEventEmitter = new EventEmitter();

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
    { client }: { client: IWorld },
    contractComponents: ContractComponents,
    { Backpack, Battle, BattleConfig, Item }: ClientComponents
) {

    const createBattle = async (account: Account) => {
        try {
            const { transaction_hash } = await client.actions.createBattle({
                account,
            });

            setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await account.waitForTransaction(transaction_hash, {
                        retryInterval: 100,
                    })
                )
            );
            
            battleEventEmitter.emit('newBattleCreated');

        } catch (e) {
            console.log(e);
        }
    }

    const joinBattle = async (account: Account, battleId: BigNumberish) => {
        try {
            const { transaction_hash } = await client.actions.joinBattle({
                account, battleId
            });

            setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await account.waitForTransaction(transaction_hash, {
                        retryInterval: 100,
                    })
                )
            );
            
            const updatedBattleId = getEntityIdFromKeys([BigInt(battleId)]) as Entity;

            battleEventEmitter.emit('battleUpdated', updatedBattleId);

        } catch (e) {
            console.log(e);
        }
    }

    const startBattle = async (account: Account, battleId: BigNumberish) => {
        try {
            const { transaction_hash } = await client.actions.startBattle({
                account, battleId
            });

            setComponentsFromEvents(
                contractComponents,
                getEvents(
                    await account.waitForTransaction(transaction_hash, {
                        retryInterval: 100,
                    })
                )
            );
            
           const updatedBattleId = getEntityIdFromKeys([BigInt(battleId)]) as Entity;

            battleEventEmitter.emit('battleUpdated', updatedBattleId);
            
        } catch (e) {
            console.log(e);
        }
    }


    return {
        createBattle,
        joinBattle,
        startBattle,
    };
}
