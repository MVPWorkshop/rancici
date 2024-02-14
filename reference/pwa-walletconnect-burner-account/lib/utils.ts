import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import {
  Account,
  CallData,
  ec,
  hash,
  RpcProvider,
  Contract,
  stark,
} from "starknet";
import { BurnerManager } from "../@dojoengine/create-burner/dist";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const setup = async () => {
  try {
    const rpcProvider = new RpcProvider({
      nodeUrl: process.env.NEXT_PUBLIC_RPC_URL,
    });

    const masterAddress = process.env.NEXT_PUBLIC_MASTER_ADDR;
    const masterPK = process.env.NEXT_PUBLIC_MASTER_PK;
    const masterAccount = new Account(
      rpcProvider,
      masterAddress,
      masterPK,
      "1"
    );

    const burnerAccClassHash = process.env.NEXT_PUBLIC_BURNER_ACC_CLASS_HASH;

    const burnerManager = new BurnerManager({
      masterAccount,
      rpcProvider,
      accountClassHash: burnerAccClassHash,
    });

    return { res: burnerManager, err: null };
  } catch (err) {
    return { res: null, err };
  }
};

export const createBurner = async (burnerManager) => {
  try {
    console.log({ burnerManager });
    await burnerManager.create();

    burnerManager.init();

    await delay(5000);

    const burnerAddr = burnerManager.account.address;
    const burnerPK = burnerManager.account.signer.pk;

    const burnerAccount = new Account(
      burnerManager.masterAccount.provider,
      burnerAddr,
      burnerPK,
      "1"
    );

    return { res: burnerAccount, err: null };
  } catch (err) {
    console.log({ err });
    return { res: null, err: err.toString() };
  }
};

export const sendEthFromAccount = async ({
  senderAcc,
  receipientAddr,
  amount,
}) => {
  try {
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

    return { res: tx, err: null };
  } catch (err) {
    return { res: null, err };
  }
};

export const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};
