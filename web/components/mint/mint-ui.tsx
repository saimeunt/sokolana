import { useRouter } from 'next/navigation';
import { Keypair } from '@solana/web3.js';
import { useLocalStorage } from 'usehooks-ts';
import { AppModal } from '../ui/ui-layout';
import { useMinterProgram } from '@/lib/minter-data-access';
import { levelToAccount, loadLevel } from '@/components/context/level-state';
import { Input } from '@/lib/types';
import { defaultEditorLevel } from '@/lib/levels';
import { useSolverProgram } from '@/lib/solver-data-access';

export function MintUiModal({
  hideModal,
  show,
  solution,
}: {
  hideModal: () => void;
  show: boolean;
  solution: Input[];
}) {
  const router = useRouter();
  const [levelData, setLevelData] = useLocalStorage(
    'editor-level',
    defaultEditorLevel
  );
  const { nftAccounts, counterAccounts, hashStorageAccounts, createNft } =
    useMinterProgram();
  const { initialize } = useSolverProgram();
  if (
    nftAccounts.isLoading ||
    !nftAccounts.data ||
    counterAccounts.isLoading ||
    !counterAccounts.data ||
    hashStorageAccounts.isLoading ||
    !hashStorageAccounts.data
  ) {
    return null;
  }
  const nftIdCounter = counterAccounts.data[0].publicKey;
  const hashStorage = hashStorageAccounts.data[0].publicKey;
  return (
    <AppModal
      title="Mint level"
      hide={hideModal}
      show={show}
      submit={async () => {
        const nftAccount = Keypair.generate();
        const idNft = nftAccounts.data.length + 1;
        await Promise.all([
          createNft.mutateAsync({
            ...levelToAccount(loadLevel('editor', levelData)),
            nftAccount,
            nftIdCounter,
            hashStorage,
          }),
          initialize.mutateAsync({ idNft, otherData: nftAccount.publicKey }),
        ]);
        setLevelData(defaultEditorLevel);
        router.push(`/play/${idNft}`);
      }}
      submitLabel="Mint"
    >
      <p>Ready to mint your level on-chain?</p>
    </AppModal>
  );
}
