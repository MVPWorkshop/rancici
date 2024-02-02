"use client";
import { useState } from "react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import { disconnect } from "@wagmi/core";

import * as dojoUtils from "../lib/utils";

const Home = () => {
  const { open } = useWeb3Modal();
  const { address: argentAddress } = useAccount();

  const [status, setStatus] = useState({
    info: "",
    errorPresent: false,
    errorMsg: "",
    burner: {
      address: "",
      pk: "",
    },
  });

  const [burnerAccount, setBurnerAccount] = useState(null);

  const [txHistory, setTxHistory] = useState([]);

  const errorActive = (err) => {
    if (err != null) {
      setStatus({
        ...status,
        errorPresent: true,
        errorMsg: JSON.stringify(err),
      });
      return true;
    }
    return false;
  };

  return (
    <div>
      <div className="Status">
        <h3>Status:</h3>
        <pre>{JSON.stringify(status, null, 3)}</pre>
      </div>

      <div className="Control">
        <h3>Control:</h3>
        <div className="Buttons">
          {!argentAddress && (
            <button onClick={() => open()}>Connect Wallet</button>
          )}
          {argentAddress && <button onClick={disconnect}>Disconnect</button>}
          <button
            onClick={async () => {
              setStatus({ ...status, info: `Setting up Burner Manager ...` });
              const { res: burnerManager, err } = await dojoUtils.setup();
              if (errorActive(err)) return;

              setStatus({ ...status, info: `Creating Burner Account ...` });
              const { res: burnerAccount, err: err2 } =
                await dojoUtils.createBurner(burnerManager);
              errorActive(err2); //TODO: public rpc problem ...

              setStatus({
                ...status,
                info: `Burner Account created !!!`,
                burner: {
                  address: burnerAccount.address,
                  pk: burnerAccount.signer.pk,
                },
              });
              setBurnerAccount(burnerAccount);
            }}
          >
            Create Burner
          </button>
          <button
            onClick={async () => {
              if (burnerAccount == null) {
                setStatus({
                  ...status,
                  errorPresent: true,
                  errorMsg: `Burner account not set up !!!`,
                });
                return;
              }
              const { res: sendTx, err } = await dojoUtils.sendEthFromAccount({
                senderAcc: burnerAccount,
                receipientAddr: process.env.NEXT_PUBLIC_MASTER_ADDR,
                amount: 100,
              });
              if (errorActive(err)) return;

              setStatus({
                ...status,
                info: `ETH sent !!!`,
              });

              setTxHistory([...txHistory, JSON.stringify(sendTx, null, 2)]);
            }}
          >
            Send ETH from Burner
          </button>
        </div>
      </div>

      <div className="Transactions">
        <h3>Transactions ({txHistory.length})</h3>
        {txHistory.length != 0 &&
          txHistory.map((tx, idx) => <div key={`tx=${idx}`}>{tx}</div>)}
      </div>
    </div>
  );
};

export default Home;
