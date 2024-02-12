import { useEffect } from "react";

import Navbar from "../components/Navbar.tsx";

import * as utils from "../utils/index.ts";

const STEP_COUNT = 21;

const Battle = ({ stateManager }) => {
  useEffect(() => {
    stateManager.updateState({ pageState: { status: "starting", stepIdx: 0 } });

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
  // console.log(stateManager.state.pageState);
  await utils.delay(400);

  console.log(stateManager.state);

  let stepIdx = 0;

  setInterval(() => {
    // const stepIdx = stateManager.state.pageState.stepIdx;
    // console.log(stateManager.state.pageState, { stepIdx });

    if (stepIdx > STEP_COUNT) {
      return;
    }

    stateManager.updateState({
      pageState: {
        status: "progressing",
        action: `Step: ${stepIdx + 1}, Action: ${Math.floor(
          Math.random() * 10e13
        )}`,
        stepIdx: stepIdx + 1,
      },
    });

    stepIdx += 1;

    if (stepIdx > STEP_COUNT) {
      stateManager.updateState({
        pageState: { status: "finished", stepIdx },
      });
    }
  }, 310);
};
