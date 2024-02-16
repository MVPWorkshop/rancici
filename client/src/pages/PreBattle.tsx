import { useEffect, useState } from "react";

import BattleComponent from "../components/Battle.tsx";
import * as utils from "../utils/index.ts";

const PreBattle = ({ stateManager }) => {
  useEffect(() => {
    stateManager.updateState({ pageState: { status: "choice" } });
  }, []);

  return (
    <div className="Page PreBattlePage">
      <div className="PageContent">
        <BattleComponent stateManager={stateManager} />
      </div>
    </div>
  );
};

export default PreBattle;
