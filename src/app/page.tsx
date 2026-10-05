import { prisma } from "@/lib/prisma";
import { getYoutubeEmbedUrl, isVideoFile } from "@/lib/video";
import SocialIcon, { platformLabel } from "@/components/SocialIcon";
import AdBranchLinkButton from "@/components/AdBranchLinkButton";
import ShareButton from "@/components/ShareButton";
import WhatsappFloatingButton, {
  floatingButtonClasses,
  floatingIconClasses,
  floatingLabelClasses,
} from "@/components/WhatsappFloatingButton";
import { withRetry } from "@/lib/with-retry";

const SOCIAL_PRIORITY: Record<string, number> = { instagram: 0, facebook: 1 };

export const dynamic = "force-dynamic";

export default async function Home() {
  const [ads, catalogs, socials, settings] = await withRetry(() =>
    Promise.all([
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
      prisma.siteSettings.findUnique({ where: { id: "main" } }),
    ])
  );

  const galleryCatalogs = catalogs.filter((c) => c.showInGallery);
  const whatsappSocials = socials.filter((s) => s.platform === "whatsapp");
  const otherSocials = socials
    .filter((s) => s.platform !== "whatsapp")
    .sort((a, b) => (SOCIAL_PRIORITY[a.platform] ?? 99) - (SOCIAL_PRIORITY[b.platform] ?? 99));
  const logoUrl = settings?.logoUrl || "/hero-logo.webp";
  const backgroundImageUrl = settings?.backgroundImageUrl || null;

  return (
    <div
      className="min-h-screen bg-background text-foreground bg-cover bg-center bg-no-repeat bg-fixed"
      style={backgroundImageUrl ? { backgroundImage: `url(${backgroundImageUrl})` } : undefined}
    >
      {(whatsappSocials.length > 0 || otherSocials.length > 0) && (
        <div className="fixed right-2 sm:right-4 bottom-4 z-30 flex flex-col items-end gap-2">
          <WhatsappFloatingButton
            options={whatsappSocials.map((s, i) => ({ branch: s.label || `Contacto ${i + 1}`, url: s.url }))}
          />
          {otherSocials.map((social) => {
            const icon = social.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={social.imageUrl} alt="" className={`${floatingIconClasses} rounded-full object-cover`} />
            ) : (
              <SocialIcon platform={social.platform} className={floatingIconClasses} />
            );

            const label = social.label
              ? social.platform === "other"
                ? social.label
                : `${platformLabel(social.platform)} · ${social.label}`
              : platformLabel(social.platform);

            return (
              <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className={floatingButtonClasses}>
                {icon}
                <span className={floatingLabelClasses}>{label}</span>
              </a>
            );
          })}
        </div>
      )}

      <header className="border-b border-border-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="Wanna Cosmetics" className="w-full h-auto" />
        <div className="max-w-5xl mx-auto px-6 pb-10 pt-6 flex flex-col items-center text-center">
          <p className="text-muted text-sm tracking-wide font-light bg-background/90 backdrop-blur-sm px-4 py-1.5 rounded-full">
            Novedades, promociones y catálogos
          </p>
          <ShareButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-20">
        {galleryCatalogs.length > 0 && (
          <section>
            <h2 className="mx-auto w-fit text-center text-xs font-medium tracking-[0.2em] text-brand uppercase mb-10 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full">
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
          <h2 className="mx-auto w-fit text-center text-xs font-medium tracking-[0.2em] text-brand uppercase mb-10 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full">
            Anuncios y publicaciones
          </h2>
          {ads.length === 0 ? (
            <p className="mx-auto w-fit text-center text-muted font-light bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full">
              Todavía no hay anuncios publicados.
            </p>
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
        <a
          href="/admin"
          className="text-xs text-muted hover:text-brand transition font-light bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full"
        >
          Panel de administración
        </a>
      </footer>
    </div>
  );
}
