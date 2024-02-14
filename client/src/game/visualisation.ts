import { delay } from "../utils";

const processedStepIdx = {
  missile: -1,
};

let battleState;
export const setBattleState = (bs) => {
  battleState = bs;
};

export const run = async (stateManager) => {
  console.log("vis:run", { battleState });

  await init();

  // const hitSound = new Audio("./sound-effects/hit.wav");

  let { attacker, target } = getActiveChars(battleState.steps[0]);

  while (true) {
    if (battleState.stageStepIdx == 0) {
      attacker.className = "Ch-Attacker BecomingActive";
      target.className = "Ch-Target BecomingActive";
      await delay(1000);
    }
    await animateMissileTrajectory();

    await delay(10);
    battleState.stageStepIdx += 1;

    if (battleState.missileAnimationFinished) {
      target.className = "Ch-Target Ch-Target-Hit";
    }

    if (battleState.missileAnimationFinished && battleState.stageStepIdx > 60) {
      attacker.className = "Ch-Attacker BecomingInactive";
      target.className = "Ch-Target BecomingInactive";
      executeEventCallbacks("onStepChange");
      await delay(1000);
      battleState.stageStepIdx = 0;
      const nextStepIdx = (battleState.stepIdx + 1) % battleState.steps.length;
      battleState.stepIdx = nextStepIdx;
      battleState.step = battleState.steps[nextStepIdx];
      battleState.attacker = battleState.steps[nextStepIdx].attacker;
      battleState.target = battleState.steps[nextStepIdx].target;

      attacker.className = "Ch";
      target.className = "Ch";

      const nextActiveChars = getActiveChars(battleState.steps[nextStepIdx]);
      attacker = nextActiveChars.attacker;
      target = nextActiveChars.target;
      await delay(500);
    }
  }
};

const CHAR_COUNT = 5;
const PLAYER_COUNT = 2;

const init = async () => {
  for (let pIdx = 1; pIdx < PLAYER_COUNT + 1; ++pIdx) {
    for (let chIdx = 1; chIdx < CHAR_COUNT + 1; ++chIdx) {
      try {
        setCharObject(
          pIdx,
          chIdx,
          document.getElementById(_genCharObjectKey(pIdx, chIdx))
        );
      } catch (err) {}
    }
  }

  const missile = document.getElementById("Missile");
  missile.style.position = "absolute";
  missile.style.opacity = 0;
  missile.hidden = false;

  battleState.objects["missile"] = missile;
};

const getCharObject = (pIdx, chIdx) => {
  return battleState.objects[_genCharObjectKey(pIdx, chIdx)];
};

const setCharObject = (pIdx, chIdx, obj) => {
  battleState.objects[_genCharObjectKey(pIdx, chIdx)] = obj;
};

const _genCharObjectKey = (pIdx, chIdx) => {
  return `Rancici-P-${pIdx}-Ch-${chIdx}`;
};

const animateMissileTrajectory = async () => {
  if (processedStepIdx.missile == battleState.stepIdx) {
    return;
  }
  const APPEARING_STEPS = 5;
  const MOVING_STEPS = 30;
  const DISAPPERING_STEPS = 5;
  const TOTAL_ANIMATION_STEPS =
    APPEARING_STEPS + MOVING_STEPS + DISAPPERING_STEPS;

  const missile = getMissile();
  const scratchpad = battleState.objectsScratchPad["missile"];
  if (scratchpad == null) {
    battleState.missileAnimationFinished = false;
    const { attacker, target } = battleState;

    const srcPos = getCharCenterPosition(attacker.pIdx, attacker.chIdx);
    const destPos = getCharCenterPosition(target.pIdx, target.chIdx);
    const currPos = srcPos;
    const incPos = [
      (destPos[0] - srcPos[0]) / MOVING_STEPS,
      (destPos[1] - srcPos[1]) / MOVING_STEPS,
    ];
    battleState.objectsScratchPad["missile"] = {
      animationStep: 0,
      srcPos,
      destPos,
      currPos,
      incPos,
    };
  }

  let { currPos, incPos, animationStep } =
    battleState.objectsScratchPad["missile"];

  if (animationStep > TOTAL_ANIMATION_STEPS) {
    processedStepIdx.missile = battleState.stepIdx;

    battleState.missileAnimationFinished = true;
    missile.style.opacity = 0;

    delete battleState.objectsScratchPad["missile"];
    // console.log({ step: "proccessed" });
    return;
  }

  if (animationStep < APPEARING_STEPS) {
    missile.style.width = `${animationStep * 10}px`;
    missile.style.height = `${animationStep * 10}px`;
    // console.log({ size: animationStep * 10 });
  } else if (animationStep < APPEARING_STEPS + MOVING_STEPS) {
    currPos = [currPos[0] + incPos[0], currPos[1] + incPos[1]];
  } else {
    missile.style.width = `${parseInt(missile.style.width) - 2}px`;
    missile.style.height = `${parseInt(missile.style.height) - 2}px`;
  }

  battleState.objectsScratchPad["missile"].currPos = currPos;

  //introduce offset to center the missile
  const { width, height } = missile.getBoundingClientRect();

  const elX = `${Math.round(currPos[0] - width / 2)}px`;
  const elY = `${Math.round(currPos[1] - height / 2)}px`;
  missile.style.left = elX;
  missile.style.top = elY;

  missile.style.opacity = 1;

  battleState.objectsScratchPad["missile"].animationStep += 1;
};

const getMissile = () => {
  return battleState.objects["missile"];
};

const getObjectInfo = (key) => {
  return battleState.objectsScratchPad[key];
};

const getCharCenterPosition = (pIdx, chIdx) => {
  const ch = getCharObject(pIdx, chIdx);
  const { width, height } = ch.getBoundingClientRect();
  const { left, top } = getOffset(ch);
  // console.log({ left, top, width, height });
  return [left + width / 2, top + height / 2];
};

const getOffset = (el) => {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
  };
};

const getActiveChars = (step) => {
  return {
    attacker: getCharObject(step.attacker.pIdx, step.attacker.chIdx),
    target: getCharObject(step.target.pIdx, step.target.chIdx),
  };
};

const _callbacks = {
  onStepChange: [],
  onBattleFinished: [],
};
export const setCallback = (e, fcn) => {
  _callbacks[e].push(fcn);
};

const executeEventCallbacks = (e) => {
  // console.log({ fcn: executeEventCallbacks, e });
  for (const cb of _callbacks[e]) cb(battleState);
};
