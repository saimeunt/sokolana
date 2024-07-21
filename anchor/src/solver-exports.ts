// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import SolverIDL from '../target/idl/solver.json';
import type { Solver } from '../target/types/solver';

// Re-export the generated IDL and type
export { Solver, SolverIDL };

// The programId is imported from the program IDL.
export const SOLVER_PROGRAM_ID = new PublicKey(SolverIDL.address);

// This is a helper function to get the Solver Anchor program.
export function getSolverProgram(provider: AnchorProvider) {
  return new Program(SolverIDL as Solver, provider);
}

// This is a helper function to get the program ID for the Solver program depending on the cluster.
export function getSolverProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Solver program on devnet and testnet.
      return new PublicKey('Dxz9KW7PbRBfcyymgNVR59jJe8cscrhgkJixHYg9eGB1');
    case 'mainnet-beta':
    default:
      return SOLVER_PROGRAM_ID;
  }
}
