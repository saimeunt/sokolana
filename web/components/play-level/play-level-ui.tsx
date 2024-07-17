import { AppModal } from '../ui/ui-layout';
import useContext from './context/hook';

export function PlayLevelUiModal({
  hideModal,
  show,
}: {
  hideModal: () => void;
  show: boolean;
}) {
  const {
    state: { level },
  } = useContext();
  return (
    <AppModal
      title="Submit solution"
      hide={hideModal}
      show={show}
      submit={() => {
        hideModal();
      }}
      submitLabel="Submit"
    >
      <p>Submit your solution on-chain?</p>
    </AppModal>
  );
}
