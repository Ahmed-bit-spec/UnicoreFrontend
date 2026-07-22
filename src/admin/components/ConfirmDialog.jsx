import Modal from "./Modal";
import { useLanguage } from "@/hooks/useLanguage";

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "danger",
  body,
  loading = false,
  loadingLabel,
  closeOnConfirm = true,
}) => {
  const { t } = useLanguage();
  const ap = t.adminPanel;

  const confirmClass =
    variant === "danger"
      ? "bg-red-500 hover:bg-red-600 text-white"
      : "bg-[#2C2DE0] dark:bg-[#1E1FAA] hover:bg-[#1E1FAA] dark:bg-[#0F0F55] text-white";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title ?? ap.common.confirmTitle}
      description={description ?? ap.common.confirmBody}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
          >
            {cancelLabel ?? ap.common.cancel}
          </button>
          <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
            type="button"
            disabled={loading}
            onClick={() => {
              onConfirm?.();
              if (closeOnConfirm) onClose();
            }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
          >
            {loading ? loadingLabel ?? ap.common.loading : confirmLabel ?? ap.common.confirm}
          </button>
        </>
      }
    >
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {body ?? description ?? ap.common.confirmBody}
      </p>
    </Modal>
  );
};

export default ConfirmDialog;
