// define the interface
#[starknet::interface]
trait IBattle<TContractState> {
    fn createBattle(self: @TContractState);
    fn joinBattle(self: @TContractState, battleId: u32);
    fn commitFormation(self: @TContractState, battleId: u32, formationHash: felt252);
    fn revealFormation(self: @TContractState, battleId: u32, formation: felt252);
    fn startBattle(self: @TContractState, battleId: u32,);
}

// dojo decorator
#[dojo::contract]
mod battle {
    use super::IBattle;

    use starknet::{ContractAddress, get_caller_address, contract_address_const};
    use dojo_starter::models::{battle::{Battle, BattleStatus}, config::{BATTLE_COUNTER, BattleConfig}};

    // impl: implement functions specified in trait
    #[external(v0)]
    impl BattleImpl of IBattle<ContractState> {
        fn createBattle(self: @ContractState) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let player = get_caller_address();

            let mut battleConfig = get!(world, BATTLE_COUNTER, BattleConfig);
            let battleId = battleConfig.counter;
            battleConfig.counter += 1;

            set!(
                world,
                (
                    Battle {
                        id: battleId, 
                        player1: player, 
                        player2: contract_address_const::<0>(), 
                        started: false,
                        player1_formation_hash: 0,
                        player2_formation_hash: 0,
                        player1_formation: 0,
                        player2_formation: 0,
                        winner: contract_address_const::<0>(),
                        status: BattleStatus::CREATED
                        },
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
            if (battle.status != BattleStatus::CREATED) {
                return;
            }

            battle.player2 = player;
            battle.status = BattleStatus::AWAITING_COMMITMENT;
            set!(world, (battle));
        }
        
        fn commitFormation(self: @ContractState, battleId: u32, formationHash: felt252) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let player = get_caller_address();

            let mut battle = get!(world, battleId, Battle);

            if (battle.status != BattleStatus::AWAITING_COMMITMENT) {
                return;
            }

            if (battle.player1 == player) {
                battle.player1_formation_hash = formationHash;
                if (battle.player2_formation_hash != 0) {
                    battle.status = BattleStatus::AWAITING_REVEAL;
                }
            } else if (battle.player2 == player) {
                battle.player2_formation_hash = formationHash;
                if (battle.player1_formation_hash != 0) {
                    battle.status = BattleStatus::AWAITING_REVEAL;
                }
            } else {
                return;
            }

            set!(world, (battle));
        }

        fn revealFormation(self: @ContractState, battleId: u32, formation: felt252) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let player = get_caller_address();

            let mut battle = get!(world, battleId, Battle);

            if (battle.status != BattleStatus::AWAITING_REVEAL) {
                return;
            }
            // to do check hash and formation and create and update characters

            if (battle.player1 == player) {
                battle.player1_formation = formation;
                if (battle.player2_formation != 0) {
                    battle.status = BattleStatus::REVEAL_DONE;
                }
            } else if (battle.player2 == player) {
                battle.player2_formation = formation;
                if (battle.player1_formation != 0) {
                    battle.status = BattleStatus::REVEAL_DONE;
                }
            } else {
                return;
            }
            
            set!(world, (battle));
        }
        
        fn startBattle(self: @ContractState, battleId: u32) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let player = get_caller_address();

            let mut battle = get!(world, battleId, Battle);
            if (battle.status != BattleStatus::REVEAL_DONE) {
                return;
            }
            if (battle.player1 == battle.player2) {
                return;
            }
            battle.started = true;
            // to do battle logic
            set!(world, (battle));
        }
    }
}
