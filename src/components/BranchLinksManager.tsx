"use client";

import { useState } from "react";

type BranchLink = {
  id: string;
  branch: string;
  category: string;
  url: string;
};

const emptyForm = { branch: "", category: "", url: "" };

export default function BranchLinksManager({ initialBranchLinks }: { initialBranchLinks: BranchLink[] }) {
  const [branchLinks, setBranchLinks] = useState<BranchLink[]>(initialBranchLinks);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startEdit(link: BranchLink) {
    setEditingId(link.id);
    setForm({ branch: link.branch, category: link.category, url: link.url });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.branch.trim() || !form.category.trim() || !form.url.trim()) {
      setError("Sucursal, categoría y enlace son obligatorios");
      return;
    }
    setSaving(true);
    setError("");

    const url = editingId ? `/api/branch-links/${editingId}` : "/api/branch-links";
    const method = editingId ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Error al guardar");
        return;
      }

      if (editingId) {
        setBranchLinks((prev) => prev.map((b) => (b.id === editingId ? data : b)));
      } else {
        setBranchLinks((prev) => [data, ...prev]);
      }
      cancelEdit();
    } catch {
      setError("Error de conexión. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este enlace?")) return;
    const res = await fetch(`/api/branch-links/${id}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) {
      setBranchLinks((prev) => prev.filter((b) => b.id !== id));
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-border-soft rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold">{editingId ? "Editar enlace" : "Nuevo enlace por sucursal"}</h2>
        <p className="text-xs text-muted -mt-2">
          No son catálogos: son los links que usan los anuncios cuando le preguntan la sucursal al visitante, o la
          ubicación de Google Maps de cada sucursal. No se muestran como tarjetas en la página.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-foreground mb-1">Sucursal</label>
            <input
              value={form.branch}
              onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
              placeholder="ej: Rio Grande"
              className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-sm text-foreground mb-1">Categoría</label>
            <input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="ej: Maquillaje, Ubicacion"
              className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
            />
          </div>
        </div>
        <p className="text-xs text-muted -mt-2">
          La categoría tiene que coincidir exactamente con la que elegiste en el anuncio (sección Anuncios →
          &quot;Preguntarle la sucursal al cliente&quot;).
        </p>

        <div>
          <label className="block text-sm text-foreground mb-1">Enlace</label>
          <input
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="https://..."
            className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand hover:bg-brand/90 text-white disabled:opacity-60 px-4 py-2 font-medium transition"
          >
            {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Agregar enlace"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg bg-brand-tint hover:bg-brand-light/40 text-brand px-4 py-2 font-medium transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Enlaces ({branchLinks.length})</h2>
        {branchLinks.length === 0 && <p className="text-muted text-sm">Todavía no hay enlaces.</p>}
        {branchLinks.map((link) => (
          <div
            key={link.id}
            className="bg-white border border-border-soft rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">{link.branch}</span>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                  {link.category}
                </span>
              </div>
              <p className="text-sm text-muted truncate mt-1">{link.url}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
              <button
                onClick={() => startEdit(link)}
                className="text-xs px-3 py-1.5 rounded-lg bg-brand-tint hover:bg-brand-light/40 text-brand transition"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(link.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
