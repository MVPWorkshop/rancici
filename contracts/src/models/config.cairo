#[derive(Model, Copy, Drop, Serde, SerdeLen)]
struct BattleConfig {
    #[key]
    entity_id: felt252, // FIXED
    counter: u32
}

const BATTLE_COUNTER: felt252 = 'battle counter';
