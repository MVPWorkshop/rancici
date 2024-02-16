# Rancici Battle Game
<img src="./contracts/assets/icon.png" alt="Game Logo" width="200"/>

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Installation](#installation)
    - [Contracts](./contracts/README.md)
    - [Client](./client/readme.md)
- [Usage](#usage)
- [Controls](#controls)


## Description
PvP battle game. Players can create or join battles.

When players are matched in battle, each player get random positions of 5 charaters (in 7x7 grid) and 10 tetris shapes (with random colours) which boost default character stats (health, attack, armor).

Each player chooses his formation of (max 5) shapes and commits to it (posting hash on chain). After both players commit to their formation, they need to send actual formation to the chain.

After both players send their formations, the battle starts. Battle is run automatically where each players's first live character attacks first live character of other player.

Automatic battle is run until one of the players has no live characters left or 50 turns are made, at which point player with most health (sum of all characters health) wins

## Features
TBD
## Usage
TBD
## Controls
TBD