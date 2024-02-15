import { useEffect, useState } from "react";

import * as utils from "../utils/index.ts";

const PlayerMatching = ({ stateManager }) => {
  useEffect(() => {
    (async () => {
      stateManager.updateState({
        modal: {
          title: "Matching Started: Querying online Players",
          desc: ["..."],
        },
        pageState: { status: "in_progress" },
      });
      await utils.delay(1000);

      stateManager.updateState({
        modal: {
          title: "Matching Done: Oponnent found",
          desc: ["Address: 0xade1...0013", "W: 3 | L: 1 | D: 0"],
        },
        pageState: { status: "oponnent_found" },
      });
      await utils.delay(1000);

      stateManager.updateState({
        modal: {
          title: "Match Starting",
          desc: ["..."],
        },
        pageState: { status: "match_starting" },
      });
      await utils.delay(1000);

      stateManager.updateState({
        page: "PreBattle",
        pageState: {},
        modal: null,
      });
    })();
  }, []);

  return null;
};

export default PlayerMatching;
