import { useRouter } from 'next/navigation';
import { Keypair } from '@solana/web3.js';
import { useLocalStorage } from 'usehooks-ts';
import { AppModal } from '../ui/ui-layout';
import { useMinterProgram } from '@/lib/minter-data-access';
import { levelToAccount, loadLevel } from '@/components/context/level-state';
import { Input } from '@/lib/types';
import { defaultEditorLevel } from '@/lib/levels';

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
        await createNft.mutateAsync({
          ...levelToAccount(loadLevel('editor', levelData)),
          nftAccount: Keypair.generate(),
          nftIdCounter,
          hashStorage,
        });
        setLevelData(defaultEditorLevel);
        router.push(`/play/${nftAccounts.data.length + 1}`);
      }}
      submitLabel="Mint"
    >
      <p>Ready to mint your level on-chain?</p>
    </AppModal>
  );
}
