import { Entity , getComponentValue, getComponentEntities} from "@dojoengine/recs";
import { useEffect, useState } from "react";
import "./App.css";
import { useDojo } from "./dojo/useDojo";
import { Account, BigNumberish, RpcProvider } from "starknet";
import { CLIENT_RENEG_LIMIT } from "tls";
import BattleComponent from "./Battle";
import { battleEventEmitter } from './dojo/createSystemCalls';
import { useComponentValue } from "@latticexyz/react";
import Board from "./components/Board";
import { EmptyCell } from "./types";
import AvailableBlocks from "./components/AvailableBlocks";
import { useGameLogic } from "./hooks/useGameLogic";



function App() {
    const {
        setup: {
            systemCalls: { createBattle, joinBattle, startBattle },
            clientComponents: { Backpack, Battle, BattleConfig, Item },
        },
        account,
        masterAccount,
        secondAccount
    } = useDojo();

    const { board, startGame, isPlaying, score, upcomingBlocks, collisions } = useGameLogic();

    return (
        <>
            <h1></h1>
            <Board currentBoard={board} collidedCells={collisions}/>
            <div className="controls">
        {/* <h2>Score: {score}</h2> */}
        <h2/>
        {isPlaying ? ( 
          <AvailableBlocks avaliableBlocks={upcomingBlocks} />
        ) : (
          <button onClick={startGame}>New Game</button>
        )}
      </div>
        </>
    );
}

export default App;
