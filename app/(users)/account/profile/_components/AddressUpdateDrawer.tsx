"use client";
declare global {
  interface Window {
    daum: any;
  }
}

interface IAddr {
  address: string;
  zonecode: string;
}

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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateUser } from "@/actions/user";
import { AddressData, AddressSchema } from "@/lib/constants/zod";
import { useSession } from "next-auth/react";

interface AddressUpdateDrawerProps {
  initialData?: {
    address?: string | null;
    zipcode?: string | null;
    detailedAddress?: string | null;
  };
}

const AddressUpdateDrawer = ({ initialData }: AddressUpdateDrawerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { update: updateSession } = useSession();

  const form = useForm<AddressData>({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      address: initialData?.address || "",
      zipcode: initialData?.zipcode || "",
      detailedAddress: initialData?.detailedAddress || "",
    },
  });

  const onSubmit = async (data: AddressData) => {
    try {
      setIsLoading(true);
      const result = await updateUser(data);

      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("주소 정보 수정 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const onClickAddr = () => {
    new window.daum.Postcode({
      oncomplete: function (data: IAddr) {
        console.log(data);
        form.setValue("address", `${data.zonecode} ${data.address}`);
        form.setValue("zipcode", data.zonecode);
      },
    }).open();
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <span className="~text-[0.875rem]/xl py-1 px-4 rounded-full border text-primaryblack border-primaryblack hover:bg-primaryblack hover:text-white transition-all duration-300">
          주소 정보 수정
        </span>
      </DrawerTrigger>
      <DrawerContent className="!max-w-screen-sm py-[2.5rem] px-[3.37rem] rounded-t-[2rem]">
        <DrawerHeader className="sr-only">
          <DrawerTitle className="">주소 정보 수정</DrawerTitle>
          <DrawerDescription className="">
            아래 정보를 입력해주세요.
          </DrawerDescription>
        </DrawerHeader>
        <div className="">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-icongray ~text-xs/base">
                      주소
                    </FormLabel>
                    <FormControl>
                      <Input
                        onClick={onClickAddr}
                        placeholder="주소를 입력해주세요"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="detailedAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-icongray ~text-xs/base">
                      상세 주소
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="상세 주소를 입력해주세요"
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
        <DrawerFooter className="flex-row justify-between ~gap-2/4 mt-[2.5rem] ~text-sm/xl">
          <DrawerClose asChild>
            <button
              className="w-full py-2 rounded-full border border-black text-black"
              disabled={isLoading}
            >
              취소
            </button>
          </DrawerClose>
          <button
            className="w-full rounded-full py-2 bg-primaryblack text-white disabled:opacity-50"
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
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

export default AddressUpdateDrawer;
