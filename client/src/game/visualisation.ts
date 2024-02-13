import { delay } from "../utils";

const battleState = {
  stepIdx: 0,
  steps: [],
  stepStage: "", // Attacker/Target becoming active, Attacker shooting, Missile traveling, Target hit, Attacker/Target becoming inactive
  stageStepIdx: 0, //for animation
  objects: {},
  objectsScratchPad: {},
  attacker: { pIdx: 1, chIdx: 1 },
  target: { pIdx: 2, chIdx: 1 },
};

export const run = async () => {
  await delay(500);

  await init();

  // const hitSound = new Audio("./sound-effects/hit.wav");
  const attacker = getCharObject(1, 1);
  const target = getCharObject(2, 1);

  while (true) {
    if (battleState.stageStepIdx == 0) {
      attacker.className = "Ch-Attacker BecomingActive";
      target.className = "Ch-Target BecomingActive";
      await delay(500);
    } else {
      await animateMissileTrajectory();
    }

    await delay(10);
    battleState.stageStepIdx += 1;

    if (battleState.stageStepIdx > 40) {
      target.className = "Ch-Target-Hit";
    }
    if (battleState.stageStepIdx > 70) {
      attacker.className = "Ch-Attacker BecomingInactive";
      target.className = "Ch-Target BecomingInactive";
    }
  }

  // while (true) {
  //   animateMissileTrajectory();
  //   ch.className = "Ch-Attacker BecomingActive";
  //   await delay(1000);

  //   ch.className = "Ch-Attacker Attacking";
  //   await delay(500);
  //   // hitSound.play();
  //   await delay(500);

  //   ch.className = "Ch-Attacker BecomingInactive";
  //   await delay(1000);
  // }
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
  const APPEARING_STEPS = 5;
  const MOVING_STEPS = 30;
  const DISAPPERING_STEPS = 5;
  const TOTAL_ANIMATION_STEPS =
    APPEARING_STEPS + MOVING_STEPS + DISAPPERING_STEPS;

  const missile = getMissile();

  if (battleState.objectsScratchPad["missile"] == null) {
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
    console.log({ srcPos, destPos, currPos, incPos });
  }

  let { currPos, incPos, animationStep } =
    battleState.objectsScratchPad["missile"];

  if (animationStep > TOTAL_ANIMATION_STEPS) {
    missile.style.opacity = 0;
    return;
  }

  if (animationStep < APPEARING_STEPS) {
    missile.style.width = `${animationStep * 10}px`;
    missile.style.height = `${animationStep * 10}px`;
    console.log({ size: animationStep * 10 });
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
  console.log({ left, top, width, height });
  return [left + width / 2, top + height / 2];
};

const getOffset = (el) => {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
  };
};
