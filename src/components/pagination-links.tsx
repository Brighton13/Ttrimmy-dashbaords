import Link from "next/link";

export function PaginationLinks({
  basePath,
  currentPage,
  totalPages,
  query,
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
  query?: Record<string, string | undefined>;
}) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  function getHref(page: number) {
    const searchParams = new URLSearchParams();

    if (page > 1) {
      searchParams.set("page", String(page));
    }

    Object.entries(query ?? {}).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {pages.map((page) => (
        <Link
          className={`flex h-9 w-9 items-center justify-center rounded-lg border ${page === currentPage ? "border-sky-600 bg-sky-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
          href={getHref(page)}
          key={page}
        >
          {page}
        </Link>
      ))}
    </div>
  );
}