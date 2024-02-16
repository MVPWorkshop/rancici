import { useEffect } from "react";

import Cell from "../components/Cell";
import { Block } from "../types.ts";
import * as constants from "../utils/constants";

import "../style/Battle.css";

const BattleVisualisation = ({ stateManager }) => {
  useEffect(() => {}, []);

  const GRID_INDICES = Array.from({ length: constants.GRID_H }, (_, i) => i);

  return (
    <div className="BattleVisualisation">
      <div className="Metadata">
        <div className="MatchId">
          <div className="Text">Match ID:</div>
          <div className="Value">3738141</div>
        </div>
      </div>
      <div className="Container1">
        <div className="GridWrapper">
          {GRID_INDICES.map((rowIdx) => (
            <div className="row" key={`${rowIdx}`}>
              {GRID_INDICES.map((colIdx) => (
                <Cell
                  type={stateManager.state.board.p1[rowIdx][colIdx]}
                  isCollided={false}
                  playerId={1}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="GridWrapper">
          {GRID_INDICES.map((rowIdx) => (
            <div className="row" key={`${rowIdx}`}>
              {GRID_INDICES.map((colIdx) => (
                <Cell
                  type={stateManager.state.board.p1[rowIdx][colIdx]}
                  isCollided={false}
                  playerId={2}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <img id="Missile" className="MissileImg" src="fire.gif" hidden></img>
    </div>
  );
};

export default BattleVisualisation;
