"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Script from "next/script";
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

declare global {
  interface Window {
    daum: any;
  }
}

interface IAddr {
  address: string;
  zonecode: string;
}

const deliveryFormSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  phone: z.string().min(1, "전화번호를 입력해주세요"),
  address: z.string().min(1, "주소를 입력해주세요"),
  detailedAddress: z.string().min(1, "상세주소를 입력해주세요"),
  zipcode: z.string().min(1, "우편번호를 입력해주세요"),
  setAsDefault: z.boolean().default(false),
});

interface DeliveryFormProps {
  defaultValues?: {
    name?: string | null;
    phone?: string | null;
    address?: string | null;
    detailedAddress?: string | null;
    zipcode?: string | null;
  };
  couponDiscount?: number;
  onSubmit: (data: {
    deliveryInfo: {
      name: string;
      phone: string;
      address: string;
      detailedAddress: string;
      zipcode: string;
      setAsDefault: boolean;
    };
    couponDiscount: number;
  }) => void;
}

export function DeliveryForm({
  defaultValues,
  couponDiscount = 0,
  onSubmit,
}: DeliveryFormProps) {
  const form = useForm<z.infer<typeof deliveryFormSchema>>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      phone: defaultValues?.phone || "",
      address: defaultValues?.address || "",
      detailedAddress: defaultValues?.detailedAddress || "",
      zipcode: defaultValues?.zipcode || "",
      setAsDefault: false,
    },
  });

  const handleSubmit = (data: z.infer<typeof deliveryFormSchema>) => {
    if (!data.address || !data.detailedAddress || !data.zipcode) {
      return;
    }
    onSubmit({
      deliveryInfo: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        detailedAddress: data.detailedAddress,
        zipcode: data.zipcode,
        setAsDefault: data.setAsDefault,
      },
      couponDiscount,
    });
  };

  const onClickAddr = () => {
    new window.daum.Postcode({
      oncomplete: function (data: IAddr) {
        form.setValue("address", data.address);
        form.setValue("zipcode", data.zonecode);
      },
    }).open();
  };

  return (
    <>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        async
        strategy="lazyOnload"
      />
      <Card>
        <CardHeader>
          <CardTitle>배송 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
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

              <div className="grid grid-cols-[1fr_auto] gap-2">
                <FormField
                  control={form.control}
                  name="zipcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>우편번호</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="주소지를 입력해주세요"
                          {...field}
                          disabled
                          readOnly
                          onClick={onClickAddr}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="self-end"
                  onClick={onClickAddr}
                >
                  주소 찾기
                </Button>
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>주소</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="주소를 입력해주세요"
                        {...field}
                        readOnly
                        onClick={onClickAddr}
                      />
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
              <FormField
                control={form.control}
                name="setAsDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="size-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      기본 배송지로 설정
                    </FormLabel>
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
    </>
  );
}
