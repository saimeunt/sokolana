import { useRouter } from 'next/navigation';
import { AppModal } from '../ui/ui-layout';
import useContext from '@/components/context/hook';
/*import { solutionToAccount } from '@/components/context/level-state';
import { useMinterProgram } from '@/lib/minter-data-access';
import { getGameAccount, useSolverProgram } from '@/lib/solver-data-access';*/

export function PlayLevelUiModal({
  hideModal,
  show,
}: {
  hideModal: () => void;
  show: boolean;
}) {
  const router = useRouter();
  const {
    state: { level },
  } = useContext();
  /* const { nftAccounts } = useMinterProgram();
  const { solve } = useSolverProgram();
  if (nftAccounts.isLoading || !nftAccounts.data) {
    return null;
  }
  const nftAccount = nftAccounts.data.find(
    ({ account }) => account.id === Number(level.id)
  );
  if (!nftAccount) {
    return null;
  } */
  return (
    <AppModal
      title="Submit solution"
      hide={hideModal}
      show={show}
      submit={async () => {
        /*await solve.mutateAsync({
          directions: solutionToAccount(level.solution),
          game: getGameAccount(Number(level.id)),
          otherData: nftAccount.publicKey,
        });*/
        router.push('/play');
      }}
      submitLabel="Submit"
    >
      <p>Submit your solution on-chain?</p>
    </AppModal>
  );
}
