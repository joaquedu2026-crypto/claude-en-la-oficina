"use client";

import { useBranch } from "@/lib/branch-context";

export default function BranchSelector({ branches }: { branches: string[] }) {
  const { branch, setBranch } = useBranch();

  if (branches.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col items-center gap-1.5">
      <label className="text-xs text-muted font-light">¿Desde qué sucursal nos vas a contactar?</label>
      <select
        value={branch ?? ""}
        onChange={(e) => setBranch(e.target.value || null)}
        className="rounded-full border border-border-soft bg-white px-4 py-2 text-sm text-brand font-medium outline-none focus:border-brand cursor-pointer"
      >
        <option value="">Elegí tu sucursal…</option>
        {branches.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
    </div>
  );
}
