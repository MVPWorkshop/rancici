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
import { useEffect, useState } from "react";
// import "./App.css";
// import { useDojo } from "../dojo/useDojo";
// import { Account, BigNumberish, RpcProvider } from "starknet";
// import { CLIENT_RENEG_LIMIT } from "tls";
// // import BattleComponent from "./Battle";
// import { battleEventEmitter } from '../dojo/createSystemCalls';
// import { useComponentValue } from "@latticexyz/react";
import Board from "./Board";
// import { EmptyCell } 
import AvailableBlocks from "./AvailableBlocks";
import { useGameLogic } from "../hooks/useGameLogic";
import CharStats from "./CharStats";
import { PreBattleState } from "../types";
import { start } from "repl";
import Legend from "../components/Legend";
import { EventEmitter } from 'events';

export const stopPlayingClickEmitter = new EventEmitter();

function BattleComponent({startBattle}) {
    // const {
    //     setup: {
    //         systemCalls: { createBattle, joinBattle, startBattle },
    //         clientComponents: { Backpack, Battle, BattleConfig, Item },
    //     },
    //     account,
    //     masterAccount,
    //     secondAccount
    // } = useDojo();

    const [state, setState] = useState(PreBattleState.Ready_To_Commit);

    const handleClick = () => {
      switch(state){
        case PreBattleState.Ready_To_Commit:
          console.log('enter case');
          stopPlayingClickEmitter.emit('stopPlay');
          setState(PreBattleState.Commited);
          //commit f-ja
          break;
        case PreBattleState.Commited:
          setState(PreBattleState.Revealed);
          //reveal f-ja
          break;
        case PreBattleState.Revealed:
          startBattle();
          console.log('game started');
          break;
      }
     
    };


    const { board, isPlaying, chosenBlock, collisions, stats, setLeftBlock, setRightBlock } = useGameLogic();
console.log(isPlaying);
  return (
    <div className="game-container">
      <Legend/>
      <Board currentBoard={board} collidedCells={collisions} />
      <div className="controls">
        <h2 />
        {isPlaying ? (
          <>
        <div className="arrowLeft"></div>
        <AvailableBlocks avaliableBlock={chosenBlock} />
        <div className="arrowRight"></div>
        </>
        ) : <></>}
        <div className="btn-container"><button className="glow-on-hover" onClick={handleClick}>{state}</button></div>
      </div>
      <CharStats stats={stats} />
    </div>
  );
}

export default BattleComponent