// define the interface
#[starknet::interface]
trait IBattle<TContractState> {
    fn createBattle(self: @TContractState);
    // fn createBattle(self: @TContractState, player: starknet::ContractAddress, items: dojo_starter::models::backpack::Items);
    fn joinBattle(self: @TContractState, battleId: u32);
    fn startBattle(self: @TContractState, battleId: u32,);
    fn dummy(ref self: TContractState);
    fn dummy2(ref self: TContractState);
}

// dojo decorator
#[dojo::contract]
mod battle {
    use super::IBattle;

    use starknet::{ContractAddress, get_caller_address};
    use dojo_starter::models::{battle::{Battle}, config::{BATTLE_COUNTER, BattleConfig}};

    // #[external(v0)]
    // fn dummy() {}

    // impl: implement functions specified in trait
    #[abi(embed_v0)]
    impl BattleImpl of IBattle<ContractState> {
        fn createBattle(self: @ContractState) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let player = get_caller_address();

            let mut battleConfig = get!(world, BATTLE_COUNTER, BattleConfig);
            let battleId = battleConfig.counter;
            battleConfig.counter += 1;
            // Update the world state with the new data.
            // 1. Set players moves to 10
            // 2. Move the player's position 100 units in both the x and y direction.
            set!(
                world,
                (
                    Battle {id: battleId, player1: player, player2: player, started: false},
                    battleConfig
                )
            );
        }

        fn joinBattle(self: @ContractState, battleId: u32) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let player = get_caller_address();

            let mut battle = get!(world, battleId, Battle);

            battle.player2 = player;
            set!(world, (battle));
        }
        
        fn startBattle(self: @ContractState, battleId: u32) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let player = get_caller_address();

            let mut battle = get!(world, battleId, Battle);

            if (battle.player1 == battle.player2) {
                return;
            }
            battle.started = true;
            set!(world, (battle));
        }

        fn dummy(ref self: ContractState){}
        fn dummy2(ref self: ContractState){}
    }
}
