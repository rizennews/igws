'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function DeleteFormButton({ formId, deleteAction }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteAction(formId);
  };

  return (
    <>
      <button 
        type="button" 
        onClick={() => setIsModalOpen(true)}
        disabled={isDeleting}
        className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm disabled:opacity-50" 
        title="Delete Flow"
      >
        <Trash2 size={13} strokeWidth={2.5} />
      </button>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Form"
        message="Are you sure you want to delete this form? This action cannot be undone and will permanently delete all form data and submissions."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </>
  );
}
