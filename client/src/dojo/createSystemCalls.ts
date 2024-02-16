import { Account, BigNumberish } from "starknet";
import { ClientComponents } from "./createClientComponents";
import { ContractComponents } from "./generated/contractComponents";
import type { IWorld } from "./generated/generated";
import { EventEmitter } from "events";
import { getEvents, setComponentsFromEvents, getEntityIdFromKeys} from "@dojoengine/utils";
import { defineComponent, Type as RecsType, World } from "@dojoengine/recs";

import { Entity, getComponentValue } from "@dojoengine/recs";

export const battleEventEmitter = new EventEmitter();

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
    { client }: { client: IWorld },
    contractComponents: ContractComponents,
    { Character, Battle, BattleConfig }: ClientComponents
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

    const startBattleSC = async (account: Account, battleId: BigNumberish) => {
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

    const commitFormation = async (account: Account, battleId: BigNumberish) => {

        const formationHash = 0x12342131; //TODO: implement posseidon hashing of formation array
        try {
            const { transaction_hash } = await client.actions.commitFormation({
                account, battleId, formationHash
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

    const revealFormation = async (account: Account, battleId: BigNumberish, formation: number[], characterPositions: number[]) => {
        try {
            const { transaction_hash } = await client.actions.revealFormation({
                account, battleId, formation, characterPositions
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
        startBattleSC,
        commitFormation,
        revealFormation
    };
}
