"use client";

import { useState } from "react";
import { uploadFile } from "@/lib/upload-client";
import { isVideoFile } from "@/lib/video";

type Ad = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  videoUrl: string | null;
  link: string | null;
  mediaWidth: number | null;
  mediaHeight: number | null;
  fullWidth: boolean;
  published: boolean;
  order: number;
};

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  videoUrl: "",
  link: "",
  mediaWidth: "",
  mediaHeight: "",
  fullWidth: false,
  order: "0",
};

export default function AdsManager({ initialAds }: { initialAds: Ad[] }) {
  const [ads, setAds] = useState<Ad[]>(initialAds);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
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
      mediaWidth: ad.mediaWidth != null ? String(ad.mediaWidth) : "",
      mediaHeight: ad.mediaHeight != null ? String(ad.mediaHeight) : "",
      fullWidth: ad.fullWidth,
      order: String(ad.order),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setError("");
    try {
      const url = await uploadFile(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch {
      setError("Error al subir la imagen");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    setError("");
    try {
      const url = await uploadFile(file);
      setForm((f) => ({ ...f, videoUrl: url }));
    } catch {
      setError("Error al subir el video");
    } finally {
      setUploadingVideo(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError("Título y descripción son obligatorios");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      title: form.title,
      description: form.description,
      imageUrl: form.imageUrl,
      videoUrl: form.videoUrl,
      link: form.link,
      mediaWidth: form.mediaWidth.trim() ? Number(form.mediaWidth) : null,
      mediaHeight: form.mediaHeight.trim() ? Number(form.mediaHeight) : null,
      fullWidth: form.fullWidth,
      order: form.order.trim() ? Number(form.order) : 0,
    };

    const url = editingId ? `/api/ads/${editingId}` : "/api/ads";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Error al guardar");
      return;
    }

    if (editingId) {
      setAds((prev) => prev.map((a) => (a.id === editingId ? data : a)).sort((a, b) => a.order - b.order));
    } else {
      setAds((prev) => [...prev, data].sort((a, b) => a.order - b.order));
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

  async function updateOrder(ad: Ad, newOrder: number) {
    if (Number.isNaN(newOrder)) return;
    const res = await fetch(`/api/ads/${ad.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: newOrder }),
    });
    const data = await res.json();
    if (res.ok) {
      setAds((prev) => prev.map((a) => (a.id === ad.id ? data : a)).sort((a, b) => a.order - b.order));
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
          <label className="block text-sm text-foreground mb-1">Imagen (foto o GIF animado)</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
          {uploadingImage && <p className="text-xs text-muted mt-1">Subiendo…</p>}
          {form.imageUrl && !isVideoFile(form.imageUrl) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.imageUrl} alt="" className="mt-2 h-24 rounded-lg object-cover" />
          )}
        </div>

        <div>
          <label className="block text-sm text-foreground mb-1">Video — subir archivo (opcional)</label>
          <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleVideoUpload} className="text-sm" />
          {uploadingVideo && <p className="text-xs text-muted mt-1">Subiendo… (puede tardar según el tamaño)</p>}
          {form.videoUrl && isVideoFile(form.videoUrl) && (
            <video src={form.videoUrl} controls className="mt-2 h-24 rounded-lg" />
          )}
        </div>

        <div>
          <label className="block text-sm text-foreground mb-1">
            …o pegar un link de YouTube / video externo (opcional)
          </label>
          <input
            value={isVideoFile(form.videoUrl) ? "" : form.videoUrl}
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-foreground mb-1">Ancho (px, opcional)</label>
            <input
              type="number"
              min={0}
              value={form.mediaWidth}
              onChange={(e) => setForm((f) => ({ ...f, mediaWidth: e.target.value }))}
              placeholder="Automático"
              className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-sm text-foreground mb-1">Alto (px, opcional)</label>
            <input
              type="number"
              min={0}
              value={form.mediaHeight}
              onChange={(e) => setForm((f) => ({ ...f, mediaHeight: e.target.value }))}
              placeholder="Automático"
              className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
            />
          </div>
        </div>
        <p className="text-xs text-muted -mt-2">
          Si dejás estos campos vacíos, la imagen/video se adapta automáticamente. En celulares nunca se va a pasar del ancho de la pantalla.
        </p>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.fullWidth}
            onChange={(e) => setForm((f) => ({ ...f, fullWidth: e.target.checked }))}
            className="rounded border-border-soft"
          />
          Ocupar todo el ancho de la página (anuncio destacado)
        </label>

        <div>
          <label className="block text-sm text-foreground mb-1">Orden (los números más bajos aparecen primero)</label>
          <input
            type="number"
            value={form.order}
            onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
            className="w-32 rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
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
            className="bg-white border border-border-soft rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-start"
          >
            {ad.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ad.imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium truncate">{ad.title}</h3>
                {!ad.published && (
                  <span className="text-xs bg-brand-tint px-2 py-0.5 rounded-full text-brand">
                    Oculto
                  </span>
                )}
                {ad.fullWidth && (
                  <span className="text-xs bg-brand-tint px-2 py-0.5 rounded-full text-brand">
                    Ancho completo
                  </span>
                )}
              </div>
              <p className="text-sm text-muted line-clamp-2">{ad.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <label className="text-xs text-muted">Orden:</label>
                <input
                  type="number"
                  defaultValue={ad.order}
                  onBlur={(e) => updateOrder(ad, Number(e.target.value))}
                  className="w-16 rounded-lg bg-white border border-border-soft px-2 py-1 text-xs outline-none focus:border-brand"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
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
