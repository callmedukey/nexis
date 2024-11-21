"use client";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
  DrawerDescription,
} from "@/components/ui/drawer";
import { HEADER_ROUTES, ICONGRAY } from "@/constants/general";

const MobileMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        className="focus:outline-none lg:hidden"
        aria-label="모바일 메뉴"
      >
        <MenuIcon color={ICONGRAY} />
      </DrawerTrigger>
      <DrawerContent className="flex space-y-4 px-8 py-12 text-xl">
        <DrawerTitle className="sr-only">Menu</DrawerTitle>
        <DrawerDescription className="sr-only">Mobile Menu</DrawerDescription>
        <nav className="flex flex-col space-y-4">
          {HEADER_ROUTES.map((link) => (
            <Link
              href={`#${link.url}`}
              key={link.label}
              className=""
              onClick={() => {
                setOpen(false);
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileMenu;
