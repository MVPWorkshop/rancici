/* Autogenerated file. Do not edit manually. */

import { Account, BigNumberish } from "starknet";
import { DojoProvider } from "@dojoengine/core";
import { defineComponent, Type as RecsType, World } from "@dojoengine/recs";

export type IWorld = Awaited<ReturnType<typeof setupWorld>>;

export async function setupWorld(provider: DojoProvider) {
    function actions() {
        const contract_name = "battle";

        const createBattle = async ({
            account,
        }: {
            account: Account;
        }) => {
            try {
                return await provider.execute(account, contract_name, "createBattle", [
                ]);
            } catch (error) {
                console.error("Error executing createBattle:", error);
                throw error;
            }
        };

        const joinBattle = async ({
            account,
            battleId,
        }: {
            account: Account;
            battleId: BigNumberish;
        }) => {
            try {
                return await provider.execute(account, contract_name, "joinBattle", [
                    battleId,
                ]);
            } catch (error) {
                console.error("Error executing joinBattle:", error);
                throw error;
            }
        };

        const startBattle = async ({
            account,
            battleId,
        }: {
            account: Account;
            battleId: BigNumberish;
        }) => {
            try {
                return await provider.execute(account, contract_name, "startBattle", [
                    battleId,
                ]);
            } catch (error) {
                console.error("Error executing startBattle:", error);
                throw error;
            }
        };

        const commitFormation = async ({
            account,
            battleId,
            formationHash
        }: {
            account: Account;
            battleId: BigNumberish;
            formationHash: BigNumberish;
        }) => {
            try {
                return await provider.execute(account, contract_name, "commitFormation", [
                    battleId,
                    formationHash
                ]);
            } catch (error) {
                console.error("Error executing commitFormation:", error);
                throw error;
            }
        };
        
        const revealFormation = async ({
            account,
            battleId,
            formation,
            characterPositions
        }: {
            account: Account;
            battleId: BigNumberish;
            formation: BigNumberish;
            characterPositions: BigNumberish;
        }) => {
            try {
                return await provider.execute(account, contract_name, "revealFormation", [
                    battleId,
                    formation,
                    characterPositions
                ]);
            } catch (error) {
                console.error("Error executing revealFormation:", error);
                throw error;
            }
        };

        return { createBattle, joinBattle, startBattle, commitFormation, revealFormation };
    }
    return {
        actions: actions(),
    };
}
