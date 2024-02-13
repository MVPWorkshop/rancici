import { useEffect } from "react";
import * as visualisation from "../game/visualisation";

import "../style/Battle.css";

const BattleVisualisation = ({ stateManager }) => {
  useEffect(() => {
    console.log({ document });
    visualisation.run();
  }, []);

  return (
    <div className="BattleVisualisation">
      <div className="Grid-P-1">
        <div id="Rancici-P-1-Ch-1" className="Ch">
          <img className="ChImg" src="./characters/ch1.png"></img>
        </div>
      </div>
      <div className="Grid-P-2">
        <div id="Rancici-P-2-Ch-1" className="Ch Ch-Target">
          <img className="ChImg" src="./characters/ch1.png"></img>
        </div>
      </div>

      <img id="Missile" className="MissileImg" src="fire-rect.gif" hidden></img>
    </div>
  );
};

export default BattleVisualisation;
