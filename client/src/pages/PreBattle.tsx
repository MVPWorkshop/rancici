import { useEffect, useState } from "react";

import Navbar from "../components/Navbar.tsx";
import BattleComponent from "../components/Battle.tsx";

const PreBattle = ({ stateManager }) => {
  useEffect(() => {
    const pageState = { status: "choice" };
    stateManager.updateState({ pageState });
  }, []);

  return (
    <div className="Page PreBattlePage">
      <Navbar stateManager={stateManager}></Navbar>
      <BattleComponent stateManager={stateManager} />
    </div>
  );
};

export default PreBattle;
