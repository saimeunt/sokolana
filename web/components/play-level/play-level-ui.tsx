import { useRouter } from 'next/navigation';
import { AppModal } from '../ui/ui-layout';
import useContext from '@/components/context/hook';

export function PlayLevelUiModal({
  isEditor,
  hideModal,
  show,
}: {
  isEditor: boolean;
  hideModal: () => void;
  show: boolean;
}) {
  const {
    state: { level },
  } = useContext();
  const router = useRouter();
  return (
    <AppModal
      title={isEditor ? 'Well done!' : 'Submit solution'}
      hide={hideModal}
      show={show}
      submit={() => {
        if (isEditor) {
          router.push(`/mint?solution=${level.solution.join('')}`);
        } else {
          hideModal();
        }
      }}
      submitLabel={isEditor ? 'Back to editor' : 'Submit'}
    >
      <p>
        {isEditor
          ? 'Your level is mintable!'
          : 'Submit your solution on-chain?'}
      </p>
    </AppModal>
  );
}
