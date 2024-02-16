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
    use dojo::components::upgradeable::upgradeable::HasComponent;
    use core::clone::Clone;
    use core::array::ArrayTrait;
    use super::IBattle;
    use core::integer::u32;
    use starknet::{ContractAddress, get_caller_address, contract_address_const};
    use dojo_starter_battle::models::{battle::{Battle, BattleStatus}, config::{BATTLE_COUNTER, BattleConfig}, character::Character};

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        DamageInflicted: DamageInflicted,
        CharactedDied: CharactedDied,
        BattleFinished: BattleFinished,
    }

    #[derive(Drop, starknet::Event)]
    struct DamageInflicted {
        #[key]
        battleId: u32,
        #[key]
        battleMove: u256,
        attackerCharID: u32,
        attackerCharPlayerAddr: ContractAddress,
        inflictedCharRemainingHealth: u256,
        inflictedCharID: u32,
        inflictedCharPlayerAddr: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct CharactedDied {
        #[key]
        battleID: u32,
        #[key]
        deadCharID: u32,
        #[key]
        deadCharPlayerAddr: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct BattleFinished {
        #[key]
        battleId: u32,
        winner: ContractAddress,
    }

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
            assert(battle.status == BattleStatus::CREATED, 'Wrong battle status');

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

            assert(battle.status == BattleStatus::AWAITING_COMMITMENT, 'Wrong battle status');
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

            assert(battle.status == BattleStatus::AWAITING_REVEAL, 'Wrong battle status');
            assert(battle.player1 == player || battle.player2 == player, 'Player is not in the battle');
            if (battle.player1 == player) {
                if (battle.player2_formation_revealed == true) {
                    battle.status = BattleStatus::REVEAL_DONE;
                }
                battle.player1_formation_revealed = true;
            } else if (battle.player2 == player) {
                if (battle.player1_formation_revealed == true) {
                    battle.status = BattleStatus::REVEAL_DONE;
                }
                battle.player2_formation_revealed = true;
            }

            // TODO check hash (if it mathces provided formation) and check random characterPositions (if correct)
            let charLength = characterPositions.len();
            assert(charLength == 5, 'Invalid character length');
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

            assert(validPositions, 'Invalid character positions');

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
                let mut leftOfCharacter = 0;
                if (charPostion > 0) {
                    leftOfCharacter = *formation.at(charPostion - 1);
                }
                let mut rightOfCharacter = 0;
                if (charPostion < 48) {
                    rightOfCharacter = *formation.at(charPostion + 1);
                }
                let mut upOfCharacter = 0;
                if (charPostion > 6) {
                    upOfCharacter = *formation.at(charPostion - 7);
                }
                let mut downOfCharacter = 0;
                if (charPostion < 42) {
                    downOfCharacter = *formation.at(charPostion + 7);
                }
                if (leftOfCharacter == 2) {
                    character.health += 30;
                } else if (leftOfCharacter == 3) {
                    character.attack += 20;
                } else if (leftOfCharacter == 4) {
                    character.armor += 15;
                }
                if (rightOfCharacter == 2) {
                    character.health += 30;
                } else if (rightOfCharacter == 3) {
                    character.attack += 20;
                } else if (rightOfCharacter == 4) {
                    character.armor += 15;
                }

                if (downOfCharacter == 2) {
                    character.health += 30;
                } else if (downOfCharacter == 3) {
                    character.attack += 20;
                } else if (downOfCharacter == 4) {
                    character.armor += 15;
                }

                if (upOfCharacter == 2) {
                    character.health += 30;
                } else if (upOfCharacter == 3) {
                    character.attack += 20;
                } else if (upOfCharacter == 4) {
                    character.armor += 15;
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

            let mut battle: Battle = get!(world, battleId, Battle);
            assert(battle.status == BattleStatus::REVEAL_DONE, 'Wrong battle status');
            assert(battle.player1 != battle.player2, 'Can not battle with yourself');

            // load characters
            let mut player1Character1: Character = get!(world, (0, battle.player1, battleId), Character);
            let mut player1Character2: Character = get!(world, (1, battle.player1, battleId), Character);
            let mut player1Character3: Character = get!(world, (2, battle.player1, battleId), Character);
            let mut player1Character4: Character = get!(world, (3, battle.player1, battleId), Character);
            let mut player1Character5: Character = get!(world, (4, battle.player1, battleId), Character);

            let mut player2Character1: Character = get!(world, (0, battle.player2, battleId), Character);
            let mut player2Character2: Character = get!(world, (1, battle.player2, battleId), Character);
            let mut player2Character3: Character = get!(world, (2, battle.player2, battleId), Character);
            let mut player2Character4: Character = get!(world, (3, battle.player2, battleId), Character);
            let mut player2Character5: Character = get!(world, (4, battle.player2, battleId), Character);
            
            let mut battleMove: u256 = 0;
            // start battle
            loop {
                if (player1Character1.dead == true && player1Character2.dead == true && player1Character3.dead == true && player1Character4.dead == true && player1Character5.dead == true) {
                    battle.winner = battle.player2;
                    break;
                }
                // break if battle move is more than 50 and calculate winner based on remaining health
                if (battleMove > 50) {
                    let mut player1Health = player1Character5.health;
                    let mut player2Health = player2Character5.health;
                    if (player1Character1.dead == false) {
                        player1Health += player1Character4.health + player1Character3.health + player1Character2.health + player1Character1.health;
                    } else if (player1Character2.dead == false) {
                        player1Health += player1Character4.health + player1Character3.health + player1Character2.health;
                    } else if (player1Character3.dead == false) {
                        player1Health += player1Character4.health + player1Character3.health;
                    } else if (player1Character4.dead == false) {
                        player1Health += player1Character4.health;
                    }

                    if (player2Character1.dead == false) {
                        player2Health += player2Character4.health + player2Character3.health + player2Character2.health + player2Character1.health;
                    } else if (player2Character2.dead == false) {
                        player2Health += player2Character4.health + player2Character3.health + player2Character2.health;
                    } else if (player2Character3.dead == false) {
                        player2Health += player2Character4.health + player2Character3.health;
                    } else if (player2Character4.dead == false) {
                        player2Health += player2Character4.health;
                    }
                    
                    if (player1Health > player2Health) {
                        battle.winner = battle.player1;
                    } else if (player1Health < player2Health) {
                        battle.winner = battle.player2;
                    } else {
                        battle.winner = contract_address_const::<0>();
                    }

                    break;
                }
                // if else to check which character is attacking and which is being attacked
                // if attacked character is dead, then move to next character
                // if attacking character is dead, then move to next character
                // it's not pretty but its efficient
                if (player1Character1.dead == false) {
                    if (player2Character1.dead == false) {
                        if (player2Character1.health <= player1Character5.attack - player2Character1.armor) {
                            player2Character1.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character1.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character1.health -= player1Character5.attack - player2Character1.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character1.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character1.health, inflictedCharID: player2Character1.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else if (player2Character2.dead == false) {
                        if (player2Character2.health <= player1Character5.attack - player2Character2.armor) {
                            player2Character2.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character2.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character2.health -= player1Character5.attack - player2Character2.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character1.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character2.health, inflictedCharID: player2Character2.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else if (player2Character3.dead == false) {
                        if (player2Character3.health <= player1Character5.attack - player2Character3.armor) {
                            player2Character3.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character3.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character3.health -= player1Character5.attack - player2Character3.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character1.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character3.health, inflictedCharID: player2Character3.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else if (player2Character4.dead == false) {
                        if (player2Character4.health <= player1Character5.attack - player2Character4.armor) {
                            player2Character4.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character4.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character4.health -= player1Character5.attack - player2Character4.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character1.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character4.health, inflictedCharID: player2Character4.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else {
                        if (player2Character5.health <= player1Character5.attack - player2Character5.armor) {
                            player2Character5.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character5.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character5.health -= player1Character5.attack - player2Character5.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character1.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character5.health, inflictedCharID: player2Character5.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    }
                } else if (player1Character2.dead == false) {
                    if (player2Character1.dead == false) {
                        if (player2Character1.health <= player1Character2.attack - player2Character1.armor) {
                            player2Character1.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character1.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character1.health -= player1Character2.attack - player2Character1.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character2.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character1.health, inflictedCharID: player2Character1.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else if (player2Character2.dead == false) {
                        if (player2Character2.health <= player1Character2.attack - player2Character2.armor) {
                            player2Character2.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character2.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character2.health -= player1Character2.attack - player2Character2.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character2.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character2.health, inflictedCharID: player2Character2.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else if (player2Character3.dead == false) {
                        if (player2Character3.health <= player1Character2.attack - player2Character3.armor) {
                            player2Character3.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character3.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character3.health -= player1Character2.attack - player2Character3.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character2.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character3.health, inflictedCharID: player2Character3.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else if (player2Character4.dead == false) {
                        if (player2Character4.health <= player1Character2.attack - player2Character4.armor) {
                            player2Character4.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character4.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character4.health -= player1Character2.attack - player2Character4.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character2.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character4.health, inflictedCharID: player2Character4.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else {
                        if (player2Character5.health <= player1Character2.attack - player2Character5.armor) {
                            player2Character5.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character5.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character5.health -= player1Character2.attack - player2Character5.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character2.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character5.health, inflictedCharID: player2Character5.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    }
                } else if (player1Character3.dead == false) {
                    if (player2Character1.dead == false) {
                        if (player2Character1.health <= player1Character3.attack - player2Character1.armor) {
                            player2Character1.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character1.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character1.health -= player1Character3.attack - player2Character1.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character3.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character1.health, inflictedCharID: player2Character1.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else if (player2Character2.dead == false) {
                        if (player2Character2.health <= player1Character3.attack - player2Character2.armor) {
                            player2Character2.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character2.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character2.health -= player1Character3.attack - player2Character2.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character3.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character2.health, inflictedCharID: player2Character2.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else if (player2Character3.dead == false) {
                        if (player2Character3.health <= player1Character3.attack - player2Character3.armor) {
                            player2Character3.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character3.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character3.health -= player1Character3.attack - player2Character3.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character3.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character3.health, inflictedCharID: player2Character3.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else if (player2Character4.dead == false) {
                        if (player2Character4.health <= player1Character3.attack - player2Character4.armor) {
                            player2Character4.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character4.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character4.health -= player1Character3.attack - player2Character4.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character3.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character4.health, inflictedCharID: player2Character4.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else {
                        if (player2Character5.health <= player1Character3.attack - player2Character5.armor) {
                            player2Character5.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character5.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character5.health -= player1Character3.attack - player2Character5.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character3.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character5.health, inflictedCharID: player2Character5.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    }
                } else if (player1Character4.dead == false) {
                    if (player2Character1.dead == false) {
                        if (player2Character1.health <= player1Character4.attack - player2Character1.armor) {
                            player2Character1.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character1.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character1.health -= player1Character4.attack - player2Character1.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character4.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character1.health, inflictedCharID: player2Character1.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else if (player2Character2.dead == false) {
                        if (player2Character2.health <= player1Character4.attack - player2Character2.armor) {
                            player2Character2.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character2.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character2.health -= player1Character4.attack - player2Character2.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character4.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character2.health, inflictedCharID: player2Character2.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else if (player2Character3.dead == false) {
                        if (player2Character3.health <= player1Character4.attack - player2Character3.armor) {
                            player2Character3.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character3.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character3.health -= player1Character4.attack - player2Character3.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character4.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character3.health, inflictedCharID: player2Character3.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else if (player2Character4.dead == false) {
                        if (player2Character4.health <= player1Character4.attack - player2Character4.armor) {
                            player2Character4.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character4.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character4.health -= player1Character4.attack - player2Character4.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character4.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character4.health, inflictedCharID: player2Character4.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else {
                        if (player2Character5.health <= player1Character4.attack - player2Character5.armor) {
                            player2Character5.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character5.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character5.health -= player1Character4.attack - player2Character5.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character4.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character5.health, inflictedCharID: player2Character5.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    }
                } else {
                    if (player2Character1.dead == false) {
                        if (player2Character1.health <= player1Character5.attack - player2Character1.armor) {
                            player2Character1.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character1.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character1.health -= player1Character5.attack - player2Character1.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character5.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character1.health, inflictedCharID: player2Character1.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else if (player2Character2.dead == false) {
                        if (player2Character2.health <= player1Character5.attack - player2Character2.armor) {
                            player2Character2.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character2.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character2.health -= player1Character5.attack - player2Character2.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character5.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character2.health, inflictedCharID: player2Character2.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else if (player2Character3.dead == false) {
                        if (player2Character3.health <= player1Character5.attack - player2Character3.armor) {
                            player2Character3.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character3.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character3.health -= player1Character5.attack - player2Character3.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character5.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character3.health, inflictedCharID: player2Character3.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else if (player2Character4.dead == false) {
                        if (player2Character4.health <= player1Character5.attack - player2Character4.armor) {
                            player2Character4.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character4.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character4.health -= player1Character5.attack - player2Character4.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character5.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character4.health, inflictedCharID: player2Character4.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    } else {
                        if (player2Character5.health <= player1Character5.attack - player2Character5.armor) {
                            player2Character5.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player2Character5.id, deadCharPlayerAddr: battle.player2});
                        } else {
                            player2Character5.health -= player1Character5.attack - player2Character5.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player1Character5.id, attackerCharPlayerAddr: battle.player1, inflictedCharRemainingHealth: player2Character5.health, inflictedCharID: player2Character5.id, inflictedCharPlayerAddr: battle.player2});
                        }
                    }
                }
                
                if (player2Character1.dead == true && player2Character2.dead == true && player2Character3.dead == true && player2Character4.dead == true && player2Character5.dead == true) {
                    battle.winner = battle.player1;
                    break;
                }
                battleMove += 1;
                if (player2Character1.dead == false) {
                    if (player1Character1.dead == false) {
                        if (player1Character1.health <= player2Character1.attack - player1Character1.armor) {
                            player1Character1.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character1.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character1.health -= player2Character1.attack - player1Character1.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character1.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character1.health, inflictedCharID: player1Character1.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else if (player1Character2.dead == false) {
                        if (player1Character2.health <= player2Character1.attack - player1Character2.armor) {
                            player1Character2.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character2.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character2.health -= player2Character1.attack - player1Character2.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character1.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character2.health, inflictedCharID: player1Character2.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else if (player1Character3.dead == false) {
                        if (player1Character3.health <= player2Character1.attack - player1Character3.armor) {
                            player1Character3.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character3.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character3.health -= player2Character1.attack - player1Character3.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character1.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character3.health, inflictedCharID: player1Character3.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else if (player1Character4.dead == false) {
                        if (player1Character4.health <= player2Character1.attack - player1Character4.armor) {
                            player1Character4.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character4.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character4.health -= player2Character1.attack - player1Character4.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character1.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character4.health, inflictedCharID: player1Character4.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else {
                        if (player1Character5.health <= player2Character1.attack - player1Character5.armor) {
                            player1Character5.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character5.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character5.health -= player2Character1.attack - player1Character5.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character1.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character5.health, inflictedCharID: player1Character5.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    }
                } else if (player2Character2.dead == false) {
                    if (player1Character1.dead == false) {
                        if (player1Character1.health <= player2Character2.attack - player1Character1.armor) {
                            player1Character1.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character1.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character1.health -= player2Character2.attack - player1Character1.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character2.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character1.health, inflictedCharID: player1Character1.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else if (player1Character2.dead == false) {
                        if (player1Character2.health <= player2Character2.attack - player1Character2.armor) {
                            player1Character2.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character2.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character2.health -= player2Character2.attack - player1Character2.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character2.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character2.health, inflictedCharID: player1Character2.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else if (player1Character3.dead == false) {
                        if (player1Character3.health <= player2Character2.attack - player1Character3.armor) {
                            player1Character3.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character3.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character3.health -= player2Character2.attack - player1Character3.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character2.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character3.health, inflictedCharID: player1Character3.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else if (player1Character4.dead == false) {
                        if (player1Character4.health <= player2Character2.attack - player1Character4.armor) {
                            player1Character4.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character4.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character4.health -= player2Character2.attack - player1Character4.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character2.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character4.health, inflictedCharID: player1Character4.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else {
                        if (player1Character5.health <= player2Character2.attack - player1Character5.armor) {
                            player1Character5.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character5.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character5.health -= player2Character2.attack - player1Character5.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character2.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character5.health, inflictedCharID: player1Character5.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    }
                } else if (player2Character3.dead == false) {
                    if (player1Character1.dead == false) {
                        if (player1Character1.health <= player2Character3.attack - player1Character1.armor) {
                            player1Character1.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character1.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character1.health -= player2Character3.attack - player1Character1.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character3.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character1.health, inflictedCharID: player1Character1.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else if (player1Character2.dead == false) {
                        if (player1Character2.health <= player2Character3.attack - player1Character2.armor) {
                            player1Character2.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character2.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character2.health -= player2Character3.attack - player1Character2.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character3.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character2.health, inflictedCharID: player1Character2.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else if (player1Character3.dead == false) {
                        if (player1Character3.health <= player2Character3.attack - player1Character3.armor) {
                            player1Character3.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character3.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character3.health -= player2Character3.attack - player1Character3.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character3.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character3.health, inflictedCharID: player1Character3.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else if (player1Character4.dead == false) {
                        if (player1Character4.health <= player2Character3.attack - player1Character4.armor) {
                            player1Character4.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character4.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character4.health -= player2Character3.attack - player1Character4.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character3.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character4.health, inflictedCharID: player1Character4.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else {
                        if (player1Character5.health <= player2Character3.attack - player1Character5.armor) {
                            player1Character5.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character5.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character5.health -= player2Character3.attack - player1Character5.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character3.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character5.health, inflictedCharID: player1Character5.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    }
                } else if (player2Character4.dead == false) {
                    if (player1Character1.dead == false) {
                        if (player1Character1.health <= player2Character4.attack - player1Character1.armor) {
                            player1Character1.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character1.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character1.health -= player2Character4.attack - player1Character1.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character4.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character1.health, inflictedCharID: player1Character1.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else if (player1Character2.dead == false) {
                        if (player1Character2.health <= player2Character4.attack - player1Character2.armor) {
                            player1Character2.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character2.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character2.health -= player2Character4.attack - player1Character2.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character4.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character2.health, inflictedCharID: player1Character2.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else if (player1Character3.dead == false) {
                        if (player1Character3.health <= player2Character4.attack - player1Character3.armor) {
                            player1Character3.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character3.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character3.health -= player2Character4.attack - player1Character3.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character4.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character3.health, inflictedCharID: player1Character3.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else if (player1Character4.dead == false) {
                        if (player1Character4.health <= player2Character4.attack - player1Character4.armor) {
                            player1Character4.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character4.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character4.health -= player2Character4.attack - player1Character4.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character4.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character4.health, inflictedCharID: player1Character4.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else {
                        if (player1Character5.health <= player2Character4.attack - player1Character5.armor) {
                            player1Character5.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character5.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character5.health -= player2Character4.attack - player1Character5.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character4.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character5.health, inflictedCharID: player1Character5.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    }
                } else {
                    if (player1Character1.dead == false) {
                        if (player1Character1.health <= player2Character5.attack - player1Character1.armor) {
                            player1Character1.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character1.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character1.health -= player2Character5.attack - player1Character1.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character5.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character1.health, inflictedCharID: player1Character1.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else if (player1Character2.dead == false) {
                        if (player1Character2.health <= player2Character5.attack - player1Character2.armor) {
                            player1Character2.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character2.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character2.health -= player2Character5.attack - player1Character2.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character5.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character2.health, inflictedCharID: player1Character2.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else if (player1Character3.dead == false) {
                        if (player1Character3.health <= player2Character5.attack - player1Character3.armor) {
                            player1Character3.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character3.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character3.health -= player2Character5.attack - player1Character3.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character5.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character3.health, inflictedCharID: player1Character3.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else if (player1Character4.dead == false) {
                        if (player1Character4.health <= player2Character5.attack - player1Character4.armor) {
                            player1Character4.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character4.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character4.health -= player2Character5.attack - player1Character4.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character5.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character4.health, inflictedCharID: player1Character4.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    } else {
                        if (player1Character5.health <= player2Character5.attack - player1Character5.armor) {
                            player1Character5.dead = true;
                            emit!(world, CharactedDied{battleID: battleId, deadCharID: player1Character5.id, deadCharPlayerAddr: battle.player1});
                        } else {
                            player1Character5.health -= player2Character5.attack - player1Character5.armor;
                            emit!(world, DamageInflicted{battleId: battleId, battleMove: battleMove, attackerCharID: player2Character5.id, attackerCharPlayerAddr: battle.player2, inflictedCharRemainingHealth: player1Character5.health, inflictedCharID: player1Character5.id, inflictedCharPlayerAddr: battle.player1});
                        }
                    }
                }
            };
            battle.status = BattleStatus::FINISHED;
            set!(world, (battle, player1Character1, player1Character2, player1Character3, player1Character4, player1Character5, player2Character1, player2Character2, player2Character3, player2Character4, player2Character5));
            emit!(world, BattleFinished{battleId: battleId, winner: battle.winner});
        }
    }
}
