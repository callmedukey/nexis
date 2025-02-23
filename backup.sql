--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'INACTIVE',
    'ACTIVE',
    'SOLDOUT'
);


ALTER TYPE public."ProductStatus" OWNER TO postgres;

--
-- Name: PurchaseStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PurchaseStatus" AS ENUM (
    'PENDING',
    'PENDING_DELIVERY',
    'DELIVERING',
    'COMPLETED',
    'CANCELLED',
    'CANCELLING',
    'RETURNING'
);


ALTER TYPE public."PurchaseStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: BusCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BusCategory" (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."BusCategory" OWNER TO postgres;

--
-- Name: BusCategory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."BusCategory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."BusCategory_id_seq" OWNER TO postgres;

--
-- Name: BusCategory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."BusCategory_id_seq" OWNED BY public."BusCategory".id;


--
-- Name: Cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Cart" (
    id text NOT NULL,
    "providerId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Cart" OWNER TO postgres;

--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CartItem" (
    id integer NOT NULL,
    "cartId" text NOT NULL,
    "productId" integer NOT NULL,
    quantity integer NOT NULL,
    "selectedOption" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CartItem" OWNER TO postgres;

--
-- Name: CartItem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CartItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CartItem_id_seq" OWNER TO postgres;

--
-- Name: CartItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CartItem_id_seq" OWNED BY public."CartItem".id;


--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: CategoryThumbnail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CategoryThumbnail" (
    id integer NOT NULL,
    url text NOT NULL,
    filename text NOT NULL,
    filetype text NOT NULL,
    "categoryId" integer,
    "subCategoryId" integer
);


ALTER TABLE public."CategoryThumbnail" OWNER TO postgres;

--
-- Name: CategoryThumbnail_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CategoryThumbnail_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."CategoryThumbnail_id_seq" OWNER TO postgres;

--
-- Name: CategoryThumbnail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CategoryThumbnail_id_seq" OWNED BY public."CategoryThumbnail".id;


--
-- Name: Category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Category_id_seq" OWNER TO postgres;

--
-- Name: Category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;


--
-- Name: Coupon; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Coupon" (
    id integer NOT NULL,
    code text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "flatDiscount" integer,
    "discountRate" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Coupon" OWNER TO postgres;

--
-- Name: Coupon_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Coupon_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Coupon_id_seq" OWNER TO postgres;

--
-- Name: Coupon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Coupon_id_seq" OWNED BY public."Coupon".id;


--
-- Name: DeliveryAddress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DeliveryAddress" (
    id text NOT NULL,
    "orderId" text NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    "detailedAddress" text NOT NULL,
    zipcode text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DeliveryAddress" OWNER TO postgres;

--
-- Name: Events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Events" (
    id integer NOT NULL,
    title text NOT NULL,
    content text,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Events" OWNER TO postgres;

--
-- Name: EventsThumbnail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EventsThumbnail" (
    id integer NOT NULL,
    url text NOT NULL,
    filename text NOT NULL,
    filetype text NOT NULL,
    "eventsId" integer NOT NULL
);


ALTER TABLE public."EventsThumbnail" OWNER TO postgres;

--
-- Name: EventsThumbnail_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."EventsThumbnail_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."EventsThumbnail_id_seq" OWNER TO postgres;

--
-- Name: EventsThumbnail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."EventsThumbnail_id_seq" OWNED BY public."EventsThumbnail".id;


--
-- Name: Events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Events_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Events_id_seq" OWNER TO postgres;

--
-- Name: Events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Events_id_seq" OWNED BY public."Events".id;


--
-- Name: Notice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notice" (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Notice" OWNER TO postgres;

--
-- Name: Notice_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Notice_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Notice_id_seq" OWNER TO postgres;

--
-- Name: Notice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Notice_id_seq" OWNED BY public."Notice".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "orderContent" jsonb NOT NULL,
    status public."PurchaseStatus" NOT NULL,
    price integer NOT NULL,
    discount integer NOT NULL,
    "trackingNumber" text,
    "trackingCompany" text,
    "couponAppliedId" integer,
    "isCanceled" boolean DEFAULT false NOT NULL,
    "isRefunded" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "paymentKey" text,
    "paymentMethod" text,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "virtualAccountInfo" jsonb
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: Post; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Post" (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "readCount" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Post" OWNER TO postgres;

--
-- Name: PostThumbnail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PostThumbnail" (
    id integer NOT NULL,
    url text NOT NULL,
    filename text NOT NULL,
    filetype text NOT NULL,
    "postId" integer NOT NULL
);


ALTER TABLE public."PostThumbnail" OWNER TO postgres;

--
-- Name: PostThumbnail_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PostThumbnail_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PostThumbnail_id_seq" OWNER TO postgres;

--
-- Name: PostThumbnail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PostThumbnail_id_seq" OWNED BY public."PostThumbnail".id;


--
-- Name: Post_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Post_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Post_id_seq" OWNER TO postgres;

--
-- Name: Post_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Post_id_seq" OWNED BY public."Post".id;


--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id integer NOT NULL,
    status public."ProductStatus" DEFAULT 'ACTIVE'::public."ProductStatus" NOT NULL,
    name text NOT NULL,
    price integer NOT NULL,
    discount integer DEFAULT 0 NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isNew" boolean DEFAULT true NOT NULL,
    "isRecommended" boolean DEFAULT false NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    options text[],
    "specialDelivery" boolean DEFAULT false NOT NULL,
    delivery boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: ProductImage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductImage" (
    id integer NOT NULL,
    url text NOT NULL,
    filename text NOT NULL,
    filetype text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "productId" integer NOT NULL
);


ALTER TABLE public."ProductImage" OWNER TO postgres;

--
-- Name: ProductImage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ProductImage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ProductImage_id_seq" OWNER TO postgres;

--
-- Name: ProductImage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ProductImage_id_seq" OWNED BY public."ProductImage".id;


--
-- Name: ProductMainImage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductMainImage" (
    id integer NOT NULL,
    url text NOT NULL,
    filename text NOT NULL,
    filetype text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "productId" integer NOT NULL
);


ALTER TABLE public."ProductMainImage" OWNER TO postgres;

--
-- Name: ProductMainImage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ProductMainImage_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ProductMainImage_id_seq" OWNER TO postgres;

--
-- Name: ProductMainImage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ProductMainImage_id_seq" OWNED BY public."ProductMainImage".id;


--
-- Name: Product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Product_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Product_id_seq" OWNER TO postgres;

--
-- Name: Product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Product_id_seq" OWNED BY public."Product".id;


--
-- Name: SubCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SubCategory" (
    id integer NOT NULL,
    name text NOT NULL,
    "categoryId" integer NOT NULL
);


ALTER TABLE public."SubCategory" OWNER TO postgres;

--
-- Name: SubCategory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."SubCategory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SubCategory_id_seq" OWNER TO postgres;

--
-- Name: SubCategory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."SubCategory_id_seq" OWNED BY public."SubCategory".id;


--
-- Name: TemporaryOrder; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TemporaryOrder" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "orderData" jsonb NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TemporaryOrder" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    provider text NOT NULL,
    "providerId" text NOT NULL,
    "isAdmin" boolean DEFAULT false NOT NULL,
    name text,
    email text,
    password text,
    phone text,
    "deliveryName" text,
    "deliveryPhone" text,
    address text,
    "detailedAddress" text,
    zipcode text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _BusCategoryToPost; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_BusCategoryToPost" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_BusCategoryToPost" OWNER TO postgres;

--
-- Name: _CategoryToProduct; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_CategoryToProduct" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_CategoryToProduct" OWNER TO postgres;

--
-- Name: _OrderToProduct; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_OrderToProduct" (
    "A" text NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_OrderToProduct" OWNER TO postgres;

--
-- Name: _ProductToSubCategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_ProductToSubCategory" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_ProductToSubCategory" OWNER TO postgres;

--
-- Name: BusCategory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BusCategory" ALTER COLUMN id SET DEFAULT nextval('public."BusCategory_id_seq"'::regclass);


--
-- Name: CartItem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem" ALTER COLUMN id SET DEFAULT nextval('public."CartItem_id_seq"'::regclass);


--
-- Name: Category id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);


--
-- Name: CategoryThumbnail id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CategoryThumbnail" ALTER COLUMN id SET DEFAULT nextval('public."CategoryThumbnail_id_seq"'::regclass);


--
-- Name: Coupon id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupon" ALTER COLUMN id SET DEFAULT nextval('public."Coupon_id_seq"'::regclass);


--
-- Name: Events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Events" ALTER COLUMN id SET DEFAULT nextval('public."Events_id_seq"'::regclass);


--
-- Name: EventsThumbnail id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EventsThumbnail" ALTER COLUMN id SET DEFAULT nextval('public."EventsThumbnail_id_seq"'::regclass);


--
-- Name: Notice id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notice" ALTER COLUMN id SET DEFAULT nextval('public."Notice_id_seq"'::regclass);


--
-- Name: Post id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Post" ALTER COLUMN id SET DEFAULT nextval('public."Post_id_seq"'::regclass);


--
-- Name: PostThumbnail id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PostThumbnail" ALTER COLUMN id SET DEFAULT nextval('public."PostThumbnail_id_seq"'::regclass);


--
-- Name: Product id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product" ALTER COLUMN id SET DEFAULT nextval('public."Product_id_seq"'::regclass);


--
-- Name: ProductImage id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductImage" ALTER COLUMN id SET DEFAULT nextval('public."ProductImage_id_seq"'::regclass);


--
-- Name: ProductMainImage id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductMainImage" ALTER COLUMN id SET DEFAULT nextval('public."ProductMainImage_id_seq"'::regclass);


--
-- Name: SubCategory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SubCategory" ALTER COLUMN id SET DEFAULT nextval('public."SubCategory_id_seq"'::regclass);


--
-- Data for Name: BusCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BusCategory" (id, name) FROM stdin;
\.


--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Cart" (id, "providerId", "createdAt", "updatedAt") FROM stdin;
426ff21f-fd66-42e4-901b-d076d059af49	4e5b4a9c-1dce-445a-bcaa-240e24b2ee36	2025-02-03 02:47:32.467	2025-02-03 02:47:32.467
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CartItem" (id, "cartId", "productId", quantity, "selectedOption", "createdAt", "updatedAt") FROM stdin;
8	426ff21f-fd66-42e4-901b-d076d059af49	14	1	\N	2025-02-11 06:05:37.973	2025-02-11 06:05:37.973
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name) FROM stdin;
3	버스 부품
5	버스 용품
6	인테리어 소품
7	음향 장비
8	장식장
9	조명
10	시트
11	Full smart
\.


--
-- Data for Name: CategoryThumbnail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CategoryThumbnail" (id, url, filename, filetype, "categoryId", "subCategoryId") FROM stdin;
5	/uploads/categories/0ab1fe25ad911db7793e7c719f08ad52cdf44875.png	0ab1fe25ad911db7793e7c719f08ad52cdf44875.png	image/png	3	\N
8	/uploads/categories/512111d23c0776f0d62b25246d11ef46cebc8368.png	512111d23c0776f0d62b25246d11ef46cebc8368.png	image/png	5	\N
9	/uploads/categories/3b007bea85b83b4962020e7fe12137d4541bd9d2.png	3b007bea85b83b4962020e7fe12137d4541bd9d2.png	image/png	6	\N
10	/uploads/categories/25d0a5a6d5a420e4bb4bf4c238c368af50168fc5.png	25d0a5a6d5a420e4bb4bf4c238c368af50168fc5.png	image/png	7	\N
11	/uploads/categories/5458456e379c150bf9050f29cdeb893bc52e9969.png	5458456e379c150bf9050f29cdeb893bc52e9969.png	image/png	8	\N
12	/uploads/categories/5d5595fcfca505a530a704b592ade45c6707659f.png	5d5595fcfca505a530a704b592ade45c6707659f.png	image/png	9	\N
13	/uploads/categories/b1057f9c2dfc020e145799f716972c9007f6fba1.png	b1057f9c2dfc020e145799f716972c9007f6fba1.png	image/png	10	\N
14	/uploads/categories/84a86e35cdbc20016aa328aa0d09f3dde994830b.png	84a86e35cdbc20016aa328aa0d09f3dde994830b.png	image/png	11	\N
\.


--
-- Data for Name: Coupon; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Coupon" (id, code, active, "flatDiscount", "discountRate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: DeliveryAddress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DeliveryAddress" (id, "orderId", name, phone, address, "detailedAddress", zipcode, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Events" (id, title, content, active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: EventsThumbnail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EventsThumbnail" (id, url, filename, filetype, "eventsId") FROM stdin;
\.


--
-- Data for Name: Notice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notice" (id, title, content, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, "userId", "orderContent", status, price, discount, "trackingNumber", "trackingCompany", "couponAppliedId", "isCanceled", "isRefunded", "createdAt", "updatedAt", "paymentKey", "paymentMethod", "paymentStatus", "virtualAccountInfo") FROM stdin;
\.


--
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Post" (id, title, content, "createdAt", "updatedAt", "readCount") FROM stdin;
\.


--
-- Data for Name: PostThumbnail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PostThumbnail" (id, url, filename, filetype, "postId") FROM stdin;
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, status, name, price, discount, description, "createdAt", "updatedAt", "isNew", "isRecommended", stock, options, "specialDelivery", delivery) FROM stdin;
2	ACTIVE	바닥매트	139000	0	베이직	2025-01-17 03:04:29.042	2025-01-17 03:04:29.042	t	f	50	{}	f	t
5	ACTIVE	버스 바닥매트	139000	0	대형 버스 전문 맞춤 제작	2025-01-17 03:30:14.809	2025-01-17 03:30:14.809	t	f	50	{블랙,블루}	f	t
6	ACTIVE	온수기	120000	0	가죽 브라켓장	2025-01-17 03:33:38.175	2025-01-17 03:33:38.175	f	t	20	{}	f	t
7	ACTIVE	온수기 반달 브라켓	80000	0	온수기 전용	2025-01-17 03:42:35.428	2025-01-17 03:42:35.428	t	f	100	{}	f	t
8	ACTIVE	컵홀더	30000	0	원목 1구형	2025-01-17 03:47:35.828	2025-01-17 03:47:35.828	f	t	20	{}	f	t
14	ACTIVE	기어 커버 소형	20000	0	크리스탈 기어 커버	2025-01-17 04:35:59.76	2025-01-17 04:35:59.76	f	t	30	{}	f	t
16	ACTIVE	핸들커버	70000	0	크리스탈 핸들커버 현대/기아 전용	2025-01-17 04:40:06.699	2025-01-17 04:40:06.699	f	t	66	{}	f	f
17	ACTIVE	마블 장식장	500000	0	버스 마블 장식장 오렌지 컬러	2025-01-17 04:52:47.868	2025-01-17 04:52:47.868	t	f	20	{}	f	t
18	ACTIVE	마블 장식장	500000	0	버스 마블 장식장 브라운 컬러	2025-01-17 04:54:45.52	2025-01-17 04:54:45.52	f	t	30	{}	t	t
19	ACTIVE	신형 버스 장식장	60000	0	마블 장식장 브라운 컬러	2025-01-17 04:58:16.962	2025-01-17 04:58:16.962	f	t	40	{}	t	t
20	ACTIVE	가죽 장식장	600000	10	프리미엄 버스 가죽 장식장 24년 신형	2025-01-17 05:00:08.819	2025-01-17 05:00:08.819	t	f	65	{}	t	t
22	ACTIVE	우드 장식장	600000	0	버스 우드 장식장 24년형	2025-01-17 05:03:23.197	2025-01-17 05:11:39.827	f	t	50	{}	t	f
15	ACTIVE	기어 커버 대형	60000	0	크리스탈 기어 커버	2025-01-17 04:38:13.843	2025-01-17 08:00:04.82	t	f	39	{}	f	t
\.


--
-- Data for Name: ProductImage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductImage" (id, url, filename, filetype, "order", "productId") FROM stdin;
26	/uploads/products/detail/4fba4d3bba0440b814f9372a93dbd7b6b74fe9e3.webp	4fba4d3bba0440b814f9372a93dbd7b6b74fe9e3.jpg	image/webp	0	6
27	/uploads/products/detail/f7963db6e06560e328112fbb86a45202f0ffee9c.webp	f7963db6e06560e328112fbb86a45202f0ffee9c.jpg	image/webp	0	6
28	/uploads/products/detail/83c962ab0737e061fb4aafd1f3a2b27e6540d671.webp	83c962ab0737e061fb4aafd1f3a2b27e6540d671.jpg	image/webp	0	7
29	/uploads/products/detail/486ff4b6c71f98ba2bb38b247f372d596e0d5a32.webp	486ff4b6c71f98ba2bb38b247f372d596e0d5a32.jpg	image/webp	0	7
30	/uploads/products/detail/86f72ef358d1e683b22bd804b78e774d67d3bc8c.webp	86f72ef358d1e683b22bd804b78e774d67d3bc8c.jpg	image/webp	0	7
31	/uploads/products/detail/43d5787624786ce178cf2fa5ce0a77943bbd786e.webp	43d5787624786ce178cf2fa5ce0a77943bbd786e.jpg	image/webp	0	7
32	/uploads/products/detail/0228ac52f7d6f6173c2620580027c8c749bfa068.webp	0228ac52f7d6f6173c2620580027c8c749bfa068.jpg	image/webp	0	7
33	/uploads/products/detail/7ab6c6a5b0d37a55201204c11207709d3e63e885.webp	7ab6c6a5b0d37a55201204c11207709d3e63e885.jpg	image/webp	0	7
34	/uploads/products/detail/5488e27f84490abda7eceef52327466a2751fc54.webp	5488e27f84490abda7eceef52327466a2751fc54.jpg	image/webp	0	7
35	/uploads/products/detail/1afb29b79616b1a15ba007c7039829fa127428a8.webp	1afb29b79616b1a15ba007c7039829fa127428a8.jpg	image/webp	0	7
36	/uploads/products/detail/22d773a09c999f7b181b01cf58d09c445a09a324.webp	22d773a09c999f7b181b01cf58d09c445a09a324.jpg	image/webp	0	8
37	/uploads/products/detail/ff0f62c5c7b8d463bf320afa8f14c74691f9013a.webp	ff0f62c5c7b8d463bf320afa8f14c74691f9013a.jpg	image/webp	0	8
38	/uploads/products/detail/d40389989cb967df34997e9eea51128557fe0e1b.webp	d40389989cb967df34997e9eea51128557fe0e1b.jpg	image/webp	0	8
39	/uploads/products/detail/af0db43a88fc232e67abbe38a4e4e73628362afd.webp	af0db43a88fc232e67abbe38a4e4e73628362afd.jpg	image/webp	0	8
40	/uploads/products/detail/fe2a2af9fd6a2255443673d3197592c305b261c1.webp	fe2a2af9fd6a2255443673d3197592c305b261c1.jpg	image/webp	0	8
41	/uploads/products/detail/42673dd5b27c6533e0857e12d0e3ea201b2ec973.webp	42673dd5b27c6533e0857e12d0e3ea201b2ec973.jpg	image/webp	0	8
42	/uploads/products/detail/d17e5e0b8819de3fe6acf6da750d492a3a684d75.webp	d17e5e0b8819de3fe6acf6da750d492a3a684d75.jpg	image/webp	0	8
48	/uploads/products/detail/d3c6fc44f54815d05bc1ba76cd8fdedd616c7971.webp	d3c6fc44f54815d05bc1ba76cd8fdedd616c7971.jpg	image/webp	0	14
49	/uploads/products/detail/6680a05ac60835e1e644ece7bf05c5487801a703.webp	6680a05ac60835e1e644ece7bf05c5487801a703.jpg	image/webp	0	14
50	/uploads/products/detail/b9f530cdd90beb598f9e9683acb07374aa523748.webp	b9f530cdd90beb598f9e9683acb07374aa523748.jpg	image/webp	0	14
51	/uploads/products/detail/044987420a13939e4207aeac057b1202ee601305.webp	044987420a13939e4207aeac057b1202ee601305.jpg	image/webp	0	14
52	/uploads/products/detail/38b5171394ed30533415bbbd02872a4e2666973f.webp	38b5171394ed30533415bbbd02872a4e2666973f.jpg	image/webp	0	14
53	/uploads/products/detail/27c3ca6fa08bf1592fa89372bd28d9dd4df54ce6.webp	27c3ca6fa08bf1592fa89372bd28d9dd4df54ce6.jpg	image/webp	0	14
54	/uploads/products/detail/f7f2d38ba18a7eb765f69f4c735d76725dad460b.webp	f7f2d38ba18a7eb765f69f4c735d76725dad460b.jpg	image/webp	0	15
55	/uploads/products/detail/1c4f8a6153c0bdc99e6f8440de193107f8fb70ae.webp	1c4f8a6153c0bdc99e6f8440de193107f8fb70ae.jpg	image/webp	0	15
56	/uploads/products/detail/c525c61848c1240ff18761c975ba8d24a205d056.webp	c525c61848c1240ff18761c975ba8d24a205d056.jpg	image/webp	0	15
57	/uploads/products/detail/2eb44ad715849bf67fab44ec10c51c671f077ead.webp	2eb44ad715849bf67fab44ec10c51c671f077ead.jpg	image/webp	0	15
58	/uploads/products/detail/098f3ac2a41edb0c4d0d6d30e4d27ddc972563ea.webp	098f3ac2a41edb0c4d0d6d30e4d27ddc972563ea.jpg	image/webp	0	15
59	/uploads/products/detail/2724a21145129032299544c90730c78083f46021.webp	2724a21145129032299544c90730c78083f46021.jpg	image/webp	0	15
60	/uploads/products/detail/5e4c06d497e013a4855c2697a3295104f8af1c81.webp	5e4c06d497e013a4855c2697a3295104f8af1c81.jpg	image/webp	0	16
76	/uploads/products/detail/42e80eedc558484c29dbea16cb70a20204a8a8cd.webp	42e80eedc558484c29dbea16cb70a20204a8a8cd.jpg	image/webp	0	18
77	/uploads/products/detail/72d278759b2dc37901112427d960d1e93371d0cb.webp	72d278759b2dc37901112427d960d1e93371d0cb.jpg	image/webp	0	18
78	/uploads/products/detail/ee9d3969478bffac1c2478a7b9de68728a786e56.webp	ee9d3969478bffac1c2478a7b9de68728a786e56.jpg	image/webp	0	18
79	/uploads/products/detail/30b9ef5a62620cd94f6fda52f285068340869b62.webp	30b9ef5a62620cd94f6fda52f285068340869b62.jpg	image/webp	0	18
80	/uploads/products/detail/a155b8d26df7771475cb4362a6f6891de642733b.webp	a155b8d26df7771475cb4362a6f6891de642733b.jpg	image/webp	0	18
81	/uploads/products/detail/8931d7212a8dfc2523cc0380a0b78c0d61be93c0.webp	8931d7212a8dfc2523cc0380a0b78c0d61be93c0.jpg	image/webp	0	19
82	/uploads/products/detail/3879bfdfab62bd6fefb9cb301a16a3f5322664cd.webp	3879bfdfab62bd6fefb9cb301a16a3f5322664cd.jpg	image/webp	0	19
83	/uploads/products/detail/4f75157c6e1cbbfb223f8d57faf65d78b76cd541.webp	4f75157c6e1cbbfb223f8d57faf65d78b76cd541.jpg	image/webp	0	19
84	/uploads/products/detail/ac6ffc45a9f3ea01ea8cfd89ea7551c0299e249b.webp	ac6ffc45a9f3ea01ea8cfd89ea7551c0299e249b.jpg	image/webp	0	19
85	/uploads/products/detail/1e653b25015280a49031d0e034bddd13944cd742.webp	1e653b25015280a49031d0e034bddd13944cd742.jpg	image/webp	0	19
86	/uploads/products/detail/4a229dc59dc17fa13e0a843785846ceae61695bc.webp	4a229dc59dc17fa13e0a843785846ceae61695bc.jpg	image/webp	0	19
87	/uploads/products/detail/61f0ba0cf6884ebbfd520b1e7ca91253a0df8792.webp	61f0ba0cf6884ebbfd520b1e7ca91253a0df8792.jpg	image/webp	0	19
88	/uploads/products/detail/0cc4b2655fd6cb8eb7a5ca074e5c9938f0b8ff32.webp	0cc4b2655fd6cb8eb7a5ca074e5c9938f0b8ff32.jpg	image/webp	0	19
89	/uploads/products/detail/f2b7fc7a75f179e42ad86ba38726f39d18f3dda3.webp	f2b7fc7a75f179e42ad86ba38726f39d18f3dda3.jpg	image/webp	0	20
90	/uploads/products/detail/fa2549b2c35cadfdc9f9ca7ef0dbd1b78a0c3aca.webp	fa2549b2c35cadfdc9f9ca7ef0dbd1b78a0c3aca.jpg	image/webp	0	20
91	/uploads/products/detail/e013b422456dff04b580eff68d22c7184d48eeef.webp	e013b422456dff04b580eff68d22c7184d48eeef.jpg	image/webp	0	20
92	/uploads/products/detail/45355976537b30fba42743d5409b93516688803d.webp	45355976537b30fba42743d5409b93516688803d.jpg	image/webp	0	20
61	/uploads/products/detail/2186d61ecaf1a8905acdd5ca450256124593e26b.webp	2186d61ecaf1a8905acdd5ca450256124593e26b.jpg	image/webp	0	16
62	/uploads/products/detail/fe450517b2f6454530ff6415a6ef498a71ac48b4.webp	fe450517b2f6454530ff6415a6ef498a71ac48b4.jpg	image/webp	0	16
63	/uploads/products/detail/ad68cdc2cfa09c99c5bfc9057484850c5f614c17.webp	ad68cdc2cfa09c99c5bfc9057484850c5f614c17.jpg	image/webp	0	16
64	/uploads/products/detail/537ec044b1f9f54a5d6aaae4a8015f13e3748ab5.webp	537ec044b1f9f54a5d6aaae4a8015f13e3748ab5.jpg	image/webp	0	16
65	/uploads/products/detail/6e9fc08f13bd31936b3857415ae05f390b59886e.webp	6e9fc08f13bd31936b3857415ae05f390b59886e.jpg	image/webp	0	16
66	/uploads/products/detail/33af7daefb9d46ce9cf3b749fc6cd5459abdac61.webp	33af7daefb9d46ce9cf3b749fc6cd5459abdac61.jpg	image/webp	0	17
67	/uploads/products/detail/28b9e96cc958755709b60181997c981683165440.webp	28b9e96cc958755709b60181997c981683165440.jpg	image/webp	0	17
68	/uploads/products/detail/f83c9505b5f1f16483e40e90a6428bca4ec658e5.webp	f83c9505b5f1f16483e40e90a6428bca4ec658e5.jpg	image/webp	0	17
69	/uploads/products/detail/cdbe0c941cd274621e017c371778022d1ede44c3.webp	cdbe0c941cd274621e017c371778022d1ede44c3.jpg	image/webp	0	17
70	/uploads/products/detail/b0c3b32c5b5dca1694530c40ec97833e0ab6e07b.webp	b0c3b32c5b5dca1694530c40ec97833e0ab6e07b.jpg	image/webp	0	17
71	/uploads/products/detail/c16957ef2c1e742a25163d635a63c7714e49e8b7.webp	c16957ef2c1e742a25163d635a63c7714e49e8b7.jpg	image/webp	0	17
72	/uploads/products/detail/8c7fba8ff9c976d9dfb919ab9d37e21981c4a2ca.webp	8c7fba8ff9c976d9dfb919ab9d37e21981c4a2ca.jpg	image/webp	0	17
73	/uploads/products/detail/548b2a2c687062429a9eb5c5a38e70bde2c1fcfa.webp	548b2a2c687062429a9eb5c5a38e70bde2c1fcfa.jpg	image/webp	0	17
74	/uploads/products/detail/72c0a3f59cdadb9abbb9afc10bafca35314bfcdb.webp	72c0a3f59cdadb9abbb9afc10bafca35314bfcdb.jpg	image/webp	0	18
75	/uploads/products/detail/485044c40ad56f0e30da3a0569b1869a4802ccdc.webp	485044c40ad56f0e30da3a0569b1869a4802ccdc.jpg	image/webp	0	18
2	/uploads/products/detail/41d5dd1c0c7e0b9dd1878c58625063d4f1ac4ed4.webp	41d5dd1c0c7e0b9dd1878c58625063d4f1ac4ed4.jpg	image/webp	0	2
3	/uploads/products/detail/723e6019f5ae1811a6012c4578bd36f0460b1f82.webp	723e6019f5ae1811a6012c4578bd36f0460b1f82.jpg	image/webp	0	2
4	/uploads/products/detail/9214c0d98c423e896e2c9f7d6560bae292b6a56b.webp	9214c0d98c423e896e2c9f7d6560bae292b6a56b.jpg	image/webp	0	2
5	/uploads/products/detail/cfd5a30f0884eb1d3eec3d4d5d3a01af9f660ea0.webp	cfd5a30f0884eb1d3eec3d4d5d3a01af9f660ea0.jpg	image/webp	0	2
6	/uploads/products/detail/0928d64b09a4da97f7a0c73f93b101cf65aa424e.webp	0928d64b09a4da97f7a0c73f93b101cf65aa424e.jpg	image/webp	0	2
7	/uploads/products/detail/14fcd609c1af776fb2de95fbd82632f333adba54.webp	14fcd609c1af776fb2de95fbd82632f333adba54.jpg	image/webp	0	2
15	/uploads/products/detail/42b5250b24961832708f4a3e115f922da69c26a2.webp	42b5250b24961832708f4a3e115f922da69c26a2.jpg	image/webp	0	5
16	/uploads/products/detail/73cded229af6504fe3df6844622bce1a59e2c66a.webp	73cded229af6504fe3df6844622bce1a59e2c66a.jpg	image/webp	0	5
17	/uploads/products/detail/82111ee78a79c59257ef542eaa64ecea094cfa2c.webp	82111ee78a79c59257ef542eaa64ecea094cfa2c.jpg	image/webp	0	5
18	/uploads/products/detail/cb34a072c20abd75a81bae9a6a0d84cfef8bbed8.webp	cb34a072c20abd75a81bae9a6a0d84cfef8bbed8.jpg	image/webp	0	5
19	/uploads/products/detail/5857ed2a51ae7eac56e11ecd51f495d53424574d.webp	5857ed2a51ae7eac56e11ecd51f495d53424574d.jpg	image/webp	0	5
20	/uploads/products/detail/bca83dfb6531e2651a46e228b7da65c541b0b4ca.webp	bca83dfb6531e2651a46e228b7da65c541b0b4ca.jpg	image/webp	0	5
21	/uploads/products/detail/a38e710af46ef51c881e41ea1970d1fe115cba67.webp	a38e710af46ef51c881e41ea1970d1fe115cba67.jpg	image/webp	0	6
22	/uploads/products/detail/e4cad1e79f83b7c884f8e158d4a57bd8fd099af4.webp	e4cad1e79f83b7c884f8e158d4a57bd8fd099af4.jpg	image/webp	0	6
23	/uploads/products/detail/f70b069f010411d524f19e6d10ebea2306e520ac.webp	f70b069f010411d524f19e6d10ebea2306e520ac.jpg	image/webp	0	6
24	/uploads/products/detail/989083a7c2a5cfe3e9307a9e3081b0c8f6d8d950.webp	989083a7c2a5cfe3e9307a9e3081b0c8f6d8d950.jpg	image/webp	0	6
25	/uploads/products/detail/537f41151f51359eeada0844ea9da463e5b4fe26.webp	537f41151f51359eeada0844ea9da463e5b4fe26.jpg	image/webp	0	6
93	/uploads/products/detail/a5c2657bedc0a9e90ec4cacd720bdda0491aa3c5.webp	a5c2657bedc0a9e90ec4cacd720bdda0491aa3c5.jpg	image/webp	0	20
94	/uploads/products/detail/d9652a4cbaeae9c6a5595d0ffec883bf9c9b7e27.webp	d9652a4cbaeae9c6a5595d0ffec883bf9c9b7e27.jpg	image/webp	0	20
95	/uploads/products/detail/861c474f8c23427dc734d8f3bd394192d5538401.webp	861c474f8c23427dc734d8f3bd394192d5538401.jpg	image/webp	0	20
96	/uploads/products/detail/b89e07a5ab527505dc4caa451bc066662e7888e6.webp	b89e07a5ab527505dc4caa451bc066662e7888e6.jpg	image/webp	0	20
98	/uploads/products/detail/aff512d3a8cd76d3143e08ec133a2740c5a2ddc8.webp	aff512d3a8cd76d3143e08ec133a2740c5a2ddc8.jpg	image/webp	0	22
99	/uploads/products/detail/fd2340c0b75667a977bc968c9e2ca5c1f1790f35.webp	fd2340c0b75667a977bc968c9e2ca5c1f1790f35.jpg	image/webp	0	22
100	/uploads/products/detail/b3fbee4665457f880b6a8026de628b6f3a0a1014.webp	b3fbee4665457f880b6a8026de628b6f3a0a1014.jpg	image/webp	0	22
101	/uploads/products/detail/2e829deb500d8de2a69263c6570062294edca07f.webp	2e829deb500d8de2a69263c6570062294edca07f.jpg	image/webp	0	22
102	/uploads/products/detail/77a4a9bf93099c00e266611205c10da52445faae.webp	77a4a9bf93099c00e266611205c10da52445faae.jpg	image/webp	0	22
103	/uploads/products/detail/2309d2340dd6cb645f2847a9adfedf18ce9c41ad.webp	2309d2340dd6cb645f2847a9adfedf18ce9c41ad.jpg	image/webp	0	22
104	/uploads/products/detail/90fd1a34a4c5dc6a1718cc42c6ba7eb1a24c22d8.webp	90fd1a34a4c5dc6a1718cc42c6ba7eb1a24c22d8.jpg	image/webp	0	22
105	/uploads/products/detail/8667478d2d042815dac4461c7ed880bdf03e6810.webp	8667478d2d042815dac4461c7ed880bdf03e6810.jpg	image/webp	0	22
106	/uploads/products/detail/0ca9344181ee3131b2d7605eb0892e5d9fade898.webp	0ca9344181ee3131b2d7605eb0892e5d9fade898.jpg	image/webp	0	22
\.


--
-- Data for Name: ProductMainImage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductMainImage" (id, url, filename, filetype, "order", "productId") FROM stdin;
2	/uploads/products/main/bd1f0bbce684e01b4d6846f06d8f491f49c9c2da.webp	bd1f0bbce684e01b4d6846f06d8f491f49c9c2da.jpg	image/webp	0	2
5	/uploads/products/main/f26510d2866ae727e3e9a4123d9fd50763b5977f.webp	f26510d2866ae727e3e9a4123d9fd50763b5977f.jpg	image/webp	0	5
6	/uploads/products/main/705068c4731fe17d38dafbb2c4a97719f1e981c3.webp	705068c4731fe17d38dafbb2c4a97719f1e981c3.jpg	image/webp	0	6
7	/uploads/products/main/631d5bf2f005d319a78a345830385ae3111731ae.webp	631d5bf2f005d319a78a345830385ae3111731ae.jpg	image/webp	0	7
8	/uploads/products/main/1568a05625aea4e63d5599755583f8be630d3797.webp	1568a05625aea4e63d5599755583f8be630d3797.jpg	image/webp	0	8
14	/uploads/products/main/efe966d24a2b3ff4414b4f56c3717c193f41156d.webp	efe966d24a2b3ff4414b4f56c3717c193f41156d.jpg	image/webp	0	14
15	/uploads/products/main/db46b8f326c213dd532f34e5525caf2e6a083d0a.webp	db46b8f326c213dd532f34e5525caf2e6a083d0a.jpg	image/webp	0	15
16	/uploads/products/main/c33dd7a66ccecebed067e9e8ceec56ffc43ab6cd.webp	c33dd7a66ccecebed067e9e8ceec56ffc43ab6cd.jpg	image/webp	0	16
17	/uploads/products/main/50b5d32dded24c262ca9b8b5883153b647ea6342.webp	50b5d32dded24c262ca9b8b5883153b647ea6342.jpg	image/webp	0	17
18	/uploads/products/main/778cefe9d0a05120cb04dcb67a97e18633b2536d.webp	778cefe9d0a05120cb04dcb67a97e18633b2536d.jpg	image/webp	0	18
19	/uploads/products/main/facd403f2614e937266a5b9a867a384af515cf00.webp	facd403f2614e937266a5b9a867a384af515cf00.jpg	image/webp	0	19
20	/uploads/products/main/2b9b1b4884196813e105627d6f0946e173505363.webp	2b9b1b4884196813e105627d6f0946e173505363.jpg	image/webp	0	20
22	/uploads/products/main/b6f501f110c28734b66548a663f44c20adf44e51.webp	b6f501f110c28734b66548a663f44c20adf44e51.jpg	image/webp	0	22
\.


--
-- Data for Name: SubCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SubCategory" (id, name, "categoryId") FROM stdin;
\.


--
-- Data for Name: TemporaryOrder; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TemporaryOrder" (id, "userId", "orderData", "expiresAt", "createdAt") FROM stdin;
202502110001	4e5b4a9c-1dce-445a-bcaa-240e24b2ee36	{"price": 20000, "userId": "4e5b4a9c-1dce-445a-bcaa-240e24b2ee36", "orderId": "202502110001", "discount": 0, "cartItems": [{"price": 20000, "quantity": 1, "productId": 14, "productName": "기어 커버 소형", "originalPrice": 20000, "subTotalPrice": 20000, "selectedOption": null}], "deliveryInfo": {"name": "Test User", "phone": "1234567890", "address": "인천 중구 젓개로 107", "zipcode": "22356", "setAsDefault": false, "detailedAddress": "2동 카일루스"}, "originalTotal": 20000}	2025-02-11 06:36:19.808	2025-02-11 06:06:19.812
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, provider, "providerId", "isAdmin", name, email, password, phone, "deliveryName", "deliveryPhone", address, "detailedAddress", zipcode, "createdAt", "updatedAt") FROM stdin;
41ecc02b-9afa-449e-abf6-9875077c3940	credentials	98e7e74c-fa5d-44f2-8fe7-924d1fedd93c	t	Admin	admin@nexis.com	$2a$10$btrusv05IfIEYjL2jyJYDOcruofW6pYDyxII/i.FEQoGHKJwtf5LC	1234567890	\N	\N	\N	\N	\N	2025-02-03 02:40:38.143	2025-02-03 02:40:38.143
3fb19cf9-b219-4c08-b8db-e1ada1be378a	credentials	4e5b4a9c-1dce-445a-bcaa-240e24b2ee36	f	Test User	test@nexis.com	$2a$10$obFqgE4AeLwkeVeyyD6y.e1S60pAYTpaigDaqllyKYuLG5rLq3Hda	1234567890	\N	\N	\N	\N	\N	2025-02-03 02:40:38.237	2025-02-03 02:40:38.237
\.


--
-- Data for Name: _BusCategoryToPost; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_BusCategoryToPost" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _CategoryToProduct; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_CategoryToProduct" ("A", "B") FROM stdin;
3	2
5	5
5	6
6	7
6	8
6	14
6	15
6	16
8	17
8	18
8	19
8	20
8	22
\.


--
-- Data for Name: _OrderToProduct; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_OrderToProduct" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _ProductToSubCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_ProductToSubCategory" ("A", "B") FROM stdin;
\.


--
-- Name: BusCategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."BusCategory_id_seq"', 1, false);


--
-- Name: CartItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CartItem_id_seq"', 8, true);


--
-- Name: CategoryThumbnail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CategoryThumbnail_id_seq"', 14, true);


--
-- Name: Category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Category_id_seq"', 11, true);


--
-- Name: Coupon_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Coupon_id_seq"', 1, false);


--
-- Name: EventsThumbnail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."EventsThumbnail_id_seq"', 1, false);


--
-- Name: Events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Events_id_seq"', 1, false);


--
-- Name: Notice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Notice_id_seq"', 1, false);


--
-- Name: PostThumbnail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PostThumbnail_id_seq"', 1, false);


--
-- Name: Post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Post_id_seq"', 1, false);


--
-- Name: ProductImage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ProductImage_id_seq"', 106, true);


--
-- Name: ProductMainImage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ProductMainImage_id_seq"', 22, true);


--
-- Name: Product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Product_id_seq"', 22, true);


--
-- Name: SubCategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."SubCategory_id_seq"', 1, false);


--
-- Name: BusCategory BusCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BusCategory"
    ADD CONSTRAINT "BusCategory_pkey" PRIMARY KEY (id);


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- Name: CategoryThumbnail CategoryThumbnail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CategoryThumbnail"
    ADD CONSTRAINT "CategoryThumbnail_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Coupon Coupon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupon"
    ADD CONSTRAINT "Coupon_pkey" PRIMARY KEY (id);


--
-- Name: DeliveryAddress DeliveryAddress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DeliveryAddress"
    ADD CONSTRAINT "DeliveryAddress_pkey" PRIMARY KEY (id);


--
-- Name: EventsThumbnail EventsThumbnail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EventsThumbnail"
    ADD CONSTRAINT "EventsThumbnail_pkey" PRIMARY KEY (id);


--
-- Name: Events Events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Events"
    ADD CONSTRAINT "Events_pkey" PRIMARY KEY (id);


--
-- Name: Notice Notice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notice"
    ADD CONSTRAINT "Notice_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: PostThumbnail PostThumbnail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PostThumbnail"
    ADD CONSTRAINT "PostThumbnail_pkey" PRIMARY KEY (id);


--
-- Name: Post Post_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_pkey" PRIMARY KEY (id);


--
-- Name: ProductImage ProductImage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_pkey" PRIMARY KEY (id);


--
-- Name: ProductMainImage ProductMainImage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductMainImage"
    ADD CONSTRAINT "ProductMainImage_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: SubCategory SubCategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SubCategory"
    ADD CONSTRAINT "SubCategory_pkey" PRIMARY KEY (id);


--
-- Name: TemporaryOrder TemporaryOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TemporaryOrder"
    ADD CONSTRAINT "TemporaryOrder_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: CartItem_cartId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CartItem_cartId_idx" ON public."CartItem" USING btree ("cartId");


--
-- Name: CartItem_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CartItem_productId_idx" ON public."CartItem" USING btree ("productId");


--
-- Name: Cart_providerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Cart_providerId_idx" ON public."Cart" USING btree ("providerId");


--
-- Name: Cart_providerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Cart_providerId_key" ON public."Cart" USING btree ("providerId");


--
-- Name: CategoryThumbnail_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CategoryThumbnail_categoryId_idx" ON public."CategoryThumbnail" USING btree ("categoryId");


--
-- Name: CategoryThumbnail_subCategoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "CategoryThumbnail_subCategoryId_idx" ON public."CategoryThumbnail" USING btree ("subCategoryId");


--
-- Name: Category_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Category_id_idx" ON public."Category" USING btree (id);


--
-- Name: Coupon_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Coupon_code_key" ON public."Coupon" USING btree (code);


--
-- Name: Coupon_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Coupon_id_idx" ON public."Coupon" USING btree (id);


--
-- Name: DeliveryAddress_orderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "DeliveryAddress_orderId_key" ON public."DeliveryAddress" USING btree ("orderId");


--
-- Name: Order_paymentKey_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_paymentKey_idx" ON public."Order" USING btree ("paymentKey");


--
-- Name: Order_userId_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Order_userId_id_idx" ON public."Order" USING btree ("userId", id);


--
-- Name: PostThumbnail_postId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "PostThumbnail_postId_idx" ON public."PostThumbnail" USING btree ("postId");


--
-- Name: Post_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Post_id_idx" ON public."Post" USING btree (id);


--
-- Name: ProductImage_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductImage_order_idx" ON public."ProductImage" USING btree ("order");


--
-- Name: ProductImage_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductImage_productId_idx" ON public."ProductImage" USING btree ("productId");


--
-- Name: ProductMainImage_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductMainImage_order_idx" ON public."ProductMainImage" USING btree ("order");


--
-- Name: ProductMainImage_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ProductMainImage_productId_idx" ON public."ProductMainImage" USING btree ("productId");


--
-- Name: Product_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Product_id_idx" ON public."Product" USING btree (id);


--
-- Name: SubCategory_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SubCategory_categoryId_idx" ON public."SubCategory" USING btree ("categoryId");


--
-- Name: TemporaryOrder_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TemporaryOrder_expiresAt_idx" ON public."TemporaryOrder" USING btree ("expiresAt");


--
-- Name: TemporaryOrder_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TemporaryOrder_userId_idx" ON public."TemporaryOrder" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_providerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_providerId_idx" ON public."User" USING btree ("providerId");


--
-- Name: User_providerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_providerId_key" ON public."User" USING btree ("providerId");


--
-- Name: _BusCategoryToPost_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_BusCategoryToPost_AB_unique" ON public."_BusCategoryToPost" USING btree ("A", "B");


--
-- Name: _BusCategoryToPost_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_BusCategoryToPost_B_index" ON public."_BusCategoryToPost" USING btree ("B");


--
-- Name: _CategoryToProduct_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_CategoryToProduct_AB_unique" ON public."_CategoryToProduct" USING btree ("A", "B");


--
-- Name: _CategoryToProduct_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_CategoryToProduct_B_index" ON public."_CategoryToProduct" USING btree ("B");


--
-- Name: _OrderToProduct_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_OrderToProduct_AB_unique" ON public."_OrderToProduct" USING btree ("A", "B");


--
-- Name: _OrderToProduct_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_OrderToProduct_B_index" ON public."_OrderToProduct" USING btree ("B");


--
-- Name: _ProductToSubCategory_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_ProductToSubCategory_AB_unique" ON public."_ProductToSubCategory" USING btree ("A", "B");


--
-- Name: _ProductToSubCategory_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_ProductToSubCategory_B_index" ON public."_ProductToSubCategory" USING btree ("B");


--
-- Name: CartItem CartItem_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CartItem CartItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Cart Cart_providerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES public."User"("providerId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CategoryThumbnail CategoryThumbnail_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CategoryThumbnail"
    ADD CONSTRAINT "CategoryThumbnail_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CategoryThumbnail CategoryThumbnail_subCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CategoryThumbnail"
    ADD CONSTRAINT "CategoryThumbnail_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES public."SubCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DeliveryAddress DeliveryAddress_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DeliveryAddress"
    ADD CONSTRAINT "DeliveryAddress_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EventsThumbnail EventsThumbnail_eventsId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EventsThumbnail"
    ADD CONSTRAINT "EventsThumbnail_eventsId_fkey" FOREIGN KEY ("eventsId") REFERENCES public."Events"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Order Order_couponAppliedId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_couponAppliedId_fkey" FOREIGN KEY ("couponAppliedId") REFERENCES public."Coupon"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PostThumbnail PostThumbnail_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PostThumbnail"
    ADD CONSTRAINT "PostThumbnail_postId_fkey" FOREIGN KEY ("postId") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductImage ProductImage_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductImage"
    ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductMainImage ProductMainImage_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductMainImage"
    ADD CONSTRAINT "ProductMainImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SubCategory SubCategory_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SubCategory"
    ADD CONSTRAINT "SubCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _BusCategoryToPost _BusCategoryToPost_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_BusCategoryToPost"
    ADD CONSTRAINT "_BusCategoryToPost_A_fkey" FOREIGN KEY ("A") REFERENCES public."BusCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _BusCategoryToPost _BusCategoryToPost_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_BusCategoryToPost"
    ADD CONSTRAINT "_BusCategoryToPost_B_fkey" FOREIGN KEY ("B") REFERENCES public."Post"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _CategoryToProduct _CategoryToProduct_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_CategoryToProduct"
    ADD CONSTRAINT "_CategoryToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _CategoryToProduct _CategoryToProduct_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_CategoryToProduct"
    ADD CONSTRAINT "_CategoryToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _OrderToProduct _OrderToProduct_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_OrderToProduct"
    ADD CONSTRAINT "_OrderToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _OrderToProduct _OrderToProduct_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_OrderToProduct"
    ADD CONSTRAINT "_OrderToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProductToSubCategory _ProductToSubCategory_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_ProductToSubCategory"
    ADD CONSTRAINT "_ProductToSubCategory_A_fkey" FOREIGN KEY ("A") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProductToSubCategory _ProductToSubCategory_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_ProductToSubCategory"
    ADD CONSTRAINT "_ProductToSubCategory_B_fkey" FOREIGN KEY ("B") REFERENCES public."SubCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

