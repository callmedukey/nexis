"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateUser } from "@/actions/user";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserProfileData, UserProfileSchema } from "@/lib/constants/zod";

interface ProfileEditDrawerProps {
  initialData?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  isRedirected: boolean;
}

const ProfileEditDrawer = ({
  initialData,
  isRedirected,
}: ProfileEditDrawerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { update: updateSession } = useSession();

  useEffect(() => {
    setIsMounted(true);
    return () => {
      document.body.style.pointerEvents = "auto";
    };
  }, []);

  useEffect(() => {
    if (isMounted && isRedirected) {
      setIsOpen(true);
      router.replace("/account/profile");
    }
  }, [isMounted, isRedirected, router]);

  const form = useForm<UserProfileData>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
    },
  });

  const onSubmit = async (data: UserProfileData) => {
    try {
      setIsLoading(true);
      const result = await updateUser(data);

      if (result.success) {
        await updateSession({
          user: {
            name: data.name,
            email: data.email,
            phone: data.phone,
          },
        });

        toast.success(result.message);
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("계정 정보 수정 실패");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={setIsOpen}
      shouldScaleBackground={false}
    >
      <DrawerTrigger asChild>
        <span className="rounded-full border border-primaryblack px-4 py-1 text-primaryblack transition-all duration-300 ~text-[0.875rem]/xl hover:bg-primaryblack hover:text-white">
          회원 정보 수정
        </span>
      </DrawerTrigger>
      <DrawerContent className="!max-w-screen-sm rounded-t-[2rem] px-[3.37rem] py-10">
        <DrawerHeader className="sr-only">
          <DrawerTitle className="">회원 정보 수정</DrawerTitle>
          <DrawerDescription className="">
            아래 정보를 입력해주세요.
          </DrawerDescription>
        </DrawerHeader>
        <div className="relative">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-icongray ~text-xs/base">
                      고객명
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="고객명을 입력해주세요"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-icongray ~text-xs/base">
                      이메일
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="이메일을 입력해주세요"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-icongray ~text-xs/base">
                      연락처
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="연락처를 입력해주세요"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DrawerFooter className="mt-10 flex-row justify-between ~text-sm/xl ~gap-2/4">
          <DrawerClose asChild>
            <button
              className="w-full rounded-full border border-black py-2 text-black"
              disabled={isLoading}
            >
              취소
            </button>
          </DrawerClose>
          <button
            className="w-full rounded-full bg-primaryblack py-2 text-white disabled:opacity-50"
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 inline size-4 animate-spin" />
                저장 중...
              </>
            ) : (
              "저장하기"
            )}
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ProfileEditDrawer;
