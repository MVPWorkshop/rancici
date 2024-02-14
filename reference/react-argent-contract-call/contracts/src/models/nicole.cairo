use starknet::ContractAddress;

#[derive(Model, Copy, Drop, Serde)]
struct Item {
    #[key]
    id: u32,
    damage: u32,
    health: u32,
    armor: u32,
}
