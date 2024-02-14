import { useEffect, useState } from "react";

import * as visualisation from "../game/visualisation";

import "../style/Battle.css";

const CharacterCard = ({ player, ch, stateManager }) => {
  const [isActive, setActiveStatus] = useState(false);
  const [stats, setStats] = useState({
    health: 400,
    attack: 230,
    armor: 383,
  });

  useEffect(() => {
    visualisation.setCallback("onStepChange", (battleState) => {
      try {
        const newStats = battleState.step[player][ch].stats;
        setActiveStatus(characterIsActive(battleState, player, ch));
        setStats(newStats);
        // console.log("aftr::health", stats.health, "intended:", newStats.health);
      } catch (err) {
        console.log("ERR", { battleState, err, player, ch });
      }
    });
  }, []);

  return (
    <div className={"CharacterCard" + isActive ? " ActiveCharacterCard" : ""}>
      <img
        className="CharacterCardImg"
        src={`./characters/${ch.toLowerCase()}.png`}
      ></img>
      <div>Health: {stats.health}</div>
    </div>
  );
};

export default CharacterCard;

const characterIsActive = (battleState, player, ch) => {
  const ans =
    (player == `P${battleState.step.attacker.pIdx}` &&
      ch == `Ch${battleState.step.attacker.chIdx}`) ||
    (player == `P${battleState.step.target.pIdx}` &&
      ch == `Ch${battleState.step.target.chIdx}`);

  return ans;
};
