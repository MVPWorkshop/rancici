# Contracts


## Battle Commands
```sh
 # Authenticate battle contract (so everyone can call it)
 bash scripts/default_auth.sh
 
 # Create battle
 sozo execute 0x117c911e19bc749a741066e1f210ce5673283ab2a745b2cd0ebfa237783448 createBattle

 # Join battle with different accounts
 sozo execute --account-address 0x5686a647a9cdd63ade617e0baf3b364856b813b508f03903eb58a7e622d5855 --private-key 0x33003003001800009900180300d206308b0070db00121318d17b5e6262150b --calldata 0  0x117c911e19bc749a741066e1f210ce5673283ab2a745b2cd0ebfa237783448 joinBattle

 # Commmit formation for battle with first account
 sozo execute --calldata 0,0x12342131  0x117c911e19bc749a741066e1f210ce5673283ab2a745b2cd0ebfa237783448 commitFormation

 # Commmit formation for battle with second account
 sozo execute --account-address 0x5686a647a9cdd63ade617e0baf3b364856b813b508f03903eb58a7e622d5855 --private-key 0x33003003001800009900180300d206308b0070db00121318d17b5e6262150b --calldata 0,0x982142131 0x117c911e19bc749a741066e1f210ce5673283ab2a745b2cd0ebfa237783448 commitFormation

 # Reveal formation for battle with first account
 sozo execute --calldata 0,49,0,0,0,4,1,2,1,0,0,1,0,0,2,3,0,2,1,4,0,2,0,0,2,1,3,0,2,3,0,0,0,0,0,2,0,0,0,0,0,0,2,3,0,0,0,0,0,2,3,5,4,6,9,16,23  0x117c911e19bc749a741066e1f210ce5673283ab2a745b2cd0ebfa237783448 revealFormation

 # Reveal formation for battle with second account
 sozo execute --account-address 0x5686a647a9cdd63ade617e0baf3b364856b813b508f03903eb58a7e622d5855 --private-key 0x33003003001800009900180300d206308b0070db00121318d17b5e6262150b --calldata 0,49,0,3,1,4,0,2,1,4,2,1,2,0,2,3,0,2,1,4,0,2,0,0,2,1,3,0,2,3,0,0,0,0,0,2,0,0,0,0,0,0,2,3,0,0,0,0,0,2,3,5,2,6,9,16,23  0x117c911e19bc749a741066e1f210ce5673283ab2a745b2cd0ebfa237783448 revealFormation

 # Start Battle (only if 2 different accounts have joined the battle and revealed their formations)
 sozo execute 0x117c911e19bc749a741066e1f210ce5673283ab2a745b2cd0ebfa237783448 startBattle --calldata 0

```
