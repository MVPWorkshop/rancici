use starknet::ContractAddress;

#[derive(Model, Copy, Drop, Serde, Array)]
struct Character {
    #[key]
    id: u32,
    #[key]
    owner: ContractAddress,
    #[key]
    battleId: u32,
	health: u256,
    armor: u256,
	attack: u256,
    dead: bool
}