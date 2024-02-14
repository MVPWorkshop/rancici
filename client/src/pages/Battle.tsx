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
    <div className="Battle">
      <Navbar stateManager={stateManager}></Navbar>

      <h3>Page: Battle</h3>
      <h3>Status: {stateManager.state.pageState.status}</h3>

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
          player={`P${pIdx}`}
          ch={`Ch${chIdx}`}
          stateManager={stateManager}
        ></CharacterCard>
      ))}
    </div>
  );
};
