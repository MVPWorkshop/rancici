import { useEffect, useState } from "react";

import Navbar from "../components/Navbar.tsx";

import * as utils from "../utils/index.ts";

const PreBattle = ({ stateManager }) => {
  useEffect(() => {
    const pageState = { status: "choice" };
    stateManager.updateState({ pageState });
  }, []);

  return (
    <div className="PreBattle">
      <Navbar stateManager={stateManager}></Navbar>

      <h3>PreBattle</h3>
      <h3>Status: {stateManager.state.pageState.status}</h3>
      <button onClick={() => sendMove(stateManager, "full move info")}>
        Random move
      </button>
    </div>
  );
};

export default PreBattle;

const sendMove = async (stateManager, move) => {
  stateManager.updateState({ pageState: { status: "broadcasting" } });
  await utils.delay(2100);

  stateManager.updateState({ pageState: { status: "waiting_for_oponent" } });
  await utils.delay(1100);

  stateManager.updateState({ pageState: { status: "battle_starting" } });
  await utils.delay(400);

  stateManager.updateState({ page: "Battle", pageState: {} });
};
