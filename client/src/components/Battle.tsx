import { Entity , getComponentValue, getComponentEntities} from "@dojoengine/recs";
import { useEffect, useState } from "react";
import { useDojo } from "../dojo/useDojo";
import Board from "./Board";
import Countdown from "../components/Countdown.tsx";
import AvailableBlocks from "./AvailableBlocks";
import { useGameLogic } from "../hooks/useGameLogic";
import CharStats from "./CharStats";
import * as utils from "../utils/index.ts";
import { PreBattleState } from "../types";
import { start } from "repl";
import Legend from "../components/Legend";
import { EventEmitter } from 'events';
import { battleEventEmitter } from '../dojo/createSystemCalls';

export const stopPlayingClickEmitter = new EventEmitter();


function BattleComponent({ stateManager, startBattle }) {
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
      const index = entities.length -1;
      const battleeeid = getComponentValue(Battle, entities[index]).id;
      setBattleId(battleeeid);
  };
  battleEventEmitter.on('newBattleCreated', handleNewBattleCreated);

  return () => {
      battleEventEmitter.off('newBattleCreated', handleNewBattleCreated);
  };
}, []);

//FOR TESTING PURPOSES:
// useEffect(() => {
//   createBattle(masterAccount);
// }, []);

// useEffect(() => {
//   if(battleId !== -1){
// console.log("join");
//     joinBattle(secondAccount, battleId);
//   }
// }, [battleId]);

const [state, setState] = useState(PreBattleState.Awaiting_Commitment);

const moveToTheBattlePage = (async () => {
  stateManager.updateState({ countdown: { visible: false } });
  await sendMove(stateManager, "full_move_info...");
  stateManager.updateState({
    page: "Battle",
    pageState: {},
    board: { p1: board },
    stats: { p1: stats },
  });
});
const handleClick = () => {
  switch(state){
    case PreBattleState.Awaiting_Commitment:
      stopPlayingClickEmitter.emit('stopPlay');
      setState(PreBattleState.Awaiting_Reveal);
      commitFormation(masterAccount, battleId);
      break;
    case PreBattleState.Awaiting_Reveal:
      setState(PreBattleState.Reveal_Done);
      console.log("new form: "+formation);
      revealFormation(masterAccount, battleId, formation, charPositionsInFormation);
      break;
    case PreBattleState.Reveal_Done:
      startBattleSC(masterAccount, battleId);
      moveToTheBattlePage();
      console.log('game started');
      break;
  }
 
};

const { board, isPlaying, chosenBlock, collisions, stats, formation, charPositionsInFormation } = useGameLogic();

console.log("board formation"+formation);
console.log("charposition: "+charPositionsInFormation);

  return (
    <div className="game-container-wrapper-2">
      <div className="game-container-wrapper">
        <div className="game-container">
        <Legend/>
          <Board currentBoard={board} collidedCells={collisions} />
          <div className="controls">
          {isPlaying ? (
          <>
        <div className="arrowLeft"></div>
        <AvailableBlocks avaliableBlock={chosenBlock} />
        <div className="arrowRight"></div>
        </>
        ) : <></>}
          </div>
          <CharStats stats={stats} />
        </div>
      </div>

      <div className="Metadata">
        <div className="MatchId">
          <div className="Text">Match ID:</div>
          <div className="Value">3738141</div>
        </div>

        <div className="start-battle-btn-wrapper">
          <Countdown stateManager={stateManager}></Countdown>
          <button
            className="start-battle-btn"
            onClick={handleClick}
          >
            {state}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BattleComponent;

const sendMove = async (stateManager, move) => {
  stateManager.updateState({
    modal: {
      title: "Sending Transaction",
      desc: ["..."],
    },
    pageState: { status: "broadcasting" },
  });
  await utils.delay(2100);

  stateManager.updateState({
    modal: {
      title: "Waiting for oponnent's move",
      desc: ["..."],
    },
    pageState: { status: "waiting_for_oponent" },
  });
  await utils.delay(1100);

  stateManager.updateState({
    modal: {
      title: "Battle starting",
      desc: ["..."],
    },
    pageState: { status: "battle_starting" },
  });
  await utils.delay(400);

  stateManager.updateState({
    page: "Battle",
    pageState: {},
    modal: {
      title: "Battle starting",
      desc: ["..."],
      blinking: true,
    },
  });
};
