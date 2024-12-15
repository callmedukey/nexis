"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const deliveryFormSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  phone: z.string().min(1, "전화번호를 입력해주세요"),
  address: z.string().min(1, "주소를 입력해주세요"),
  detailedAddress: z.string().min(1, "상세주소를 입력해주세요"),
  zipcode: z.string().min(1, "우편번호를 입력해주세요"),
});

interface DeliveryFormProps {
  defaultValues?: {
    name?: string | null;
    phone?: string | null;
    address?: string | null;
    detailedAddress?: string | null;
    zipcode?: string | null;
  };
  onSubmit: (data: z.infer<typeof deliveryFormSchema>) => void;
}

export function DeliveryForm({ defaultValues, onSubmit }: DeliveryFormProps) {
  const form = useForm<z.infer<typeof deliveryFormSchema>>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      phone: defaultValues?.phone || "",
      address: defaultValues?.address || "",
      detailedAddress: defaultValues?.detailedAddress || "",
      zipcode: defaultValues?.zipcode || "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>배송 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input placeholder="이름을 입력해주세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>전화번호</FormLabel>
                  <FormControl>
                    <Input placeholder="전화번호를 입력해주세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>주소</FormLabel>
                  <FormControl>
                    <Input placeholder="주소를 입력해주세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="detailedAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상세주소</FormLabel>
                  <FormControl>
                    <Input placeholder="상세주소를 입력해주세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              주문하기
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
