"use client";

import { useBranch } from "@/lib/branch-context";

type Catalog = {
  id: string;
  name: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  branch: string | null;
};

function CatalogCard({ catalog, large }: { catalog: Catalog; large?: boolean }) {
  return (
    <a
      href={catalog.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group bg-white border border-border-soft hover:border-brand-light rounded-xl overflow-hidden flex flex-col transition shadow-sm hover:shadow-md ${
        large ? "w-40 sm:w-48" : ""
      }`}
    >
      {catalog.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={catalog.imageUrl} alt={catalog.name} className="w-full aspect-square object-cover" />
      ) : (
        <div
          className={`w-full aspect-square bg-brand-tint flex items-center justify-center text-brand font-medium ${
            large ? "text-3xl" : "text-xl"
          }`}
        >
          {catalog.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className={`bg-white text-center ${large ? "p-3" : "p-2"}`}>
        <p className={`font-semibold text-foreground group-hover:text-brand transition ${large ? "text-sm" : "text-xs"}`}>
          {catalog.name}
        </p>
        {catalog.description && (
          <p className={`text-muted mt-0.5 font-light line-clamp-2 ${large ? "text-xs" : "text-[11px]"}`}>
            {catalog.description}
          </p>
        )}
      </div>
    </a>
  );
}

export default function CatalogsSection({ catalogs }: { catalogs: Catalog[] }) {
  const { branch } = useBranch();

  const hasMatch = branch !== null && catalogs.some((c) => c.branch === branch);
  const visible = hasMatch ? catalogs.filter((c) => c.branch === branch || c.branch === null) : catalogs;

  if (visible.length === 0) return null;

  return (
    <section>
      <h2 className="mx-auto w-fit text-center text-xs font-medium tracking-[0.2em] text-brand uppercase mb-10 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full">
        Catálogos
      </h2>
      {hasMatch ? (
        <div className="flex flex-wrap justify-center gap-6">
          {visible.map((catalog) => (
            <CatalogCard key={catalog.id} catalog={catalog} large />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {visible.map((catalog) => (
            <CatalogCard key={catalog.id} catalog={catalog} />
          ))}
        </div>
      )}
    </section>
  );
}
