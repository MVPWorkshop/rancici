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

import { Entity , getComponentValue, getComponentEntities} from "@dojoengine/recs";
import { useEffect, useState } from "react";
// import "./App.css";
import { useDojo } from "../dojo/useDojo";
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
import { getEvents, setComponentsFromEvents, getEntityIdFromKeys} from "@dojoengine/utils";
import { battleEventEmitter } from '../dojo/createSystemCalls';


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

        const {
        setup: {
            systemCalls: { createBattle, joinBattle, startBattleSC, commitFormation,revealFormation },
            clientComponents: { Character, Battle, BattleConfig },
        },
        account,
        masterAccount,
        secondAccount
    } = useDojo();
    const [battleId, setBattleId] = useState(-1);
    const [battleEntities, setBattleEntities] = useState<any[]>(Array.from(getComponentEntities(Battle)));

    useEffect(() => {
      const handleNewBattleCreated= () => {
         var entities = Array.from(getComponentEntities(Battle));
         setBattleEntities(entities);
          // console.log(entities);
          const index = entities.length -1;
          // console.log(index);
          // console.log(entities[index]);
          const battleeeid = getComponentValue(Battle, entities[index]).id;
          setBattleId(battleeeid);
          // joinBattle(secondAccount, entities[index]);
      };
      battleEventEmitter.on('newBattleCreated', handleNewBattleCreated);

      return () => {
          battleEventEmitter.off('newBattleCreated', handleNewBattleCreated);
      };
  }, []);

    useEffect(() => {
      createBattle(masterAccount);
    }, []);

    useEffect(() => {
      if(battleId !== -1){
console.log("join");
        joinBattle(secondAccount, battleId);
      }
    }, [battleId]);

    const [state, setState] = useState(PreBattleState.Awaiting_Commitment);

//     const entity = getEntityIdFromKeys ([BigInt(battleId
//   ] )as Entity;

//     const val = getComponentValue(Battle, entity);
// console.log("VALUE: "+val);
    // setBattleId(val.id);

    const handleClick = () => {
      switch(state){
        case PreBattleState.Awaiting_Commitment:
          stopPlayingClickEmitter.emit('stopPlay');
          setState(PreBattleState.Awaiting_Reveal);
          commitFormation(masterAccount, battleId);
          break;
        case PreBattleState.Awaiting_Reveal:
          setState(PreBattleState.Reveal_Done);
          revealFormation(masterAccount, battleId, formation.toString(), charPositionsInFormation.toString());
          break;
        case PreBattleState.Reveal_Done:
          startBattleSC(masterAccount, battleId);
          //startBattle();
          console.log('game started');
          break;
      }
     
    };

    const { board, isPlaying, chosenBlock, collisions, stats, formation, charPositionsInFormation } = useGameLogic();

    console.log("board formation"+formation);
    console.log("charposition: "+charPositionsInFormation);
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