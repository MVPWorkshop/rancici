import { useEffect } from "react";

import Navbar from "../components/Navbar.tsx";
import BattleVisualisation from "../components/BattleVisualisation.tsx";
import CharacterCard from "../components/CharacterCard.tsx";

import * as dataFetch from "../game/dataFetch";
import * as visualisation from "../game/visualisation";
import * as utils from "../utils/index.ts";

import "../style/Battle.css";

const Battle = ({ stateManager }) => {
  useEffect(() => {
    (async () => {
      stateManager.updateState({
        pageState: { status: "fetching" },
        modal: {
          title: "Battle starting",
          desc: ["..."],
          blinking: true,
          special: "battle_starting",
        },
      });

      await utils.delay(2000);

      await dataFetch.run(stateManager, 1);

      visualisation.run(stateManager);

      visualisation.setCallback("onFinish", (battleState) => {
        stateManager.updateState({
          modal: {
            title: "Glorious Victory",
            desc: ["You have advanced to LEVEL 2"],
          },
        });
      });
    })();
  }, []);

  return (
    <div className="Page BattlePage">
      <div className="PageContent">
        <BattleVisualisation stateManager={stateManager}></BattleVisualisation>
        <div className="TeamInfoWrapper">
          <TeamInfo stateManager={stateManager} pIdx="1"></TeamInfo>
          <TeamInfo stateManager={stateManager} pIdx="2"></TeamInfo>
        </div>
      </div>
    </div>
  );
};

export default Battle;

const TeamInfo = ({ stateManager, pIdx }) => {
  const CHARACTER_COUNT = 5;

  return (
    <div className={`P${pIdx}-Ch-Info`}>
      {Array.from({ length: CHARACTER_COUNT }, (_, i) => i + 1).map((chIdx) => (
        <CharacterCard
          pIdx={pIdx}
          chIdx={chIdx}
          stateManager={stateManager}
        ></CharacterCard>
      ))}
    </div>
  );
};
