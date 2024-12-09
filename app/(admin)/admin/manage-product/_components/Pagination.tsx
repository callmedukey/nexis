import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  createQueryString: (page: number) => string;
}

export function Pagination({
  currentPage,
  totalPages,
  createQueryString,
}: PaginationProps) {
  // Ensure we have at least 1 page
  const safeTotal = Math.max(1, totalPages);
  const pages = Array.from({ length: safeTotal }, (_, i) => i + 1);
  const displayPages = pages.slice(
    Math.max(0, currentPage - 2),
    Math.min(safeTotal, currentPage + 1)
  );

  const noMorePages = totalPages === 0;

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1 || noMorePages}
      >
        <Link 
          href={`?${createQueryString(Math.max(1, currentPage - 1))}`}
          className="px-2"
        >
          이전
        </Link>
      </Button>

      {!noMorePages && displayPages[0] > 1 && (
        <>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`?${createQueryString(1)}`}>1</Link>
          </Button>
          {displayPages[0] > 2 && <span>...</span>}
        </>
      )}

      {!noMorePages && displayPages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link href={`?${createQueryString(page)}`}>
            {page}
          </Link>
        </Button>
      ))}

      {!noMorePages && displayPages[displayPages.length - 1] < totalPages - 1 && (
        <span>...</span>
      )}

      {!noMorePages && displayPages[displayPages.length - 1] < totalPages && (
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <Link href={`?${createQueryString(totalPages)}`}>
            {totalPages}
          </Link>
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages || noMorePages}
      >
        <Link 
          href={`?${createQueryString(Math.min(safeTotal, currentPage + 1))}`}
          className="px-2"
        >
          다음
        </Link>
      </Button>
    </div>
  );
} 