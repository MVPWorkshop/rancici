use starknet::ContractAddress;

#[derive(Model, Copy, Drop, Serde)]
struct Battle {
    #[key]
    id: u32,
    player1: ContractAddress,
    player2: ContractAddress,
    // player1_backpack_hash: felt252,
    // player2_backpack_hash: felt252,
    started: bool,
}
