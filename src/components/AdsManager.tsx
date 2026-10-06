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
  branchCategory: string | null;
  mediaWidth: number | null;
  mediaHeight: number | null;
  fullWidth: boolean;
  shape: string;
  published: boolean;
  order: number;
};

type Catalog = {
  id: string;
  name: string;
  url: string;
  branch: string | null;
  category: string | null;
};

const NO_LINK = "none";
const CATALOG_LINK = "catalog";
const CUSTOM_LINK = "custom";
const ASK_BRANCH = "ask_branch";
const GENERAL_GROUP = "__general__";

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  videoUrl: "",
  link: "",
  branchCategory: "",
  mediaWidth: "",
  mediaHeight: "",
  fullWidth: false,
  shape: "card",
  order: "0",
};

export default function AdsManager({ initialAds, catalogs }: { initialAds: Ad[]; catalogs: Catalog[] }) {
  const [ads, setAds] = useState<Ad[]>(initialAds);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const branches = Array.from(new Set(catalogs.filter((c) => c.branch).map((c) => c.branch as string)));
  const hasBranches = branches.length > 0;
  const hasGeneralCatalogs = catalogs.some((c) => !c.branch);
  const branchCategories = Array.from(
    new Set(catalogs.filter((c) => c.branch && c.category).map((c) => c.category as string)),
  );

  function catalogsForBranchGroup(group: string): Catalog[] {
    return group === GENERAL_GROUP ? catalogs.filter((c) => !c.branch) : catalogs.filter((c) => c.branch === group);
  }

  function resolveLinkState(ad: Ad) {
    if (ad.branchCategory) return { linkType: ASK_BRANCH, catalogId: "", branchGroup: "" };
    const link = ad.link ?? "";
    if (!link) return { linkType: NO_LINK, catalogId: "", branchGroup: "" };
    const match = catalogs.find((c) => c.url === link);
    if (!match) return { linkType: CUSTOM_LINK, catalogId: "", branchGroup: "" };
    return { linkType: CATALOG_LINK, catalogId: match.id, branchGroup: match.branch ?? GENERAL_GROUP };
  }

  const [linkType, setLinkType] = useState(NO_LINK);
  const [selectedBranchGroup, setSelectedBranchGroup] = useState("");
  const [selectedCatalogId, setSelectedCatalogId] = useState("");

  function handleLinkTypeChange(value: string) {
    setLinkType(value);
    setSelectedBranchGroup("");
    setSelectedCatalogId("");
    if (value !== CUSTOM_LINK) {
      setForm((f) => ({ ...f, link: "" }));
    }
    if (value !== ASK_BRANCH) {
      setForm((f) => ({ ...f, branchCategory: "" }));
    }
  }

  function handleBranchGroupChange(value: string) {
    setSelectedBranchGroup(value);
    setSelectedCatalogId("");
    setForm((f) => ({ ...f, link: "" }));
  }

  function handleCatalogIdChange(value: string) {
    setSelectedCatalogId(value);
    const catalog = catalogs.find((c) => c.id === value);
    setForm((f) => ({ ...f, link: catalog?.url ?? "" }));
  }

  function startEdit(ad: Ad) {
    setEditingId(ad.id);
    const link = ad.link ?? "";
    setForm({
      title: ad.title,
      description: ad.description,
      imageUrl: ad.imageUrl ?? "",
      videoUrl: ad.videoUrl ?? "",
      link,
      branchCategory: ad.branchCategory ?? "",
      mediaWidth: ad.mediaWidth != null ? String(ad.mediaWidth) : "",
      mediaHeight: ad.mediaHeight != null ? String(ad.mediaHeight) : "",
      fullWidth: ad.fullWidth,
      shape: ad.shape,
      order: String(ad.order),
    });
    const state = resolveLinkState(ad);
    setLinkType(state.linkType);
    setSelectedCatalogId(state.catalogId);
    setSelectedBranchGroup(state.branchGroup);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setLinkType(NO_LINK);
    setSelectedBranchGroup("");
    setSelectedCatalogId("");
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
      branchCategory: form.branchCategory || null,
      mediaWidth: form.mediaWidth.trim() ? Number(form.mediaWidth) : null,
      mediaHeight: form.mediaHeight.trim() ? Number(form.mediaHeight) : null,
      fullWidth: form.fullWidth,
      shape: form.shape,
      order: form.order.trim() ? Number(form.order) : 0,
    };

    const url = editingId ? `/api/ads/${editingId}` : "/api/ads";
    const method = editingId ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

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
    } catch {
      setError("Error de conexión. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este anuncio?")) return;
    const res = await fetch(`/api/ads/${id}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) {
      setAds((prev) => prev.filter((a) => a.id !== id));
    }
  }

  async function togglePublished(ad: Ad) {
    const res = await fetch(`/api/ads/${ad.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !ad.published }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data) {
      setAds((prev) => prev.map((a) => (a.id === ad.id ? data : a)));
    }
  }

  async function updateOrder(ad: Ad, newOrder: number) {
    if (Number.isNaN(newOrder)) return;
    const res = await fetch(`/api/ads/${ad.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: newOrder }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data) {
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
          <label className="block text-sm text-foreground mb-1">¿A dónde lleva el botón &quot;Ver más&quot;? (opcional)</label>
          <select
            value={linkType}
            onChange={(e) => handleLinkTypeChange(e.target.value)}
            className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
          >
            <option value={NO_LINK}>Sin enlace</option>
            <option value={CATALOG_LINK}>Un catálogo</option>
            {branchCategories.length > 0 && (
              <option value={ASK_BRANCH}>Preguntarle la sucursal al cliente</option>
            )}
            <option value={CUSTOM_LINK}>Otro enlace (escribir manualmente)</option>
          </select>

          {linkType === ASK_BRANCH && (
            <div className="mt-2">
              <select
                value={form.branchCategory}
                onChange={(e) => setForm((f) => ({ ...f, branchCategory: e.target.value }))}
                className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
              >
                <option value="">Elegí la categoría de este anuncio…</option>
                {branchCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted mt-1">
                Al tocar &quot;Ver más&quot;, el visitante va a elegir su sucursal y lo vamos a mandar al catálogo de{" "}
                {form.branchCategory || "esta categoría"} de esa sucursal.
              </p>
            </div>
          )}

          {linkType === CATALOG_LINK && (
            <div className="mt-2 space-y-2">
              {hasBranches ? (
                <>
                  <select
                    value={selectedBranchGroup}
                    onChange={(e) => handleBranchGroupChange(e.target.value)}
                    className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
                  >
                    <option value="">Elegí una sucursal…</option>
                    {branches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    {hasGeneralCatalogs && <option value={GENERAL_GROUP}>Catálogos generales</option>}
                  </select>
                  {selectedBranchGroup && (
                    <select
                      value={selectedCatalogId}
                      onChange={(e) => handleCatalogIdChange(e.target.value)}
                      className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
                    >
                      <option value="">Elegí una categoría…</option>
                      {catalogsForBranchGroup(selectedBranchGroup).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.category || c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              ) : (
                <select
                  value={selectedCatalogId}
                  onChange={(e) => handleCatalogIdChange(e.target.value)}
                  className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
                >
                  <option value="">Elegí un catálogo…</option>
                  {catalogs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {linkType === CUSTOM_LINK && (
            <input
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              placeholder="https://..."
              className="w-full mt-2 rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
            />
          )}
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

        <div>
          <label className="block text-sm text-foreground mb-1">Forma</label>
          <select
            value={form.shape}
            onChange={(e) => setForm((f) => ({ ...f, shape: e.target.value }))}
            className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
          >
            <option value="card">Tarjeta (imagen rectangular)</option>
            <option value="circle">Círculo</option>
          </select>
          <p className="text-xs text-muted mt-1">
            Con imagen (sin video), toda la tarjeta funciona como botón — igual que los catálogos. No aplica a
            anuncios con video: esos siempre se muestran como tarjeta.
          </p>
        </div>

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
                {ad.branchCategory && (
                  <span className="text-xs bg-brand-tint px-2 py-0.5 rounded-full text-brand">
                    Pregunta sucursal: {ad.branchCategory}
                  </span>
                )}
                {ad.shape === "circle" && (
                  <span className="text-xs bg-brand-tint px-2 py-0.5 rounded-full text-brand">Círculo</span>
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
