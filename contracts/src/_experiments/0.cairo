#[starknet::contract]
mod Experiments {
    use starknet::ContractAddress;

    const ROUND_LIMIT: u256 = 3;
    const CHARS_PER_TEAM: u32 = 5;

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        HealthChange: HealthChange,
    }

    #[derive(Drop, starknet::Event)]
    struct HealthChange {
        #[key]
        val: u32
    }

    #[storage]
    struct Storage {
        names: LegacyMap::<ContractAddress, felt252>,

        winners: LegacyMap::<u256, u256>, 
    }


    struct Health {
        val: u32,
    }

    #[constructor]
    fn constructor(ref self: ContractState, name: felt252, address: ContractAddress) {
        self.names.write(address, name);
    }

    #[external(v0)]
    fn get_winner(self: @ContractState, battle_id: u256) -> u256 { return self.winners.read(battle_id); }

    #[external(v0)]
    fn get_winner_13(self: @ContractState) -> u256 { return self.winners.read(13); }

    #[external(v0)]
    fn dummy(ref self: ContractState, battle_id: u256) { }

    #[external(v0)]
    fn battle_test_13(ref self: ContractState) {
        battle_test(ref self, 13);
     } 

    #[external(v0)]
    fn battle_test_part0(ref self: ContractState, battle_id: u256) { 

    }

    #[external(v0)]
    fn battle_test(ref self: ContractState, battle_id: u256) { 

        let mut _p1_health = mock_p_chars_stats(331);
        let mut _p2_health = mock_p_chars_stats(221);

        let mut roundIdx = 0; 

        loop {
            
            if(roundIdx >= ROUND_LIMIT){
                break;
            }

            let p1_health_snap = @_p1_health;
            let p2_health_snap = @_p2_health;

            early_completion(p1_health_snap, p2_health_snap);

            _p2_health = attack(p1_health_snap, p2_health_snap, p1_health_snap, 0, 1);

            self.emit(HealthChange { val: get_val(p2_health_snap, 1)});

            roundIdx = roundIdx + 1;
        };

        self.winners.write(battle_id, roundIdx);
    }

    fn mock_p_chars_health (ref p1_chars_health: Array::<u32>, ref p2_chars_health: Array::<u32>) {
        let mut ch_idx = 0;
        loop {
            if(ch_idx == CHARS_PER_TEAM){
                break;
            }

            p1_chars_health.append(ch_idx*3 + 100);
            p2_chars_health.append(ch_idx*4 + 20);

            ch_idx += 1;
        };
    }

    fn mock_p_chars_health_2 () -> (Array::<u32>, Array::<u32>) {
        let mut p1_chars_health: Array::<u32> = ArrayTrait::new();
        let mut p2_chars_health: Array::<u32> = ArrayTrait::new();
        let mut ch_idx = 0;
        loop {
            if(ch_idx >= CHARS_PER_TEAM){
                break;
            }

            p1_chars_health.append(ch_idx*3 + 100);
            p2_chars_health.append(ch_idx*4 + 20);

            ch_idx = ch_idx + 1;
        };

        return (p1_chars_health, p2_chars_health);
    }

    fn mock_p_chars_stats (seed: u32) -> Array::<u32> {
        let mut stats: Array::<u32> = ArrayTrait::new();

        let mut ch_idx = 0;
        loop {
            if(ch_idx >= CHARS_PER_TEAM){
                break;
            }

            stats.append(( ch_idx*3 + 100 * seed ) % 1000);

            ch_idx = ch_idx + 1;
        };

        return stats;
    }

    fn early_completion (p1_chars_health: @Array::<u32>, p2_chars_health: @Array::<u32>) -> (bool, u256) {

        let mut team1_is_alive = false;
        let mut team2_is_alive = false;
        let mut ch_idx:u32 = 0;
        loop {
            if(ch_idx == CHARS_PER_TEAM.try_into().unwrap()){
                break;
            }

            //team is alive if one of its characters is still alive
            team1_is_alive = team1_is_alive || *p1_chars_health.at(ch_idx) != 0_u32; //*a.at(0);
            team2_is_alive = team2_is_alive || *p2_chars_health.at(ch_idx) != 0_u32;

            ch_idx = ch_idx + 1;
        };

        let both_teams_are_alive = team1_is_alive && team2_is_alive;

        if(both_teams_are_alive) {
            return (false, 3); //no early completion
        }

        if(team1_is_alive) { return (true, 1); }

        //else...
        return (true, 2);
    }

    fn attack (
        attacker_chars_attack: @Array::<u32>, 
        target_chars_armor: @Array::<u32>, 
        target_chars_health: @Array::<u32>,
        attacker_idx: u32,
        target_idx: u32
    ) -> Array::<u32> {
        let mut updated_health: Array::<u32> = ArrayTrait::new();


        let attack: u32 = *attacker_chars_attack.at(attacker_idx);
        let armor: u32 = *target_chars_armor.at(target_idx);


        let mut idx = 0;
        let mut health: u32 = 0;
        let mut new_health = 0;
        loop {
            if(idx == CHARS_PER_TEAM){
                break;
            }

            health = get_val(target_chars_health, idx);
            new_health = health;

            if(idx == target_idx) {
                if(attack > armor) {
                    let damage = attack - armor;

                    new_health = health - damage;
                }
            }

            updated_health.append(new_health);

            idx = idx + 1;
        };

        return updated_health;
    }

    fn get_val(arr: @Array::<u32>, idx: u32) -> u32 {
        return *arr.at(idx);
    }
}