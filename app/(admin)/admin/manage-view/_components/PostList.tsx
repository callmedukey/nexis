"use client";

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deletePost } from "@/actions/admin";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  thumbnail: Array<{
    url: string;
  }>;
}

interface PostListProps {
  posts: Post[];
  onSelectionChange?: (ids: number[]) => void;
}

export function PostList({ posts, onSelectionChange }: PostListProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelect = (checked: boolean, id: number) => {
    const newSelectedIds = checked
      ? [...selectedIds, id]
      : selectedIds.filter((selectedId) => selectedId !== id);
    setSelectedIds(newSelectedIds);
    onSelectionChange?.(newSelectedIds);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelectedIds = checked ? posts.map((p) => p.id) : [];
    setSelectedIds(newSelectedIds);
    onSelectionChange?.(newSelectedIds);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIds.length) return;

    const confirmed = confirm(
      "선택한 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const result = await deletePost(selectedIds);

      if (result.success) {
        toast.success(result.message || "게시물이 삭제되었습니다.");
        setSelectedIds([]);
        router.refresh();
      } else {
        toast.error(result.message || "게시물 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("게시물 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form id="post-list-form" onSubmit={handleDelete}>
      <div className="relative w-full overflow-auto">
        {posts.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
            게시물이 없습니다.
          </div>
        ) : (
          <div className="w-full min-w-max">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">
                    <Checkbox
                      checked={
                        selectedIds.length === posts.length && posts.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[50px] text-center">No</TableHead>
                  <TableHead className="max-w-[300px]">제목</TableHead>
                  <TableHead className="w-[120px]">작성일</TableHead>
                  <TableHead className="w-[120px]">수정일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post, index) => (
                  <TableRow key={post.id}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedIds.includes(post.id)}
                        onCheckedChange={(checked: boolean) =>
                          handleSelect(checked, post.id)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {posts.length - index}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      <Link
                        href={`/admin/manage-view/${post.id}`}
                        className="hover:underline"
                      >
                        <div className="overflow-x-auto whitespace-nowrap">
                          {post.title}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(post.updatedAt), {
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
