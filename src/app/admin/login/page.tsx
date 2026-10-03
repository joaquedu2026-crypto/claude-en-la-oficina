"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Error al iniciar sesión");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-background border border-border-soft rounded-2xl p-8 shadow-sm"
      >
        <div className="flex justify-center mb-6">
          <Image src="/logo.webp" alt="Wanna Cosmetics" width={260} height={91} className="h-auto w-[230px]" />
        </div>
        <h1 className="text-base font-medium text-foreground mb-1 text-center">Panel de administración</h1>
        <p className="text-muted text-sm mb-6 text-center font-light">Ingresá la contraseña para continuar.</p>

        <label className="block text-sm text-foreground mb-2" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg bg-white border border-border-soft px-3 py-2 text-foreground outline-none focus:border-brand"
          autoFocus
        />

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 rounded-lg bg-brand hover:bg-brand/90 disabled:opacity-60 text-white font-medium py-2 transition"
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
