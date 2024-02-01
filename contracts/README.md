# Contracts


## Battle Commands
```sh
 # Authenticate battle contract (so everyone can call it)
 sozo auth writer -v Battle 0x205b2d192248efe597a053110c62c4abaa6f637a00a084596045a592c75c2aa  --world 0x28f5999ae62fec17c09c52a800e244961dba05251f5aaf923afabd9c9804d1a
 
 # Create battle
 sozo execute 0x205b2d192248efe597a053110c62c4abaa6f637a00a084596045a592c75c2aa createBattle

 # Join battle with different accounts
 sozo execute --account-address 0x5686a647a9cdd63ade617e0baf3b364856b813b508f03903eb58a7e622d5855 --private-key 0x33003003001800009900180300d206308b0070db00121318d17b5e6262150b --calldata 0  0x205b2d192248efe597a053110c62c4abaa6f637a00a084596045a592c75c2aa joinBattle

 # Start Battle (only if 2 different accounts have joineds)
 sozo execute 0x205b2d192248efe597a053110c62c4abaa6f637a00a084596045a592c75c2aa startBattle --calldata 0`

```
