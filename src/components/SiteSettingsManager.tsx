"use client";

import { useState } from "react";
import { uploadFile } from "@/lib/upload-client";

type Settings = {
  id: string;
  logoUrl: string | null;
  backgroundImageUrl: string | null;
} | null;

export default function SiteSettingsManager({ initialSettings }: { initialSettings: Settings }) {
  const [logoUrl, setLogoUrl] = useState(initialSettings?.logoUrl ?? "");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(initialSettings?.backgroundImageUrl ?? "");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "background") {
    const file = e.target.files?.[0];
    if (!file) return;
    const setUploading = field === "logo" ? setUploadingLogo : setUploadingBackground;
    const setUrl = field === "logo" ? setLogoUrl : setBackgroundImageUrl;
    setUploading(true);
    setError("");
    try {
      const url = await uploadFile(file);
      setUrl(url);
    } catch {
      setError("Error al subir la imagen");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoUrl, backgroundImageUrl }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Error al guardar los cambios");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-8">
      <div className="bg-white border border-border-soft rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Logo</h2>
        <p className="text-sm text-muted">
          Se muestra arriba de todo en la página principal. Si no cargás ninguno, se usa el logo por defecto de
          Wanna Cosmetics.
        </p>
        <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "logo")} className="text-sm" />
        {uploadingLogo && <p className="text-xs text-muted">Subiendo…</p>}
        {logoUrl && (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="" className="w-full max-w-md rounded-lg border border-border-soft object-cover" />
            <button
              type="button"
              onClick={() => setLogoUrl("")}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition"
            >
              Quitar y usar el logo por defecto
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-border-soft rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Imagen de fondo</h2>
        <p className="text-sm text-muted">
          Se muestra de fondo en toda la página principal, detrás de los anuncios y catálogos. Si no cargás
          ninguna, el fondo queda liso como hasta ahora.
        </p>
        <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "background")} className="text-sm" />
        {uploadingBackground && <p className="text-xs text-muted">Subiendo…</p>}
        {backgroundImageUrl && (
          <div className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backgroundImageUrl}
              alt=""
              className="w-full max-w-md rounded-lg border border-border-soft object-cover"
            />
            <button
              type="button"
              onClick={() => setBackgroundImageUrl("")}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition"
            >
              Quitar fondo
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-brand hover:bg-brand/90 text-white disabled:opacity-60 px-5 py-2.5 font-medium transition"
      >
        {saving ? "Guardando…" : saved ? "¡Guardado!" : "Guardar cambios"}
      </button>
    </div>
  );
}
