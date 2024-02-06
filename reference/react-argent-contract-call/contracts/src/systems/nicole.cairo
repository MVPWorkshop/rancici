// define the interface
#[starknet::interface]
trait INicole<TContractState> {

    /// View functions:
    fn sayHi(self: @TContractState) -> felt252;
    fn getX(self: @TContractState) -> u256;

    /// State update functions:
    fn changeX(ref self: TContractState, new_val: u256);
}

// dojo decorator
#[dojo::contract]
mod nicole {
    use super::INicole;

    use starknet::{ContractAddress, get_caller_address};



    #[storage]
    struct Storage {
        x: u256,
    }

    #[abi(embed_v0)]
    impl NicoleImpl of INicole<ContractState> {

        /// View functions:
        fn sayHi(self: @ContractState) -> felt252 {
            return 'Hi';
        }

        fn getX(self: @ContractState) -> u256 {
            return self.x.read();
        }
    
        /// State update functions:
        fn changeX(ref self: ContractState, new_val: u256) {
            self.x.write(new_val);
        }


    }
}
