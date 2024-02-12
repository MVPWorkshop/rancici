#[derive(Model, Copy, Drop, Serde)]
struct Character {
    #[key]
    id: u32,
    #[key]
    owner: ContractAddress,
    #[key]
    battleId: u32,
	health: u256,
    stamina: u256,
    speed: u256,
	attack: u256
}
