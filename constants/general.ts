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
};

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
