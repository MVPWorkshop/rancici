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
        Backpack: overridableComponent(contractComponents.Backpack),
        Battle: overridableComponent(contractComponents.Battle),
        BattleConfig: overridableComponent(contractComponents.BattleConfig),
        Item: overridableComponent(contractComponents.Item),
    };
}
