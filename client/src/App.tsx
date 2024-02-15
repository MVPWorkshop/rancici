import { useEffect, useState } from "react";

import Login from "./pages/Login.tsx";
import PlayerMatching from "./pages/PlayerMatching.tsx";
import PreBattle from "./pages/PreBattle.tsx";
import Battle from "./pages/Battle.tsx";
import Modal from "./components/Modal.tsx";

import * as localStorage from "./utils/localStorage.ts";

import "./style/App.css";

const App = () => {
  const [state, setState] = useState({
    loggedIn: false,
    argentWallet: { address: "..." },
    burnerWallet: {
      address: "...",
    },
    page: "Login", // "Login" | "PlayerMatching" | "PreBattle" | "Battle"
    pageState: {},
    // modal: { title: "Messaginggggg", desc: ["...", "..."] },
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
        <PreBattle stateManager={stateManager}></PreBattle>
      ) : null}

      {stateManager.state.page == "Battle" ? (
        <Battle stateManager={stateManager}></Battle>
      ) : null}

      <Modal stateManager={stateManager}></Modal>
    </div>
  );
};

export default App;
