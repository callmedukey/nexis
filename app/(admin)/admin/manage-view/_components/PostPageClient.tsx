"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { CreatePostModal } from "./CreatePostModal";
import { PostList } from "./PostList";
import { SearchInput } from "./SearchInput";
import { Pagination } from "../../manage-product/_components/Pagination";

interface PostPageClientProps {
  posts: any[];
  currentPage: number;
  totalPages: number;
  query?: string;
}

export function PostPageClient({
  posts,
  currentPage,
  totalPages,
  query,
}: PostPageClientProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  return (
    <main className="min-h-screen bg-lightgray">
      <div className="p-8">
        <div className="rounded-lg bg-white p-4 md:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">게시물 관리</h1>
              <p className="text-sm text-muted-foreground">
                게시물을 관리하고 수정할 수 있습니다
              </p>
            </div>
            <div className="flex items-center gap-4">
              <SearchInput />
              <Button onClick={() => setIsCreateModalOpen(true)}>
                게시물 작성
              </Button>
            </div>
          </div>

          <PostList posts={posts} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            createQueryString={createQueryString}
          />
        </div>
      </div>

      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </main>
  );
} 