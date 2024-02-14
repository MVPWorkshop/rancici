// interface BattleComponentProps {
//     battleId: number;
//     started: boolean;
//     joined: boolean;
//     setBattleIdValue: (value: number) => void;
//   }

//   const BattleComponent: React.FC<BattleComponentProps> = ({ battleId, started, joined, setBattleIdValue }) => {

//     const handleClick = () => {
//       setBattleIdValue(battleId);
//     };

//     const getStatus = () => {
//       if (started) {
//           return { status: 'started', color: 'green' };
//       } else if (joined) {
//           return { status: 'joined', color: 'orange' };
//       } else {
//           return { status: 'created', color: 'blue' };
//       }
//   };
  
//     return (
//       <div>
//         <p onClick={handleClick}>
//             Battle with id: <span style={{ color: getStatus().color }}>{battleId}</span> 
//             , status: <span style={{ color: getStatus().color }}>{getStatus().status}</span>
//         </p>
//       </div>
//     );
//   };

// export default BattleComponent

// import { Entity , getComponentValue, getComponentEntities} from "@dojoengine/recs";
// import { useEffect, useState } from "react";
// import "./App.css";
// import { useDojo } from "../dojo/useDojo";
// import { Account, BigNumberish, RpcProvider } from "starknet";
// import { CLIENT_RENEG_LIMIT } from "tls";
// // import BattleComponent from "./Battle";
// import { battleEventEmitter } from '../dojo/createSystemCalls';
// import { useComponentValue } from "@latticexyz/react";
import Board from "./Board";
// import { EmptyCell } from "../types";
import AvailableBlocks from "./AvailableBlocks";
import { useGameLogic } from "../hooks/useGameLogic";
import CharStats from "./CharStats";

function generateStatsArray(numStats) {
  const statsArray = [];

  for (let i = 0; i < numStats; i++) {
    const stat = {
      Health: Math.floor(Math.random() * 100) + 1, 
      Armor: Math.floor(Math.random() * 50) + 1,  
      Stamina: Math.floor(Math.random() * 200) + 1 
    };
    statsArray.push(stat);
  }

  return statsArray;
}

function BattleComponent() {
    // const {
    //     setup: {
    //         systemCalls: { createBattle, joinBattle, startBattle },
    //         clientComponents: { Backpack, Battle, BattleConfig, Item },
    //     },
    //     account,
    //     masterAccount,
    //     secondAccount
    // } = useDojo();

    const { board, startGame, isPlaying, upcomingBlocks, collisions, stats } = useGameLogic();

    // const stats = generateStatsArray(5);

    return (
        <div className="game-container">
            <h1></h1>
            <Board currentBoard={board} collidedCells={collisions}/>
            <div className="controls">
        <h2/>
        {isPlaying ? ( 
              <AvailableBlocks avaliableBlocks={upcomingBlocks} />
        ) : <></>}
      </div>
      {isPlaying ? ( 
               <CharStats stats={stats}/>) : (
                <button onClick={startGame}>New Game</button>
              )
        }
      </div>
    );
}

export default BattleComponent