"use client";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteEvent } from "@/actions/admin";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Event {
  id: number;
  title: string;
  content: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  thumbnail: Array<{
    url: string;
  }>;
}

interface EventListProps {
  events: Event[];
  onSelectionChange?: (ids: number[]) => void;
}

export function EventList({ events, onSelectionChange }: EventListProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    const newSelectedIds = checked ? events.map((event) => event.id) : [];
    setSelectedIds(newSelectedIds);
    onSelectionChange?.(newSelectedIds);
  };

  const handleSelect = (id: number, checked: boolean) => {
    const newSelectedIds = checked
      ? [...selectedIds, id]
      : selectedIds.filter((selectedId) => selectedId !== id);
    setSelectedIds(newSelectedIds);
    onSelectionChange?.(newSelectedIds);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIds.length) return;

    const confirmed = confirm(
      `선택한 ${selectedIds.length}개의 이벤트를 삭제하시겠습니까?`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteEvent(id)));
      toast.success("이벤트가 삭제되었습니다");
      router.refresh();
    } catch {
      toast.error("이벤트 삭제에 실패했습니다");
    } finally {
      setIsDeleting(false);
      setSelectedIds([]);
    }
  };

  return (
    <form id="event-list-form" onSubmit={handleDelete}>
      <div className="relative w-full overflow-auto">
        {events.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
            이벤트가 없습니다.
          </div>
        ) : (
          <div className="w-full min-w-max">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">
                    <Checkbox
                      checked={
                        selectedIds.length === events.length &&
                        events.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[50px] text-center">No</TableHead>
                  <TableHead className="max-w-[300px]">제목</TableHead>
                  <TableHead className="w-[100px] text-center">상태</TableHead>
                  <TableHead className="w-[120px]">작성일</TableHead>
                  <TableHead className="w-[120px]">수정일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedIds.includes(event.id)}
                        onCheckedChange={(checked) =>
                          handleSelect(event.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">{event.id}</TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/manage-events/${event.id}`}
                        className="hover:underline"
                      >
                        {event.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs ${
                          event.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {event.active ? "활성" : "비활성"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(event.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(event.updatedAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2">
            <Loader2 className="size-4 animate-spin" />
            <span>삭제 중...</span>
          </div>
        </div>
      )}
    </form>
  );
}
