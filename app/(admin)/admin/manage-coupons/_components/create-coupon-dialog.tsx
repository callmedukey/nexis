"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"
import { z } from "zod"
import { createCoupon, updateCoupon } from "@/actions/admin"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { type Coupon } from "./columns"

const couponSchema = z.object({
  code: z.string().min(1, "쿠폰 코드를 입력해주세요."),
  active: z.boolean(),
  flatDiscount: z.number().nullable(),
  discountRate: z.number().nullable(),
}).refine((data) => {
  return (data.flatDiscount !== null && data.discountRate === null) || 
         (data.flatDiscount === null && data.discountRate !== null)
}, {
  message: "정액 할인과 비율 할인 중 하나만 선택해주세요.",
})

interface Props {
  trigger?: React.ReactNode
}

export default function CouponDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")
  const [active, setActive] = useState(true)
  const [flatDiscount, setFlatDiscount] = useState<string>("")
  const [discountRate, setDiscountRate] = useState<string>("")
  const [discountType, setDiscountType] = useState<"flat" | "rate" | null>(null)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const router = useRouter()

  useEffect(() => {
    const handleEditCoupon = (e: CustomEvent<Coupon>) => {
      const coupon = e.detail
      setEditingCoupon(coupon)
      setCode(coupon.code)
      setActive(coupon.active)
      if (coupon.flatDiscount) {
        setDiscountType("flat")
        setFlatDiscount(coupon.flatDiscount.toString())
        setDiscountRate("")
      } else if (coupon.discountRate) {
        setDiscountType("rate")
        setDiscountRate(coupon.discountRate.toString())
        setFlatDiscount("")
      }
      setOpen(true)
    }

    document.addEventListener("EDIT_COUPON", handleEditCoupon as EventListener)
    return () => {
      document.removeEventListener("EDIT_COUPON", handleEditCoupon as EventListener)
    }
  }, [])

  const resetForm = () => {
    setCode("")
    setActive(true)
    setFlatDiscount("")
    setDiscountRate("")
    setDiscountType(null)
    setEditingCoupon(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await couponSchema.safeParseAsync({
      code,
      active,
      flatDiscount: flatDiscount ? parseInt(flatDiscount) : null,
      discountRate: discountRate ? parseInt(discountRate) : null,
    })

    if (!result.success) {
      toast.error(result.error.errors[0]?.message || "입력값을 확인해주세요.")
      return
    }

    const response = editingCoupon
      ? await updateCoupon({ id: editingCoupon.id, ...result.data })
      : await createCoupon(result.data)

    if (response.success) {
      toast.success(response.message)
      setOpen(false)
      resetForm()
      router.refresh()
    } else {
      toast.error(response.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      setOpen(open)
      if (!open) resetForm()
    }}>
      <DialogTrigger asChild>
        {trigger || <Button>쿠폰 생성</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingCoupon ? "쿠폰 수정" : "새 쿠폰 생성"}</DialogTitle>
          <DialogDescription>
            {editingCoupon 
              ? "쿠폰 정보를 수정합니다. 정액 할인과 비율 할인 중 하나만 선택해주세요."
              : "새로운 쿠폰을 생성합니다. 정액 할인과 비율 할인 중 하나만 선택해주세요."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code">쿠폰 코드</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SUMMER2023"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="active">활성화</Label>
            <Switch
              id="active"
              checked={active}
              onCheckedChange={setActive}
            />
          </div>

          <div className="space-y-4">
            <Label>할인 유형</Label>
            <RadioGroup 
              value={discountType || ""} 
              onValueChange={(value: "flat" | "rate") => {
                setDiscountType(value)
                if (value === "flat") {
                  setDiscountRate("")
                } else {
                  setFlatDiscount("")
                }
              }}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="flat" id="flat" />
                <Label htmlFor="flat" className="font-normal">정액 할인</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rate" id="rate" />
                <Label htmlFor="rate" className="font-normal">할인율</Label>
              </div>
            </RadioGroup>
          </div>

          {discountType === "flat" && (
            <div className="space-y-2">
              <Label htmlFor="flatDiscount">정액 할인 (원)</Label>
              <Input
                id="flatDiscount"
                type="number"
                value={flatDiscount}
                onChange={(e) => setFlatDiscount(e.target.value)}
                placeholder="5000"
                min="0"
              />
            </div>
          )}

          {discountType === "rate" && (
            <div className="space-y-2">
              <Label htmlFor="discountRate">할인율 (%)</Label>
              <Input
                id="discountRate"
                type="number"
                value={discountRate}
                onChange={(e) => setDiscountRate(e.target.value)}
                placeholder="10"
                min="0"
                max="100"
              />
            </div>
          )}

          <Button type="submit" className="w-full">
            {editingCoupon ? "수정하기" : "생성하기"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 