import { prisma } from "@/lib/prisma";
import { getYoutubeEmbedUrl } from "@/lib/video";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [ads, catalogs] = await Promise.all([
    prisma.ad.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    prisma.catalog.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Novedades y catálogos</h1>
          <p className="text-slate-400 mt-1">Anuncios, publicaciones y accesos directos.</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-16">
        {catalogs.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Catálogos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {catalogs.map((catalog) => (
                <a
                  key={catalog.id}
                  href={catalog.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-xl p-4 flex flex-col items-center text-center gap-3 transition"
                >
                  {catalog.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={catalog.imageUrl}
                      alt={catalog.name}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-xl font-semibold">
                      {catalog.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium group-hover:text-indigo-400 transition">
                      {catalog.name}
                    </p>
                    {catalog.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {catalog.description}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold mb-4">Anuncios y publicaciones</h2>
          {ads.length === 0 ? (
            <p className="text-slate-400">Todavía no hay anuncios publicados.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {ads.map((ad) => {
                const embedUrl = ad.videoUrl ? getYoutubeEmbedUrl(ad.videoUrl) : null;
                return (
                  <article
                    key={ad.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col"
                  >
                    {embedUrl ? (
                      <div className="aspect-video">
                        <iframe
                          src={embedUrl}
                          title={ad.title}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    ) : ad.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ad.imageUrl} alt={ad.title} className="w-full aspect-video object-cover" />
                    ) : null}

                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-semibold text-lg">{ad.title}</h3>
                      <p className="text-slate-400 mt-1 flex-1 whitespace-pre-wrap">
                        {ad.description}
                      </p>
                      {ad.link && (
                        <a
                          href={ad.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium text-sm"
                        >
                          Ver más →
                        </a>
                      )}
                      {ad.videoUrl && !embedUrl && (
                        <a
                          href={ad.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium text-sm"
                        >
                          Ver video →
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center">
        <a href="/admin" className="text-xs text-slate-500 hover:text-slate-300">
          Panel de administración
        </a>
      </footer>
    </div>
  );
}
