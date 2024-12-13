"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type Coupon = {
  id: number
  code: string
  active: boolean
  flatDiscount: number | null
  discountRate: number | null
  createdAt: Date
}

export const columns: ColumnDef<Coupon>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: "쿠폰 코드",
    cell: ({ row }) => {
      const coupon = row.original

      return (
        <Button
          variant="link"
          className="p-0 h-auto font-normal"
          onClick={() => {
            document.dispatchEvent(
              new CustomEvent("EDIT_COUPON", {
                detail: coupon,
              })
            )
          }}
        >
          {coupon.code}
        </Button>
      )
    },
  },
  {
    accessorKey: "active",
    header: "상태",
    cell: ({ row }) => (
      <Badge variant={row.original.active ? "default" : "secondary"}>
        {row.original.active ? "활성" : "비활성"}
      </Badge>
    ),
  },
  {
    accessorKey: "discount",
    header: "할인",
    cell: ({ row }) => {
      if (row.original.flatDiscount) {
        return `${row.original.flatDiscount.toLocaleString()}원`
      }
      if (row.original.discountRate) {
        return `${row.original.discountRate}%`
      }
      return "-"
    },
  },
  {
    accessorKey: "createdAt",
    header: "생성일",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("ko-KR"),
  },
] 