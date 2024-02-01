use starknet::ContractAddress;

#[derive(Model, Drop, Serde)]
struct Backpack {
    #[key]
    player: ContractAddress,
    #[key]
    rancicAddress: ContractAddress,
    #[key]
    rancicId: u256,
    items: Items
}

#[derive(Copy, Hash, Drop, Serde, Introspect)]
struct Items {
    first: u32,
    second: u32,
    third: u32,
    fourth: u32,
    fifth: u32,
}