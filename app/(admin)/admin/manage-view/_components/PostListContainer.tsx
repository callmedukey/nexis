"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { PostList } from "./PostList";
import { SearchInput } from "./SearchInput";

interface PostListContainerProps {
  posts: any[];
  query?: string;
}

export function PostListContainer({ posts, query }: PostListContainerProps) {
  const [hasSelection, setHasSelection] = useState(false);

  return (
    <>
      <div className="mb-4">
        <SearchInput placeholder="제목으로 검색" defaultValue={query} />
      </div>
      <PostList posts={posts} onSelectionChange={(ids) => setHasSelection(ids.length > 0)} />
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-white p-4">
        <div className="flex items-center justify-between">
          <Button asChild size="sm">
            <Link href="/admin/manage-view/new">게시물 작성</Link>
          </Button>
          {hasSelection && (
            <Button
              variant="destructive"
              size="sm"
              id="delete-selected"
              form="post-list-form"
              type="submit"
            >
              선택 삭제
            </Button>
          )}
        </div>
      </div>
    </>
  );
} 