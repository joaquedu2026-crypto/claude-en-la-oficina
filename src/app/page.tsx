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
  const whatsappSocials = socials.filter((s) => s.platform === "whatsapp");
  const otherSocials = socials.filter((s) => s.platform !== "whatsapp");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {whatsappSocials.length > 0 && (
        <div className="fixed right-2 sm:right-4 bottom-4 z-30 flex flex-col-reverse gap-2">
          {whatsappSocials.map((social) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              title={social.label ? `WhatsApp · ${social.label}` : "WhatsApp"}
              className="flex items-center gap-1.5 rounded-full bg-white border border-border-soft shadow-sm hover:shadow-md hover:-translate-x-0.5 transition pl-1.5 pr-2.5 py-1.5"
            >
              <SocialIcon platform="whatsapp" className="h-6 w-6 flex-shrink-0" />
              {social.label && (
                <span className="text-[11px] font-medium text-brand leading-none whitespace-nowrap">
                  {social.label}
                </span>
              )}
            </a>
          ))}
        </div>
      )}

      <header className="border-b border-border-soft">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col items-center text-center">
          <Image src="/logo.webp" alt="Wanna Cosmetics" width={560} height={197} priority className="h-auto w-[90%] max-w-[380px] sm:max-w-[460px] md:max-w-[560px]" />
          <p className="mt-4 text-muted text-sm tracking-wide font-light">
            Novedades, promociones y catálogos
          </p>
          {otherSocials.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {otherSocials.map((social) => {
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
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {galleryCatalogs.map((catalog) => (
                <a
                  key={catalog.id}
                  href={catalog.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white border border-border-soft hover:border-brand-light rounded-xl overflow-hidden flex flex-col transition shadow-sm hover:shadow-md"
                >
                  {catalog.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={catalog.imageUrl}
                      alt={catalog.name}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-brand-tint flex items-center justify-center text-brand text-xl font-medium">
                      {catalog.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="bg-white p-2 text-center">
                    <p className="font-semibold text-xs text-foreground group-hover:text-brand transition">
                      {catalog.name}
                    </p>
                    {catalog.description && (
                      <p className="text-[11px] text-muted mt-0.5 font-light line-clamp-2">
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
                    className={`bg-white border border-border-soft rounded-2xl flex flex-col shadow-sm hover:shadow-md transition ${ad.fullWidth ? "sm:col-span-2" : ""}`}
                  >
                    {uploadedVideo ? (
                      <div
                        className={`overflow-hidden rounded-t-2xl ${hasCustomSize ? "mx-auto" : "aspect-video"}`}
                        style={mediaStyle}
                      >
                        <video
                          src={uploadedVideo}
                          controls
                          className={hasCustomSize ? "w-full h-full" : "w-full h-full object-cover"}
                        />
                      </div>
                    ) : embedUrl ? (
                      <div
                        className={`overflow-hidden rounded-t-2xl ${hasCustomSize ? "mx-auto" : "aspect-video"}`}
                        style={mediaStyle}
                      >
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
                        className={`rounded-t-2xl ${hasCustomSize ? "mx-auto" : "w-full aspect-video object-cover"}`}
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
