import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ProductListSkeleton() {
  return (
    <div className="relative w-full overflow-auto">
      <div className="w-full min-w-max">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-20 w-[50px] whitespace-nowrap bg-white text-center">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              <TableHead className="sticky left-[50px] z-20 w-[50px] whitespace-nowrap bg-white text-center">
                No
              </TableHead>
              <TableHead className="sticky left-[100px] z-20 w-[200px] whitespace-nowrap bg-white">
                상품명
              </TableHead>
              <TableHead className="w-[120px] whitespace-nowrap text-right">
                판매가
              </TableHead>
              <TableHead className="w-[150px] whitespace-nowrap">
                카테고리
              </TableHead>
              <TableHead className="w-[100px] whitespace-nowrap text-right">
                할인율
              </TableHead>
              <TableHead className="w-[100px] whitespace-nowrap text-center">
                상태
              </TableHead>
              <TableHead className="w-[80px] whitespace-nowrap text-right">
                재고
              </TableHead>
              <TableHead className="w-[120px] whitespace-nowrap">
                등록일
              </TableHead>
              <TableHead className="w-[100px] whitespace-nowrap">
                상품번호
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="sticky left-0 z-20 whitespace-nowrap bg-white text-center">
                  <div className="flex size-full items-center justify-center">
                    <Skeleton className="h-4 w-4" />
                  </div>
                </TableCell>
                <TableCell className="sticky left-[50px] z-20 whitespace-nowrap bg-white text-center">
                  <Skeleton className="h-4 w-8 mx-auto" />
                </TableCell>
                <TableCell className="sticky left-[100px] z-20 truncate bg-white">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
                <TableCell className="whitespace-nowrap text-center">
                  <Skeleton className="h-6 w-16 mx-auto rounded-full" />
                </TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Skeleton className="h-4 w-16" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 