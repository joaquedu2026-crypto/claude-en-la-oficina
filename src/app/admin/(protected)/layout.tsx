import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border-soft bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-4 sm:gap-6">
            <Image src="/logo.webp" alt="Wanna Cosmetics" width={170} height={60} className="h-12 w-auto flex-shrink-0" />
            <div className="sm:hidden">
              <LogoutButton />
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/admin" className="hover:text-brand font-medium whitespace-nowrap">
              Anuncios
            </Link>
            <Link href="/admin/catalogs" className="hover:text-brand font-medium whitespace-nowrap">
              Catálogos
            </Link>
            <Link href="/admin/socials" className="hover:text-brand font-medium whitespace-nowrap">
              Redes y contacto
            </Link>
            <Link href="/" className="hover:text-brand text-muted whitespace-nowrap">
              Ver sitio público ↗
            </Link>
          </nav>
          <div className="hidden sm:block">
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8 overflow-x-hidden">{children}</main>
    </div>
  );
}
