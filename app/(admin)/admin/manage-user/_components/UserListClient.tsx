"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { deleteUsers } from "@/actions/admin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Pagination } from "../../manage-product/_components/Pagination";

interface UserListClientProps {
  users: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    provider: string;
    createdAt: Date;
  }[];
  total: number;
  page: number;
  limit: number;
  skip: number;
  searchParams: {
    page?: string;
    email?: string;
    phone?: string;
    name?: string;
  };
}

export function UserListClient({
  users,
  total,
  page,
  limit,
  skip,
  searchParams,
}: UserListClientProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const handleDeleteSelected = async () => {
    try {
      setIsLoading(true);
      const result = await deleteUsers({ userIds: selectedUsers });

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success("선택한 사용자들이 삭제되었습니다.");
      setSelectedUsers([]);
      // Refresh the data
      window.location.reload();
    } catch (error) {
      toast.error("사용자 삭제에 실패했습니다.");
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDeleteSingle = async (userId: string) => {
    try {
      setIsLoading(true);
      const result = await deleteUsers({ userIds: [userId] });

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success("사용자가 삭제되었습니다.");
      // Refresh the data
      window.location.reload();
    } catch (error) {
      toast.error("사용자 삭제에 실패했습니다.");
    } finally {
      setIsLoading(false);
      setUserToDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedUsers.length === users.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>번호</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>전화번호</TableHead>
                <TableHead>계정 유형</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell>{skip + index + 1}</TableCell>
                  <TableCell>{user.name || "-"}</TableCell>
                  <TableCell>{user.email || "-"}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>
                    {user.provider === "kakao" ? "Kakao" : "Naver"}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setUserToDelete(user.id);
                      }}
                      disabled={isLoading}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination
          totalPages={Math.ceil(total / limit)}
          currentPage={page}
          createQueryString={(page: number) => {
            const params = new URLSearchParams(
              searchParams as Record<string, string>
            );
            params.set("page", page.toString());
            return params.toString();
          }}
        />
      </div>

      {selectedUsers.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 border-t bg-white p-4">
          <div className="mx-auto flex max-w-screen-xl items-center justify-between">
            <span>{selectedUsers.length}명의 사용자가 선택됨</span>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isLoading}
            >
              선택 삭제
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>사용자 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              ���택한 {selectedUsers.length}명의 사용자를 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>사용자 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 사용자를 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDeleteSingle(userToDelete)}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 