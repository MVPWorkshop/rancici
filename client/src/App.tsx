import { useEffect, useState } from "react";

import Login from "./pages/Login.tsx";
import PlayerMatching from "./pages/PlayerMatching.tsx";
import PreBattle from "./pages/PreBattle.tsx";
import Battle from "./pages/Battle.tsx";
import Modal from "./components/Modal.tsx";
import Navbar from "./components/Navbar.tsx";

import * as localStorage from "./utils/localStorage.ts";

import "./style/App.css";

const App = () => {
  const [state, setState] = useState({
    loggedIn: false,
    argentWallet: {
      address:
        "0x05c6407451a8ad89745906ce386e23a13631eff01b09f94ff79661e283776e1e",
    },
    burnerWallet: {
      address:
        "0x13c6407451a8ad89745906ce386e23a13631eff01b09f94ff79661e283776e12",
    },
    page: "Login", // "Login" | "PlayerMatching" | "PreBattle" | "Battle"
    pageState: {},
  });
  const updateState = (newState) => {
    setState({ ...state, ...newState });
  };

  const stateManager = {
    state,
    setState,
    updateState,
  };

  useEffect(() => {
    if (state.page == "Login") {
      const loggedIn = localStorage.isLoggedIn();
      stateManager.updateState({
        loggedIn,
        page: loggedIn ? "PreBattle" : "Login",
      });
    }
  }, []);

  return (
    <div className="App">
      {stateManager.state.page == "Login" ? (
        <Login stateManager={stateManager}></Login>
      ) : null}

      {stateManager.state.page == "PlayerMatching" ? (
        <PlayerMatching stateManager={stateManager}></PlayerMatching>
      ) : null}

      {stateManager.state.page == "PreBattle" ? (
        <div>
          <Navbar stateManager={stateManager}></Navbar>
          <PreBattle stateManager={stateManager}></PreBattle>
        </div>
      ) : null}

      {stateManager.state.page == "Battle" ? (
        <div>
          <Navbar stateManager={stateManager}></Navbar>
          <Battle stateManager={stateManager}></Battle>
        </div>
      ) : null}

      <Modal stateManager={stateManager}></Modal>

      <div className="BackgroundImage"></div>
    </div>
  );
};

export default App;
