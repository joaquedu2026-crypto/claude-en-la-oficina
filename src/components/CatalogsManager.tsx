"use client";

import { useState } from "react";

type Catalog = {
  id: string;
  name: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  published: boolean;
  order: number;
};

const emptyForm = { name: "", description: "", url: "", imageUrl: "" };

export default function CatalogsManager({ initialCatalogs }: { initialCatalogs: Catalog[] }) {
  const [catalogs, setCatalogs] = useState<Catalog[]>(initialCatalogs);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startEdit(catalog: Catalog) {
    setEditingId(catalog.id);
    setForm({
      name: catalog.name,
      description: catalog.description ?? "",
      url: catalog.url,
      imageUrl: catalog.imageUrl ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");

    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? "Error al subir la imagen");
      return;
    }
    setForm((f) => ({ ...f, imageUrl: data.url }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) {
      setError("Nombre y enlace son obligatorios");
      return;
    }
    setSaving(true);
    setError("");

    const url = editingId ? `/api/catalogs/${editingId}` : "/api/catalogs";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Error al guardar");
      return;
    }

    if (editingId) {
      setCatalogs((prev) => prev.map((c) => (c.id === editingId ? data : c)));
    } else {
      setCatalogs((prev) => [data, ...prev]);
    }
    cancelEdit();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este catálogo?")) return;
    const res = await fetch(`/api/catalogs/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCatalogs((prev) => prev.filter((c) => c.id !== id));
    }
  }

  async function togglePublished(catalog: Catalog) {
    const res = await fetch(`/api/catalogs/${catalog.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !catalog.published }),
    });
    const data = await res.json();
    if (res.ok) {
      setCatalogs((prev) => prev.map((c) => (c.id === catalog.id ? data : c)));
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold">
          {editingId ? "Editar catálogo" : "Nuevo acceso a catálogo"}
        </h2>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Nombre</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Enlace al catálogo</label>
          <input
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="https://..."
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Descripción (opcional)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Imagen / ícono (opcional)</label>
          <input type="file" accept="image/*" onChange={handleUpload} className="text-sm" />
          {uploading && <p className="text-xs text-slate-400 mt-1">Subiendo…</p>}
          {form.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.imageUrl} alt="" className="mt-2 h-24 rounded-lg object-cover" />
          )}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-4 py-2 font-medium transition"
          >
            {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Agregar catálogo"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 font-medium transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Catálogos ({catalogs.length})</h2>
        {catalogs.length === 0 && <p className="text-slate-400 text-sm">Todavía no hay catálogos.</p>}
        {catalogs.map((catalog) => (
          <div
            key={catalog.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex gap-4 items-start"
          >
            {catalog.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={catalog.imageUrl}
                alt=""
                className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{catalog.name}</h3>
                {!catalog.published && (
                  <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">
                    Oculto
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 truncate">{catalog.url}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => togglePublished(catalog)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
              >
                {catalog.published ? "Ocultar" : "Publicar"}
              </button>
              <button
                onClick={() => startEdit(catalog)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(catalog.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-900 transition"
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
