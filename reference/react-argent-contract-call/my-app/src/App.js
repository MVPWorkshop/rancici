import { useState } from "react";
import { connect, disconnect } from "starknetkit";
import { Contract, json } from "starknet";

import contractJson from "./chain/target/dev/dojo_starter::systems::nicole::nicole.json";

import "./style/App.css";

const CONTRACT_ADDR =
  "0x5296891fccb765ee2ef49645365e99bb4286b7c4b3f9daefb28af66e270a18d";

const { abi } = contractJson;

const App = () => {
  const [connection, setConnection] = useState();
  const [provider, setProvider] = useState();
  const [address, setAddress] = useState();

  const [contract, setContract] = useState();

  const [newX, setNewX] = useState(0);
  const [xValue, setXValue] = useState();

  const [msg, setMsg] = useState();

  const connectWallet = async () => {
    console.log(`connectWallet() called`);
    const connection = await connect();

    try {
      if (connection.wallet.isConnected) {
        setConnection(connection);
        setProvider(connection.wallet.account);
        setAddress(connection.wallet.selectedAddress);
        console.log(`Wallet Connected!`);

        const _contract = new Contract(
          abi,
          CONTRACT_ADDR,
          connection.wallet.account
        );
        setContract(_contract);
        _contract.connect(connection.wallet.account);

        console.log(`Contract initiated!`);
      }
    } catch (err) {
      console.log(`ERROR: Wallet connection failed`, { err });
    }

    console.log(`---> connectWallet() finished`);
  };

  const call_sayHi = async () => {
    try {
      console.log(`Calling .sayHi()`);

      const res = await contract.sayHi();

      setMsg(fromHex(res.toString(16)));

      console.log(`----> .sayHi() finished`);
    } catch (err) {
      console.log(`ERROR: calling .sayHi() failed`, { err });
    }
  };

  const execute_changeX = async (newX) => {
    try {
      console.log(`Executing .changeX()`);

      const tx = await contract.changeX(newX);

      console.log({ tx });
    } catch (err) {
      console.log(`ERROR: executing .changeX() failed`, { err });
    }
  };

  const call_getX = async () => {
    try {
      console.log(`Calling .getX()`);

      const res = await contract.getX();

      console.log({ res });

      setXValue(res.toString());

      console.log(`----> .getX() finished`);
    } catch (err) {
      console.log(`ERROR: calling .getX() failed`, { err });
    }
  };

  return (
    <div className="App">
      <h3>React: OK</h3>
      <button onClick={connectWallet}>Connect Wallet</button>

      <h5>Address: {address != null ? address : "wallet not connected"}</h5>

      <button onClick={call_sayHi}>Call .sayHi()</button>
      <div>Msg: {msg != null ? msg : "not yet fetched"}</div>

      <input
        type="number"
        onChange={(e) => {
          const _newX = parseInt(e.target.value);
          setNewX(_newX);
        }}
      ></input>
      <button onClick={() => execute_changeX(newX)}>Execute .changeX()</button>

      <br></br>

      <button onClick={call_getX}>Call .getX()</button>
      <div>X value: {xValue != null ? xValue : "not yet fetched"}</div>
    </div>
  );
};

const fromHex = (h) => {
  var s = "";
  for (var i = 0; i < h.length; i += 2) {
    s += String.fromCharCode(parseInt(h.substr(i, 2), 16));
  }
  return decodeURIComponent(escape(s));
};

export default App;
