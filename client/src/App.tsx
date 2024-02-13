import { useEffect, useState } from "react";

import Login from "./pages/Login.tsx";
import PreBattle from "./pages/PreBattle.tsx";
import Battle from "./pages/Battle.tsx";

import * as localStorage from "./utils/localStorage.ts";

import "./style/App.css";

const SKIP_LOGIN = true;

const App = () => {
  const [state, setState] = useState({
    loggedIn: false,
    argentWallet: { address: "..." },
    burnerWallet: {
      address: "...",
    },
    page: "Battle", // "Login" | "PreBattle" | "Battle"
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
    if (SKIP_LOGIN == true) return;

    const loggedIn = localStorage.isLoggedIn();
    stateManager.updateState({
      loggedIn,
      page: loggedIn ? "PreBattle" : "Login",
    });
  }, []);

  return (
    <div className="App">
      {stateManager.state.page == "Login" ? (
        <Login stateManager={stateManager}></Login>
      ) : null}

      {stateManager.state.page == "PreBattle" ? (
        <PreBattle stateManager={stateManager}></PreBattle>
      ) : null}

      {stateManager.state.page == "Battle" ? (
        <Battle stateManager={stateManager}></Battle>
      ) : null}
    </div>
  );
};

export default App;
