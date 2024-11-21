export type AuthProviders = "kakao" | "naver";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  LOGOUT: "/logout",
  AFTER_LOGIN: "/after-login",
  ACCOUNT: "/account",
  PURCHASES: "/purchases",
  PROFILE: "/profile",
  PRODUCTS: "/products",
  EXPLORE: "/explore",
  ADMIN: "/admin",
  MANAGE_PRODUCT: "/admin/manage-product",
  MANAGE_ORDER: "/admin/manage-order",
  MANAGE_VIEW: "/admin/manage-view",
  MANAGE_COUPONS: "/admin/manage-coupons",
};

export const ADMIN_ROUTES = [
  {
    label: "상품 관리",
    url: ROUTES.MANAGE_PRODUCT,
  },
  {
    label: "주문 관리",
    url: ROUTES.MANAGE_ORDER,
  },
  {
    label: "둘러보기 관리",
    url: ROUTES.MANAGE_VIEW,
  },
  {
    label: "쿠폰 관리",
    url: ROUTES.MANAGE_COUPONS,
  },
];

export const AUTH_ACCOUNT_ROUTES = [
  { label: "마이 페이지", url: ROUTES.ACCOUNT },
  { label: "구매 내역", url: ROUTES.PURCHASES },
  { label: "게정 관리", url: ROUTES.PROFILE },
  { label: "로그아웃", url: ROUTES.LOGOUT },
];

export const AUTH_ROUTES = [
  { label: "로그인", url: ROUTES.LOGIN },
  { label: "회원가입", url: ROUTES.SIGNUP },
];

export const HEADER_ROUTES = [
  { label: "홈", url: ROUTES.HOME },
  { label: "제품", url: ROUTES.PRODUCTS },
  { label: "둘러보기", url: ROUTES.EXPLORE },
];

export const ICONGRAY = "#484848";
