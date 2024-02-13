import {
  connect as starknetkitConnect,
  disconnect as starknetkitDisconnect,
} from "starknetkit";
import { Account } from "starknet";

export const connect = async () => {
  // Let the user pick a wallet (on button click)
  const starknet = await starknetkitConnect();

  if (!starknet) {
    throw Error(
      "User rejected wallet selection or silent connect found nothing"
    );
  }

  starknet.wallet?.enable();

  let account: Account | undefined = undefined;
  // Check if connection was successful
  if (starknet.wallet?.isConnected) {
    account = await starknet.wallet.account;
  }

  if (!account?.address) {
    throw new Error("account not found");
  }

  return account;
};

export const disconnect = async () => {
  await starknetkitDisconnect();
};
