import { useEffect } from "react";

import Navbar from "../components/Navbar.tsx";

import * as utils from "../utils/index.ts";

let stepIdx = 0;
const STEP_COUNT = 21;

const Battle = ({ stateManager }) => {
  useEffect(() => {
    fetchDataAndSetupProgression(stateManager);
  }, []);

  return (
    <div className="Battle">
      <Navbar stateManager={stateManager}></Navbar>

      <h3>Page: Battle</h3>
      <h3>Status: {stateManager.state.pageState.status}</h3>
      <h3>Info: {stateManager.state.pageState.action}</h3>
    </div>
  );
};

export default Battle;

const fetchDataAndSetupProgression = async (stateManager) => {
  stateManager.updateState({ pageState: { status: "starting" } });
  await utils.delay(400);

  setInterval(() => {
    if (stepIdx > STEP_COUNT) {
      return;
    }

    stateManager.updateState({
      pageState: {
        status: "progressing",
        action: `Step: ${stepIdx}, Action: ${Math.floor(
          Math.random() * 10e13
        )}`,
      },
    });
    stepIdx += 1;

    if (stepIdx > STEP_COUNT) {
      stateManager.updateState({ pageState: { status: "finished" } });
    }
  }, 310);
};
