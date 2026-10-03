"use client";

import { useState } from "react";
import SocialIcon, { SOCIAL_PLATFORMS, platformLabel } from "./SocialIcon";

type Social = {
  id: string;
  platform: string;
  url: string;
  label: string | null;
  imageUrl: string | null;
  published: boolean;
  order: number;
};

const emptyForm = { platform: "instagram", url: "", label: "", imageUrl: "" };

export default function SocialsManager({ initialSocials }: { initialSocials: Social[] }) {
  const [socials, setSocials] = useState<Social[]>(initialSocials);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startEdit(social: Social) {
    setEditingId(social.id);
    setForm({
      platform: social.platform,
      url: social.url,
      label: social.label ?? "",
      imageUrl: social.imageUrl ?? "",
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
    if (!form.url.trim()) {
      setError("El enlace es obligatorio");
      return;
    }
    if (form.platform === "other" && !form.label.trim()) {
      setError("Para \"Otro\" necesitás escribir un nombre");
      return;
    }
    setSaving(true);
    setError("");

    const url = editingId ? `/api/socials/${editingId}` : "/api/socials";
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
      setSocials((prev) => prev.map((s) => (s.id === editingId ? data : s)));
    } else {
      setSocials((prev) => [data, ...prev]);
    }
    cancelEdit();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este enlace?")) return;
    const res = await fetch(`/api/socials/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSocials((prev) => prev.filter((s) => s.id !== id));
    }
  }

  async function togglePublished(social: Social) {
    const res = await fetch(`/api/socials/${social.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !social.published }),
    });
    const data = await res.json();
    if (res.ok) {
      setSocials((prev) => prev.map((s) => (s.id === social.id ? data : s)));
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-border-soft rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold">
          {editingId ? "Editar enlace" : "Nuevo enlace de contacto / red social"}
        </h2>

        <div>
          <label className="block text-sm text-foreground mb-1">Red social</label>
          <select
            value={form.platform}
            onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
            className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
          >
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {platformLabel(p)}
              </option>
            ))}
          </select>
        </div>

        {form.platform === "other" && (
          <div>
            <label className="block text-sm text-foreground mb-1">Nombre a mostrar</label>
            <input
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
            />
          </div>
        )}

        <div>
          <label className="block text-sm text-foreground mb-1">
            Enlace {form.platform === "whatsapp" && "(ej: https://wa.me/5491122334455)"}
          </label>
          <input
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="https://..."
            className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 outline-none focus:border-brand"
          />
        </div>

        {form.platform === "other" && (
          <div>
            <label className="block text-sm text-foreground mb-1">Ícono personalizado (opcional)</label>
            <input type="file" accept="image/*" onChange={handleUpload} className="text-sm" />
            {uploading && <p className="text-xs text-muted mt-1">Subiendo…</p>}
            {form.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.imageUrl} alt="" className="mt-2 h-12 w-12 rounded-full object-cover" />
            )}
          </div>
        )}

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
        <h2 className="text-lg font-semibold">Enlaces ({socials.length})</h2>
        {socials.length === 0 && <p className="text-muted text-sm">Todavía no hay enlaces.</p>}
        {socials.map((social) => (
          <div
            key={social.id}
            className="bg-white border border-border-soft rounded-xl p-4 flex gap-4 items-center"
          >
            <div className="h-10 w-10 rounded-full bg-brand-tint text-brand flex items-center justify-center flex-shrink-0">
              {social.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={social.imageUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <SocialIcon platform={social.platform} className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">
                  {social.platform === "other" ? social.label : platformLabel(social.platform)}
                </h3>
                {!social.published && (
                  <span className="text-xs bg-brand-tint px-2 py-0.5 rounded-full text-brand">
                    Oculto
                  </span>
                )}
              </div>
              <p className="text-sm text-muted truncate">{social.url}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => togglePublished(social)}
                className="text-xs px-3 py-1.5 rounded-lg bg-brand-tint hover:bg-brand-light/40 text-brand transition"
              >
                {social.published ? "Ocultar" : "Publicar"}
              </button>
              <button
                onClick={() => startEdit(social)}
                className="text-xs px-3 py-1.5 rounded-lg bg-brand-tint hover:bg-brand-light/40 text-brand transition"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(social.id)}
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
