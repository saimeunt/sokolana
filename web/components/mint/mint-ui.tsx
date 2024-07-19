import { AppModal } from '../ui/ui-layout';

export function MintUiModal({
  hideModal,
  show,
}: {
  hideModal: () => void;
  show: boolean;
}) {
  return (
    <AppModal
      title="Mint level"
      hide={hideModal}
      show={show}
      submit={() => {
        hideModal();
      }}
      submitLabel="Mint"
    >
      <p>Ready to mint your level on-chain?</p>
    </AppModal>
  );
}
