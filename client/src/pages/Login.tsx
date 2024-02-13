import * as wallet from "../utils/wallet.ts";
import * as localStorage from "../utils/localStorage.ts";

const Login = ({ stateManager }) => {
  return (
    <div className="Login">
      <h3>Page:Login</h3>
      <button onClick={async () => connectWallet(stateManager)}>
        Connect Wallet
      </button>
    </div>
  );
};

export default Login;

const connectWallet = async (stateManager) => {
  const account = await wallet.connect();

  const argentWallet = { address: account.address };

  stateManager.updateState({ page: "PreBattle", loggedIn: true, argentWallet });

  localStorage.loggedIn();
};
