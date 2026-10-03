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
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Image src="/logo.webp" alt="Wanna Cosmetics" width={150} height={53} className="h-10 w-auto" />
            <nav className="flex gap-4 text-sm">
              <Link href="/admin" className="hover:text-brand font-medium">
                Anuncios
              </Link>
              <Link href="/admin/catalogs" className="hover:text-brand font-medium">
                Catálogos
              </Link>
              <Link href="/admin/socials" className="hover:text-brand font-medium">
                Redes y contacto
              </Link>
              <Link href="/" className="hover:text-brand text-muted">
                Ver sitio público ↗
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
