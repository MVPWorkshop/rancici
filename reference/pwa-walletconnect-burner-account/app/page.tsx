"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";

import {
  Account,
  CallData,
  ec,
  hash,
  RpcProvider,
  Contract,
  stark,
} from "starknet";

import { BurnerManager } from "../dojo-burner-account/@dojoengine/create-burner/dist";

// import "dotenv/config";

export const setup = async () => {
  console.log({ XX: process.env.NEXT_PUBLIC_RPC_URL });
  const rpcProvider = new RpcProvider({
    nodeUrl: process.env.NEXT_PUBLIC_RPC_URL,
  });

  console.log({ rpcProvider });
  const masterAddress = process.env.NEXT_PUBLIC_MASTER_ADDR;
  const masterPK = process.env.NEXT_PUBLIC_MASTER_PK;
  const masterAccount = new Account(rpcProvider, masterAddress, masterPK, "1");

  const burnerAccClassHash = process.env.NEXT_PUBLIC_BURNER_ACC_CLASS_HASH;

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
    console.log(`ERR: creating burner`);
    console.log(e);
  }

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

export default function Home() {
  const [burnerAccount, setBurnerAccount] = useState(null);
  return (
    <div>
      Hello 321
      <Button
        onClick={async () => {
          console.log({
            MASTER_ADDR: process.env.NEXT_PUBLIC_MASTER_ADDR,
            NEXT_PUBLIC_PUBLIC_WC_ID: process.env.NEXT_PUBLIC_WC_ID,
          });
          console.log(`Setting up Burner Manager`);
          const burnerManager = await setup();
          console.log(`Creating Burner Account`);
          const burnerAccount = await createBurner(burnerManager);
          console.log(`All Good`);
          console.log(`Burner Account:`);
          console.log(`Addr:`, burnerAccount.address);
          console.log(`PK:`, burnerAccount.signer.pk);

          setBurnerAccount(burnerAccount);
        }}
      >
        Create Burner
      </Button>
      <Button
        onClick={async () => {
          if (burnerAccount == null) {
            console.log(`Burner account not set up`);
            return;
          }
          const sendTx = await sendEthFromAccount({
            senderAcc: burnerAccount,
            receipientAddr: process.env.NEXT_PUBLIC_MASTER_ADDR,
            amount: 100,
          });

          console.log(`ETH sent:`, { sendTx });
        }}
      >
        Send ETH from Burner
      </Button>
    </div>
  );
}
