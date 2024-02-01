import {
  Account,
  CallData,
  ec,
  hash,
  RpcProvider,
  Contract,
  stark,
} from "starknet";

import { BurnerManager } from "@dojoengine/create-burner-local";

import "dotenv/config";

export const setup = async () => {
  const rpcProvider = new RpcProvider({
    nodeUrl: process.env.RPC_URL,
  });

  const masterAddress = process.env.MASTER_ADDR;
  const masterPK = process.env.MASTER_PK;
  const masterAccount = new Account(rpcProvider, masterAddress, masterPK, "1");

  const burnerAccClassHash = process.env.BURNER_ACC_CLASS_HASH;

  const burnerManager = new BurnerManager({
    masterAccount,
    rpcProvider,
    accountClassHash: burnerAccClassHash,
  });

  return burnerManager;
};

export const createBurner = async (burnerManager) => {
  try {
    await burnerManager.create();
  } catch (e) {
    console.log(e);
  }

  burnerManager.init();

  const burnerAddr = burnerManager.account.address;
  const burnerPK = burnerManager.account.signer.pk;

  const burnerAccount = new Account(
    burnerManager.masterAccount.provider,
    burnerAddr,
    burnerPK,
    "1"
  );

  return burnerAccount;
};

export const sendEthFromAccount = async ({
  senderAcc,
  receipientAddr,
  amount,
}) => {
  const ETH_ADDRESS =
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

  const { abi } = await senderAcc.provider.getClassAt(ETH_ADDRESS);

  const ethContract = new Contract(abi, ETH_ADDRESS, senderAcc.provider);

  ethContract.connect(senderAcc);

  const populatedTx = ethContract.populate("transfer", [
    receipientAddr,
    amount,
  ]);

  const tx = await ethContract.transfer(populatedTx.calldata);

  return tx;
};

export const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};
