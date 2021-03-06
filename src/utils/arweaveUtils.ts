import axios from 'axios';
import Arweave from 'arweave';
import ArLocal from 'arlocal';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { ARLOCAL_BASE_URL, ARWEAVE_BASE_URL, WINSTONS_PER_AR } from '../constants';

const getArweavePriceForBytesInWinstons = async (bytes: number): Promise<number> => {
  const price = await axios.get<string>(ARWEAVE_BASE_URL + 'price/' + bytes);
  return +price.data;
};

const connectToArweave = (): Arweave => {
  const arweave = Arweave.init({
    host: 'arweave.net',
    protocol: 'https',
    port: 443,
  });
  // tslint:disable-next-line: no-console
  console.log("connected to Arweave mainnet. Careful, you're playing with real money here!");

  return arweave;
};

const connectToLocalArweave = async (
  shouldStartNewArLocalInstance: boolean = true,
  useLogging: boolean = true,
): Promise<{ arweave: Arweave; arLocal: ArLocal | null }> => {
  let arLocal: ArLocal | null;
  if (shouldStartNewArLocalInstance) {
    arLocal = new ArLocal();
    await arLocal.start();
  } else {
    arLocal = null;
  }

  const arweave = Arweave.init({
    host: 'localhost',
    port: 1984,
    protocol: 'http',
    logging: useLogging,
  });

  return {
    arweave,
    arLocal,
  };
};

const generateTestKey = async (arweave: Arweave): Promise<JWKInterface> => {
  const key = await arweave.wallets.generate();
  await mintTestWinstonsToKey(arweave, 1000 * WINSTONS_PER_AR, key);
  return key;
};

const uploadDataToArweave = async (
  arweave: Arweave,
  key: JWKInterface,
  data: string | Buffer,
  contentType: string,
): Promise<string> => {
  const tx = await arweave.createTransaction({ data }, key);

  tx.addTag('Content-Type', contentType);

  await arweave.transactions.sign(tx, key);

  const uploader = await arweave.transactions.getUploader(tx);

  while (!uploader.isComplete) {
    await uploader.uploadChunk();
  }

  return tx.id;
};

const getTxnURI = (txn: string, isMainnet: boolean): string => {
  if (isMainnet) {
    return ARWEAVE_BASE_URL + txn;
  } else {
    return ARLOCAL_BASE_URL + txn;
  }
};

const mintTestWinstonsToKey = async (arweave: Arweave, numberOfTokens: number, key: JWKInterface): Promise<void> => {
  const walletAddress = await arweave.wallets.getAddress(key);
  await arweave.api.get<number>('mint/' + walletAddress + '/' + numberOfTokens);
  return;
};

export {
  getArweavePriceForBytesInWinstons,
  connectToArweave,
  connectToLocalArweave,
  generateTestKey,
  uploadDataToArweave,
  getTxnURI,
  mintTestWinstonsToKey,
};
