export type AuthProviders = "kakao" | "naver";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  LOGOUT: "/logout",
  ACCOUNT: "/account",
  PURCHASES: "/account/history",
  PROFILE: "/account/profile",
  PRODUCTS: "/products",
  EXPLORE: "/explore",
  ADMIN: "/admin",
  CS: "/customer-service",
  MANAGE_PRODUCT: "/admin/manage-product",
  MANAGE_USER: "/admin/manage-user",
  MANAGE_ORDER: "/admin/manage-order",
  MANAGE_VIEW: "/admin/manage-view",
  MANAGE_COUPONS: "/admin/manage-coupons",
  MANAGE_PRODUCT_ADD: "/admin/manage-product/add",
  MANAGE_CATEGORY: "/admin/manage-category",
  MANAGE_EVENTS: "/admin/manage-events",
};

export const ADMIN_ROUTES = [
  {
    label: "상품 관리",
    url: ROUTES.MANAGE_PRODUCT,
  },
  {
    label: "카테고리 관리",
    url: ROUTES.MANAGE_CATEGORY,
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
  {
    label: "회원 관리",
    url: ROUTES.MANAGE_USER,
  },
  {
    label: "이벤트 관리",
    url: ROUTES.MANAGE_EVENTS,
  },
];

export const AUTH_ACCOUNT_ROUTES = [
  { label: "마이 페이지", url: ROUTES.ACCOUNT },
  { label: "구매 내역", url: ROUTES.PURCHASES },
  { label: "게정 관리", url: ROUTES.PROFILE },
  { label: "고객센터", url: ROUTES.CS },
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
export const LIGHTGRAY = "#EDEDED";
export const PRIMARYBLUE = "#326cff";
export const ANOTHERBLUE = "#0058A3";
export const PRIMARYBLACK = "#111111";
export const OTHERGRAY = "#F5F5F5";
export const PRIMARYRED = "#CC0008";

export const OrderStatusKoreanMapping = {
  PENDING: "상품 준비중",
  PENDING_DELIVERY: "배송 준비중",
  DELIVERING: "배송중",
  COMPLETED: "배송완료",
  CANCELLED: "주문 취소",
  CANCELLING: "취소 중",
  RETURNING: "반품 중",
};

export const NotAllowedCancelStatus = [
  OrderStatusKoreanMapping.CANCELLING,
  OrderStatusKoreanMapping.CANCELLED,
  OrderStatusKoreanMapping.COMPLETED,
  OrderStatusKoreanMapping.DELIVERING,
];
