export type MintPhase = 'OG' | 'WL' | 'PUBLIC' | 'NOT_STARTED' | 'ENDED';

export interface MintConfig {
  maxSupply: number;
  minted: number;
  ogMint: {
    duration: number; // in hours
    maxPerWallet: number;
    price: number;
  };
  wlMint: {
    duration: number; // in hours
    maxPerWallet: number;
    price: number;
  };
  publicMint: {
    maxPerWallet: number;
    price: number;
  };
}