import { Modal as UiModal } from "./ui/Modal";

export default function Modal({ title, onClose, children }) {
  return (
    <UiModal isOpen={true} onClose={onClose} title={title}>
      {children}
    </UiModal>
  );
}