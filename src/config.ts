import { MintConfig } from './types';

export const MINT_CONFIG: MintConfig = {
  maxSupply: 1000,
  minted: 0,
  ogMint: {
    duration: 1,
    maxPerWallet: 1,
    price: 0,
  },
  wlMint: {
    duration: 2,
    maxPerWallet: 3,
    price: 5,
  },
  publicMint: {
    maxPerWallet: 3,
    price: 10,
  },
};