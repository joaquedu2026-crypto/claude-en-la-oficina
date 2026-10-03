"use client";

import { useState } from "react";

type Ad = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  videoUrl: string | null;
  link: string | null;
  published: boolean;
  order: number;
};

const emptyForm = { title: "", description: "", imageUrl: "", videoUrl: "", link: "" };

export default function AdsManager({ initialAds }: { initialAds: Ad[] }) {
  const [ads, setAds] = useState<Ad[]>(initialAds);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startEdit(ad: Ad) {
    setEditingId(ad.id);
    setForm({
      title: ad.title,
      description: ad.description,
      imageUrl: ad.imageUrl ?? "",
      videoUrl: ad.videoUrl ?? "",
      link: ad.link ?? "",
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
    if (!form.title.trim() || !form.description.trim()) {
      setError("Título y descripción son obligatorios");
      return;
    }
    setSaving(true);
    setError("");

    const url = editingId ? `/api/ads/${editingId}` : "/api/ads";
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
      setAds((prev) => prev.map((a) => (a.id === editingId ? data : a)));
    } else {
      setAds((prev) => [data, ...prev]);
    }
    cancelEdit();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este anuncio?")) return;
    const res = await fetch(`/api/ads/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAds((prev) => prev.filter((a) => a.id !== id));
    }
  }

  async function togglePublished(ad: Ad) {
    const res = await fetch(`/api/ads/${ad.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !ad.published }),
    });
    const data = await res.json();
    if (res.ok) {
      setAds((prev) => prev.map((a) => (a.id === ad.id ? data : a)));
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-border-soft rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold">
          {editingId ? "Editar anuncio" : "Nuevo anuncio"}
        </h2>

        <div>
          <label className="block text-sm text-foreground mb-1">Título</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="block text-sm text-foreground mb-1">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="block text-sm text-foreground mb-1">Imagen</label>
          <input type="file" accept="image/*" onChange={handleUpload} className="text-sm" />
          {uploading && <p className="text-xs text-muted mt-1">Subiendo…</p>}
          {form.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.imageUrl} alt="" className="mt-2 h-24 rounded-lg object-cover" />
          )}
        </div>

        <div>
          <label className="block text-sm text-foreground mb-1">
            Video (URL de YouTube u otro, opcional)
          </label>
          <input
            value={form.videoUrl}
            onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
            placeholder="https://youtube.com/..."
            className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="block text-sm text-foreground mb-1">Enlace (opcional)</label>
          <input
            value={form.link}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
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
            {saving ? "Guardando…" : editingId ? "Guardar cambios" : "Publicar anuncio"}
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
        <h2 className="text-lg font-semibold">Anuncios ({ads.length})</h2>
        {ads.length === 0 && <p className="text-muted text-sm">Todavía no hay anuncios.</p>}
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="bg-white border border-border-soft rounded-xl p-4 flex gap-4 items-start"
          >
            {ad.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ad.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{ad.title}</h3>
                {!ad.published && (
                  <span className="text-xs bg-brand-tint px-2 py-0.5 rounded-full text-brand">
                    Oculto
                  </span>
                )}
              </div>
              <p className="text-sm text-muted line-clamp-2">{ad.description}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => togglePublished(ad)}
                className="text-xs px-3 py-1.5 rounded-lg bg-brand-tint hover:bg-brand-light/40 text-brand transition"
              >
                {ad.published ? "Ocultar" : "Publicar"}
              </button>
              <button
                onClick={() => startEdit(ad)}
                className="text-xs px-3 py-1.5 rounded-lg bg-brand-tint hover:bg-brand-light/40 text-brand transition"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(ad.id)}
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
