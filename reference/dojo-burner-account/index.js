import * as utils from "./utils.js";

const run = async () => {
  console.log(`\nSetting things up ...`);

  const burnerManager = await utils.setup();

  console.log(`-----> Done\n`);

  console.log(`Creating Burner account ...`);

  const burnerAcc = await utils.createBurner(burnerManager);

  console.log(`Addr: ${burnerAcc.address}`);
  console.log(`PK: ${burnerAcc.signer.pk}`);

  console.log(`-----> Done\n`);

  console.log(`Delay for chain to update (10s) ...`);

  await utils.delay(10000);

  console.log(`-----> Done\n`);

  console.log(`Sending ETH from Burner Acc ...`);

  const tx = await utils.sendEthFromAccount({
    senderAcc: burnerAcc,
    receipientAddr: burnerAcc.address,
    amount: 100,
  });

  console.log(`Tx: https://testnet.starkscan.co/tx/${tx.transaction_hash}`);

  console.log(`-----> Done\n`);
};

run().then(() => {});
