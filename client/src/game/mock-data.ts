const STEP_COUNT = 20;

export const steps = [
  {
    P1: {
      Ch1: { stats: { health: 150 } },
      Ch2: { stats: { health: 150 } },
      Ch3: { stats: { health: 150 } },
      Ch4: { stats: { health: 150 } },
      Ch5: { stats: { health: 150 } },
    },

    P2: {
      Ch1: { stats: { health: 150 } },
      Ch2: { stats: { health: 150 } },
      Ch3: { stats: { health: 150 } },
      Ch4: { stats: { health: 150 } },
      Ch5: { stats: { health: 150 } },
    },
    attacker: { pIdx: 2, chIdx: 1 },
    target: { pIdx: 1, chIdx: 1 },
  },
];

const copyStep = (step) => {
  return {
    P1: {
      Ch1: { stats: { health: step.P1.Ch1.stats.health } },
      Ch2: { stats: { health: step.P1.Ch2.stats.health } },
      Ch3: { stats: { health: step.P1.Ch3.stats.health } },
      Ch4: { stats: { health: step.P1.Ch4.stats.health } },
      Ch5: { stats: { health: step.P1.Ch5.stats.health } },
    },
    P2: {
      Ch1: { stats: { health: step.P2.Ch1.stats.health } },
      Ch2: { stats: { health: step.P2.Ch2.stats.health } },
      Ch3: { stats: { health: step.P2.Ch3.stats.health } },
      Ch4: { stats: { health: step.P2.Ch4.stats.health } },
      Ch5: { stats: { health: step.P2.Ch5.stats.health } },
    },
  };
};

const idxs = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5];

const attack = { P1: 20, P2: 10 };

export const build = () => {
  for (let i = 1; i < STEP_COUNT; ++i) {
    const prevStep = steps[i - 1];
    const step = {
      ...copyStep(prevStep),
      attacker: { pIdx: -1, chIdx: -1 },
      target: { pIdx: -1, chIdx: -1 },
    };

    if (prevStep.attacker.pIdx == 1) {
      step.attacker.pIdx = 2;
      step.target.pIdx = 1;

      let idx = prevStep.target.chIdx;
      while (step.P1[`Ch${idx}`].stats.health <= 0) {
        //skip dead
        idx = 1 + ((idx + 1) % 5);
      }
      step.attacker.chIdx = idx;

      idx = 1 + ((prevStep.attacker.chIdx + 1) % 5);
      while (step.P1[`Ch${idx}`].stats.health <= 0) {
        //skip dead
        idx = 1 + ((idx + 1) % 5);
      }
      step.target.chIdx = idx;
    } else {
      step.attacker.pIdx = 1;
      step.target.pIdx = 2;

      let idx = prevStep.target.chIdx;
      while (step.P1[`Ch${idx}`].stats.health <= 0) {
        //skip dead
        idx = 1 + ((idx + 1) % 5);
      }
      step.attacker.chIdx = idx;

      idx = 1 + ((prevStep.attacker.chIdx + 1) % 5);
      while (step.P1[`Ch${idx}`].stats.health <= 0) {
        //skip dead
        idx = (idx + 1) % 5;
      }
      step.target.chIdx = idx;
    }

    step[`P${step.target.pIdx}`][`Ch${step.target.chIdx}`].stats.health -=
      attack[`P${step.attacker.pIdx}`];
    step[`P${step.target.pIdx}`][`Ch${step.target.chIdx}`].stats.health =
      Math.max(
        0,
        step[`P${step.target.pIdx}`][`Ch${step.target.chIdx}`].stats.health
      );

    steps.push(step);
  }

  return steps;
};
