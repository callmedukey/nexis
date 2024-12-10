import { Suspense } from "react";

import { SearchFilters } from "./_components/SearchFilters";
import { UserList } from "./_components/UserList";
import { UserListSkeleton } from "./_components/UserListSkeleton";

interface PageProps {
  searchParams: {
    page?: string;
    email?: string;
    phone?: string;
    name?: string;
  };
}

export default async function ManageUserPage({ searchParams }: PageProps) {
  const awaitedSearchParams = await searchParams;
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">회원 관리</h1>
      </div>
      <SearchFilters />
      <Suspense fallback={<UserListSkeleton />}>
        <UserList searchParams={awaitedSearchParams} />
      </Suspense>
    </div>
  );
}
