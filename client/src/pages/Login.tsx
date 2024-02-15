import LoginBackground from "../components/LoginBackground.tsx";
import { setup } from "../components/LoginBackground.tsx";
import * as wallet from "../utils/wallet.ts";
import * as localStorage from "../utils/localStorage.ts";

const Login = ({ stateManager }) => {
  return (
    <div className="Login">
      <div id="LoginBackgroundWrapper">
        <LoginBackground></LoginBackground>
      </div>

      <div className="Info">
        <div className="Logo">
          <div className="Text">Rancici</div>
          <img src="./rancici-logo.png"></img>
        </div>
        <div className="Description">
          <div className="Main">Starknet Winter Hackathon 2024</div>

          <div className="Sponsors">
            <div className="Pre">Built using: </div>
            <div className="SponsorContainer">
              <img src="/dojo-logo.png"></img>
              Dojo Engine
            </div>
            <div className="SponsorContainer">
              <img src="/argent-logo.png"></img>
              Argent Mobile Wallet
            </div>
          </div>
        </div>

        <button
          className="LoginButton"
          onClick={async () => connectWallet(stateManager)}
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
};

export default Login;

const connectWallet = async (stateManager) => {
  const account = await wallet.connect();

  const argentWallet = { address: account.address };

  stateManager.updateState({
    page: "PlayerMatching",
    loggedIn: true,
    argentWallet,
  });

  localStorage.loggedIn();
};
