// define the interface
#[starknet::interface]
trait IBattle<TContractState> {
    fn createBattle(self: @TContractState);
    // fn createBattle(self: @TContractState, player: starknet::ContractAddress, items: dojo_starter::models::backpack::Items);
    fn joinBattle(self: @TContractState, battleId: u32, opponent: starknet::ContractAddress);
    fn startBattle(self: @TContractState, battleId: u32,);
}

// dojo decorator
#[dojo::contract]
mod Battle {
    use super::IBattle;

    use starknet::{ContractAddress, get_caller_address};
    use dojo_starter::models::{battle::{Battle}};

    // impl: implement functions specified in trait
    #[abi(embed_v0)]
    impl BattleImpl of IBattle<ContractState> {
        fn createBattle(self: @ContractState) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let player = get_caller_address();

            // Update the world state with the new data.
            // 1. Set players moves to 10
            // 2. Move the player's position 100 units in both the x and y direction.
            set!(
                world,
                (
                    Battle {id: 0, player1: player, player2: player, started: false},
                )
            );
        }

        fn joinBattle(self: @ContractState, battleId: u32, opponent: ContractAddress) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let player = get_caller_address();

            let mut battle = get!(world, battleId, Battle);

            battle.player2 = opponent;
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
    }
}
