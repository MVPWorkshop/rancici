import { useEffect, useState } from "react";

import * as visualisation from "../game/visualisation";

import "../style/Battle.css";

const CharacterCard = ({ pIdx, chIdx, stateManager }) => {
  const [isActive, setActiveStatus] = useState(false);
  const [stats, setStats] = useState({
    health: 400,
    attack: 230,
    armor: 383,
  });

  const player = `P${pIdx}`;
  const ch = `Ch${chIdx}`;

  useEffect(() => {
    visualisation.setCallback("onStepStart", (battleState) => {
      try {
        const newStats = battleState.step[player][ch].stats;
        setActiveStatus(characterIsActive(battleState, pIdx, chIdx));
        setStats(newStats);
      } catch (err) {
        console.log("ERR", { battleState, err, player, ch });
      }
    });
  }, []);

  const className = "CharacterCard";

  return (
    <div className="CharacterCardWrapper">
      <div id={`CharacterCard-P-${pIdx}-Ch-${chIdx}`} className={className}>
        <img
          className="CharacterCardImg"
          src={`./characters/${ch.toLowerCase()}.png`}
        ></img>
        <div>
          Health: <br></br>
          {stats.health}
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;

const characterIsActive = (battleState, pIdx, chIdx) => {
  const ans =
    (pIdx == battleState.step.attacker.pIdx &&
      chIdx == battleState.step.attacker.chIdx) ||
    (pIdx == battleState.step.target.pIdx &&
      chIdx == battleState.step.target.chIdx);

  return ans;
};
