'use client';

import Modal from './Modal';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title = 'Confirm', message, confirmText = 'Confirm', cancelText = 'Cancel', isDestructive = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors font-medium"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`w-full sm:w-auto px-4 py-2 text-white rounded-md transition-colors font-medium ${
            isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
