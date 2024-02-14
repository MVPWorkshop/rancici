// define the interface
#[starknet::interface]
trait IBattle<TContractState> {
    fn createBattle(self: @TContractState);
    fn joinBattle(self: @TContractState, battleId: u32);
    fn commitFormation(self: @TContractState, battleId: u32, formationHash: felt252);
    fn revealFormation(self: @TContractState, battleId: u32, formation: Array<u32>, characterPositions: Array<u32>);
    fn startBattle(self: @TContractState, battleId: u32,);
}

// dojo decorator
#[dojo::contract]
mod battle {
    use core::clone::Clone;
    use core::array::ArrayTrait;
    use super::IBattle;
    use core::integer::u32;

    use starknet::{ContractAddress, get_caller_address, contract_address_const};
    use dojo_starter::models::{battle::{Battle, BattleStatus}, config::{BATTLE_COUNTER, BattleConfig}, character::Character};

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
                        player1_formation_revealed: false,
                        player2_formation_revealed: false,
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
            assert(battle.status != BattleStatus::CREATED, 'Wrong battle status');

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

            assert(battle.status != BattleStatus::AWAITING_COMMITMENT, 'Wrong battle status');
            assert(battle.player1 == player || battle.player2 == player, 'Player is not in the battle');
            if (battle.player1 == player) {
                if (battle.player2_formation_hash != 0) {
                    battle.status = BattleStatus::AWAITING_REVEAL;
                }
                battle.player1_formation_hash = formationHash;
            } else if (battle.player2 == player) {
                if (battle.player1_formation_hash != 0) {
                    battle.status = BattleStatus::AWAITING_REVEAL;
                }
                battle.player2_formation_hash = formationHash;
            }

            set!(world, (battle));
        }

        fn revealFormation(self: @ContractState, battleId: u32, formation: Array<u32>, characterPositions: Array<u32>) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();

            // Get the address of the current caller, possibly the player's address.
            let player = get_caller_address();

            let mut battle = get!(world, battleId, Battle);

            assert(battle.status != BattleStatus::AWAITING_REVEAL, 'Wrong battle status');
            assert(battle.player1 == player || battle.player2 == player, 'Player is not in the battle');
            if (battle.player1 == player) {
                if (battle.player2_formation_revealed == true) {
                    battle.status = BattleStatus::REVEAL_DONE;
                }
            } else if (battle.player2 == player) {
                if (battle.player1_formation_revealed == true) {
                    battle.status = BattleStatus::REVEAL_DONE;
                }
            }

            // TODO check hash (if it mathces provided formation) and check random characterPositions (if correct)
            let charLength = characterPositions.len();
            assert(charLength != 5, 'Invalid character length');
            //check if characters in right position in formation
            let mut i = 0;
            let validationCharPositions = characterPositions.clone();
            let validationFomation = formation.clone();
            let validPositions = loop {
                if i == 5 {
                    break true;
                }
                let charPostion = *validationCharPositions.at(i);
                if (charPostion < 0 || charPostion > 48) {
                    break false;
                }
                if (*validationFomation.at(charPostion) != 1) {
                    break false;
                }
                i += 1;
            };

            assert(validPositions == false, 'Invalid character positions');

            let mut defCharacter = Character {
                id: 0,
                owner: player,
                battleId: battleId,
                health: 100,
                attack: 50,
                armor: 0,
                dead: false,
            };
            let mut initialCharacterArray = array![defCharacter, defCharacter, defCharacter, defCharacter, defCharacter];
            let mut finalCharacterArray = array![];
            
            let mut i = 0;
            loop {
                if i == 5 {
                    break;
                }
                let charPostion = *characterPositions.at(i);
                let mut character = *initialCharacterArray.at(i);
                let leftOfCharacter = *formation.at(charPostion - 1);
                let rightOfCharacter = *formation.at(charPostion + 1);
                let upOfCharacter = *formation.at(charPostion - 7);
                let downOfCharacter = *formation.at(charPostion + 7);
                if (leftOfCharacter == 2) {
                    character.health += 10;
                } else if (leftOfCharacter == 3) {
                    character.attack += 10;
                } else if (leftOfCharacter == 4) {
                    character.armor += 10;
                }
                if (rightOfCharacter == 2) {
                    character.health += 10;
                } else if (rightOfCharacter == 3) {
                    character.attack += 10;
                } else if (rightOfCharacter == 4) {
                    character.armor += 10;
                }

                if (downOfCharacter == 2) {
                    character.health += 10;
                } else if (downOfCharacter == 3) {
                    character.attack += 10;
                } else if (downOfCharacter == 4) {
                    character.armor += 10;
                }

                if (upOfCharacter == 2) {
                    character.health += 10;
                } else if (upOfCharacter == 3) {
                    character.attack += 10;
                } else if (upOfCharacter == 4) {
                    character.armor += 10;
                }
                character.id += i;
                finalCharacterArray.append(character);
                
                i += 1;
            }; 
            
            let charcter1 = *finalCharacterArray.at(0);
            let charcter2 = *finalCharacterArray.at(1);
            let charcter3 = *finalCharacterArray.at(2);
            let charcter4 = *finalCharacterArray.at(3);
            let charcter5 = *finalCharacterArray.at(4);
            
            set!(world, (battle, charcter1, charcter2, charcter3, charcter4, charcter5));
        }
        
        fn startBattle(self: @ContractState, battleId: u32) {
            // Access the world dispatcher for reading.
            let world = self.world_dispatcher.read();
            // TODO add events

            // Get the address of the current caller, possibly the player's address.
            let player = get_caller_address();

            let mut battle = get!(world, battleId, Battle);
            assert(battle.started == true, 'Battle not started');
            assert(battle.status != BattleStatus::REVEAL_DONE, 'Reveal not done');
            assert(battle.player1 == battle.player2, 'Can not battle with yourself');

            battle.started = true;
            // load characters
            let mut player1Character1 = get!(world, (0, battle.player1, battleId), Character);
            let mut player1Character2 = get!(world, (1, battle.player1, battleId), Character);
            let mut player1Character3 = get!(world, (2, battle.player1, battleId), Character);
            let mut player1Character4 = get!(world, (3, battle.player1, battleId), Character);
            let mut player1Character5 = get!(world, (4, battle.player1, battleId), Character);

            let mut player2Character1 = get!(world, (0, battle.player2, battleId), Character);
            let mut player2Character2 = get!(world, (1, battle.player2, battleId), Character);
            let mut player2Character3 = get!(world, (2, battle.player2, battleId), Character);
            let mut player2Character4 = get!(world, (3, battle.player2, battleId), Character);
            let mut player2Character5 = get!(world, (4, battle.player2, battleId), Character);

            // start battle
            loop {
                if (player1Character1.dead == true && player1Character2.dead == true && player1Character3.dead == true && player1Character4.dead == true && player1Character5.dead == true) {
                    battle.winner = battle.player2;
                    break;
                }

                if (player1Character1.dead == false) {
                    if (player2Character1.dead == false) {
                        if (player2Character1.health < player1Character5.attack - player2Character1.armor) {
                            player2Character1.dead = true;
                        } else {
                            player2Character1.health -= player1Character5.attack - player2Character1.armor;
                        }
                    } else if (player2Character2.dead == false) {
                        if (player2Character2.health < player1Character5.attack - player2Character2.armor) {
                            player2Character2.dead = true;
                        } else {
                            player2Character2.health -= player1Character5.attack - player2Character2.armor;
                        }
                    } else if (player2Character3.dead == false) {
                        if (player2Character3.health < player1Character5.attack - player2Character3.armor) {
                            player2Character3.dead = true;
                        } else {
                            player2Character3.health -= player1Character5.attack - player2Character3.armor;
                        }
                    } else if (player2Character4.dead == false) {
                        if (player2Character4.health < player1Character5.attack - player2Character4.armor) {
                            player2Character4.dead = true;
                        } else {
                            player2Character4.health -= player1Character5.attack - player2Character4.armor;
                        }
                    } else if (player2Character5.dead == false) {
                        if (player2Character5.health < player1Character5.attack - player2Character5.armor) {
                            player2Character5.dead = true;
                        } else {
                            player2Character5.health -= player1Character5.attack - player2Character5.armor;
                        }
                    }
                } else if (player1Character2.dead == false) {
                    if (player2Character1.dead == false) {
                        if (player2Character1.health < player1Character2.attack - player2Character1.armor) {
                            player2Character1.dead = true;
                        } else {
                            player2Character1.health -= player1Character2.attack - player2Character1.armor;
                        }
                    } else if (player2Character2.dead == false) {
                        if (player2Character2.health < player1Character2.attack - player2Character2.armor) {
                            player2Character2.dead = true;
                        } else {
                            player2Character2.health -= player1Character2.attack - player2Character2.armor;
                        }
                    } else if (player2Character3.dead == false) {
                        if (player2Character3.health < player1Character2.attack - player2Character3.armor) {
                            player2Character3.dead = true;
                        } else {
                            player2Character3.health -= player1Character2.attack - player2Character3.armor;
                        }
                    } else if (player2Character4.dead == false) {
                        if (player2Character4.health < player1Character2.attack - player2Character4.armor) {
                            player2Character4.dead = true;
                        } else {
                            player2Character4.health -= player1Character2.attack - player2Character4.armor;
                        }
                    } else if (player2Character5.dead == false) {
                        if (player2Character5.health < player1Character2.attack - player2Character5.armor) {
                            player2Character5.dead = true;
                        } else {
                            player2Character5.health -= player1Character2.attack - player2Character5.armor;
                        }
                    }
                } else if (player1Character3.dead == false) {
                    if (player2Character1.dead == false) {
                        if (player2Character1.health < player1Character3.attack - player2Character1.armor) {
                            player2Character1.dead = true;
                        } else {
                            player2Character1.health -= player1Character3.attack - player2Character1.armor;
                        }
                    } else if (player2Character2.dead == false) {
                        if (player2Character2.health < player1Character3.attack - player2Character2.armor) {
                            player2Character2.dead = true;
                        } else {
                            player2Character2.health -= player1Character3.attack - player2Character2.armor;
                        }
                    } else if (player2Character3.dead == false) {
                        if (player2Character3.health < player1Character3.attack - player2Character3.armor) {
                            player2Character3.dead = true;
                        } else {
                            player2Character3.health -= player1Character3.attack - player2Character3.armor;
                        }
                    } else if (player2Character4.dead == false) {
                        if (player2Character4.health < player1Character3.attack - player2Character4.armor) {
                            player2Character4.dead = true;
                        } else {
                            player2Character4.health -= player1Character3.attack - player2Character4.armor;
                        }
                    } else if (player2Character5.dead == false) {
                        if (player2Character5.health < player1Character3.attack - player2Character5.armor) {
                            player2Character5.dead = true;
                        } else {
                            player2Character5.health -= player1Character3.attack - player2Character5.armor;
                        }
                    }
                } else if (player1Character4.dead == false) {
                    if (player2Character1.dead == false) {
                        if (player2Character1.health < player1Character4.attack - player2Character1.armor) {
                            player2Character1.dead = true;
                        } else {
                            player2Character1.health -= player1Character4.attack - player2Character1.armor;
                        }
                    } else if (player2Character2.dead == false) {
                        if (player2Character2.health < player1Character4.attack - player2Character2.armor) {
                            player2Character2.dead = true;
                        } else {
                            player2Character2.health -= player1Character4.attack - player2Character2.armor;
                        }
                    } else if (player2Character3.dead == false) {
                        if (player2Character3.health < player1Character4.attack - player2Character3.armor) {
                            player2Character3.dead = true;
                        } else {
                            player2Character3.health -= player1Character4.attack - player2Character3.armor;
                        }
                    } else if (player2Character4.dead == false) {
                        if (player2Character4.health < player1Character4.attack - player2Character4.armor) {
                            player2Character4.dead = true;
                        } else {
                            player2Character4.health -= player1Character4.attack - player2Character4.armor;
                        }
                    } else if (player2Character5.dead == false) {
                        if (player2Character5.health < player1Character4.attack - player2Character5.armor) {
                            player2Character5.dead = true;
                        } else {
                            player2Character5.health -= player1Character4.attack - player2Character5.armor;
                        }
                    }
                } else {
                    if (player2Character1.dead == false) {
                        if (player2Character1.health < player1Character5.attack - player2Character1.armor) {
                            player2Character1.dead = true;
                        } else {
                            player2Character1.health -= player1Character5.attack - player2Character1.armor;
                        }
                    } else if (player2Character2.dead == false) {
                        if (player2Character2.health < player1Character5.attack - player2Character2.armor) {
                            player2Character2.dead = true;
                        } else {
                            player2Character2.health -= player1Character5.attack - player2Character2.armor;
                        }
                    } else if (player2Character3.dead == false) {
                        if (player2Character3.health < player1Character5.attack - player2Character3.armor) {
                            player2Character3.dead = true;
                        } else {
                            player2Character3.health -= player1Character5.attack - player2Character3.armor;
                        }
                    } else if (player2Character4.dead == false) {
                        if (player2Character4.health < player1Character5.attack - player2Character4.armor) {
                            player2Character4.dead = true;
                        } else {
                            player2Character4.health -= player1Character5.attack - player2Character4.armor;
                        }
                    } else if (player2Character5.dead == false) {
                        if (player2Character5.health < player1Character5.attack - player2Character5.armor) {
                            player2Character5.dead = true;
                        } else {
                            player2Character5.health -= player1Character5.attack - player2Character5.armor;
                        }
                    }
                }
                
                if (player2Character1.dead == true && player2Character2.dead == true && player2Character3.dead == true && player2Character4.dead == true && player2Character5.dead == true) {
                    battle.winner = battle.player1;
                    break;
                }

                if (player2Character1.dead == false) {
                    if (player1Character1.dead == false) {
                        if (player1Character1.health < player2Character1.attack - player1Character1.armor) {
                            player1Character1.dead = true;
                        } else {
                            player1Character1.health -= player2Character1.attack - player1Character1.armor;
                        }
                    } else if (player1Character2.dead == false) {
                        if (player1Character2.health < player2Character1.attack - player1Character2.armor) {
                            player1Character2.dead = true;
                        } else {
                            player1Character2.health -= player2Character1.attack - player1Character2.armor;
                        }
                    } else if (player1Character3.dead == false) {
                        if (player1Character3.health < player2Character1.attack - player1Character3.armor) {
                            player1Character3.dead = true;
                        } else {
                            player1Character3.health -= player2Character1.attack - player1Character3.armor;
                        }
                    } else if (player1Character4.dead == false) {
                        if (player1Character4.health < player2Character1.attack - player1Character4.armor) {
                            player1Character4.dead = true;
                        } else {
                            player1Character4.health -= player2Character1.attack - player1Character4.armor;
                        }
                    } else if (player1Character5.dead == false) {
                        if (player1Character5.health < player2Character1.attack - player1Character5.armor) {
                            player1Character5.dead = true;
                        } else {
                            player1Character5.health -= player2Character1.attack - player1Character5.armor;
                        }
                    }
                } else if (player2Character2.dead == false) {
                    if (player1Character1.dead == false) {
                        if (player1Character1.health < player2Character2.attack - player1Character1.armor) {
                            player1Character1.dead = true;
                        } else {
                            player1Character1.health -= player2Character2.attack - player1Character1.armor;
                        }
                    } else if (player1Character2.dead == false) {
                        if (player1Character2.health < player2Character2.attack - player1Character2.armor) {
                            player1Character2.dead = true;
                        } else {
                            player1Character2.health -= player2Character2.attack - player1Character2.armor;
                        }
                    } else if (player1Character3.dead == false) {
                        if (player1Character3.health < player2Character2.attack - player1Character3.armor) {
                            player1Character3.dead = true;
                        } else {
                            player1Character3.health -= player2Character2.attack - player1Character3.armor;
                        }
                    } else if (player1Character4.dead == false) {
                        if (player1Character4.health < player2Character2.attack - player1Character4.armor) {
                            player1Character4.dead = true;
                        } else {
                            player1Character4.health -= player2Character2.attack - player1Character4.armor;
                        }
                    } else if (player1Character5.dead == false) {
                        if (player1Character5.health < player2Character2.attack - player1Character5.armor) {
                            player1Character5.dead = true;
                        } else {
                            player1Character5.health -= player2Character2.attack - player1Character5.armor;
                        }
                    }
                } else if (player2Character3.dead == false) {
                    if (player1Character1.dead == false) {
                        if (player1Character1.health < player2Character3.attack - player1Character1.armor) {
                            player1Character1.dead = true;
                        } else {
                            player1Character1.health -= player2Character3.attack - player1Character1.armor;
                        }
                    } else if (player1Character2.dead == false) {
                        if (player1Character2.health < player2Character3.attack - player1Character2.armor) {
                            player1Character2.dead = true;
                        } else {
                            player1Character2.health -= player2Character3.attack - player1Character2.armor;
                        }
                    } else if (player1Character3.dead == false) {
                        if (player1Character3.health < player2Character3.attack - player1Character3.armor) {
                            player1Character3.dead = true;
                        } else {
                            player1Character3.health -= player2Character3.attack - player1Character3.armor;
                        }
                    } else if (player1Character4.dead == false) {
                        if (player1Character4.health < player2Character3.attack - player1Character4.armor) {
                            player1Character4.dead = true;
                        } else {
                            player1Character4.health -= player2Character3.attack - player1Character4.armor;
                        }
                    } else if (player1Character5.dead == false) {
                        if (player1Character5.health < player2Character3.attack - player1Character5.armor) {
                            player1Character5.dead = true;
                        } else {
                            player1Character5.health -= player2Character3.attack - player1Character5.armor;
                        }
                    }
                } else if (player2Character4.dead == false) {
                    if (player1Character1.dead == false) {
                        if (player1Character1.health < player2Character4.attack - player1Character1.armor) {
                            player1Character1.dead = true;
                        } else {
                            player1Character1.health -= player2Character4.attack - player1Character1.armor;
                        }
                    } else if (player1Character2.dead == false) {
                        if (player1Character2.health < player2Character4.attack - player1Character2.armor) {
                            player1Character2.dead = true;
                        } else {
                            player1Character2.health -= player2Character4.attack - player1Character2.armor;
                        }
                    } else if (player1Character3.dead == false) {
                        if (player1Character3.health < player2Character4.attack - player1Character3.armor) {
                            player1Character3.dead = true;
                        } else {
                            player1Character3.health -= player2Character4.attack - player1Character3.armor;
                        }
                    } else if (player1Character4.dead == false) {
                        if (player1Character4.health < player2Character4.attack - player1Character4.armor) {
                            player1Character4.dead = true;
                        } else {
                            player1Character4.health -= player2Character4.attack - player1Character4.armor;
                        }
                    } else if (player1Character5.dead == false) {
                        if (player1Character5.health < player2Character4.attack - player1Character5.armor) {
                            player1Character5.dead = true;
                        } else {
                            player1Character5.health -= player2Character4.attack - player1Character5.armor;
                        }
                    }
                } else {
                    if (player1Character1.dead == false) {
                        if (player1Character1.health < player2Character5.attack - player1Character1.armor) {
                            player1Character1.dead = true;
                        } else {
                            player1Character1.health -= player2Character5.attack - player1Character1.armor;
                        }
                    } else if (player1Character2.dead == false) {
                        if (player1Character2.health < player2Character5.attack - player1Character2.armor) {
                            player1Character2.dead = true;
                        } else {
                            player1Character2.health -= player2Character5.attack - player1Character2.armor;
                        }
                    } else if (player1Character3.dead == false) {
                        if (player1Character3.health < player2Character5.attack - player1Character3.armor) {
                            player1Character3.dead = true;
                        } else {
                            player1Character3.health -= player2Character5.attack - player1Character3.armor;
                        }
                    } else if (player1Character4.dead == false) {
                        if (player1Character4.health < player2Character5.attack - player1Character4.armor) {
                            player1Character4.dead = true;
                        } else {
                            player1Character4.health -= player2Character5.attack - player1Character4.armor;
                        }
                    } else if (player1Character5.dead == false) {
                        if (player1Character5.health < player2Character5.attack - player1Character5.armor) {
                            player1Character5.dead = true;
                        } else {
                            player1Character5.health -= player2Character5.attack - player1Character5.armor;
                        }
                    }
                }
            };

            set!(world, (battle));
        }
    }
}
