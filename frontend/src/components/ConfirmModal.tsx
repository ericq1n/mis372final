import { useState } from 'react';

type Tone = 'default' | 'danger';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  // Disable confirm with an explanation — useful for guard conditions that
  // should be visible to the user (e.g. "transfer your balance first").
  disabledReason?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  disabledReason,
  onConfirm,
  onClose,
}) => {
  const [working, setWorking] = useState(false);
  const [err, setErr] = useState('');

  if (!isOpen) return null;

  const confirmCls =
    tone === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-[#CC5500] hover:bg-[#b34600] text-white';

  const handleConfirm = async () => {
    if (disabledReason) return;
    setErr('');
    setWorking(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Operation failed');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <header className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-700 text-lg leading-none"
          >
            ×
          </button>
        </header>

        <div className="p-5 space-y-3">
          {description && (
            <div className="text-sm text-gray-700 leading-relaxed">{description}</div>
          )}

          {disabledReason && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-md px-3 py-2">
              {disabledReason}
            </div>
          )}

          {err && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">
              {err}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              disabled={working}
              className="flex-1 bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 py-2 rounded-md text-sm font-medium transition disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={working || !!disabledReason}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition disabled:opacity-50 ${confirmCls}`}
            >
              {working ? 'Working...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
