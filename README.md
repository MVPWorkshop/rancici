# Rancici Battle Game

<img src="./readme-assets/rancici-home.png" alt="Rancici Logo" width="2000"/>

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Installation](#installation)
  - [Contracts](./contracts/README.md)
  - [Client](./client/readme.md)
- [Usage](#usage)
- [Controls](#controls)

## Description

PvP battle game (Futuristic Naruto Style). Players can create or join battles.

When players are matched in battle, each player get random positions of 5 charaters (in 7x7 grid) and 10 tetris shapes (with random colours) which boost default character stats (health, attack, armor).

Each player chooses his formation of (max 5) shapes and commits to it (posting hash on chain). After both players commit to their formation, they need to send actual formation to the chain.After both players send their formations, the battle starts.

Battle is run automatically where each players's first alive character attacks the first alive character of the other player in loop. Automatic battle is run until one of the players has no live characters left or 50 turns (each) are made, at which point player with most health (sum of all characters health) wins.

## Features

PVP battle game with following features:

- Create battle
- Join battle
- Commit formation
- Reveal formation
- Start battle
  Create and join will be done autoatically by Madara in the future vesion.

## Usage

Check [contracts](./contracts/README.md) and [client](./client/readme.md) for more details.

## Controls

For Cli battle commands and controls look at [Battle Steps Commands](./contracts/README.md#battle-steps-commands-localy)
