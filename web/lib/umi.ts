import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';

const umi = (endpoint: string) => createUmi(endpoint).use(mplTokenMetadata());

export default umi;
