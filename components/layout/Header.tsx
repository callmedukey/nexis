import { ShoppingCartIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ICONGRAY, ROUTES } from "@/constants/general";
import Logo from "@/public/logo.svg";

import AccountMenu from "./AccountMenu";
import MobileMenu from "./MobileMenu";
const Header = () => {
  return (
    <header>
      <div className="flex h-16 items-center p-4 text-icongray">
        <Link href="/" className="">
          <Image src={Logo} alt="logo" width={120} className="" />
        </Link>
        <nav className="ml-auto flex gap-4 text-lg font-medium">
          <Link href="/" className="hidden hover:underline lg:block">
            홈
          </Link>
          <Link
            href={ROUTES.PRODUCTS}
            className="hidden hover:underline lg:block"
          >
            제품
          </Link>
          <Link href="/" className="hidden hover:underline lg:block">
            둘러보기
          </Link>
          <div className="flex items-center gap-2">
            <AccountMenu />
            <Link href="/cart" aria-label="View shopping cart">
              <ShoppingCartIcon color={ICONGRAY} className="size-6" />
            </Link>
            <MobileMenu />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
