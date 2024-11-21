"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_ROUTES } from "@/constants/general";
import { cn } from "@/lib/utils";

const AdminHeader = () => {
  const pathname = usePathname();
  return (
    <aside className="flex h-20 items-center gap-8 border-y-2 border-black bg-gray-50 p-4">
      {ADMIN_ROUTES.map((route) => (
        <Link
          key={route.url}
          href={route.url}
          className={cn(
            "text-lg hover:font-bold transition-all duration-300",
            pathname === route.url && "font-bold"
          )}
        >
          {route.label}
        </Link>
      ))}
    </aside>
  );
};

export default AdminHeader;
