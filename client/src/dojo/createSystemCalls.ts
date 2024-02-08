import { Account, BigNumberish } from "starknet";
import { ClientComponents } from "./createClientComponents";
import { ContractComponents } from "./generated/contractComponents";
import type { IWorld } from "./generated/generated";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
    { client }: { client: IWorld },
    contractComponents: ContractComponents,
    { Backpack, Battle, BattleConfig, Item }: ClientComponents
) {

    const createBattle = async (account: Account) => {
        try {
            console.log("Account: "+ account);
            await client.actions.createBattle({
                account,
            });

            console.log("createSystemCalls: create battle");
            console.log("Caller" + account.address);
        } catch (e) {
            console.log(e);
        }
    }

    const joinBattle = async (account: Account, battleId: BigNumberish) => {
        try {
            await client.actions.joinBattle({
                account, battleId
            });

            console.log("createSystemCalls: join battle");
            console.log("Caller" + account.address);

        } catch (e) {
            console.log(e);
        }
    }

    const startBattle = async (account: Account, battleId: BigNumberish) => {
        try {
            await client.actions.startBattle({
                account, battleId
            });

            console.log("createSystemCalls: start battle");
            console.log("Caller" + account.address);

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
