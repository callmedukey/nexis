"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteEvent } from "@/actions/admin";
import { Button } from "@/components/ui/button";

import { EventList } from "./EventList";
import { SearchInput } from "./SearchInput";
import { Pagination } from "../../manage-product/_components/Pagination";

interface EventsPageClientProps {
  events: any[];
  currentPage: number;
  totalPages: number;
  query?: string;
}

export function EventsPageClient({
  events,
  currentPage,
  totalPages,
  query,
}: EventsPageClientProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const createQueryString = (page: number) => {
    const params = new URLSearchParams();
    if (query) {
      params.set("query", query);
    }
    if (page > 1) {
      params.set("page", page.toString());
    }
    return params.toString();
  };

  const handleSelectionChange = (ids: number[]) => {
    setSelectedIds(ids);
  };

  const handleDelete = async () => {
    if (!selectedIds.length) return;

    const confirmed = confirm(
      `선택한 ${selectedIds.length}개의 이벤트를 삭제하시겠습니까?`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteEvent(id)));
      toast.success("이벤트가 삭제되었습니다");
      setSelectedIds([]);
      router.refresh();
    } catch {
      toast.error("이벤트 삭제에 실패했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-lightgray">
      <div className="p-8">
        <div className="rounded-lg bg-white p-4 md:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">이벤트 관리</h1>
              <p className="text-sm text-muted-foreground">
                이벤트를 관리하고 수정할 수 있습니다
              </p>
            </div>
            <div className="flex items-center gap-4">
              <SearchInput />
            </div>
          </div>

          <EventList
            events={events}
            onSelectionChange={handleSelectionChange}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            createQueryString={createQueryString}
          />
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="fixed inset-x-0 bottom-0 z-50 w-full border-t bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-[72px] items-center px-4 md:px-8">
          <div className="flex w-full">
            <Button asChild size="lg" className="mr-auto">
              <Link href="/admin/manage-events/new">이벤트 작성</Link>
            </Button>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {selectedIds.length}개 선택됨
                </span>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  삭제
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
