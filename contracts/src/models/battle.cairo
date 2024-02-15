use starknet::ContractAddress;

#[derive(Model, Copy, Drop, Serde)]
struct Battle {
    #[key]
    id: u32,
    player1: ContractAddress,
    player2: ContractAddress,
    player1_formation_hash: felt252,
    player2_formation_hash: felt252,
    player1_formation_revealed: bool,
    player2_formation_revealed: bool,
    winner: ContractAddress,
    status: BattleStatus,
}
 
// This enum simply defines the states of a game.
#[derive(Serde, Copy, Drop, Introspect, PartialEq, Print)]
enum BattleStatus {
    CREATED: (), //nakon .createMatch()
    AWAITING_COMMITMENT: (), //ulazi nakon .joinMatch(), izlazi kad oba urade .commit()
    AWAITING_REVEAL: (), //izlazi kad oba urade .reveal()
    REVEAL_DONE: (), //izlazi kad se zavrsi. battle()
    FINISHED: (),
}

// We define an into trait
impl BattleStatusFelt252 of Into<BattleStatus, felt252> {
    fn into(self: BattleStatus) -> felt252 {
        match self {
            BattleStatus::CREATED => 0,
            BattleStatus::AWAITING_COMMITMENT => 1,
            BattleStatus::AWAITING_REVEAL => 2,
            BattleStatus::REVEAL_DONE => 3,
            BattleStatus::FINISHED => 4,
        }
    }
}