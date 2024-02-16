# Contracts

## Battle Pre-requisites:
1. instal dojo (dojoup)
2. sozo build
3. run katana in different terminal (command: `katana --disable-fee`)
4. sozo migrate
5. run `bash scripts/default_auth.sh` to authenticate battle contract (so everyone can call it)
5. (Optional) run torii in different terminal (command: 
`torii --world 0x4ebcc658b6fce7b61303e2137cdd8cab4e93720872ee0ba3be5432ee0b4fe`)
6. (Optional) After each battle step you can check the status of battleModel in torii on endpoint:
 http://0.0.0.0:8081/graphql
 and this query
 ```graphql
 query {
  battleModels {
    edges {
      node {
        id
        player1
        player2
        player1_formation_revealed
        player2_formation_revealed
        player1_formation_hash
        player2_formation_hash
        status
        winner
      }
    }
  }
}
```
7. (Optional) You can also check the status of characterModel (after reveal step) in torii with this query:
```graphql
query {
  characterModels {
    edges {
      node {
        id
        battleId
        owner
        health
        armor
        attack
        dead
      }
    }
  }
}
```

## Battle Steps Commands (localy)
```sh
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
## Deployed Contracts on Goerli Testnet
World contract deployed to: [0x4ebcc658b6fce7b61303e2137cdd8cab4e93720872ee0ba3be5432ee0b4fe](https://goerli.voyager.online/contract/0x04ebcc658b6fce7b61303e2137cdd8cab4e93728e0872ee0ba3be5432ee0b4fe)
Battle system (actions) contract deployed to: [0x117c911e19bc749a741066e1f210ce5673283ab2a745b2cd0ebfa237783448](https://goerli.voyager.online/contract/0x117c911e19bc749a741066e1f210ce5673283ab2a745b2cd0ebfa237783448) 

Battle succesfully tested on goerli testnet (check World and Battle contract Account calls in Voyager). 
You can try also, but player accounts need to be cairo v0 (You can use Starkli v0.1.20 to create braavos account). e.g. [0x075e27854cdb3645d64b019e931db8a9a151ea2a7339936a8d344ff865acec3d](https://goerli.voyager.online/contract/0x075e27854cdb3645d64b019e931db8a9a151ea2a7339936a8d344ff865acec3d)

To run torii (and check battle and character models) on goerli testnet use this command:
`torii -w 0x4ebcc658b6fce7b61303e2137cdd8cab4e93728e087e0ba3be5432ee0b4fe --rpc https://starknet-goerli.g.alchemy.com/v2/<alchemy-key> -s 950765`

Expected torii output of battleModel query on goerli testnet:
```graphql
{
  "data": {
    "battleModels": {
      "edges": [
        {
          "node": {
            "id": 1,
            "player1": "0x75e27854cdb3645d64b019e931db8a9a151ea2a7339936a8d344ff865acec3d",
            "player2": "0x232663eff47d4449cd4db21b9f878c20185b8e6094c2ae358f8e8fe91b127ab",
            "player1_formation_revealed": true,
            "player2_formation_revealed": true,
            "player1_formation_hash": "0x12342131",
            "player2_formation_hash": "0x982142131",
            "status": "FINISHED",
            "winner": "0x75e27854cdb3645d64b019e931db8a9a151ea2a7339936a8d344ff865acec3d"
          }
        },
        {
          "node": {
            "id": 2,
            "player1": "0x232663eff47d4449cd4db21b9f878c20185b8e6094c2ae358f8e8fe91b127ab",
            "player2": "0x0",
            "player1_formation_revealed": false,
            "player2_formation_revealed": false,
            "player1_formation_hash": "0x0",
            "player2_formation_hash": "0x0",
            "status": "CREATED",
            "winner": "0x0"
          }
        },
        {
          "node": {
            "id": 0,
            "player1": "0x75e27854cdb3645d64b019e931db8a9a151ea2a7339936a8d344ff865acec3d",
            "player2": "0x75e27854cdb3645d64b019e931db8a9a151ea2a7339936a8d344ff865acec3d",
            "player1_formation_revealed": false,
            "player2_formation_revealed": false,
            "player1_formation_hash": "0x12342131",
            "player2_formation_hash": "0x0",
            "status": "AWAITING_COMMITMENT",
            "winner": "0x0"
          }
        }
      ]
    }
  }
}
```