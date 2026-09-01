"use client";

import { createPortal } from "react-dom";

interface LogoutConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutConfirmModal({ onConfirm, onCancel }: LogoutConfirmModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(14,15,17,0.42)] p-8">
      <div className="w-full max-w-[380px] overflow-auto rounded-[16px] border border-line bg-card shadow-[0_24px_64px_-24px_rgba(14,15,17,0.45)]">
        <div className="border-b border-line px-[24px] py-[20px] pb-[16px]">
          <div className="text-[17px] font-semibold tracking-[-0.02em]">Sign out?</div>
          <div className="mt-[3px] text-[12.5px] text-muted">
            You&rsquo;ll need to sign in again to access your account.
          </div>
        </div>

        <div className="flex items-center justify-end gap-[10px] rounded-b-[16px] border-t border-line bg-surface px-[24px] py-[14px]">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[8px] border border-line bg-card px-[14px] py-2 text-[12.5px] font-medium text-[#4E5359] transition-colors hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-[8px] border-0 bg-status-rejected-fg px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-black"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
