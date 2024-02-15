import { useEffect } from "react";

import Navbar from "../components/Navbar.tsx";
import BattleVisualisation from "../components/BattleVisualisation.tsx";
import CharacterCard from "../components/CharacterCard.tsx";

import * as dataFetch from "../game/dataFetch";
import * as visualisation from "../game/visualisation";

import "../style/Battle.css";

const Battle = ({ stateManager }) => {
  useEffect(() => {
    (async () => {
      stateManager.updateState({ pageState: { status: "fetching" } });

      await dataFetch.run(stateManager, 1);

      visualisation.run(stateManager);
    })();
  }, []);

  return (
    <div className="Page Battle">
      <Navbar stateManager={stateManager}></Navbar>
      <BattleVisualisation stateManager={stateManager}></BattleVisualisation>
      <div className="TeamInfoWrapper">
        <TeamInfo stateManager={stateManager} pIdx="1"></TeamInfo>
        <TeamInfo stateManager={stateManager} pIdx="2"></TeamInfo>
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
