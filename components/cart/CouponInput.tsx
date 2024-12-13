"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

async function validateCoupon(code: string) {
  const res = await fetch("/api/coupons/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  })
  return res.json()
}

interface Props {
  subtotal: number
  onCouponChange: (discount: number) => void
}

export function CouponInput({ subtotal, onCouponChange }: Props) {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discount: number
    type: "flat" | "rate"
  } | null>(null)
  const router = useRouter()

  const handleApplyCoupon = async () => {
    if (!code) return

    setLoading(true)
    try {
      const result = await validateCoupon(code)
      if (result.success) {
        const discount = result.coupon.type === "flat"
          ? result.coupon.discount
          : Math.round((subtotal * result.coupon.discount) / 100)
        setAppliedCoupon({
          ...result.coupon,
          discount,
        })
        onCouponChange(discount)
        toast.success("쿠폰이 적용되었습니다.")
      } else {
        toast.error(result.message || "쿠폰 적용에 실패했습니다.")
        setCode("")
      }
    } catch (error) {
      toast.error("쿠폰 적용에 실패했습니다.")
      setCode("")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCode("")
    onCouponChange(0)
    router.refresh()
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {appliedCoupon ? (
          <Input
            value={appliedCoupon.code}
            disabled
            className="bg-muted"
          />
        ) : (
          <Input
            placeholder="쿠폰 코드를 입력하세요"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={loading}
          />
        )}
        {appliedCoupon ? (
          <Button
            variant="outline"
            onClick={handleRemoveCoupon}
          >
            취소
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={handleApplyCoupon}
            disabled={!code || loading}
          >
            {loading ? "확인중..." : "적용"}
          </Button>
        )}
      </div>

      {appliedCoupon && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">쿠폰 할인</span>
          <span className="font-medium text-green-600">
            - ₩ {appliedCoupon.discount.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  )
} 