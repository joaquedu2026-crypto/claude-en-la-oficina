import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/60">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" className="hover:text-indigo-400 font-medium">
              Anuncios
            </Link>
            <Link href="/admin/catalogs" className="hover:text-indigo-400 font-medium">
              Catálogos
            </Link>
            <Link href="/" className="hover:text-indigo-400 text-slate-400">
              Ver sitio público ↗
            </Link>
          </nav>
          <LogoutButton />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
