import { useEffect } from "react";

import "../style/Battle.css";

const BattleVisualisation = ({ stateManager }) => {
  useEffect(() => {}, []);

  return (
    <div className="BattleVisualisation">
      <div className="Grid-P-1">
        <div id="Rancici-P-1-Ch-1" className="Ch">
          <img className="ChImg" src="./characters/ch1.png"></img>
        </div>
        <hr></hr>
        <div id="Rancici-P-1-Ch-2" className="Ch">
          <img className="ChImg" src="./characters/ch2.png"></img>
        </div>
        <hr></hr>
        <div id="Rancici-P-1-Ch-3" className="Ch">
          <img className="ChImg" src="./characters/ch3.png"></img>
        </div>
        <hr></hr>
        <div id="Rancici-P-1-Ch-4" className="Ch">
          <img className="ChImg" src="./characters/ch4.png"></img>
        </div>
        <hr></hr>
        <div id="Rancici-P-1-Ch-5" className="Ch">
          <img className="ChImg" src="./characters/ch5.png"></img>
        </div>
      </div>
      <div className="Grid-P-2">
        <div id="Rancici-P-2-Ch-1" className="Ch">
          <img className="ChImg" src="./characters/ch6.png"></img>
        </div>
        <hr></hr>
        <div id="Rancici-P-2-Ch-2" className="Ch">
          <img className="ChImg" src="./characters/ch3.png"></img>
        </div>
        <hr></hr>
        <div id="Rancici-P-2-Ch-3" className="Ch">
          <img className="ChImg" src="./characters/ch7.png"></img>
        </div>
        <hr></hr>
        <div id="Rancici-P-2-Ch-4" className="Ch">
          <img className="ChImg" src="./characters/ch2.png"></img>
        </div>
        <hr></hr>
        <div id="Rancici-P-2-Ch-5" className="Ch">
          <img className="ChImg" src="./characters/ch1.png"></img>
        </div>
      </div>

      <img id="Missile" className="MissileImg" src="fire.gif" hidden></img>
    </div>
  );
};

export default BattleVisualisation;
