import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getYoutubeEmbedUrl, isVideoFile } from "@/lib/video";
import SocialIcon, { platformLabel } from "@/components/SocialIcon";
import AdBranchLinkButton from "@/components/AdBranchLinkButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [ads, catalogs, socials] = await Promise.all([
    prisma.ad.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    prisma.catalog.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    prisma.socialLink.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const galleryCatalogs = catalogs.filter((c) => c.showInGallery);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border-soft">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col items-center text-center">
          <Image src="/logo.webp" alt="Wanna Cosmetics" width={560} height={197} priority className="h-auto w-[90%] max-w-[380px] sm:max-w-[460px] md:max-w-[560px]" />
          <p className="mt-4 text-muted text-sm tracking-wide font-light">
            Novedades, promociones y catálogos
          </p>
          {socials.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {socials.map((social) => {
                const icon = social.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={social.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <SocialIcon platform={social.platform} className="h-9 w-9" />
                );

                if (social.label) {
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-full bg-white border border-border-soft hover:shadow-md hover:-translate-y-0.5 transition pl-2 pr-4 py-1.5"
                    >
                      <span className="flex-shrink-0">{icon}</span>
                      <span className="text-sm font-medium text-brand">
                        {social.platform === "other" ? social.label : `${platformLabel(social.platform)} · ${social.label}`}
                      </span>
                    </a>
                  );
                }

                return (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={platformLabel(social.platform)}
                    className="flex items-center justify-center hover:-translate-y-0.5 hover:drop-shadow-md transition"
                  >
                    {icon}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-20">
        {galleryCatalogs.length > 0 && (
          <section>
            <h2 className="text-center text-xs font-medium tracking-[0.2em] text-brand uppercase mb-10">
              Catálogos
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {galleryCatalogs.map((catalog) => (
                <a
                  key={catalog.id}
                  href={catalog.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white border border-border-soft hover:border-brand-light rounded-2xl overflow-hidden flex flex-col transition shadow-sm hover:shadow-md"
                >
                  {catalog.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={catalog.imageUrl}
                      alt={catalog.name}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-brand-tint flex items-center justify-center text-brand text-3xl font-medium">
                      {catalog.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="bg-white p-3 text-center">
                    <p className="font-semibold text-base text-foreground group-hover:text-brand transition">
                      {catalog.name}
                    </p>
                    {catalog.description && (
                      <p className="text-xs text-muted mt-1 font-light line-clamp-2">
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
          <h2 className="text-center text-xs font-medium tracking-[0.2em] text-brand uppercase mb-10">
            Anuncios y publicaciones
          </h2>
          {ads.length === 0 ? (
            <p className="text-center text-muted font-light">Todavía no hay anuncios publicados.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-7">
              {ads.map((ad) => {
                const embedUrl = ad.videoUrl && !isVideoFile(ad.videoUrl) ? getYoutubeEmbedUrl(ad.videoUrl) : null;
                const uploadedVideo = ad.videoUrl && isVideoFile(ad.videoUrl) ? ad.videoUrl : null;
                const hasCustomSize = Boolean(ad.mediaWidth || ad.mediaHeight);
                const mediaStyle = hasCustomSize
                  ? {
                      width: ad.mediaWidth ? `${ad.mediaWidth}px` : undefined,
                      height: ad.mediaHeight ? `${ad.mediaHeight}px` : undefined,
                      maxWidth: "100%",
                    }
                  : undefined;

                return (
                  <article
                    key={ad.id}
                    className={`bg-white border border-border-soft rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition ${ad.fullWidth ? "sm:col-span-2" : ""}`}
                  >
                    {uploadedVideo ? (
                      <div className={hasCustomSize ? "mx-auto" : "aspect-video"} style={mediaStyle}>
                        <video
                          src={uploadedVideo}
                          controls
                          className={hasCustomSize ? "w-full h-full" : "w-full h-full object-cover"}
                        />
                      </div>
                    ) : embedUrl ? (
                      <div className={hasCustomSize ? "mx-auto" : "aspect-video"} style={mediaStyle}>
                        <iframe
                          src={embedUrl}
                          title={ad.title}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    ) : ad.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className={hasCustomSize ? "mx-auto" : "w-full aspect-video object-cover"}
                        style={mediaStyle}
                      />
                    ) : null}

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-medium text-lg">{ad.title}</h3>
                      <p className="text-muted mt-2 flex-1 whitespace-pre-wrap font-light text-sm leading-relaxed">
                        {ad.description}
                      </p>
                      {ad.branchCategory ? (
                        <AdBranchLinkButton
                          options={catalogs
                            .filter((c) => c.branch && c.category === ad.branchCategory)
                            .map((c) => ({ branch: c.branch as string, url: c.url }))}
                        />
                      ) : (
                        ad.link && (
                          <a
                            href={ad.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 inline-flex items-center gap-1 text-brand hover:text-brand-light font-medium text-sm transition"
                          >
                            Ver más →
                          </a>
                        )
                      )}
                      {ad.videoUrl && !embedUrl && !uploadedVideo && (
                        <a
                          href={ad.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex items-center gap-1 text-brand hover:text-brand-light font-medium text-sm transition"
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

      <footer className="border-t border-border-soft py-8 text-center">
        <a href="/admin" className="text-xs text-muted hover:text-brand transition font-light">
          Panel de administración
        </a>
      </footer>
    </div>
  );
}
