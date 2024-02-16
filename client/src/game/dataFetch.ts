import * as utils from "../utils/index.ts";
import * as visualisation from "./visualisation.ts";
import * as _mockData from "./mock-data.ts";

const STEP_COUNT = 2;

export const run = async (stateManager, matchId) => {
  await utils.delay(400);

  let stepIdx = 0;

  setInterval(() => {
    if (stepIdx > STEP_COUNT) {
      return;
    }

    stateManager.updateState({
      pageState: {
        status: "progressing",
      },
    });

    stepIdx += 1;

    if (stepIdx > STEP_COUNT) {
      stateManager.updateState({
        pageState: { status: "finished", stepIdx },
      });
    }
  }, 310);

  console.log({ Q: stateManager.state.statsState });

  const steps = _mockData.build(stateManager.state.stats.p1);

  console.log({ steps });
  const battleState = {
    finished: false,
    stepIdx: 0,
    step: steps[0],
    steps,
    stepStage: "", // Attacker/Target becoming active, Attacker shooting, Missile traveling, Target hit, Attacker/Target becoming inactive
    stageStepIdx: 0, //for animation
    objects: {},
    objectsScratchPad: {},
    attacker: steps[0].attacker,
    target: steps[0].target,

    missileAnimationFinished: true,
  };

  visualisation.setBattleState(battleState);

  stateManager.updateState({ pageState: { status: "starting" } });
};

const randUint = (start, end) => {
  return start + Math.floor(Math.random() * (end - start));
};
const randStep = () => {
  const step = { P1: {}, P2: {}, attacker: {}, target: {} };
  for (let chIdx = 1; chIdx < 6; chIdx++) {
    step.P1[`Ch${chIdx}`] = {};
    step.P1[`Ch${chIdx}`].stats = randStats();
    step.P2[`Ch${chIdx}`] = {};
    step.P2[`Ch${chIdx}`].stats = randStats();
  }

  const pAttack = randUint(1, 3);
  const pTarget = pAttack == 1 ? 2 : 1;

  step.attacker = { pIdx: pAttack, chIdx: randUint(1, 6) };
  step.target = { pIdx: pTarget, chIdx: randUint(1, 6) };

  return step;
};

const randStats = () => {
  return {
    health: randUint(100, 200),
    armor: randUint(100, 200),
    attack: randUint(100, 200),
  };
};
