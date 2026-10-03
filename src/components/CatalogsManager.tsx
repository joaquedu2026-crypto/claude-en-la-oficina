"use client";

import { useState } from "react";
import { uploadFile } from "@/lib/upload-client";

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
    try {
      const url = await uploadFile(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch {
      setError("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
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
        className="bg-white border border-border-soft rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold">
          {editingId ? "Editar catálogo" : "Nuevo acceso a catálogo"}
        </h2>

        <div>
          <label className="block text-sm text-foreground mb-1">Nombre</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="block text-sm text-foreground mb-1">Enlace al catálogo</label>
          <input
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="https://..."
            className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="block text-sm text-foreground mb-1">Descripción (opcional)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="block text-sm text-foreground mb-1">Imagen o GIF animado (opcional)</label>
          <input type="file" accept="image/*" onChange={handleUpload} className="text-sm" />
          {uploading && <p className="text-xs text-muted mt-1">Subiendo…</p>}
          {form.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.imageUrl} alt="" className="mt-2 h-24 rounded-lg object-cover" />
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand hover:bg-brand/90 text-white disabled:opacity-60 px-4 py-2 font-medium transition"
          >
            {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Agregar catálogo"}
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
        <h2 className="text-lg font-semibold">Catálogos ({catalogs.length})</h2>
        {catalogs.length === 0 && <p className="text-muted text-sm">Todavía no hay catálogos.</p>}
        {catalogs.map((catalog) => (
          <div
            key={catalog.id}
            className="bg-white border border-border-soft rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-start"
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
                  <span className="text-xs bg-brand-tint px-2 py-0.5 rounded-full text-brand">
                    Oculto
                  </span>
                )}
              </div>
              <p className="text-sm text-muted truncate">{catalog.url}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
              <button
                onClick={() => togglePublished(catalog)}
                className="text-xs px-3 py-1.5 rounded-lg bg-brand-tint hover:bg-brand-light/40 text-brand transition"
              >
                {catalog.published ? "Ocultar" : "Publicar"}
              </button>
              <button
                onClick={() => startEdit(catalog)}
                className="text-xs px-3 py-1.5 rounded-lg bg-brand-tint hover:bg-brand-light/40 text-brand transition"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(catalog.id)}
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
