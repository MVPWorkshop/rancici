import * as wallet from "../utils/wallet.ts";
import * as localStorage from "../utils/localStorage.ts";

const Navbar = ({ stateManager }) => {
  return (
    <div className="Navbar">
      <div className="Logo">
        <img src="./rancici-logo.png"></img>
        <div className="Text">Rancici</div>
      </div>

      <div className="RightSideWrapper">
        <div className="Account">
          <div className="Argent">
            {/* <img src="./argent-logo.png"></img> */}
            <div className="Img"></div>
            <div className="Address">
              {formatAddress(stateManager.state.argentWallet.address)}
            </div>
          </div>
        </div>

        <div className="Account">
          <div className="Dojo">
            {/* <img src="./dojo-logo.png"></img> */}
            <div className="Img"></div>
            <div className="Address">
              {formatAddress(stateManager.state.burnerWallet.address)}
            </div>
          </div>
        </div>

        <button onClick={async () => disconnectWallet(stateManager)}>
          Disconnect
        </button>
      </div>
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

const formatAddress = (address: string) => {
  return `${address.slice(0, 5)}...${address.slice(
    address.length - 3,
    address.length
  )}`;
};
