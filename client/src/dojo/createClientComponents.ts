import { overridableComponent } from "@dojoengine/recs";
import { ContractComponents } from "./generated/contractComponents";

export type ClientComponents = ReturnType<typeof createClientComponents>;

export function createClientComponents({
    contractComponents,
}: {
    contractComponents: ContractComponents;
}) {
    return {
        ...contractComponents,
        Character: overridableComponent(contractComponents.Character),
        Battle: overridableComponent(contractComponents.Battle),
        BattleConfig: overridableComponent(contractComponents.BattleConfig),
    };
}
