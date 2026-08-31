"use client";

import { useState } from "react";
import { apiRequest, ApiClientError } from "@/lib/api";
import { EmployeeProfile } from "@/types/domain";
import { useToast } from "@/context/ToastContext";

interface DeleteEmployeeModalProps {
  employee: EmployeeProfile;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteEmployeeModal({ employee, onClose, onDeleted }: DeleteEmployeeModalProps) {
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);
    try {
      await apiRequest(`/employees/${employee.id}`, { method: "DELETE" });
      toast.success(`${employee.fullName} was deleted.`);
      onDeleted();
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Couldn't delete this employee.";
      setError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(14,15,17,0.42)] p-8">
      <div className="w-full max-w-[420px] overflow-auto rounded-[16px] border border-line bg-card shadow-[0_24px_64px_-24px_rgba(14,15,17,0.45)]">
        <div className="flex items-start gap-4 border-b border-line px-[24px] py-[20px] pb-[16px]">
          <div>
            <div className="text-[17px] font-semibold tracking-[-0.02em]">Delete employee?</div>
            <div className="mt-[3px] text-[12.5px] text-muted">{employee.fullName}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto flex h-7 w-7 flex-none items-center justify-center rounded-[8px] text-[15px] text-muted transition-colors hover:bg-surface"
          >
            ✕
          </button>
        </div>

        <div className="px-[24px] py-[20px] text-[13px] leading-relaxed text-[#4E5359]">
          This permanently removes {employee.fullName}&rsquo;s employee record. This can&rsquo;t be undone.
        </div>

        {error ? (
          <div className="mx-[24px] mb-[16px] rounded-[10px] border border-status-rejected-fg/25 bg-status-rejected-bg/40 px-[13px] py-[10px] text-[12.5px] text-status-rejected-fg">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-[10px] rounded-b-[16px] border-t border-line bg-surface px-[24px] py-[14px]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[8px] border border-line bg-card px-[14px] py-2 text-[12.5px] font-medium text-[#4E5359] transition-colors hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="rounded-[8px] border-0 bg-status-rejected-fg px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
