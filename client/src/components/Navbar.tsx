import * as wallet from "../utils/wallet.ts";
import * as localStorage from "../utils/localStorage.ts";

const Navbar = ({ stateManager }) => {
  return (
    <div className="Navbar">
      <h3>Rancici: Starknet Winter Hackathon</h3>

      <button onClick={async () => disconnectWallet(stateManager)}>
        Disconnect Wallet
      </button>
    </div>
  );
};

export default Navbar;

const disconnectWallet = async (stateManager) => {
  await wallet.disconnect();

  const argentWallet = null;

  stateManager.updateState({ page: "Login", loggedIn: false, argentWallet });

  localStorage.logOut();
};
