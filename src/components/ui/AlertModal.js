'use client';

import Modal from './Modal';

export default function AlertModal({ isOpen, onClose, title = 'Alert', message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          OK
        </button>
      </div>
    </Modal>
  );
}
