// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import MinterIDL from '../target/idl/minter.json';
import type { Minter } from '../target/types/minter';

// Re-export the generated IDL and type
export { Minter, MinterIDL };

// The programId is imported from the program IDL.
export const MINTER_PROGRAM_ID = new PublicKey(MinterIDL.address);

// This is a helper function to get the Minter Anchor program.
export function getMinterProgram(provider: AnchorProvider) {
  return new Program(MinterIDL as Minter, provider);
}

// This is a helper function to get the program ID for the Minter program depending on the cluster.
export function getMinterProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Minter program on devnet and testnet.
      // return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg');
      return new PublicKey('5PVX8zjPwPJHKqoJFcfKCXQzHGv4RiMQrij6TeLFYPWZ');
    case 'mainnet-beta':
    default:
      return MINTER_PROGRAM_ID;
  }
}
