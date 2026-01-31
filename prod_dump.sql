--
-- PostgreSQL database dump
--

\restrict hejalofcRXfsbQ5OyfPfc6WxbQZ8ATQTIY6hDlhC9xIEQMrIyInDVRaPZXmULKG

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.addresses (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    street text NOT NULL,
    city text NOT NULL,
    "postalCode" text NOT NULL,
    country text DEFAULT 'Russia'::text NOT NULL,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    logo text,
    website text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "parentId" text,
    image text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "pageContent" text
);


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id text NOT NULL,
    "chatId" text NOT NULL,
    sender text NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_sessions (
    id text NOT NULL,
    "userId" text,
    "userName" text NOT NULL,
    "userEmail" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lastMessage" timestamp(3) without time zone
);


--
-- Name: email_campaign_recipients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaign_recipients (
    id text NOT NULL,
    "campaignId" text NOT NULL,
    "userId" text,
    email text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "errorMessage" text,
    "openedAt" timestamp(3) without time zone,
    "clickedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: email_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaigns (
    id text NOT NULL,
    name text NOT NULL,
    "templateId" text NOT NULL,
    subject text NOT NULL,
    preheader text,
    status text DEFAULT 'draft'::text NOT NULL,
    "scheduledAt" timestamp(3) without time zone,
    "startedAt" timestamp(3) without time zone,
    "finishedAt" timestamp(3) without time zone,
    "statsTotal" integer DEFAULT 0 NOT NULL,
    "statsSent" integer DEFAULT 0 NOT NULL,
    "statsFailed" integer DEFAULT 0 NOT NULL,
    "statsOpened" integer DEFAULT 0 NOT NULL,
    "statsClicked" integer DEFAULT 0 NOT NULL,
    "filterJson" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_templates (
    id text NOT NULL,
    type text NOT NULL,
    name text NOT NULL,
    "subjectDefault" text,
    "designJson" jsonb,
    html text,
    status text DEFAULT 'draft'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: email_unsubscribes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_unsubscribes (
    id text NOT NULL,
    email text NOT NULL,
    "userId" text,
    reason text,
    token text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: filter_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.filter_groups (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: filter_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.filter_options (
    id text NOT NULL,
    "filterGroupId" text NOT NULL,
    name text NOT NULL,
    value text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: newsletter; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter (
    id text NOT NULL,
    email text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "subscribedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "confirmedAt" timestamp(3) without time zone,
    "unsubscribedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    "productName" text NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    "variantInfo" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "userId" text,
    status text DEFAULT 'pending'::text NOT NULL,
    "paymentStatus" text DEFAULT 'pending'::text NOT NULL,
    "paymentMethod" text NOT NULL,
    "deliveryMethod" text DEFAULT 'delivery'::text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    city text,
    "deliveryAddress" text,
    "companyName" text,
    inn text,
    kpp text,
    "companyAddress" text,
    subtotal numeric(10,2) NOT NULL,
    tax numeric(10,2) DEFAULT 0 NOT NULL,
    shipping numeric(10,2) DEFAULT 0 NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "addressId" text,
    "cdekDeliveryCost" numeric(10,2),
    "cdekDeliveryDateMax" timestamp(3) without time zone,
    "cdekDeliveryDateMin" timestamp(3) without time zone,
    "cdekDeliveryType" text,
    "cdekOrderNumber" text,
    "cdekOrderUuid" text,
    "cdekPvzAddress" text,
    "cdekPvzCode" text,
    "cdekStatus" text,
    "cdekStatusUpdatedAt" timestamp(3) without time zone,
    "cdekTariffCode" integer,
    "cdekTariffName" text
);


--
-- Name: pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    content text,
    "metaTitle" text,
    "metaDescription" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_methods (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    commission numeric(5,2) DEFAULT 0 NOT NULL,
    instructions text,
    config jsonb,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_categories (
    id text NOT NULL,
    "productId" text NOT NULL,
    "categoryId" text NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL
);


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id text NOT NULL,
    "productId" text NOT NULL,
    url text NOT NULL,
    alt text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variants (
    id text NOT NULL,
    "productId" text NOT NULL,
    name text NOT NULL,
    value text NOT NULL,
    price numeric(10,2),
    "comparePrice" numeric(10,2),
    stock integer DEFAULT 0 NOT NULL,
    sku text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "shortDescription" text,
    price numeric(10,2) NOT NULL,
    "comparePrice" numeric(10,2),
    sku text,
    volume text,
    gender text,
    "aromaFamily" text,
    ingredients text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    weight numeric(8,2),
    dimensions text,
    "myWarehouseCode" text,
    "manufacturerSku" text,
    "productType" text,
    "aromaDescription" text,
    "topNotes" text,
    purpose text,
    barcode text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "brandId" text NOT NULL,
    "brandCountry" text,
    "manufactureCountry" text,
    "shortName" text,
    "usageInstructions" text,
    "warehouseLocation" text
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    "userId" text,
    "productId" text NOT NULL,
    rating integer NOT NULL,
    title text,
    comment text,
    "isVerified" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isApproved" boolean DEFAULT false NOT NULL,
    "userEmail" text,
    "userName" text
);


--
-- Name: seasonal_discount_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seasonal_discount_categories (
    id text NOT NULL,
    "discountId" text NOT NULL,
    "categoryId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: seasonal_discount_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seasonal_discount_products (
    id text NOT NULL,
    "discountId" text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: seasonal_discounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seasonal_discounts (
    id text NOT NULL,
    name text NOT NULL,
    discount integer NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "applyTo" text DEFAULT 'categories'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    type text DEFAULT 'string'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: task_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_messages (
    id text NOT NULL,
    "taskId" text NOT NULL,
    "userId" text NOT NULL,
    message text,
    "fileUrl" text,
    "fileName" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'new'::text NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    "fileUrl" text,
    "fileName" text,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    phone text,
    password text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "termsAcceptedAt" timestamp(3) without time zone,
    "privacyAcceptedAt" timestamp(3) without time zone,
    "allowedAdminSections" text[] DEFAULT ARRAY[]::text[],
    "marketingConsent" text,
    "marketingConsentAt" timestamp(3) without time zone,
    unsubscribed boolean DEFAULT false NOT NULL
);


--
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlist_items (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
3426e5f4-e10c-4497-bbd6-a16ff0aca484	e6e71f207f77bf025d391ec059f54aba4f5bfa4338e4d83c4b09bebe2a4787d5	2026-01-19 11:30:31.931013+00	20250120000000_add_review_is_approved		\N	2026-01-19 11:30:31.931013+00	0
\.


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.addresses (id, "userId", name, street, city, "postalCode", country, "isDefault", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.brands (id, name, slug, description, logo, website, "isActive", "createdAt", "updatedAt") FROM stdin;
cmh1woioj000311n47flxakul	Tom Ford	tom-ford	Роскошные парфюмы от американского дизайнера	\N	\N	t	2025-10-22 11:24:27.667	2025-10-22 11:24:27.667
cmh1woion000511n4ntzugw9f	Creed	creed	Эксклюзивные парфюмы с 1760 года	\N	\N	t	2025-10-22 11:24:27.667	2025-10-22 11:24:27.667
cmh22xlmb000010e72rvbeytf	Mathilde M	mathilde-m	\N	\N	\N	t	2025-10-22 14:19:29.076	2025-10-22 14:19:29.076
cmh22xlmg000110e7em2b341d	Maison Berger	maison-berger	\N	\N	\N	t	2025-10-22 14:19:29.08	2025-10-22 14:19:29.08
cmh22xlmh000210e7wqdz0nym	Cire Trudon	cire-trudon	\N	\N	\N	t	2025-10-22 14:19:29.081	2025-10-22 14:19:29.081
cmh22xlmi000310e7vl9s5byi	L'Artisan Parfumeur	lartisan-parfumeur	\N	\N	\N	t	2025-10-22 14:19:29.082	2025-10-22 14:19:29.082
cmhz85a6y0000upvs0xrxzdwn	Baci Milano	baci-milano	\N	\N	\N	t	2025-11-14 19:01:49.402	2025-11-14 19:01:49.402
cmhz85a9i002supvs0jigk1bv	Baobab Collection	baobab-collection	\N	\N	\N	t	2025-11-14 19:01:49.494	2025-11-14 19:01:49.494
cmhz85abk005kupvsgxuzfejq	Bougies la francaise	bougies-la-francaise	\N	\N	\N	t	2025-11-14 19:01:49.569	2025-11-14 19:01:49.569
cmhz85abx0062upvssauzds7x	CULTI MILANO	culti-milano	\N	\N	\N	t	2025-11-14 19:01:49.582	2025-11-14 19:01:49.582
cmhz85ach006oupvs06ykeee8	Dr. Vranjes Firenze	dr-vranjes-firenze	\N	\N	\N	t	2025-11-14 19:01:49.601	2025-11-14 19:01:49.601
cmhz85agb00ckupvs6qh095rx	EDG	edg	\N	\N	\N	t	2025-11-14 19:01:49.74	2025-11-14 19:01:49.74
cmhz85agn00d0upvsuqck98o6	ERBAL	erbal	\N	\N	\N	t	2025-11-14 19:01:49.751	2025-11-14 19:01:49.751
cmhz85ahb00e2upvsffia4ngx	Esteban Paris Parfums	esteban-paris-parfums	\N	\N	\N	t	2025-11-14 19:01:49.776	2025-11-14 19:01:49.776
cmhz85ahs00equpvsmrr16anm	Maison Berger Paris	maison-berger-paris	\N	\N	\N	t	2025-11-14 19:01:49.792	2025-11-14 19:01:49.792
cmhz85amo00l4upvswzvm2ep4	Locherber Milano	locherber-milano	\N	\N	\N	t	2025-11-14 19:01:49.968	2025-11-14 19:01:49.968
cmhz85aqw00rcupvsmibx66m8	Lovely Shabby	lovely-shabby	\N	\N	\N	t	2025-11-14 19:01:50.12	2025-11-14 19:01:50.12
cmhz85asv00u0upvs68ugd0dn	Miho Подсвечники	miho-podsvechniki	\N	\N	\N	t	2025-11-14 19:01:50.191	2025-11-14 19:01:50.191
cmhz85atb00uiupvsx7faqx5m	Voluspa	voluspa	\N	\N	\N	t	2025-11-14 19:01:50.207	2025-11-14 19:01:50.207
cmh1woioj000411n42axoml39	Diptyque	diptyque	Французский бренд ароматических свечей и парфюмов	\N	\N	t	2025-10-22 11:24:27.667	2025-10-22 11:24:27.667
cmktvn8gz00cv13y46sqrfavm	Италия	italiya	\N	\N	\N	t	2026-01-25 15:12:08.1	2026-01-25 15:12:08.1
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, slug, description, "parentId", image, "sortOrder", "isActive", "createdAt", "updatedAt", "pageContent") FROM stdin;
cmkzd4n6o023i13y4n9scl9t0	Ванная комната	vannaya-komnata	\N	\N	\N	0	t	2026-01-29 11:20:24.673	2026-01-29 11:20:24.673	\N
cmhz86nv201arupvssqz4z5s0	Ароматы для дома	aromaty-dlya-doma	Создайте неповторимую атмосферу уюта с премиальными свечами, диффузорами и ароматическими композициями	\N	\N	0	t	2025-11-14 19:02:53.774	2026-01-19 14:12:41.818	<p>У каждого из нас свой дом… И исторически так сложилось, что с первого шага, как только мы открываем дверь, мы слышим запах дома, и потом видим обстановку, детали интерьера. Если аромат приятный, нам хочется им дышать, чувствовать его. Мы просыпаемся в хорошем настроении, благодаря аромату, испытываем полное пробуждение или расслабление в ванной комнате, видим атмосферу гостиной и уют на кухне.</p><p>Мы даем Вам верные советы, чтобы аромат звучал в Вашем доме именно так – чувственно и проникновенно, чтобы было приятно всем членам семьи и гостям.</p><p>Выбирайте предметы ароматизации в соответствие с площадью комнат, регулируйте интенсивность аромата, с ним должно быть комфортно.</p><p>AROMA BOUTIQUE IDYLLE выбирает для Вас лучшие марки Франции, Италии, России, Бельгии, Испании, США, Португалии. Мы работаем только с достойными производителями. Качество продукции обеспечивается международными стандартами. Со своей стороны мы дарим лучший сервис.</p>
cmhz86nxa01dpupvs1m9qu9m7	Подарок	podarki	Идеальные подарки для ваших близких - ароматы и товары для дома, которые создадут незабываемые впечатления	\N	\N	0	t	2025-11-14 19:02:53.854	2026-01-19 14:12:57.401	<p>Каждый подарок - это выражение ваших чувств и заботы. Мы предлагаем эксклюзивную коллекцию ароматов и товаров для дома, которые станут незабываемым подарком для ваших близких.</p><p>Премиальные ароматы, элегантная упаковка и внимание к деталям - все для того, чтобы ваш подарок вызвал восторг и надолго запомнился.</p>
cmhz86nuh01amupvskf050k57	Уют и интерьер	uyut-i-interer	Создайте неповторимую атмосферу уюта с премиальными товарами для интерьера	\N	\N	0	t	2025-11-14 19:02:53.753	2026-01-19 14:13:10.571	<p>Создайте уютную и стильную атмосферу в вашем доме с помощью премиальных товаров для интерьера. Каждый элемент продуман до мелочей, чтобы добавить тепла и гармонии в ваше пространство.</p><p>Мы предлагаем широкий выбор товаров для создания идеального интерьера, которые подчеркнут ваш уникальный стиль и создадут атмосферу комфорта.</p>
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_messages (id, "chatId", sender, message, "isRead", "createdAt") FROM stdin;
cmkk90nyh0003dx8tfoujko5q	cmkk90k9b0001dx8tc25rsrwq	user	привет! 	t	2026-01-18 21:28:47.945
cmkk90tu90005dx8t0jfz4iqz	cmkk90k9b0001dx8tc25rsrwq	admin	добрый день	f	2026-01-18 21:28:55.569
\.


--
-- Data for Name: chat_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_sessions (id, "userId", "userName", "userEmail", "isActive", "createdAt", "updatedAt", "lastMessage") FROM stdin;
cmkk90k9b0001dx8tc25rsrwq	\N	Дима	test@test.co	t	2026-01-18 21:28:43.152	2026-01-18 21:28:55.571	2026-01-18 21:28:55.571
\.


--
-- Data for Name: email_campaign_recipients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_campaign_recipients (id, "campaignId", "userId", email, status, "errorMessage", "openedAt", "clickedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: email_campaigns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_campaigns (id, name, "templateId", subject, preheader, status, "scheduledAt", "startedAt", "finishedAt", "statsTotal", "statsSent", "statsFailed", "statsOpened", "statsClicked", "filterJson", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_templates (id, type, name, "subjectDefault", "designJson", html, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: email_unsubscribes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_unsubscribes (id, email, "userId", reason, token, "createdAt") FROM stdin;
\.


--
-- Data for Name: filter_groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.filter_groups (id, name, type, "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
brand-filter	Бренд	checkbox	t	1	2025-10-22 11:25:12.358	2025-10-22 11:25:12.358
gender-filter	Пол	checkbox	t	3	2025-10-22 11:25:12.358	2025-10-22 11:25:12.358
family-filter	Ароматическая семья	checkbox	t	2	2025-10-22 11:25:12.358	2025-10-22 11:25:12.358
\.


--
-- Data for Name: filter_options; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.filter_options (id, "filterGroupId", name, value, "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
cmh1wph5y000lz6z0ju6uqbdu	brand-filter	Diptyque	diptyque	1	t	2025-10-22 11:25:12.358	2025-10-22 11:25:12.358
cmh1wph5y000nz6z04pp8siqs	brand-filter	Tom Ford	tom-ford	2	t	2025-10-22 11:25:12.358	2025-10-22 11:25:12.358
cmh1wph5y000pz6z0wx51tlqm	brand-filter	Creed	creed	3	t	2025-10-22 11:25:12.358	2025-10-22 11:25:12.358
cmh1wph5y000mz6z0f9vhudr6	family-filter	Woody	woody	1	t	2025-10-22 11:25:12.358	2025-10-22 11:25:12.358
cmh1wph5y000oz6z02o9tihiy	family-filter	Oriental	oriental	2	t	2025-10-22 11:25:12.358	2025-10-22 11:25:12.358
cmh1wph5y000qz6z02s7vgjw1	family-filter	Fruity	fruity	3	t	2025-10-22 11:25:12.358	2025-10-22 11:25:12.358
cmh1wph5y000rz6z0e9vbr3a9	gender-filter	Мужской	men	1	t	2025-10-22 11:25:12.358	2025-10-22 11:25:12.358
cmh1wph5y000sz6z0nsljk6qw	gender-filter	Женский	women	2	t	2025-10-22 11:25:12.358	2025-10-22 11:25:12.358
cmh1wph5y000tz6z08dn5curl	gender-filter	Унисекс	unisex	3	t	2025-10-22 11:25:12.358	2025-10-22 11:25:12.358
\.


--
-- Data for Name: newsletter; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.newsletter (id, email, "isActive", "subscribedAt", "confirmedAt", "unsubscribedAt", "createdAt", "updatedAt") FROM stdin;
cmk9ycywd0000k62ipi6exed9	ognew.d@gmail.com	t	2026-01-11 16:32:44.46	\N	\N	2026-01-11 16:32:44.461	2026-01-11 16:32:44.461
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, "orderId", "productId", "productName", quantity, price, "variantInfo", "createdAt") FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, "orderNumber", "userId", status, "paymentStatus", "paymentMethod", "deliveryMethod", "firstName", "lastName", email, phone, city, "deliveryAddress", "companyName", inn, kpp, "companyAddress", subtotal, tax, shipping, discount, total, notes, "createdAt", "updatedAt", "addressId", "cdekDeliveryCost", "cdekDeliveryDateMax", "cdekDeliveryDateMin", "cdekDeliveryType", "cdekOrderNumber", "cdekOrderUuid", "cdekPvzAddress", "cdekPvzCode", "cdekStatus", "cdekStatusUpdatedAt", "cdekTariffCode", "cdekTariffName") FROM stdin;
cmh7se95o0001aqkhz56gpgt7	idy1	cmh7qsx9y0000131895gf5r13	pending	pending	card	delivery	Дмитрий	Огнев	ognew.d@gmail.com	+79210914280	Санкт-Петербург	Тельмана 40	\N	\N	\N	\N	11938.00	0.00	0.00	0.00	11938.00	\N	2025-10-26 14:11:07.356	2025-10-26 14:11:07.356	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmh7sjtot0007aqkhgxjy66vn	idy2	cmh7qsx9y0000131895gf5r13	pending	pending	card	delivery	Дмитрий	Огнев	ognew.d@gmail.com	+79210914280	Санкт-Петербург	Тельмана 40	\N	\N	\N	\N	2626.00	0.00	500.00	0.00	3126.00	\N	2025-10-26 14:15:27.245	2025-10-26 14:15:27.245	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmh7skw36000baqkhc0o2xki7	idy3	cmh7qsx9y0000131895gf5r13	confirmed	paid	card	delivery	Дмитрий	Огнев	ognew.d@gmail.com	+79210914280	Санкт-Петербург	тельмана 40	\N	\N	\N	\N	2626.00	0.00	500.00	0.00	3126.00		2025-10-26 14:16:17.011	2025-11-16 12:10:06.133	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmkisav8o0001hq2qzgf79ci2	idy4	\N	pending	pending	pickup	pickup	Дмитрий		ognewd@gmail.com	+7 (921) 091-42-80	Санкт-Петербург	\N	\N	\N	\N	\N	3790.00	0.00	0.00	0.00	3790.00	\N	2026-01-17 20:53:04.296	2026-01-17 20:53:04.296	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmkkyraen000jdx8terksnvbv	idy5	\N	pending	pending	invoice	cdek	Дмитрий	Огнев	ognew.d@gmail.com	+7 (921) 091-42-80	Москва	тест, д. тест	тест	232424		тест	3790.00	0.00	0.00	0.00	3790.00	\N	2026-01-19 09:29:20.495	2026-01-19 09:29:20.495	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
cmkl98fbg0001c2vv0hd4ux5w	idy6	cmh1woio4000011n4qsje0699	pending	pending	invoice	cdek	Юлия	Юлия	idylle.spb@gmail.com	+7 (921) 789-27-77	Санкт-Петербург	\N	бур	7814329051		ул. 10-я Советская, 1-3, лит. А, пом6-Н	42290.00	0.00	0.00	0.00	42290.00	\N	2026-01-19 14:22:36.173	2026-01-19 14:22:36.173	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pages (id, slug, title, content, "metaTitle", "metaDescription", "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmk9xpkkq0003bb4rtlnv4msf	privacy	Политика конфиденциальности	<h2>1. Общие положения</h2><p>Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей интернет-магазина <span style="color: rgb(2, 8, 23);">AROMA BOUTIQUE IDYLLE </span>(далее — «Магазин»), расположенного по адресу aromarussia.ru.</p><p>Использование Магазина означает безоговорочное согласие пользователя с настоящей Политикой конфиденциальности и указанными в ней условиями обработки его персональной информации.</p><h2>2. Собираемая информация</h2><p>При регистрации и оформлении заказа мы собираем следующую информацию:</p><ul><li>ФИО, адрес электронной почты, номер телефона</li><li>Адрес доставки и платежная информация</li><li>История покупок и предпочтения</li><li>Технические данные (IP-адрес, тип браузера, устройство)</li></ul><h2>3. Использование информации</h2><p>Собранная информация используется для:</p><ul><li>Обработки и выполнения заказов</li><li>Связи с клиентами по вопросам заказов</li><li>Улучшения качества обслуживания</li><li>Отправки информационных сообщений (с согласия пользователя)</li></ul>	Политика конфиденциальности - AROMA BOUTIQUE IDYLLE	Политика конфиденциальности AROMA BOUTIQUE IDYLLE. Как мы собираем, используем и защищаем ваши персональные данные.	t	4	2026-01-11 16:14:32.81	2026-01-19 14:03:25.493
cmk9xpkkk0001bb4r55bjffnd	delivery	Доставка и оплата	<h2>Способы доставки</h2><h3>🚚 Курьерская доставка по СПб</h3><ul><li>Доставка в день заказа (при заказе до 14:00)</li><li>Стоимость: от 300 ₽</li><li>Время доставки: 2-4 часа</li><li>Возможность оплаты при получении</li></ul><h3>📦 Самовывоз из бутика</h3><ul><li>Бесплатно</li><li>Адрес: Невский проспект, 114-116</li><li>Время работы: Пн-Вс 10:00-23:00</li><li>Возможность лично почувствовать и выбрать свой аромат.</li></ul><h3>🌍 Доставка по России</h3><ul><li>СДЭК, Почта России</li><li>Стоимость: от 400 ₽</li><li>Срок доставки: 3-7 дней</li><li>Отслеживание посылки</li></ul><h2>Способы оплаты</h2><h3>💳 Банковская карта</h3><ul><li>Visa, MasterCard, МИР</li><li>Безопасная оплата онлайн</li><li>Мгновенное подтверждение</li><li>Возврат в течение 14 дней</li></ul>	Доставка и оплата - Idylle	Условия доставки и оплаты в AROMA BOUTIQUE IDYLLE. Быстрая доставка по Санкт-Петербургу и всей России.	t	2	2026-01-11 16:14:32.805	2026-01-19 13:53:38.36
cmk9xpkkn0002bb4rywtjxogz	contacts	Контакты	<h2>Наши контакты</h2><p><strong>Телефон:</strong> 8-800-500-87-29</p><p>Пн-Вс: 10:00 - 23:00</p><p><strong>Email:</strong> info@idylle.spb.ru</p><p>Ответим в течение часа</p><p><strong>Адрес:</strong></p><p>Санкт-Петербург, Невский проспект, 114-116</p><p>Станция метро: Площадь Восстания</p><p><strong>Время работы:</strong> Пн-Вс: 10:00 - 22:00 (Без выходных)</p>	Контакты - AROMA BOUTIQUE IDYLLE	Свяжитесь с нами. Контакты AROMA BOUTIQUE IDYLLE в Санкт-Петербурге. Телефон, адрес, время работы.	t	3	2026-01-11 16:14:32.808	2026-01-19 14:01:38.778
cmk9xpkkh0000bb4r0lkh97e0	about	О нас	<h2>Наша история</h2><p>AROMA BOUTIQUE IDYLLE — это уникальное пространство, где встречаются изысканность и комфорт. Мы специализируемся на эксклюзивных ароматах и товарах для дома от ведущих мировых брендов.</p><p>Наша миссия — помочь вам создать неповторимую атмосферу в вашем доме, где каждый аромат рассказывает свою историю, а каждый предмет несет в себе частичку роскоши.</p><h3>Наши ценности</h3><ul><li>Качество и подлинность каждого продукта</li><li>Индивидуальный подход к каждому клиенту</li><li>Создание уникальной атмосферы</li><li>Стремление к совершенству</li></ul>	О нас - AROMA BOUTIQUE IDYLLE	Узнайте больше о AROMA BOUTIQUE IDYLLE - эксклюзивные ароматы и товары для дома от ведущих мировых брендов.	t	1	2026-01-11 16:14:32.801	2026-01-19 14:02:55.835
cmk9xpkks0004bb4r0rw9qfqx	terms	Условия использования	<h2>1. Общие положения</h2><p>Настоящие Условия использования регулируют отношения между интернет-магазином <span style="color: rgb(2, 8, 23);">AROMA BOUTIQUE IDYLLE</span> (далее — «Магазин») и пользователями сайта aromarussia.ru (далее — «Пользователи»).</p><p>Используя сайт Магазина, Пользователь соглашается с настоящими Условиями использования.</p><h2>2. Регистрация и оформление заказа</h2><p>Для оформления заказа Пользователь должен:</p><ul><li>Предоставить достоверные персональные данные</li><li>Указать корректный адрес доставки и контактную информацию</li><li>Выбрать способ оплаты и доставки</li><li>Подтвердить заказ</li></ul><h2>3. Оплата и доставка</h2><p>Оплата заказа производится в соответствии с выбранным способом оплаты. Доставка осуществляется в соответствии с условиями доставки, указанными на сайте.</p>	Условия использования - AROMA BOUTIQUE IDYLLE	Условия использования интернет-магазина AROMA BOUTIQUE IDYLLE. Правила размещения заказов, оплаты и доставки.	t	5	2026-01-11 16:14:32.813	2026-01-19 14:03:46.211
cmk9xpkkv0005bb4r03q1j737	cookies	Политика cookies	<h2>1. Что такое cookies</h2><p>Cookies — это небольшие текстовые файлы, которые сохраняются на вашем устройстве при посещении веб-сайта. Они помогают сайту запомнить ваши предпочтения и улучшить работу сайта.</p><h2>2. Как мы используем cookies</h2><p>Мы используем cookies для следующих целей:</p><ul><li>Сохранения информации о корзине покупок</li><li>Запоминания ваших предпочтений и настроек</li><li>Улучшения работы сайта и пользовательского опыта</li><li>Анализа использования сайта для его улучшения</li><li>Обеспечения безопасности и предотвращения мошенничества</li></ul><h2>3. Типы используемых cookies</h2><p>Мы используем следующие типы cookies:</p><ul><li><strong>Обязательные cookies</strong> — необходимы для работы сайта</li><li><strong>Функциональные cookies</strong> — улучшают функциональность сайта</li><li><strong>Аналитические cookies</strong> — помогают анализировать использование сайта</li><li><strong>Маркетинговые cookies</strong> — используются для персонализации контента</li></ul>	Политика cookies - AROMA BOUTIQUE IDYLLE	Политика использования файлов cookie в интернет-магазине AROMA BOUTIQUE IDYLLE. Как мы используем cookies для улучшения работы сайта.	t	6	2026-01-11 16:14:32.815	2026-01-19 14:04:06.116
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_methods (id, name, type, "isActive", commission, instructions, config, "sortOrder", "createdAt", "updatedAt") FROM stdin;
cash-delivery	Наличные при доставке	cash_delivery	t	0.00	\N	\N	3	2025-10-22 11:25:12.364	2025-10-22 11:25:12.364
card-payment	Банковская карта	card	t	0.00	\N	\N	1	2025-10-22 11:25:12.364	2025-10-22 11:25:12.364
bank-transfer	Банковский перевод	bank_transfer	t	0.00	Реквизиты для оплаты будут отправлены на email после оформления заказа	\N	2	2025-10-22 11:25:12.364	2025-10-22 11:25:12.364
\.


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_categories (id, "productId", "categoryId", "isPrimary") FROM stdin;
cmktwawig01qv13y46ukk0hda	cmktvwzpx018713y406yny8qv	cmhz86nv201arupvssqz4z5s0	t
cmktwawrk01qz13y4d00zw69j	cmktvwzxy018d13y4zt1637b8	cmhz86nv201arupvssqz4z5s0	t
cmktwawtk01r313y4k2jwgg1r	cmktvwzzy018j13y4d8xukb3a	cmhz86nv201arupvssqz4z5s0	t
cmktwawvg01r713y4nf9vzyid	cmktvx01n018p13y4cr92jgg1	cmhz86nv201arupvssqz4z5s0	t
cmktwawxb01rb13y44iqa1tf8	cmktvx03b018v13y4xfx5q6ti	cmhz86nv201arupvssqz4z5s0	t
cmktwawzf01rf13y4foni1qqs	cmktvx052019113y4f22d3erz	cmhz86nv201arupvssqz4z5s0	t
cmktwax1b01rj13y4vw5gpxgg	cmktvx06q019713y4fg2teecu	cmhz86nv201arupvssqz4z5s0	t
cmktwax3901rn13y4z8pcgmdy	cmktvx08h019d13y4sqlp95a8	cmhz86nv201arupvssqz4z5s0	t
cmktwax5e01rr13y48uingqox	cmktvx0a6019j13y4w3w6bfj7	cmhz86nv201arupvssqz4z5s0	t
cmktwax7801rv13y4vcqislfi	cmktvx0cp019p13y4579q45xt	cmhz86nv201arupvssqz4z5s0	t
cmktwax9001rz13y4zbq15ync	cmktvx0ee019v13y4yqz2x39g	cmhz86nv201arupvssqz4z5s0	t
cmktwaxar01s313y4qrlhrdcq	cmktvx0g201a113y4seq7sv7y	cmhz86nv201arupvssqz4z5s0	t
cmktwaxci01s713y4gch4pk7u	cmktvx0hq01a713y4l8mmxhd6	cmhz86nv201arupvssqz4z5s0	t
cmktwaxea01sb13y4ws0pqe87	cmktvx0jg01ad13y44wha9e09	cmhz86nv201arupvssqz4z5s0	t
cmktwaxg001sf13y4hzam62wu	cmktvx0ld01aj13y4lzmunsl4	cmhz86nv201arupvssqz4z5s0	t
cmktwaxm301sn13y46gqr4u5c	cmktvx0qa01at13y4zw31c5lz	cmhz86nv201arupvssqz4z5s0	t
cmktwaxrc01sv13y4inlhfvz2	cmktvx0v401b313y4x0ainhcr	cmhz86nv201arupvssqz4z5s0	t
cmktwaxsz01sz13y4tk222q3k	cmktvx0wt01b913y4s0fdhwrn	cmhz86nv201arupvssqz4z5s0	t
cmktwaxux01t313y4gec1uf18	cmktvx0yf01bf13y4qmqb9txs	cmhz86nv201arupvssqz4z5s0	t
cmktwaxwl01t713y4ddnbb444	cmktvx10101bl13y4xjvywoe2	cmhz86nv201arupvssqz4z5s0	t
cmktwaxyc01tb13y49n8jw0m4	cmktvx11n01br13y4h79m6e71	cmhz86nv201arupvssqz4z5s0	t
cmktway0101tf13y4wv44ex4o	cmktvx13b01bx13y4bvco4f00	cmhz86nv201arupvssqz4z5s0	t
cmktway1w01tj13y4n0lwzomt	cmktvx14z01c313y4dxflp02p	cmhz86nv201arupvssqz4z5s0	t
cmktway4c01tn13y47z4jmpoh	cmktvx17201c913y4g7p2qu6j	cmhz86nv201arupvssqz4z5s0	t
cmktway6201tr13y4nj0eks4m	cmktvx19001cf13y4k4qiz12z	cmhz86nv201arupvssqz4z5s0	t
cmktway7u01tv13y4kupaa7xb	cmktvx1an01cl13y4gwdrdqav	cmhz86nv201arupvssqz4z5s0	t
cmktway9i01tz13y4s1oxlzik	cmktvx1cc01cr13y4rhfw10sr	cmhz86nv201arupvssqz4z5s0	t
cmktwayb701u313y4qflrrx2h	cmktvx1dx01cx13y4z9ii3vn9	cmhz86nv201arupvssqz4z5s0	t
cmktwaycz01u713y4heut9j56	cmktvx1fl01d313y419puvafs	cmhz86nv201arupvssqz4z5s0	t
cmktwaylc01uh13y4acj0gpou	cmktvx1li01df13y4d1pxdagn	cmhz86nv201arupvssqz4z5s0	t
cmktwaynf01ul13y4z34gf4qa	cmktvx1n601dl13y449e09e6a	cmhz86nv201arupvssqz4z5s0	t
cmktwayp701up13y49jme2tkl	cmktvx1ou01dr13y4qxm4x84f	cmhz86nv201arupvssqz4z5s0	t
cmktwayxh01ut13y4xtdu4mok	cmktvx1um01dx13y4g4vbt3ai	cmhz86nv201arupvssqz4z5s0	t
cmktwayzj01ux13y434hsrtj3	cmktvx1w601e313y4h85xfwt9	cmhz86nv201arupvssqz4z5s0	t
cmktwaz1k01v113y4h2e96c0a	cmktvx1xq01e913y4pve5m281	cmhz86nv201arupvssqz4z5s0	t
cmktwaz3b01v513y47zj04day	cmktvx1zf01ef13y4g5cjjmrv	cmhz86nv201arupvssqz4z5s0	t
cmktwaz5301v913y4nhyxti74	cmktvx21201el13y44807lbmx	cmhz86nv201arupvssqz4z5s0	t
cmktwaz6z01vd13y4184gv6sx	cmktvx22o01er13y4oq1bm235	cmhz86nv201arupvssqz4z5s0	t
cmktwaz8v01vh13y4yekwmnkk	cmktvx24j01ex13y4012dlxf3	cmhz86nv201arupvssqz4z5s0	t
cmktwazas01vl13y4jpsyvjw4	cmktvx26801f313y460yo8b9v	cmhz86nv201arupvssqz4z5s0	t
cmktwazcs01vp13y47ks9nqra	cmktvx27y01f913y4gqtbc5ah	cmhz86nv201arupvssqz4z5s0	t
cmktwazer01vt13y4wltw8y13	cmktvx29p01ff13y4za0vfq5l	cmhz86nv201arupvssqz4z5s0	t
cmktwazgk01vx13y4y9og1gxu	cmktvx2be01fl13y4rstrxo5l	cmhz86nv201arupvssqz4z5s0	t
cmktwazjh01w113y4u5b6ngxi	cmktvx2e301fr13y4pgoj9l51	cmhz86nv201arupvssqz4z5s0	t
cmktwazq401w913y4or284ya6	cmktvx2j301g113y47xien3d5	cmhz86nv201arupvssqz4z5s0	t
cmktwazt401wd13y4medz1rls	cmktvx2lv01g713y4sxnp1uyu	cmhz86nv201arupvssqz4z5s0	t
cmktwazv201wh13y410yfvg94	cmktvx2o701gd13y4zujnpl6b	cmhz86nv201arupvssqz4z5s0	t
cmktwazwz01wl13y4mced7fr5	cmktvx2q901gj13y4jbnumicw	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwazyl01wp13y4pm1e1yzm	cmktvx2rt01gp13y4vkbpubtg	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb00501wt13y4okiijare	cmktvx2tk01gv13y43u31pu7w	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb00s01wx13y4sm5y05al	cmktvx2ua01h113y4mv1uhzt5	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb02j01x113y4g359b54v	cmktvx2wb01h713y4ydvmjytm	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb04801x513y4p7yiccny	cmktvx2yq01hd13y4p9pkmd74	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb05w01x913y4ekhd6l52	cmktvx30e01hj13y4w8joq6k3	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb06e01xd13y4fc6tpfdm	cmktvx31101hp13y4v70kxzfw	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb09x01xh13y4nngpwqte	cmktvx33m01hv13y4zpbfighv	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb0ef01xl13y4u5em37cs	cmktvx37z01i113y4ih1yb2gd	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb0f401xp13y4nt0ece9h	cmktvx38l01i713y4udbad3ih	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb0hk01xt13y4hcxyqwaw	cmktvx3a501id13y4fnu3vjsp	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb0i301xx13y4ze57iyr7	cmktvx3aq01ij13y4p205utkj	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb0jp01y113y4dp0asxw8	cmktvx3c801ip13y40f6x9r9n	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb0la01y513y43e7zir7k	cmktvx3dy01iv13y4zxb4u45i	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb0q601y913y4w6l1admn	cmktvx3hj01j113y4ga2i20dc	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb0t801yd13y46m5yirn9	cmktvx3k101j713y40z2lwle4	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb0uy01yh13y4dshsa239	cmktvx3lk01jd13y4shunzufr	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb0wx01yl13y4pbv3ndmo	cmktvx3ni01jj13y4emcmx2j0	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb0xi01yp13y4operfxhy	cmktvx3o801jp13y425kly5yu	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb0xy01yt13y4xhrp5evm	cmktvx3or01jv13y4pol0b4ly	cmhz86nxa01dpupvs1m9qu9m7	t
cmktwb11b01yx13y4yrhtgkly	cmktvx3rk01k113y4hwhrfc42	cmhz86nv201arupvssqz4z5s0	t
cmktwb12v01z113y4hdf4cv3v	cmktvx3t001k713y4kj4pu5t8	cmhz86nv201arupvssqz4z5s0	t
cmktwb15601z513y4y3j3ls3k	cmktvx3ug01kd13y41zve350l	cmhz86nv201arupvssqz4z5s0	t
cmktwb16u01z913y479pp9g3j	cmktvx3wo01kj13y42nekvqwf	cmhz86nv201arupvssqz4z5s0	t
cmktwb18h01zd13y4zh4d36xd	cmktvx3y901kp13y4ycxc4anw	cmhz86nv201arupvssqz4z5s0	t
cmktwb1a301zh13y4g3vf7u25	cmktvx3zp01kv13y4dz8q0b59	cmhz86nv201arupvssqz4z5s0	t
cmktwb1au01zl13y4l5iux6he	cmktvx41501l113y4rok3go9x	cmhz86nv201arupvssqz4z5s0	t
cmktwb1d201zp13y4ztrerjq8	cmktvx42m01l713y463ozy24r	cmhz86nv201arupvssqz4z5s0	t
cmktwb1es01zt13y4bhwwa1bp	cmktvx44701ld13y433frioeg	cmhz86nv201arupvssqz4z5s0	t
cmktwb1gf01zx13y442vxd5qm	cmktvx45o01lj13y43guzxcuj	cmhz86nv201arupvssqz4z5s0	t
cmktwb1i9020113y4xl80hfva	cmktvx47c01lp13y41zlebhlk	cmhz86nv201arupvssqz4z5s0	t
cmktwb1js020513y49a3g6df7	cmktvx48s01lv13y40djqe7ga	cmhz86nv201arupvssqz4z5s0	t
cmktwb1le020913y4nogzgdta	cmktvx4ab01m113y4v75ddjip	cmhz86nv201arupvssqz4z5s0	t
cmktwb1m3020d13y44iqt4p8t	cmktvx4b801m713y4caqnjglv	cmhz86nv201arupvssqz4z5s0	t
cmktwb1ns020h13y4m5ucmouc	cmktvx4co01md13y41k9s3g90	cmhz86nv201arupvssqz4z5s0	t
cmktwb1pe020l13y40qrs34rp	cmktvx4eo01mj13y487i8eulw	cmhz86nv201arupvssqz4z5s0	t
cmktwb1qz020p13y4vjkllo2d	cmktvx4g701mp13y4urjxjz87	cmhz86nv201arupvssqz4z5s0	t
cmktwb1sh020t13y442tk5agp	cmktvx4ht01mv13y4uw9zn4ko	cmhz86nv201arupvssqz4z5s0	t
cmktwb1st020x13y4egre4dd7	cmktvx4i501n113y409osgnqf	cmhz86nv201arupvssqz4z5s0	t
cmktwb1uc021113y41g3pfdnj	cmktvx4mp01n713y4zublibm0	cmhz86nv201arupvssqz4z5s0	t
cmktwb1w6021513y4rrabfu1m	cmktvx4o801nd13y462268b3w	cmhz86nv201arupvssqz4z5s0	t
cmktwb1xx021913y4fiu3s3jj	cmktvx4pu01nj13y48s98fa89	cmhz86nv201arupvssqz4z5s0	t
cmktwb1zm021d13y4sd3wmi5y	cmktvx4rx01np13y41i54m6bd	cmhz86nv201arupvssqz4z5s0	t
cmktwb214021h13y4l7aq2imy	cmktvx4te01nv13y4138p4eek	cmhz86nv201arupvssqz4z5s0	t
cmktwb22o021l13y456dfswst	cmktvx4uv01o113y4lkpgpjuv	cmhz86nv201arupvssqz4z5s0	t
cmktwb24d021p13y4jx74exsq	cmktvx4wc01o713y4pzkstv1u	cmhz86nv201arupvssqz4z5s0	t
cmktwb265021t13y44lgadqva	cmktvx4z701od13y4db8rydak	cmhz86nv201arupvssqz4z5s0	t
cmktwb27r021x13y4wx6qr3i7	cmktvx50p01oj13y4azse9h7c	cmhz86nv201arupvssqz4z5s0	t
cmktwb29d022113y48siefz37	cmktvx52j01op13y4m9rwujmp	cmhz86nv201arupvssqz4z5s0	t
cmktwb2ax022513y4wt00g7iu	cmktvx54001ov13y4vxnomd9k	cmhz86nv201arupvssqz4z5s0	t
cmktwb2ce022913y49odf4a87	cmktvx55g01p113y4m38f1rx6	cmhz86nv201arupvssqz4z5s0	t
cmktwb2e6022d13y4vh067my1	cmktvx56p01p713y4ccuwt7uu	cmhz86nv201arupvssqz4z5s0	t
cmktwb2fq022h13y46qzjapmr	cmktvx58701pd13y4g8fxo6fd	cmhz86nv201arupvssqz4z5s0	t
cmktwb2h8022l13y4tzngs9dl	cmktvx59p01pj13y4j310ycpo	cmhz86nv201arupvssqz4z5s0	t
cmktwb2iu022p13y495zgugnx	cmktvx5bq01pp13y4v7ab5c7f	cmhz86nv201arupvssqz4z5s0	t
cmktwb2kb022t13y4sctbplxp	cmktvx5d501pv13y4zu2l7jni	cmhz86nv201arupvssqz4z5s0	t
cmktwb2lw022x13y4lh3u9nx2	cmktvx5em01q113y48p6ds7di	cmhz86nv201arupvssqz4z5s0	t
cmktwb2ng023113y4ad50iq85	cmktvx5g401q713y4j5ldt4xy	cmhz86nv201arupvssqz4z5s0	t
cmktwb2pw023513y45iebbadj	cmktvx5hk01qd13y4go7nfls5	cmhz86nv201arupvssqz4z5s0	t
cmktwb2s3023913y4vazmi36d	cmktvx5j301qj13y4px7dfwdv	cmhz86nv201arupvssqz4z5s0	t
cmktwb2tk023d13y40ef3e75x	cmktvx5kk01qp13y4yrino100	cmhz86nv201arupvssqz4z5s0	t
\.


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_images (id, "productId", url, alt, "sortOrder", "isPrimary", "createdAt") FROM stdin;
cmktvwzzu018h13y4ekygaz2y	cmktvwzxy018d13y4zt1637b8	/uploads/products/1769354383673-h7ah3igig5t.png	Ароматический диффузор Albero di Natale (Рождественская ель) 500 мл, арт. FRV0018D	0	f	2026-01-25 15:19:43.674
cmktvx01k018n13y4507gyrdv	cmktvwzzy018j13y4d8xukb3a	/uploads/products/1769354383735-7tutu1gaqf7.png	Ароматический диффузор Albero di Natale (Рождественская ель) 250 мл, арт. FRV0018C	0	f	2026-01-25 15:19:43.736
cmktvx038018t13y4qjhkkw1k	cmktvx01n018p13y4cr92jgg1	/uploads/products/1769354383795-qm1l6s6h8a.png	Ароматический диффузор Ambra (амбра) 250 мл, арт. FRV0012C	0	f	2026-01-25 15:19:43.796
cmktvx04z018z13y4p9zmk735	cmktvx03b018v13y4xfx5q6ti	/uploads/products/1769354383858-80q1rxf8duo.png	Ароматический диффузор Ambra (амбра) 500 мл, арт. FRV0012D	0	f	2026-01-25 15:19:43.859
cmktvx06n019513y4orwfv311	cmktvx052019113y4f22d3erz	/uploads/products/1769354383919-tgahxarjx7.png	Ароматический диффузор Arancio Cannella (Апельсин и корица) 250 мл, арт. FRV0010C	0	f	2026-01-25 15:19:43.92
cmktvx08d019b13y4zzn6jkun	cmktvx06q019713y4fg2teecu	/uploads/products/1769354383980-xyot25bjpw.png	Ароматический диффузор Arancio Cannella (Апельсин и корица) 500 мл, арт. FRV0010D	0	f	2026-01-25 15:19:43.981
cmktvx0a3019h13y4pvb22ct3	cmktvx08h019d13y4sqlp95a8	/uploads/products/1769354384042-fluc4emdwyk.png	Ароматический диффузор Arancio Uva Rossa (Апельсин и красный виноград) 250 мл, арт. FRV0019C	0	f	2026-01-25 15:19:44.043
cmktvx0cm019n13y4b9smwfni	cmktvx0a6019j13y4w3w6bfj7	/uploads/products/1769354384133-ywu7mz5n6ic.png	Ароматический диффузор Arancio Uva Rossa (Апельсин и виноград) 500 мл, арт. FRV0019D	0	f	2026-01-25 15:19:44.134
cmktvx0eb019t13y46hoad3wu	cmktvx0cp019p13y4579q45xt	/uploads/products/1769354384194-9hz88vb2du.png	Ароматический диффузор Bellini (Беллини) 250 мл, арт. FRV0059C	0	f	2026-01-25 15:19:44.196
cmktvx0fz019z13y4ntfwy0ke	cmktvx0ee019v13y4yqz2x39g	/uploads/products/1769354384254-2ytjogmygcv.png	Ароматический диффузор Bellini (Беллини) 500 мл, арт. FRV0059D	0	f	2026-01-25 15:19:44.256
cmktvx0hn01a513y4iugqx77e	cmktvx0g201a113y4seq7sv7y	/uploads/products/1769354384315-231od77u3tk.png	Ароматический диффузор Fuoco (Огонь) 250 мл, арт. FRV0003C	0	f	2026-01-25 15:19:44.316
cmktvx0jd01ab13y45yt4280r	cmktvx0hq01a713y4l8mmxhd6	/uploads/products/1769354384376-6tavss74if8.png	Ароматический диффузор Giglio di Firenze (Лилия Флоренции) 250 мл, арт. FRV0068C	0	f	2026-01-25 15:19:44.377
cmktvx0la01ah13y4xpn3c0xk	cmktvx0jg01ad13y44wha9e09	/uploads/products/1769354384445-lflhsn5vbl.png	Ароматический диффузор Giglio di Firenze (Лилия Флоренции) 500 мл, арт. FRV0068D	0	f	2026-01-25 15:19:44.446
cmktvx0mz01an13y4ck29cz3h	cmktvx0ld01aj13y4lzmunsl4	/uploads/products/1769354384506-obtb08447x.png	Ароматический диффузор Ginger Lime (Имбирь и лайм) 250 мл, арт. FRV0014C	0	f	2026-01-25 15:19:44.508
cmktvx0rv01ax13y4jqg2lby5	cmktvx0qa01at13y4zw31c5lz	/uploads/products/1769354384682-iujgixpe6cd.png	Ароматический диффузор Ginger Lime (Имбирь и лайм) 500 мл, арт. FRV0014D	0	f	2026-01-25 15:19:44.684
cmktvx0tg01az13y4ae69ywzz	cmktvx0qa01at13y4zw31c5lz	/uploads/products/1769354384739-96krhujhg5r.png	Ароматический диффузор Ginger Lime (Имбирь и лайм) 500 мл, арт. FRV0014D — фото 1	1	f	2026-01-25 15:19:44.741
cmktvx0v201b113y4c3sp6s1x	cmktvx0qa01at13y4zw31c5lz	/uploads/products/1769354384797-q8a2dmmpx4.png	Ароматический диффузор Ginger Lime (Имбирь и лайм) 500 мл, арт. FRV0014D — фото 2	2	f	2026-01-25 15:19:44.798
cmktvx0wq01b713y4m6o3do9r	cmktvx0v401b313y4x0ainhcr	/uploads/products/1769354384857-f2fk02483ea.png	Ароматический диффузор Leather Oud (Кожа и Уд) 250 мл, арт. FRV0075MLNEEU	0	f	2026-01-25 15:19:44.859
cmktvx0yc01bd13y44ctjhuqe	cmktvx0wt01b913y4s0fdhwrn	/uploads/products/1769354384915-r9vp974ftjn.png	Ароматический диффузор Leather Oud (Кожа и Уд) 500 мл, арт. FRV0075MNNEEU	0	f	2026-01-25 15:19:44.916
cmktvx0zx01bj13y4ibveo94e	cmktvx0yf01bf13y4qmqb9txs	/uploads/products/1769354384972-h46y9snjkhd.png	Ароматический диффузор Limone Cedrato (Лимон и кедр) 250 мл, арт. frv0077mlneeu	0	f	2026-01-25 15:19:44.974
cmktvx11k01bp13y4lfnwzqky	cmktvx10101bl13y4xjvywoe2	/uploads/products/1769354385031-8sjcspdgkl5.png	Ароматический диффузор Limone Cedrato (Лимон и цитрон) 500 мл, арт. frv0077mnneeu	0	f	2026-01-25 15:19:45.032
cmktvx13801bv13y4mly317bp	cmktvx11n01br13y4h79m6e71	/uploads/products/1769354385091-mpxu6pd88o.png	Ароматический диффузор Magnolia Orchidea (Магнолия орхидея) 250 мл, арт. FRV0006C	0	f	2026-01-25 15:19:45.092
cmktvx14w01c113y41qrf4fr0	cmktvx13b01bx13y4bvco4f00	/uploads/products/1769354385151-g9l9rcmgvd.png	Ароматический диффузор Maserati (Мазерати) 500 мл, ар. FRV0049D	0	f	2026-01-25 15:19:45.152
cmktvx16z01c713y45a0r905q	cmktvx14z01c313y4dxflp02p	/uploads/products/1769354385226-5aazkg6bdhb.png	Ароматический диффузор Melograno Menta (Гранат и мята) 250 мл, арт. FRV0022C	0	f	2026-01-25 15:19:45.227
cmktvx18x01cd13y43o1v83qy	cmktvx17201c913y4g7p2qu6j	/uploads/products/1769354385296-wex1963zjl.png	Ароматический диффузор Melograno Menta (Гранат и мята) 500 мл, арт. FRV0022D	0	f	2026-01-25 15:19:45.297
cmktvx1ak01cj13y421bniws3	cmktvx19001cf13y4k4qiz12z	/uploads/products/1769354385355-qi0mtb4vatb.png	Ароматический диффузор Melograno (Гранат) 250 мл, арт. FRV0009C	0	f	2026-01-25 15:19:45.357
cmktvx1c801cp13y4yhteofyd	cmktvx1an01cl13y4gwdrdqav	/uploads/products/1769354385415-e2vt6b531pb.png	Ароматический диффузор Melograno (Гранат) 500 мл, арт. FRV0009D	0	f	2026-01-25 15:19:45.417
cmktvx1du01cv13y4vzgahgzz	cmktvx1cc01cr13y4rhfw10sr	/uploads/products/1769354385473-zmc7gkre3ud.png	Ароматический диффузор Milano (Милан) 250 мл, арт. FRV0054C	0	f	2026-01-25 15:19:45.475
cmktvx1gw01d713y47jn9pwnl	cmktvx1fl01d313y419puvafs	/uploads/products/1769354385583-pld0153idv.png	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 100 мл, арт. FRV0073A	0	f	2026-01-25 15:19:45.585
cmktvx1n301dj13y4rc0z279u	cmktvx1li01df13y4d1pxdagn	/uploads/products/1769354385806-p3si4lpaf1c.png	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 250 мл, арт. FRV0073C	0	f	2026-01-25 15:19:45.807
cmktvx1or01dp13y4rbkz0nql	cmktvx1n601dl13y449e09e6a	/uploads/products/1769354385865-rg1wau2y3tc.png	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 500 мл, арт. FRV0073D	0	f	2026-01-25 15:19:45.867
cmktvx1uj01dv13y4md6uqive	cmktvx1ou01dr13y4qxm4x84f	/uploads/products/1769354386074-f52wfux53d.png	Ароматический диффузор Oud Nobile (Уд благородный) 250 мл, арт. FRV0042C	0	f	2026-01-25 15:19:46.075
cmktvx1w301e113y4chi1r4ey	cmktvx1um01dx13y4g4vbt3ai	/uploads/products/1769354386131-occhzhtzk0q.png	Ароматический диффузор Oud Nobile (Уд благородный) 500 мл, арт. FRV0042D	0	f	2026-01-25 15:19:46.132
cmktvx1xn01e713y4gz9z3mxa	cmktvx1w601e313y4h85xfwt9	/uploads/products/1769354386186-leyelo9ee4.png	Ароматический диффузор Rosa Tabacco (Роза Табак) 250 мл, арт. FRV0074C	0	f	2026-01-25 15:19:46.187
cmktvx1zc01ed13y4sbcbqhwo	cmktvx1xq01e913y4pve5m281	/uploads/products/1769354386247-7cc1sbhjx29.png	Ароматический диффузор Rosa Tabacco (Роза Табак) 500 мл, арт. FRV0074D	0	f	2026-01-25 15:19:46.248
cmktvx20z01ej13y4lctlh194	cmktvx1zf01ef13y4g5cjjmrv	/uploads/products/1769354386306-e9jfeuq3z3n.png	Ароматический диффузор Rosso Nobile (Красный благородный) 1250 мл, арт. FRV0016K	0	f	2026-01-25 15:19:46.308
cmktvx22l01ep13y4qx9peb7m	cmktvx21201el13y44807lbmx	/uploads/products/1769354386364-z01bypv92v.png	Ароматический диффузор Rosso Nobile (Красный благородный) 250 мл, арт. FRV0016C	0	f	2026-01-25 15:19:46.365
cmktvx24g01ev13y4bfetc5v9	cmktvx22o01er13y4oq1bm235	/uploads/products/1769354386431-c6eary1xnb6.png	Ароматический диффузор Rosso Nobile (Красный благородный) 500 мл, арт. FRV0016D	0	f	2026-01-25 15:19:46.432
cmktvx26501f113y4m4nk37nq	cmktvx24j01ex13y4012dlxf3	/uploads/products/1769354386492-atmybkfiztj.png	Ароматический диффузор Vaniglia Mandarino (Ваниль и мандарин) 250 мл, арт. FRV0005C	0	f	2026-01-25 15:19:46.493
cmktvx27v01f713y48aj6i9h4	cmktvx26801f313y460yo8b9v	/uploads/products/1769354386554-vj9nndhe2e.png	Ароматический диффузор Vaniglia Mandarino (Ваниль и мандарин) 500 мл, арт. FRV0005D	0	f	2026-01-25 15:19:46.555
cmktvx29m01fd13y4mg2x0buf	cmktvx27y01f913y4gqtbc5ah	/uploads/products/1769354386617-kbtv6lec9dc.png	Ароматический диффузор Velvet Saffron (Бархатистый шафран) 250 мл, арт. frv0076mlnee	0	f	2026-01-25 15:19:46.619
cmktvx2ba01fj13y42w9dmr5s	cmktvx29p01ff13y4za0vfq5l	/uploads/products/1769354386677-c0d410wo8gb.png	Ароматический диффузор Velvet Saffron (Бархатистый шафран) 500 мл, арт. frv0076mnnee	0	f	2026-01-25 15:19:46.679
cmktvx2dx01fp13y4cjqw268w	cmktvx2be01fl13y4rstrxo5l	/uploads/products/1769354386771-8bo4mvqqhhj.png	Набор для автомобиля. Диспенсер карбон + два сменных аромата ROSSO NOBILE и AMBRA, размеры 16,5 х 8 х 10 см, арт. GFT0095BABLE2	0	f	2026-01-25 15:19:46.773
cmktvx2fc01fv13y4q0xqml1v	cmktvx2e301fr13y4pgoj9l51	/uploads/products/1769354386822-1puyarnwnwa.png	Набор для автомобиля. Диспенсер карбон + два сменных аромата ROSSO NOBILE и ROSA TABACCO, размеры 16,5 х 8 х 10 см, арт. GFT0092BABLE2	0	f	2026-01-25 15:19:46.824
cmktvx2hk01fx13y4fsulnjfl	cmktvx2e301fr13y4pgoj9l51	/uploads/products/1769354386903-xnxo37ob0j.png	Набор для автомобиля. Диспенсер карбон + два сменных аромата ROSSO NOBILE и ROSA TABACCO, размеры 16,5 х 8 х 10 см, арт. GFT0092BABLE2 — фото 1	1	f	2026-01-25 15:19:46.905
cmktvx2ls01g513y49dzmegb1	cmktvx2j301g113y47xien3d5	/uploads/products/1769354387055-52nzpkzgxy6.png	Палочки бамбуковые белые 250 мл Dr Vranjes, арт. PFRS0052	0	f	2026-01-25 15:19:47.056
cmktvx2o401gb13y40i4m6tcl	cmktvx2lv01g713y4sxnp1uyu	/uploads/products/1769354387123-6pe63qsna14.png	Палочки бамбуковые черные 500 мл Dr. Vranjes, арт. PFRV0005-2	0	f	2026-01-25 15:19:47.141
cmktvx2q601gh13y4li2i36jt	cmktvx2o701gd13y4zujnpl6b	/uploads/products/1769354387213-ta1hhrp4dd.png	Палочки бамбуковые черные Dr Vranjes 1250 мл	0	f	2026-01-25 15:19:47.215
cmktvx2rq01gn13y42j0nbjqu	cmktvx2q901gj13y4jbnumicw	/uploads/products/1769354387269-c8njujli3om.webp	Подарочный набор Ginger lime (Имбирь и лайм) диффузор 250 мл + сменный аромат 150 мл, арт. GFT0014BFCSE1	0	f	2026-01-25 15:19:47.27
cmktvx2th01gt13y4fkttoeiw	cmktvx2rt01gp13y4vkbpubtg	/uploads/products/1769354387332-s2b18sjzuj.png	Подарочный набор Leather Oud (Кожа и Уд) диффузор 250 мл + сменный аромат 150 мл, арт. GFT0075BFCSE1	0	f	2026-01-25 15:19:47.334
cmktvx2u701gz13y48eqgr5g6	cmktvx2tk01gv13y43u31pu7w	/uploads/products/1769354387358-qj97yjjyfbk.png	Подарочный набор Melograno (Гранат) диффузор 100 мл + сменный аромат 150 мл, арт. GFT0009BCCSE1	0	f	2026-01-25 15:19:47.36
cmktvx2w701h513y4ev47ux0i	cmktvx2ua01h113y4mv1uhzt5	/uploads/products/1769354387430-rjdagg8h69.png	Подарочный набор Melograno (Гранат) диффузор 250 мл + сменный аромат 150 мл, арт. GFT0009BFCSE1	0	f	2026-01-25 15:19:47.431
cmktvx30b01hh13y4fnn5tu70	cmktvx2yq01hd13y4p9pkmd74	/uploads/products/1769354387578-oekblu8xnis.png	Подарочный набор Oud nobile (Уд благородный) диффузор 250 мл + сменный аромат 150 мл, арт. GFT0042BFCSE1	0	f	2026-01-25 15:19:47.579
cmktvx30y01hn13y4y8sf6vnw	cmktvx30e01hj13y4w8joq6k3	/uploads/products/1769354387601-t00z2b4mp5j.png	Подарочный набор Rosa Tabacco (Роза и табак)  диффузор 250 мл и свеча 200 гр, Размеры 23 х 18 х 13,5 см, арт. GFT0074BYCSE1	0	f	2026-01-25 15:19:47.602
cmktvx33j01ht13y46d7soxma	cmktvx31101hp13y4v70kxzfw	/uploads/products/1769354387693-bvqh2r8jh3d.png	Подарочный набор Rosa Tabacco (Роза и табак) диффузор 250 мл и свеча 80 гр, (Золотая и синяя коробка) арт. GFT0074BHBOE2	0	f	2026-01-25 15:19:47.696
cmktvx37v01hz13y4661u0koq	cmktvx33m01hv13y4zpbfighv	/uploads/products/1769354387838-qw9udqosp9i.png	Подарочный набор Rosso Nobile (Красный благородный) диффузор 500 мл + сменный аромат 500 мл, Размеры 31 х 25 х 13 см, арт. FRV19-A16	0	f	2026-01-25 15:19:47.851
cmktvx38i01i513y4w9m1s9z3	cmktvx37z01i113y4ih1yb2gd	/uploads/products/1769354387873-s8p6d6totb.png	Подарочный набор Rosso Nobile (Красный благородный) Диффузор 250 мл Зеленая коробка, арт. GFT0X16MLGRE1	0	f	2026-01-25 15:19:47.875
cmktvx3a201ib13y4i36twtjg	cmktvx38l01i713y4udbad3ih	/uploads/products/1769354387929-68h3lcqaalp.png	Подарочный набор Rosso nobile (Красный благородный) диффузор 250 мл и сменный аромат 150 мл, арт. GFT0016BFCSE2	0	f	2026-01-25 15:19:47.93
cmktvx3an01ih13y4mszlnvid	cmktvx3a501id13y4fnu3vjsp	/uploads/products/1769354387950-0g1d82i5yj77.png	Подарочный набор Rosso nobile (Красный благородный) диффузор 250 мл + свеча 80 гр,  Синяя коробка, арт. GFT0X16BHBUE2	0	f	2026-01-25 15:19:47.952
cmktvx3c501in13y4hbq2wrhi	cmktvx3aq01ij13y4p205utkj	/uploads/products/1769354388004-jfg14m7de1o.png	Подарочный набор Rosso Nobile (Красный благородный) диффузор 500 мл, Красная коробка Белые полосы, арт. GFT0X16MNRSE1	0	f	2026-01-25 15:19:48.006
cmktvx3dv01it13y4ev4kzeux	cmktvx3c801ip13y40f6x9r9n	/uploads/products/1769354388066-mhuqlr7yqv.png	Подарочный набор Rosso Nobile (Красный благородный) диффузор 500 мл + свеча 500 гр, арт. GFT0016BKCSE2	0	f	2026-01-25 15:19:48.067
cmktvx3hf01iz13y44ydnnzy3	cmktvx3dy01iv13y4zxb4u45i	/uploads/products/1769354388190-sgdljbi06ql.png	Подарочный набор Rosso Nobile (Красный благородный) диффузор 500 мл + сменный аромат 500 мл, арт. GFT0016BJCSE2	0	f	2026-01-25 15:19:48.196
cmktvx3jy01j513y4f48n263k	cmktvx3hj01j113y4ga2i20dc	/uploads/products/1769354388271-yrwkgzl465m.png	Подарочный набор Rosso nobile (Красный благородный) диффузор 250 мл + свеча 200 гр, Размеры 23 х 18 х 13,5 см, арт. GFT0016BYCSE1	0	f	2026-01-25 15:19:48.286
cmktvx3le01jb13y4srfoc1l5	cmktvx3k101j713y40z2lwle4	/uploads/products/1769354388337-u0rudmy06j.png	Подарочный набор Rosso Nobile (Красный благородный) диффузор 100 мл + сменный аромат 150 мл, арт. GFT0016BCCSE1	0	f	2026-01-25 15:19:48.338
cmktvx3nb01jh13y465206jzk	cmktvx3lk01jd13y4shunzufr	/uploads/products/1769354388406-chto0lm1v8.png	Подарочный набор Rosso nobile (Красный благородный) диффузор 250 мл + сменный аромат 150 мл, арт. GFT0016BFCSE1	0	f	2026-01-25 15:19:48.407
cmktvx3o501jn13y48661yjdt	cmktvx3ni01jj13y4emcmx2j0	/uploads/products/1769354388436-l0rhsvzxju.png	Подарочный набор Albero di Natale (Рождественская ель) диффузор 250 мл (Золотая и синяя коробка), арт. GFT0018MLBOE1	0	f	2026-01-25 15:19:48.437
cmktvx3oo01jt13y433gmawws	cmktvx3o801jp13y425kly5yu	/uploads/products/1769354388455-xfnyuvnpoth.png	Подарочный набор Leather Oud (Кожа и Уд) диффузор 500 мл (Золотая и синяя коробка), арт. GFT0075MNBOE1	0	f	2026-01-25 15:19:48.456
cmktvx3rg01jz13y4aio922f4	cmktvx3or01jv13y4pol0b4ly	/uploads/products/1769354388552-u9fd6ljhj3j.png	Подарочный набор Rosso Nobile (Красный благородный) Декантер 750 мл (красная коробка) Размер 38 х 34 х 19 см арт. FRV0D16MPRSE1	0	f	2026-01-25 15:19:48.557
cmktvx3sw01k513y4d5k6o24l	cmktvx3rk01k113y4hwhrfc42	/uploads/products/1769354388607-pl0f6iakvas.png	Сменный аромат Acqua (Вода) 500 мл, арт. FRV0001E	0	f	2026-01-25 15:19:48.609
cmktvx3ud01kb13y4nminerjb	cmktvx3t001k713y4kj4pu5t8	/uploads/products/1769354388660-ii7dsbsutgm.png	Сменный аромат Albero di Natale (Рождественская ель) 500 мл, арт. FRV0018E	0	f	2026-01-25 15:19:48.661
cmktvx3wc01kh13y4ej0wg5im	cmktvx3ug01kd13y41zve350l	/uploads/products/1769354388715-pqv6q7bfd7d.png	Сменный аромат Ambra (Амбра) 500 мл, арт. FRV0012E	0	f	2026-01-25 15:19:48.732
cmktvx3y601kn13y4vivvpbkk	cmktvx3wo01kj13y42nekvqwf	/uploads/products/1769354388797-xut1in0olhp.png	Сменный аромат Arancio Cannella (Апельсин и корица) 500 мл, арт. FRV0010E	0	f	2026-01-25 15:19:48.798
cmktvx3zm01kt13y4xxy39oic	cmktvx3y901kp13y4ycxc4anw	/uploads/products/1769354388849-ftzgt1hwejw.png	Сменный аромат Bellini (Беллини) 500 мл, арт. FRV0059E	0	f	2026-01-25 15:19:48.85
cmktvx41201kz13y4y9sp6ccz	cmktvx3zp01kv13y4dz8q0b59	/uploads/products/1769354388901-1v78xuniruv.png	Сменный аромат Fuoco (Огонь) 500 мл, арт. FRV0003E	0	f	2026-01-25 15:19:48.902
cmktvx42j01l513y4v34w5jtk	cmktvx41501l113y4rok3go9x	/uploads/products/1769354388954-2332fzhqsce.png	Сменный аромат Giglio di Firenze (Лилия Флоренции) 500 мл, арт. FRV0068E	0	f	2026-01-25 15:19:48.955
cmktvx44401lb13y47w1vkn9n	cmktvx42m01l713y463ozy24r	/uploads/products/1769354389011-fzga8skzse.webp	Сменный аромат Ginger Lime (Имбирь и лайм) 500 мл, арт. FRV0014E	0	f	2026-01-25 15:19:49.013
cmktvx45l01lh13y44dwp7si9	cmktvx44701ld13y433frioeg	/uploads/products/1769354389064-xdijehy8sv.png	Сменный аромат Leather Oud (Кожа и Уд) 500 мл, арт. FRV0R75MNNEEU	0	f	2026-01-25 15:19:49.065
cmktvx47801ln13y45f6mvv6a	cmktvx45o01lj13y43guzxcuj	/uploads/products/1769354389122-q76qwwnjttm.png	Сменный аромат Limone Cedrato (Лимон и цитрон) 500 мл, арт. frv0r77mnneeu	0	f	2026-01-25 15:19:49.124
cmktvwzxv018b13y4tr45n77s	cmktvwzpx018713y406yny8qv	/uploads/products/1769354383602-dv6jwxgvrq.png	Ароматический диффузор Acqua (вода) 250 мл, арт. FRV0001C	0	f	2026-01-25 15:19:43.604
cmktwawr501qx13y4xfge49o9	cmktvwzpx018713y406yny8qv	/uploads/products/1769355032641-sggyd0yzxlf.png	Ароматический диффузор Acqua (вода) 250 мл, арт. FRV0001C	0	t	2026-01-25 15:30:32.658
cmktvx4a801lz13y4n35qrbk7	cmktvx48s01lv13y40djqe7ga	/uploads/products/1769354389231-ci6dvmiouur.png	Сменный аромат Maserati (Мазерати) 500 мл, арт. FRV0049E	0	f	2026-01-25 15:19:49.232
cmktvx4b501m513y49leprzu7	cmktvx4ab01m113y4v75ddjip	/uploads/products/1769354389264-cja40mrbqu.png	Сменный аромат Melograno Menta (Гранат и мята) 500 мл, арт. FRV0022E	0	f	2026-01-25 15:19:49.266
cmktvx4cl01mb13y49t0oi4j3	cmktvx4b801m713y4caqnjglv	/uploads/products/1769354389316-glf8rimt07c.png	Сменный аромат Melograno (Гранат) 500 мл, арт. FRV0009E	0	f	2026-01-25 15:19:49.318
cmktvx4ed01mh13y46pv3wnqs	cmktvx4co01md13y41k9s3g90	/uploads/products/1769354389371-jhewem7whmo.png	Сменный аромат Milano (Милан) 500 мл, арт. FRV0054E	0	f	2026-01-25 15:19:49.381
cmktvx4g401mn13y4d81sccyd	cmktvx4eo01mj13y487i8eulw	/uploads/products/1769354389443-h8atm60q41b.png	Сменный аромат Oud Nobile (Уд благородный) 500 мл, арт. FRV0042E	0	f	2026-01-25 15:19:49.445
cmktvx4hq01mt13y44rpa8vtx	cmktvx4g701mp13y4urjxjz87	/uploads/products/1769354389501-7f3t6u6ffyi.png	Сменный аромат Rosa Tabacco (Роза Табак) 500 мл, арт. FRV0074E	0	f	2026-01-25 15:19:49.502
cmktvx4i201mz13y43bqobis4	cmktvx4ht01mv13y4uw9zn4ko	/uploads/products/1769354389513-vklwy6znjfs.png	Сменный аромат Rosso nobile (Красный благородный) 1000 мл, арт. FRV0R16MPRSE2	0	f	2026-01-25 15:19:49.515
cmktvx4jp01n513y4g32xakbi	cmktvx4i501n113y409osgnqf	/uploads/products/1769354389572-0x4tzxd5twu.png	Сменный аромат Rosso Nobile (красный благородный) 500 мл, арт. FRV0016E	0	f	2026-01-25 15:19:49.573
cmktvx4o501nb13y4k0ule0rj	cmktvx4mp01n713y4zublibm0	/uploads/products/1769354389732-3v2yhxvq2r.png	Сменный аромат Vaniglia Mandarino (Ваниль и мандарин) 500 мл, арт. FRV0005E	0	f	2026-01-25 15:19:49.734
cmktvx4pr01nh13y4hnzvolr0	cmktvx4o801nd13y462268b3w	/uploads/products/1769354389789-lmphk9f0hif.png	Сменный блок Ambra (Амбра) для автомобиля, арт. CRP001299BLE1	0	f	2026-01-25 15:19:49.791
cmktvx4ru01nn13y4kpo70jhw	cmktvx4pu01nj13y48s98fa89	/uploads/products/1769354389865-kdykgqf3ln.png	Сменный блок Milano (Милан) для автомобиля, арт. CRP005499BLE1	0	f	2026-01-25 15:19:49.866
cmktvx4tb01nt13y4n0oj5axu	cmktvx4rx01np13y41i54m6bd	/uploads/products/1769354389918-6m6veenw39m.png	Сменный блок Oud Nobile (Уд благородный) для автомобиля, арт. CRP004299BLE1	0	f	2026-01-25 15:19:49.919
cmktvx4us01nz13y46ht0fgis	cmktvx4te01nv13y4138p4eek	/uploads/products/1769354389971-auecuhg4mhm.png	Сменный блок Rosa Tabacco (Роза табак) для автомобиля, арт. CRP007499BLE1	0	f	2026-01-25 15:19:49.972
cmktvx4w901o513y4d8w265lr	cmktvx4uv01o113y4lkpgpjuv	/uploads/products/1769354390023-ijcqyuv3hnk.png	Сменный блок Rosso Nobile (Красный благородный) для автомобиля, арт. CRP001699BLE1	0	f	2026-01-25 15:19:50.025
cmktvx4yu01ob13y4r5oco2y6	cmktvx4wc01o713y4pzkstv1u	/uploads/products/1769354390104-5jokfyhksyf.png	Спрей для дома Acqua (вода) 100 мл, арт. FRV0001B	0	f	2026-01-25 15:19:50.118
cmktvx50n01oh13y49qpgy5bm	cmktvx4z701od13y4db8rydak	/uploads/products/1769354390182-rpxmzh36a1.png	Спрей для дома Albero di Natale (Рождественская ель) 100 мл, арт. FRV0018B	0	f	2026-01-25 15:19:50.183
cmktvx52g01on13y42ox6schh	cmktvx50p01oj13y4azse9h7c	/uploads/products/1769354390247-7f23c12xt9m.png	Спрей для дома Ambra (амбра) 100 мл, арт. FRV0012B	0	f	2026-01-25 15:19:50.249
cmktvx53x01ot13y4xztzewln	cmktvx52j01op13y4m9rwujmp	/uploads/products/1769354390300-o87g03axa4.png	Спрей для дома Arancio Uva Rossa (Апельсин и красный виноград) 100 мл, арт. FRV0019B	0	f	2026-01-25 15:19:50.301
cmktvx55d01oz13y43l4e2qol	cmktvx54001ov13y4vxnomd9k	/uploads/products/1769354390352-ttsx2gw0c4.png	Спрей для дома Bellini (Беллини) 100 мл, арт. FRV0059B	0	f	2026-01-25 15:19:50.354
cmktvx56m01p513y4og1h327v	cmktvx55g01p113y4m38f1rx6	/uploads/products/1769354390397-du8xx9wzu7c.png	Спрей для дома Fuoco (Огонь) 100 мл, арт. FRV0003B	0	f	2026-01-25 15:19:50.399
cmktvx58401pb13y4vx7vtwop	cmktvx56p01p713y4ccuwt7uu	/uploads/products/1769354390451-76ormw0c4z.png	Спрей для дома Ginger Lime (Имбирь и лайм) 100 мл, арт. FRV0014B	0	f	2026-01-25 15:19:50.453
cmktvx59m01ph13y4vx5nlikb	cmktvx58701pd13y4g8fxo6fd	/uploads/products/1769354390505-b0vz60kpi7.png	Спрей для дома Leather Oud (Кожа и Уд) 100 мл, арт. FRV0S75MGNEEU	0	f	2026-01-25 15:19:50.506
cmktvx5bl01pn13y4714ahnhd	cmktvx59p01pj13y4j310ycpo	/uploads/products/1769354390576-x8n9vvpomh.png	Спрей для дома Limone Cedrato (Лимон и Кедр) 100 мл, арт. frv0s77mgneeu	0	f	2026-01-25 15:19:50.578
cmktvx5d301pt13y4f7v93io2	cmktvx5bq01pp13y4v7ab5c7f	/uploads/products/1769354390630-0cl14bdpu8bm.png	Спрей для дома Melograno (Гранат) 100 мл, арт. FRV0009B	0	f	2026-01-25 15:19:50.631
cmktvx5ej01pz13y4vj7infwz	cmktvx5d501pv13y4zu2l7jni	/uploads/products/1769354390682-ggyuogjsb1.png	Спрей для дома Milano (Милан) 100 мл, арт. FRV0054B	0	f	2026-01-25 15:19:50.684
cmktvx5g101q513y4ilm2up5o	cmktvx5em01q113y48p6ds7di	/uploads/products/1769354390736-u0o1rppnvol.png	Спрей для дома Oud Nobile (Уд благородный) 100 мл, арт. FRV0042B	0	f	2026-01-25 15:19:50.737
cmktvx5hh01qb13y4559ckmt6	cmktvx5g401q713y4j5ldt4xy	/uploads/products/1769354390788-njxdg08u69.png	Спрей для дома Rosa Tabacco (Роза Табак) 100 мл, арт. FRV0074B	0	f	2026-01-25 15:19:50.789
cmktvx5j001qh13y459w2lkg6	cmktvx5hk01qd13y4go7nfls5	/uploads/products/1769354390843-nk02wyvjga.png	Спрей для дома Rosso Nobile (Красный благородный) 100 мл, арт. FRV0016B	0	f	2026-01-25 15:19:50.844
cmktvx5kh01qn13y4gmo414y6	cmktvx5j301qj13y4px7dfwdv	/uploads/products/1769354390896-e9zszzpxklp.png	Спрей для дома Vaniglia Mandarino (Ваниль мандарин) 100 мл, арт. FRV0005B	0	f	2026-01-25 15:19:50.897
cmktvx5lx01qt13y4z5cipwna	cmktvx5kk01qp13y4yrino100	/uploads/products/1769354390948-zsimickp0us.png	Спрей для дома Velvet Saffron (Бархатистый шафран) 100 мл, арт. frv0s76mgnee	0	f	2026-01-25 15:19:50.949
cmktwawte01r113y4t1mf0mwd	cmktvwzxy018d13y4zt1637b8	/uploads/products/1769355032736-ieyfsz3xk39.png	Ароматический диффузор Albero di Natale (Рождественская ель) 500 мл, арт. FRV0018D	0	t	2026-01-25 15:30:32.739
cmktwawv901r513y4s9dfjkcd	cmktvwzzy018j13y4d8xukb3a	/uploads/products/1769355032802-umy8xfvqe7h.png	Ароматический диффузор Albero di Natale (Рождественская ель) 250 мл, арт. FRV0018C	0	t	2026-01-25 15:30:32.805
cmktwawx501r913y46he9cw3j	cmktvx01n018p13y4cr92jgg1	/uploads/products/1769355032870-eetufntzm7.png	Ароматический диффузор Ambra (амбра) 250 мл, арт. FRV0012C	0	t	2026-01-25 15:30:32.873
cmktwawz701rd13y4h8lj3not	cmktvx03b018v13y4xfx5q6ti	/uploads/products/1769355032944-u87ejk9lb38.png	Ароматический диффузор Ambra (амбра) 500 мл, арт. FRV0012D	0	t	2026-01-25 15:30:32.948
cmktwax1501rh13y4p96l1frp	cmktvx052019113y4f22d3erz	/uploads/products/1769355033014-f7jx5a247kk.png	Ароматический диффузор Arancio Cannella (Апельсин и корица) 250 мл, арт. FRV0010C	0	t	2026-01-25 15:30:33.018
cmktwax3401rl13y4qqynxz2q	cmktvx06q019713y4fg2teecu	/uploads/products/1769355033085-1ofjh17oraj.png	Ароматический диффузор Arancio Cannella (Апельсин и корица) 500 мл, арт. FRV0010D	0	t	2026-01-25 15:30:33.088
cmktwax5801rp13y43lch8rnf	cmktvx08h019d13y4sqlp95a8	/uploads/products/1769355033161-syljj15bte.png	Ароматический диффузор Arancio Uva Rossa (Апельсин и красный виноград) 250 мл, арт. FRV0019C	0	t	2026-01-25 15:30:33.164
cmktwax7301rt13y4lcl9qunz	cmktvx0a6019j13y4w3w6bfj7	/uploads/products/1769355033228-jc5tglzp91o.png	Ароматический диффузор Arancio Uva Rossa (Апельсин и виноград) 500 мл, арт. FRV0019D	0	t	2026-01-25 15:30:33.231
cmktwax8u01rx13y4f768uz6w	cmktvx0cp019p13y4579q45xt	/uploads/products/1769355033291-jety9hzop2e.png	Ароматический диффузор Bellini (Беллини) 250 мл, арт. FRV0059C	0	t	2026-01-25 15:30:33.295
cmktwaxam01s113y4sy7ldayb	cmktvx0ee019v13y4yqz2x39g	/uploads/products/1769355033355-d2ofvnkq07.png	Ароматический диффузор Bellini (Беллини) 500 мл, арт. FRV0059D	0	t	2026-01-25 15:30:33.358
cmktwaxcd01s513y42ytwq33g	cmktvx0g201a113y4seq7sv7y	/uploads/products/1769355033419-j0wt7uytigf.png	Ароматический диффузор Fuoco (Огонь) 250 мл, арт. FRV0003C	0	t	2026-01-25 15:30:33.422
cmktwaxe401s913y46qgthc82	cmktvx0hq01a713y4l8mmxhd6	/uploads/products/1769355033481-as5swjz2b0t.png	Ароматический диффузор Giglio di Firenze (Лилия Флоренции) 250 мл, арт. FRV0068C	0	t	2026-01-25 15:30:33.485
cmktwaxfv01sd13y4d8bz07e6	cmktvx0jg01ad13y44wha9e09	/uploads/products/1769355033544-pxvmrmfmub.png	Ароматический диффузор Giglio di Firenze (Лилия Флоренции) 500 мл, арт. FRV0068D	0	t	2026-01-25 15:30:33.548
cmktvx0ok01ap13y4lcm1zz5b	cmktvx0ld01aj13y4lzmunsl4	/uploads/products/1769354384563-9iw4wpsf2yn.png	Ароматический диффузор Ginger Lime (Имбирь и лайм) 250 мл, арт. FRV0014C — фото 1	1	f	2026-01-25 15:19:44.564
cmktvx0q701ar13y4yc1wud0x	cmktvx0ld01aj13y4lzmunsl4	/uploads/products/1769354384621-ohnme4gnhei.png	Ароматический диффузор Ginger Lime (Имбирь и лайм) 250 мл, арт. FRV0014C — фото 2	2	f	2026-01-25 15:19:44.623
cmktwaxhw01sh13y4dxpl8ye6	cmktvx0ld01aj13y4lzmunsl4	/uploads/products/1769355033618-8ehbwoe9zu6.png	Ароматический диффузор Ginger Lime (Имбирь и лайм) 250 мл, арт. FRV0014C	0	t	2026-01-25 15:30:33.621
cmktwaxka01sj13y4g0aky4gn	cmktvx0ld01aj13y4lzmunsl4	/uploads/products/1769355033705-i57et7zqrt.png	Ароматический диффузор Ginger Lime (Имбирь и лайм) 250 мл, арт. FRV0014C — фото 1	1	f	2026-01-25 15:30:33.707
cmktwaxly01sl13y4vr8hozv2	cmktvx0ld01aj13y4lzmunsl4	/uploads/products/1769355033765-efuo1y9o8fg.png	Ароматический диффузор Ginger Lime (Имбирь и лайм) 250 мл, арт. FRV0014C — фото 2	2	f	2026-01-25 15:30:33.766
cmktwaxnv01sp13y4pfugo5s7	cmktvx0qa01at13y4zw31c5lz	/uploads/products/1769355033832-6fd7yccipvw.png	Ароматический диффузор Ginger Lime (Имбирь и лайм) 500 мл, арт. FRV0014D	0	t	2026-01-25 15:30:33.835
cmktwaxpk01sr13y4576dm1u7	cmktvx0qa01at13y4zw31c5lz	/uploads/products/1769355033895-yosvyhstgg.png	Ароматический диффузор Ginger Lime (Имбирь и лайм) 500 мл, арт. FRV0014D — фото 1	1	f	2026-01-25 15:30:33.897
cmktwaxr601st13y46si0zb4u	cmktvx0qa01at13y4zw31c5lz	/uploads/products/1769355033953-abhi4jsxqt.png	Ароматический диффузор Ginger Lime (Имбирь и лайм) 500 мл, арт. FRV0014D — фото 2	2	f	2026-01-25 15:30:33.954
cmktwaxst01sx13y486hvgojn	cmktvx0v401b313y4x0ainhcr	/uploads/products/1769355034011-70r7kkkn1ir.png	Ароматический диффузор Leather Oud (Кожа и Уд) 250 мл, арт. FRV0075MLNEEU	0	t	2026-01-25 15:30:34.014
cmktwaxur01t113y42a928yfm	cmktvx0wt01b913y4s0fdhwrn	/uploads/products/1769355034081-6dwvxryva6g.png	Ароматический диффузор Leather Oud (Кожа и Уд) 500 мл, арт. FRV0075MNNEEU	0	t	2026-01-25 15:30:34.084
cmktwaxwg01t513y4m8w2hwz3	cmktvx0yf01bf13y4qmqb9txs	/uploads/products/1769355034141-tjnexgj7ji.png	Ароматический диффузор Limone Cedrato (Лимон и кедр) 250 мл, арт. frv0077mlneeu	0	t	2026-01-25 15:30:34.144
cmktwaxy601t913y4u2co09zl	cmktvx10101bl13y4xjvywoe2	/uploads/products/1769355034203-n84tgyn9ct.png	Ароматический диффузор Limone Cedrato (Лимон и цитрон) 500 мл, арт. frv0077mnneeu	0	t	2026-01-25 15:30:34.206
cmktwaxzw01td13y4soh0i42h	cmktvx11n01br13y4h79m6e71	/uploads/products/1769355034265-ob9x6qavg9.png	Ароматический диффузор Magnolia Orchidea (Магнолия орхидея) 250 мл, арт. FRV0006C	0	t	2026-01-25 15:30:34.268
cmktway1q01th13y49l7kjn81	cmktvx13b01bx13y4bvco4f00	/uploads/products/1769355034332-7bfhpmk8i5.png	Ароматический диффузор Maserati (Мазерати) 500 мл, ар. FRV0049D	0	t	2026-01-25 15:30:34.335
cmktway4701tl13y41dnyos1c	cmktvx14z01c313y4dxflp02p	/uploads/products/1769355034421-2zpxyvuhi9d.png	Ароматический диффузор Melograno Menta (Гранат и мята) 250 мл, арт. FRV0022C	0	t	2026-01-25 15:30:34.424
cmktway5w01tp13y4yg9zh4ot	cmktvx17201c913y4g7p2qu6j	/uploads/products/1769355034481-b5kjvg6kj4.png	Ароматический диффузор Melograno Menta (Гранат и мята) 500 мл, арт. FRV0022D	0	t	2026-01-25 15:30:34.484
cmktway7p01tt13y4ir5ff4w3	cmktvx19001cf13y4k4qiz12z	/uploads/products/1769355034546-oltzu786mz.png	Ароматический диффузор Melograno (Гранат) 250 мл, арт. FRV0009C	0	t	2026-01-25 15:30:34.549
cmktway9d01tx13y48db1fx2l	cmktvx1an01cl13y4gwdrdqav	/uploads/products/1769355034606-r3a4meg1h3.png	Ароматический диффузор Melograno (Гранат) 500 мл, арт. FRV0009D	0	t	2026-01-25 15:30:34.609
cmktwayb101u113y4l7epdik7	cmktvx1cc01cr13y4rhfw10sr	/uploads/products/1769355034667-0l9gkad4wpzd.png	Ароматический диффузор Milano (Милан) 250 мл, арт. FRV0054C	0	t	2026-01-25 15:30:34.67
cmktvx1fh01d113y439ybvrk6	cmktvx1dx01cx13y4z9ii3vn9	/uploads/products/1769354385532-1fougzv31ja.png	Ароматический диффузор Milano (Милан) 500 мл, арт. FRV0054D	0	f	2026-01-25 15:19:45.533
cmktwaycv01u513y4ux3k7tjf	cmktvx1dx01cx13y4z9ii3vn9	/uploads/products/1769355034732-mqg689khlrm.png	Ароматический диффузор Milano (Милан) 500 мл, арт. FRV0054D	0	t	2026-01-25 15:30:34.735
cmktvx1ih01d913y437f3vrci	cmktvx1fl01d313y419puvafs	/uploads/products/1769354385640-tfjuv2f7vfa.png	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 100 мл, арт. FRV0073A — фото 1	1	f	2026-01-25 15:19:45.641
cmktvx1k201db13y4v6xpxbjh	cmktvx1fl01d313y419puvafs	/uploads/products/1769354385697-1ge92phpjey.png	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 100 мл, арт. FRV0073A — фото 2	2	f	2026-01-25 15:19:45.698
cmktvx1lf01dd13y4433sswi7	cmktvx1fl01d313y419puvafs	/uploads/products/1769354385746-mbr1iqj87g.jpg	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 100 мл, арт. FRV0073A — фото 3	3	f	2026-01-25 15:19:45.747
cmktwayeh01u913y46wbjrt7z	cmktvx1fl01d313y419puvafs	/uploads/products/1769355034789-kuejxc3c01.png	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 100 мл, арт. FRV0073A	0	t	2026-01-25 15:30:34.793
cmktwayg001ub13y4pfsshx2m	cmktvx1fl01d313y419puvafs	/uploads/products/1769355034847-4iccx2iqbsh.png	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 100 мл, арт. FRV0073A — фото 1	1	f	2026-01-25 15:30:34.848
cmktwayj601ud13y4uinwqn6k	cmktvx1fl01d313y419puvafs	/uploads/products/1769355034961-lsm3btzagza.png	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 100 мл, арт. FRV0073A — фото 2	2	f	2026-01-25 15:30:34.962
cmktwayl601uf13y4sugl6tsq	cmktvx1fl01d313y419puvafs	/uploads/products/1769355035033-jegmsv105l.jpg	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 100 мл, арт. FRV0073A — фото 3	3	f	2026-01-25 15:30:35.034
cmktwayna01uj13y4eaeynvv6	cmktvx1li01df13y4d1pxdagn	/uploads/products/1769355035108-utuyo4u6d9.png	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 250 мл, арт. FRV0073C	0	t	2026-01-25 15:30:35.111
cmktwayp201un13y4l64hvd0d	cmktvx1n601dl13y449e09e6a	/uploads/products/1769355035171-s27ikfew9bb.png	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 500 мл, арт. FRV0073D	0	t	2026-01-25 15:30:35.174
cmktwayxc01ur13y42jkqmw44	cmktvx1ou01dr13y4qxm4x84f	/uploads/products/1769355035469-kavoghpjf6.png	Ароматический диффузор Oud Nobile (Уд благородный) 250 мл, арт. FRV0042C	0	t	2026-01-25 15:30:35.472
cmktwayze01uv13y4wue55pcy	cmktvx1um01dx13y4g4vbt3ai	/uploads/products/1769355035543-9enb0z41n5.png	Ароматический диффузор Oud Nobile (Уд благородный) 500 мл, арт. FRV0042D	0	t	2026-01-25 15:30:35.546
cmktwaz1f01uz13y4zy6t96bg	cmktvx1w601e313y4h85xfwt9	/uploads/products/1769355035616-8p5fbthigfq.png	Ароматический диффузор Rosa Tabacco (Роза Табак) 250 мл, арт. FRV0074C	0	t	2026-01-25 15:30:35.619
cmktwaz3601v313y4okcpcuh3	cmktvx1xq01e913y4pve5m281	/uploads/products/1769355035680-1rts6sc341l.png	Ароматический диффузор Rosa Tabacco (Роза Табак) 500 мл, арт. FRV0074D	0	t	2026-01-25 15:30:35.683
cmktwaz4y01v713y47jpyjau9	cmktvx1zf01ef13y4g5cjjmrv	/uploads/products/1769355035743-ze2q402gshn.png	Ароматический диффузор Rosso Nobile (Красный благородный) 1250 мл, арт. FRV0016K	0	t	2026-01-25 15:30:35.746
cmktwaz6v01vb13y481djy708	cmktvx21201el13y44807lbmx	/uploads/products/1769355035812-13fv8mzmuud.png	Ароматический диффузор Rosso Nobile (Красный благородный) 250 мл, арт. FRV0016C	0	t	2026-01-25 15:30:35.815
cmktwaz8o01vf13y48c9upupg	cmktvx22o01er13y4oq1bm235	/uploads/products/1769355035876-2so7jjo0blt.png	Ароматический диффузор Rosso Nobile (Красный благородный) 500 мл, арт. FRV0016D	0	t	2026-01-25 15:30:35.88
cmktwazan01vj13y4lq2o5l77	cmktvx24j01ex13y4012dlxf3	/uploads/products/1769355035949-4unr5bqh5x.png	Ароматический диффузор Vaniglia Mandarino (Ваниль и мандарин) 250 мл, арт. FRV0005C	0	t	2026-01-25 15:30:35.952
cmktwazcl01vn13y4ef0rqsoq	cmktvx26801f313y460yo8b9v	/uploads/products/1769355036019-t8b8e5uhi7.png	Ароматический диффузор Vaniglia Mandarino (Ваниль и мандарин) 500 мл, арт. FRV0005D	0	t	2026-01-25 15:30:36.021
cmktwazel01vr13y4ktkqbeo5	cmktvx27y01f913y4gqtbc5ah	/uploads/products/1769355036091-kqknql1padh.png	Ароматический диффузор Velvet Saffron (Бархатистый шафран) 250 мл, арт. frv0076mlnee	0	t	2026-01-25 15:30:36.094
cmktwazgf01vv13y4dc5yyjfc	cmktvx29p01ff13y4za0vfq5l	/uploads/products/1769355036156-gm5mz9kmbs6.png	Ароматический диффузор Velvet Saffron (Бархатистый шафран) 500 мл, арт. frv0076mnnee	0	t	2026-01-25 15:30:36.159
cmktwazjc01vz13y44ukx6j0f	cmktvx2be01fl13y4rstrxo5l	/uploads/products/1769355036261-k5lsx5wrlz9.png	Набор для автомобиля. Диспенсер карбон + два сменных аромата ROSSO NOBILE и AMBRA, размеры 16,5 х 8 х 10 см, арт. GFT0095BABLE2	0	t	2026-01-25 15:30:36.264
cmktvx2iz01fz13y4x2miquyx	cmktvx2e301fr13y4pgoj9l51	/uploads/products/1769354386954-a9le6gooxnc.png	Набор для автомобиля. Диспенсер карбон + два сменных аромата ROSSO NOBILE и ROSA TABACCO, размеры 16,5 х 8 х 10 см, арт. GFT0092BABLE2 — фото 2	2	f	2026-01-25 15:19:46.956
cmktwazk501w313y4jzb6uoqe	cmktvx2e301fr13y4pgoj9l51	/uploads/products/1769355036291-5keq48kls4v.png	Набор для автомобиля. Диспенсер карбон + два сменных аромата ROSSO NOBILE и ROSA TABACCO, размеры 16,5 х 8 х 10 см, арт. GFT0092BABLE2	0	t	2026-01-25 15:30:36.294
cmktwazmp01w513y4o1hqq96i	cmktvx2e301fr13y4pgoj9l51	/uploads/products/1769355036383-qaf8mlyowd.png	Набор для автомобиля. Диспенсер карбон + два сменных аромата ROSSO NOBILE и ROSA TABACCO, размеры 16,5 х 8 х 10 см, арт. GFT0092BABLE2 — фото 1	1	f	2026-01-25 15:30:36.385
cmktwazpt01w713y4u6qtrk3k	cmktvx2e301fr13y4pgoj9l51	/uploads/products/1769355036481-p0rnpok0e2b.png	Набор для автомобиля. Диспенсер карбон + два сменных аромата ROSSO NOBILE и ROSA TABACCO, размеры 16,5 х 8 х 10 см, арт. GFT0092BABLE2 — фото 2	2	f	2026-01-25 15:30:36.497
cmktwazsy01wb13y40x9kmowr	cmktvx2j301g113y47xien3d5	/uploads/products/1769355036607-esnvhhbku3s.png	Палочки бамбуковые белые 250 мл Dr Vranjes, арт. PFRS0052	0	t	2026-01-25 15:30:36.611
cmktwazuw01wf13y48of1vvjl	cmktvx2lv01g713y4sxnp1uyu	/uploads/products/1769355036677-918eblil7o8.png	Палочки бамбуковые черные 500 мл Dr. Vranjes, арт. PFRV0005-2	0	t	2026-01-25 15:30:36.681
cmktwazwt01wj13y4r04bzaen	cmktvx2o701gd13y4zujnpl6b	/uploads/products/1769355036746-0z4gdn07cfg.png	Палочки бамбуковые черные Dr Vranjes 1250 мл	0	t	2026-01-25 15:30:36.749
cmktwazyf01wn13y4bfgh6gkj	cmktvx2q901gj13y4jbnumicw	/uploads/products/1769355036804-04mqmi0yars7.webp	Подарочный набор Ginger lime (Имбирь и лайм) диффузор 250 мл + сменный аромат 150 мл, арт. GFT0014BFCSE1	0	t	2026-01-25 15:30:36.808
cmktwb00001wr13y43l2pugpz	cmktvx2rt01gp13y4vkbpubtg	/uploads/products/1769355036862-jye3lpbg5mp.png	Подарочный набор Leather Oud (Кожа и Уд) диффузор 250 мл + сменный аромат 150 мл, арт. GFT0075BFCSE1	0	t	2026-01-25 15:30:36.865
cmktwb00n01wv13y413vwlt87	cmktvx2tk01gv13y43u31pu7w	/uploads/products/1769355036885-0fkyacuvfktm.png	Подарочный набор Melograno (Гранат) диффузор 100 мл + сменный аромат 150 мл, арт. GFT0009BCCSE1	0	t	2026-01-25 15:30:36.888
cmktwb02e01wz13y4bi4e5l8m	cmktvx2ua01h113y4mv1uhzt5	/uploads/products/1769355036947-bi1dsasx6lj.png	Подарочный набор Melograno (Гранат) диффузор 250 мл + сменный аромат 150 мл, арт. GFT0009BFCSE1	0	t	2026-01-25 15:30:36.95
cmktvx2ye01hb13y4znslf4rj	cmktvx2wb01h713y4ydvmjytm	/uploads/products/1769354387506-iq2zpznonvl.png	Подарочный набор Oud Nobile (Уд благородный) диффузор 250 мл и свеча 200 гр, Размеры 23 х 18 х 13,5 см, арт. GFT0042BYCSE1	0	f	2026-01-25 15:19:47.51
cmktwb04201x313y4u1y2bk0m	cmktvx2wb01h713y4ydvmjytm	/uploads/products/1769355037008-h4z633u2gh.png	Подарочный набор Oud Nobile (Уд благородный) диффузор 250 мл и свеча 200 гр, Размеры 23 х 18 х 13,5 см, арт. GFT0042BYCSE1	0	t	2026-01-25 15:30:37.011
cmktwb05q01x713y4g7iyil1v	cmktvx2yq01hd13y4p9pkmd74	/uploads/products/1769355037067-frfeakxvmz6.png	Подарочный набор Oud nobile (Уд благородный) диффузор 250 мл + сменный аромат 150 мл, арт. GFT0042BFCSE1	0	t	2026-01-25 15:30:37.07
cmktwb06701xb13y4hdf41u55	cmktvx30e01hj13y4w8joq6k3	/uploads/products/1769355037085-iseo8f0wc6.png	Подарочный набор Rosa Tabacco (Роза и табак)  диффузор 250 мл и свеча 200 гр, Размеры 23 х 18 х 13,5 см, арт. GFT0074BYCSE1	0	t	2026-01-25 15:30:37.088
cmktwb09r01xf13y4zlisac3a	cmktvx31101hp13y4v70kxzfw	/uploads/products/1769355037186-x5zlplt3xhi.png	Подарочный набор Rosa Tabacco (Роза и табак) диффузор 250 мл и свеча 80 гр, (Золотая и синяя коробка) арт. GFT0074BHBOE2	0	t	2026-01-25 15:30:37.215
cmktwb0e601xj13y4uue8wbbv	cmktvx33m01hv13y4zpbfighv	/uploads/products/1769355037357-iogi4url0tn.png	Подарочный набор Rosso Nobile (Красный благородный) диффузор 500 мл + сменный аромат 500 мл, Размеры 31 х 25 х 13 см, арт. FRV19-A16	0	t	2026-01-25 15:30:37.374
cmktwb0ex01xn13y4q3a0kkar	cmktvx37z01i113y4ih1yb2gd	/uploads/products/1769355037398-7wh4al6hchq.png	Подарочный набор Rosso Nobile (Красный благородный) Диффузор 250 мл Зеленая коробка, арт. GFT0X16MLGRE1	0	t	2026-01-25 15:30:37.401
cmktwb0he01xr13y45jisug17	cmktvx38l01i713y4udbad3ih	/uploads/products/1769355037487-1468gv3b18c.png	Подарочный набор Rosso nobile (Красный благородный) диффузор 250 мл и сменный аромат 150 мл, арт. GFT0016BFCSE2	0	t	2026-01-25 15:30:37.491
cmktwb0hy01xv13y49vzj7bwc	cmktvx3a501id13y4fnu3vjsp	/uploads/products/1769355037507-61bla5tj6vc.png	Подарочный набор Rosso nobile (Красный благородный) диффузор 250 мл + свеча 80 гр,  Синяя коробка, арт. GFT0X16BHBUE2	0	t	2026-01-25 15:30:37.511
cmktwb0jk01xz13y4xsuuv7ed	cmktvx3aq01ij13y4p205utkj	/uploads/products/1769355037565-9qucio6hjm4.png	Подарочный набор Rosso Nobile (Красный благородный) диффузор 500 мл, Красная коробка Белые полосы, арт. GFT0X16MNRSE1	0	t	2026-01-25 15:30:37.568
cmktwb0l501y313y4u6y7sfs2	cmktvx3c801ip13y40f6x9r9n	/uploads/products/1769355037622-aiay7g6x36a.png	Подарочный набор Rosso Nobile (Красный благородный) диффузор 500 мл + свеча 500 гр, арт. GFT0016BKCSE2	0	t	2026-01-25 15:30:37.625
cmktwb0pz01y713y4boyq9rbd	cmktvx3dy01iv13y4zxb4u45i	/uploads/products/1769355037771-8xvr53yfw3b.png	Подарочный набор Rosso Nobile (Красный благородный) диффузор 500 мл + сменный аромат 500 мл, арт. GFT0016BJCSE2	0	t	2026-01-25 15:30:37.8
cmktwb0sb01yb13y4u86p0pm8	cmktvx3hj01j113y4ga2i20dc	/uploads/products/1769355037876-7eiltr2itqi.png	Подарочный набор Rosso nobile (Красный благородный) диффузор 250 мл + свеча 200 гр, Размеры 23 х 18 х 13,5 см, арт. GFT0016BYCSE1	0	t	2026-01-25 15:30:37.884
cmktwb0ut01yf13y4ybttmise	cmktvx3k101j713y40z2lwle4	/uploads/products/1769355037965-skd4xul5jb.png	Подарочный набор Rosso Nobile (Красный благородный) диффузор 100 мл + сменный аромат 150 мл, арт. GFT0016BCCSE1	0	t	2026-01-25 15:30:37.973
cmktwb0wr01yj13y4mrisbt3k	cmktvx3lk01jd13y4shunzufr	/uploads/products/1769355038040-p5bzm0e4oas.png	Подарочный набор Rosso nobile (Красный благородный) диффузор 250 мл + сменный аромат 150 мл, арт. GFT0016BFCSE1	0	t	2026-01-25 15:30:38.043
cmktwb0xd01yn13y4zioqouqg	cmktvx3ni01jj13y4emcmx2j0	/uploads/products/1769355038062-tuw4c3o0yg.png	Подарочный набор Albero di Natale (Рождественская ель) диффузор 250 мл (Золотая и синяя коробка), арт. GFT0018MLBOE1	0	t	2026-01-25 15:30:38.065
cmktwb0xt01yr13y4j30dw435	cmktvx3o801jp13y425kly5yu	/uploads/products/1769355038079-3cv8d3xsj7d.png	Подарочный набор Leather Oud (Кожа и Уд) диффузор 500 мл (Золотая и синяя коробка), арт. GFT0075MNBOE1	0	t	2026-01-25 15:30:38.081
cmktwb11601yv13y4ubwclys7	cmktvx3or01jv13y4pol0b4ly	/uploads/products/1769355038196-emesebr84ve.png	Подарочный набор Rosso Nobile (Красный благородный) Декантер 750 мл (красная коробка) Размер 38 х 34 х 19 см арт. FRV0D16MPRSE1	0	t	2026-01-25 15:30:38.202
cmktwb12q01yz13y4tpgehabt	cmktvx3rk01k113y4hwhrfc42	/uploads/products/1769355038255-13w7lxb65dzo.png	Сменный аромат Acqua (Вода) 500 мл, арт. FRV0001E	0	t	2026-01-25 15:30:38.258
cmktwb14z01z313y4raitnzzx	cmktvx3t001k713y4kj4pu5t8	/uploads/products/1769355038313-pdcj8dvgb0i.png	Сменный аромат Albero di Natale (Рождественская ель) 500 мл, арт. FRV0018E	0	t	2026-01-25 15:30:38.339
cmktwb16o01z713y49nbu8r3l	cmktvx3ug01kd13y41zve350l	/uploads/products/1769355038398-52rxoqpeeh7.png	Сменный аромат Ambra (Амбра) 500 мл, арт. FRV0012E	0	t	2026-01-25 15:30:38.401
cmktwb18b01zb13y4xnh1gctq	cmktvx3wo01kj13y42nekvqwf	/uploads/products/1769355038457-aouwj3tzxco.png	Сменный аромат Arancio Cannella (Апельсин и корица) 500 мл, арт. FRV0010E	0	t	2026-01-25 15:30:38.46
cmktwb19w01zf13y4tur2oc78	cmktvx3y901kp13y4ycxc4anw	/uploads/products/1769355038514-phglngpsian.png	Сменный аромат Bellini (Беллини) 500 мл, арт. FRV0059E	0	t	2026-01-25 15:30:38.517
cmktwb1ap01zj13y49gi2r178	cmktvx3zp01kv13y4dz8q0b59	/uploads/products/1769355038541-wvybtxxv63.png	Сменный аромат Fuoco (Огонь) 500 мл, арт. FRV0003E	0	t	2026-01-25 15:30:38.545
cmktwb1cx01zn13y4wbxddm77	cmktvx41501l113y4rok3go9x	/uploads/products/1769355038622-uwxjicc73t.png	Сменный аромат Giglio di Firenze (Лилия Флоренции) 500 мл, арт. FRV0068E	0	t	2026-01-25 15:30:38.625
cmktwb1em01zr13y44cs9cyzi	cmktvx42m01l713y463ozy24r	/uploads/products/1769355038683-a7c3fvrbvot.webp	Сменный аромат Ginger Lime (Имбирь и лайм) 500 мл, арт. FRV0014E	0	t	2026-01-25 15:30:38.686
cmktwb1g901zv13y4tn5azbch	cmktvx44701ld13y433frioeg	/uploads/products/1769355038743-l78p98d9af.png	Сменный аромат Leather Oud (Кожа и Уд) 500 мл, арт. FRV0R75MNNEEU	0	t	2026-01-25 15:30:38.746
cmktwb1i301zz13y4tmc5oyry	cmktvx45o01lj13y43guzxcuj	/uploads/products/1769355038808-ais26sp5uu6.png	Сменный аромат Limone Cedrato (Лимон и цитрон) 500 мл, арт. frv0r77mnneeu	0	t	2026-01-25 15:30:38.811
cmktvx48p01lt13y49zsw0kkg	cmktvx47c01lp13y41zlebhlk	/uploads/products/1769354389176-ubtguc6as0f.png	Сменный аромат Magnolia Orchidea (Магнолия Орхидея ) 500 мл, арт. FRV0006E	0	f	2026-01-25 15:19:49.177
cmktwb1jn020313y408xuxoid	cmktvx47c01lp13y41zlebhlk	/uploads/products/1769355038864-c8h1rer4tll.png	Сменный аромат Magnolia Orchidea (Магнолия Орхидея ) 500 мл, арт. FRV0006E	0	t	2026-01-25 15:30:38.867
cmktwb1l9020713y4d64mcg6n	cmktvx48s01lv13y40djqe7ga	/uploads/products/1769355038922-c9xnnamkeu9.png	Сменный аромат Maserati (Мазерати) 500 мл, арт. FRV0049E	0	t	2026-01-25 15:30:38.925
cmktwb1ly020b13y4u4ofazun	cmktvx4ab01m113y4v75ddjip	/uploads/products/1769355038947-2jvzxigr6nr.png	Сменный аромат Melograno Menta (Гранат и мята) 500 мл, арт. FRV0022E	0	t	2026-01-25 15:30:38.95
cmktwb1no020f13y4eshd7yiu	cmktvx4b801m713y4caqnjglv	/uploads/products/1769355039009-unfm8qt7ahs.png	Сменный аромат Melograno (Гранат) 500 мл, арт. FRV0009E	0	t	2026-01-25 15:30:39.012
cmktwb1p9020j13y4cm0c6ina	cmktvx4co01md13y41k9s3g90	/uploads/products/1769355039066-tth85pyhmcr.png	Сменный аромат Milano (Милан) 500 мл, арт. FRV0054E	0	t	2026-01-25 15:30:39.069
cmktwb1qu020n13y4n0ps9n1g	cmktvx4eo01mj13y487i8eulw	/uploads/products/1769355039123-9wwkr93ros.png	Сменный аромат Oud Nobile (Уд благородный) 500 мл, арт. FRV0042E	0	t	2026-01-25 15:30:39.126
cmktwb1sb020r13y47ckeayi1	cmktvx4g701mp13y4urjxjz87	/uploads/products/1769355039177-22ho7hhfj87.png	Сменный аромат Rosa Tabacco (Роза Табак) 500 мл, арт. FRV0074E	0	t	2026-01-25 15:30:39.18
cmktwb1so020v13y4stqkbk64	cmktvx4ht01mv13y4uw9zn4ko	/uploads/products/1769355039190-zcbzy219crs.png	Сменный аромат Rosso nobile (Красный благородный) 1000 мл, арт. FRV0R16MPRSE2	0	t	2026-01-25 15:30:39.192
cmktwb1u7020z13y4merds6es	cmktvx4i501n113y409osgnqf	/uploads/products/1769355039244-gkgrdcl12ql.png	Сменный аромат Rosso Nobile (красный благородный) 500 мл, арт. FRV0016E	0	t	2026-01-25 15:30:39.248
cmktwb1vy021313y4a6l81bkt	cmktvx4mp01n713y4zublibm0	/uploads/products/1769355039307-xpy9qsb0dt.png	Сменный аромат Vaniglia Mandarino (Ваниль и мандарин) 500 мл, арт. FRV0005E	0	t	2026-01-25 15:30:39.31
cmktwb1xq021713y4fafsvz3v	cmktvx4o801nd13y462268b3w	/uploads/products/1769355039370-f86evohbhik.png	Сменный блок Ambra (Амбра) для автомобиля, арт. CRP001299BLE1	0	t	2026-01-25 15:30:39.374
cmktwb1zh021b13y41jhzi0a5	cmktvx4pu01nj13y48s98fa89	/uploads/products/1769355039434-e4ezcieufd.png	Сменный блок Milano (Милан) для автомобиля, арт. CRP005499BLE1	0	t	2026-01-25 15:30:39.437
cmktwb20z021f13y4t5wpdjnt	cmktvx4rx01np13y41i54m6bd	/uploads/products/1769355039489-ix5jknd7a6.png	Сменный блок Oud Nobile (Уд благородный) для автомобиля, арт. CRP004299BLE1	0	t	2026-01-25 15:30:39.492
cmktwb22j021j13y4decp5jeu	cmktvx4te01nv13y4138p4eek	/uploads/products/1769355039545-5lce2bmtf9p.png	Сменный блок Rosa Tabacco (Роза табак) для автомобиля, арт. CRP007499BLE1	0	t	2026-01-25 15:30:39.547
cmktwb247021n13y4ax6p8z0e	cmktvx4uv01o113y4lkpgpjuv	/uploads/products/1769355039603-p1z1usx6x5p.png	Сменный блок Rosso Nobile (Красный благородный) для автомобиля, арт. CRP001699BLE1	0	t	2026-01-25 15:30:39.608
cmktwb261021r13y4ahh1khzf	cmktvx4wc01o713y4pzkstv1u	/uploads/products/1769355039670-gevroopxr4m.png	Спрей для дома Acqua (вода) 100 мл, арт. FRV0001B	0	t	2026-01-25 15:30:39.673
cmktwb27m021v13y4h63qnqey	cmktvx4z701od13y4db8rydak	/uploads/products/1769355039726-srs4u7frrz8.png	Спрей для дома Albero di Natale (Рождественская ель) 100 мл, арт. FRV0018B	0	t	2026-01-25 15:30:39.73
cmktwb298021z13y4lnpmroe5	cmktvx50p01oj13y4azse9h7c	/uploads/products/1769355039786-tqeujauujf.png	Спрей для дома Ambra (амбра) 100 мл, арт. FRV0012B	0	t	2026-01-25 15:30:39.789
cmktwb2as022313y4jgou8vdr	cmktvx52j01op13y4m9rwujmp	/uploads/products/1769355039841-4nklle4t9ha.png	Спрей для дома Arancio Uva Rossa (Апельсин и красный виноград) 100 мл, арт. FRV0019B	0	t	2026-01-25 15:30:39.844
cmktwb2c9022713y4gsezn9zq	cmktvx54001ov13y4vxnomd9k	/uploads/products/1769355039895-ih7snjwxgko.png	Спрей для дома Bellini (Беллини) 100 мл, арт. FRV0059B	0	t	2026-01-25 15:30:39.897
cmktwb2e2022b13y4ia51uwd9	cmktvx55g01p113y4m38f1rx6	/uploads/products/1769355039959-v53qncnor9e.png	Спрей для дома Fuoco (Огонь) 100 мл, арт. FRV0003B	0	t	2026-01-25 15:30:39.962
cmktwb2fl022f13y4u2svyoyk	cmktvx56p01p713y4ccuwt7uu	/uploads/products/1769355040015-3kjdxzrekc5.png	Спрей для дома Ginger Lime (Имбирь и лайм) 100 мл, арт. FRV0014B	0	t	2026-01-25 15:30:40.017
cmktwb2h2022j13y4b8m8pxu6	cmktvx58701pd13y4g8fxo6fd	/uploads/products/1769355040068-jod83ppz3rg.png	Спрей для дома Leather Oud (Кожа и Уд) 100 мл, арт. FRV0S75MGNEEU	0	t	2026-01-25 15:30:40.071
cmktwb2il022n13y4867c8nrz	cmktvx59p01pj13y4j310ycpo	/uploads/products/1769355040123-f5ahgnab3ep.png	Спрей для дома Limone Cedrato (Лимон и Кедр) 100 мл, арт. frv0s77mgneeu	0	t	2026-01-25 15:30:40.126
cmktwb2k6022r13y4ymq1xdwr	cmktvx5bq01pp13y4v7ab5c7f	/uploads/products/1769355040179-khnxi4c1i3b.png	Спрей для дома Melograno (Гранат) 100 мл, арт. FRV0009B	0	t	2026-01-25 15:30:40.182
cmktwb2lq022v13y4ya1l3fhk	cmktvx5d501pv13y4zu2l7jni	/uploads/products/1769355040234-vykzd90rep.png	Спрей для дома Milano (Милан) 100 мл, арт. FRV0054B	0	t	2026-01-25 15:30:40.238
cmktwb2n9022z13y4pfwsvlen	cmktvx5em01q113y48p6ds7di	/uploads/products/1769355040291-qx0hlfhg9eg.png	Спрей для дома Oud Nobile (Уд благородный) 100 мл, арт. FRV0042B	0	t	2026-01-25 15:30:40.294
cmktwb2pq023313y4ko44y0vn	cmktvx5g401q713y4j5ldt4xy	/uploads/products/1769355040379-n7sxwvblb9.png	Спрей для дома Rosa Tabacco (Роза Табак) 100 мл, арт. FRV0074B	0	t	2026-01-25 15:30:40.383
cmktwb2rx023713y489kcsnv6	cmktvx5hk01qd13y4go7nfls5	/uploads/products/1769355040458-ax7dml8by6l.png	Спрей для дома Rosso Nobile (Красный благородный) 100 мл, арт. FRV0016B	0	t	2026-01-25 15:30:40.461
cmktwb2tf023b13y4kctt64h7	cmktvx5j301qj13y4px7dfwdv	/uploads/products/1769355040512-60avxdcwruy.png	Спрей для дома Vaniglia Mandarino (Ваниль мандарин) 100 мл, арт. FRV0005B	0	t	2026-01-25 15:30:40.515
cmktwb2uy023f13y4or120g8g	cmktvx5kk01qp13y4yrino100	/uploads/products/1769355040567-spv5rima7w.png	Спрей для дома Velvet Saffron (Бархатистый шафран) 100 мл, арт. frv0s76mgnee	0	t	2026-01-25 15:30:40.57
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_variants (id, "productId", name, value, price, "comparePrice", stock, sku, "isDefault", "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, slug, description, "shortDescription", price, "comparePrice", sku, volume, gender, "aromaFamily", ingredients, "isActive", "isFeatured", stock, weight, dimensions, "myWarehouseCode", "manufacturerSku", "productType", "aromaDescription", "topNotes", purpose, barcode, "createdAt", "updatedAt", "brandId", "brandCountry", "manufactureCountry", "shortName", "usageInstructions", "warehouseLocation") FROM stdin;
cmktvwzxy018d13y4zt1637b8	Ароматический диффузор Albero di Natale (Рождественская ель) 500 мл, арт. FRV0018D	aromaticheskiy-diffuzor-albero-di-natale-rozhdestvenskaya-el-500-ml-art-frv0018d	Аромат Albero di Natale наполняет дом теплом и радостью, согревая сердце и создавая атмосферу уюта. Ноты звездчатого аниса, хлорофилла, древесины и сосновой смолы, дикой мяты и лесных мускусов соединяются, чтобы передать магию праздников в выразительном аромате, которым можно наслаждаться круглый год. Albero di Natale — это праздничные моменты, возвращающие вас к теплым семейным воспоминаниям.	\N	23790.00	\N	\N	500 мл	\N	\N	\N	t	f	5	\N	9,5 х 9,5 х 19,5	04779	FRV0018D	Ароматический диффузор	Аромат Albero di Natale наполняет дом теплом и радостью, согревая сердце и создавая атмосферу уюта. Ноты звездчатого аниса, хлорофилла, древесины и сосновой смолы, дикой мяты и лесных мускусов соединяются, чтобы передать магию праздников в выразительном аромате, которым можно наслаждаться круглый год. Albero di Natale — это праздничные моменты, возвращающие вас к теплым семейным воспоминаниям.	Верхние ноты: Розмарин, мята\nСердце аромата: Еловая древесина, еловые смолы\nНоты шлейфа: Сандаловое дерево, мускус	Гостиная, Кабинет, Офис, Холл, Прихожая	2000000049755	2026-01-25 15:19:43.607	2026-01-25 15:30:32.669	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Albero di Natale (Рождественская ель) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvwzzy018j13y4d8xukb3a	Ароматический диффузор Albero di Natale (Рождественская ель) 250 мл, арт. FRV0018C	aromaticheskiy-diffuzor-albero-di-natale-rozhdestvenskaya-el-250-ml-art-frv0018c	Аромат Albero di Natale наполняет дом теплом и радостью, согревая сердце и создавая атмосферу уюта. Ноты звездчатого аниса, хлорофилла, древесины и сосновой смолы, дикой мяты и лесных мускусов соединяются, чтобы передать магию праздников в выразительном аромате, которым можно наслаждаться круглый год. Albero di Natale — это праздничные моменты, возвращающие вас к теплым семейным воспоминаниям.	\N	15990.00	\N	\N	250 мл	\N	\N	\N	t	f	4	\N	8 х 8 х 16	04778	FRV0018C	Ароматический диффузор	Аромат Albero di Natale наполняет дом теплом и радостью, согревая сердце и создавая атмосферу уюта. Ноты звездчатого аниса, хлорофилла, древесины и сосновой смолы, дикой мяты и лесных мускусов соединяются, чтобы передать магию праздников в выразительном аромате, которым можно наслаждаться круглый год. Albero di Natale — это праздничные моменты, возвращающие вас к теплым семейным воспоминаниям.	Верхние ноты: Розмарин, мята\nСердце аромата: Еловая древесина, еловые смолы\nНоты шлейфа: Сандаловое дерево, мускус	Гостиная, Кабинет, Офис, Холл, Прихожая	2000000049748	2026-01-25 15:19:43.678	2026-01-25 15:30:32.742	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Albero di Natale (Рождественская ель) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx01n018p13y4cr92jgg1	Ароматический диффузор Ambra (амбра) 250 мл, арт. FRV0012C	aromaticheskiy-diffuzor-ambra-ambra-250-ml-art-frv0012c	Ароматы для дома Ambra обладает загадочной, сладкой и чувственной индивидуальностью.\nОн перенесет вас в мир интенсивных нот амбры, цветов ириса, герани, лабданума и пачули, завершая композицию аккордами благородных пород древесины и мадагаскарской ванили. Представьте себя окруженным редкими ароматами, хранящимися в элегантных бутылочках самых необычных форм, утопающим в роскошных тканях и любимых пряностях.	\N	13090.00	\N	\N	250 мл	\N	\N	\N	t	f	3	\N	8 х 8 х 16	05364	FRV0012C	Ароматический диффузор	Ароматы для дома Ambra обладает загадочной, сладкой и чувственной индивидуальностью.\nОн перенесет вас в мир интенсивных нот амбры, цветов ириса, герани, лабданума и пачули, завершая композицию аккордами благородных пород древесины и мадагаскарской ванили. Представьте себя окруженным редкими ароматами, хранящимися в элегантных бутылочках самых необычных форм, утопающим в роскошных тканях и любимых пряностях.	Верхние ноты: цветы ириса, герань\nСредние ноты: амбра, лабданум, пачули, рокроз\nБазовые ноты: сандаловое дерево, ваниль, кедровое дерево	Классическая гостиная	8033196272366	2026-01-25 15:19:43.739	2026-01-25 15:30:32.808	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Ambra (амбра) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx2lv01g713y4sxnp1uyu	Палочки бамбуковые черные 500 мл Dr. Vranjes, арт. PFRV0005-2	palochki-bambukovye-chernye-500-ml-dr-vranjes-art-pfrv0005-2	\N	\N	890.00	\N	\N	500 мл	\N	\N	\N	t	f	150	\N	\N	05228	PFRV0005-2	\N	\N	\N	\N	2000000054377	2026-01-25 15:19:47.06	2026-01-25 15:30:36.613	cmhz85ach006oupvs06ykeee8	Италия	Италия	Палочки бамбуковые черные 500 мл Dr. Vranjes	Вставьте палочки в диффузор с ароматической жидкостью, через час переверните для равномерного раскрытия аромата — и наслаждайтесь его нежным распространением по всему помещению. Для более насыщенного эффекта переворачивайте палочки регулярно.	1
cmktvx052019113y4f22d3erz	Ароматический диффузор Arancio Cannella (Апельсин и корица) 250 мл, арт. FRV0010C	aromaticheskiy-diffuzor-arancio-cannella-apelsin-i-koritsa-250-ml-art-frv0010c	Пряности и спелые фрукты, согретые солнцем, создают неповторимую и сияющую атмосферу. Arancio Canella — это не просто аромат, а настоящая поэзия, написанная корицей и цедрой горького апельсина, чтобы подарить ощущения уюта и умиротворения.\nСоблазнительный букет, заключенный в аромате Arancio Canella воплощает счастливые моменты семейного уюта, придавая любому пространству тепло и даря ощущение благополучия.	\N	13090.00	\N	\N	250 мл	\N	\N	\N	t	f	3	\N	8 х 8 х 16	00443	FRV0010C	Ароматический диффузор	Пряности и спелые фрукты, согретые солнцем, создают неповторимую и сияющую атмосферу. Arancio Canella — это не просто аромат, а настоящая поэзия, написанная корицей и цедрой горького апельсина, чтобы подарить ощущения уюта и умиротворения.\nСоблазнительный букет, заключенный в аромате Arancio Canella воплощает счастливые моменты семейного уюта, придавая любому пространству тепло и даря ощущение благополучия.	Верхние ноты: цветы горького апельсина\nСредние ноты: апельсин\nБазовые ноты: цейлонская корица	Гостиная, кухня, столовая, будуар, комната для чтения, зона камина, прихожая, зимний сад	2000000004549	2026-01-25 15:19:43.862	2026-01-25 15:30:32.952	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Arancio Cannella (Апельсин и корица) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx06q019713y4fg2teecu	Ароматический диффузор Arancio Cannella (Апельсин и корица) 500 мл, арт. FRV0010D	aromaticheskiy-diffuzor-arancio-cannella-apelsin-i-koritsa-500-ml-art-frv0010d	Пряности и спелые фрукты, согретые солнцем, создают неповторимую и сияющую атмосферу. Arancio Canella — это не просто аромат, а настоящая поэзия, написанная корицей и цедрой горького апельсина, чтобы подарить ощущения уюта и умиротворения.\nСоблазнительный букет, заключенный в аромате Arancio Canella воплощает счастливые моменты семейного уюта, придавая любому пространству тепло и даря ощущение благополучия.	\N	20590.00	\N	\N	500 мл	\N	\N	\N	t	f	3	\N	9,5 х 9,5 х 19,5	05368	FRV0010D	Ароматический диффузор	Пряности и спелые фрукты, согретые солнцем, создают неповторимую и сияющую атмосферу. Arancio Canella — это не просто аромат, а настоящая поэзия, написанная корицей и цедрой горького апельсина, чтобы подарить ощущения уюта и умиротворения.\nСоблазнительный букет, заключенный в аромате Arancio Canella воплощает счастливые моменты семейного уюта, придавая любому пространству тепло и даря ощущение благополучия.	Верхние ноты: цветы горького апельсина\nСредние ноты: апельсин\nБазовые ноты: цейлонская корица	Гостиная, кухня, столовая, будуар, комната для чтения, зона камина, прихожая, зимний сад	2000000055848	2026-01-25 15:19:43.923	2026-01-25 15:30:33.02	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Arancio Cannella (Апельсин и корица) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx08h019d13y4sqlp95a8	Ароматический диффузор Arancio Uva Rossa (Апельсин и красный виноград) 250 мл, арт. FRV0019C	aromaticheskiy-diffuzor-arancio-uva-rossa-apelsin-i-krasnyy-vinograd-250-ml-art-frv0019c	Arancio e Uva Rossa — аромат тосканского виноградника, наполненный светом, теплом и солнечной свежестью. Горький апельсин и мандарин переплетаются с бархатными нотами красного винограда, розы и магнолии, переходя в изящный шлейф фиалки, корицы и берёзовой древесины. Этот аромат словно приглашает снова и снова возвращаться в Тоскану — где бы вы ни находились.	\N	13090.00	\N	\N	250 мл	\N	\N	\N	t	f	4	\N	8 х 8 х 16	00447	FRV0019C	Ароматический диффузор	Arancio e Uva Rossa — аромат тосканского виноградника, наполненный светом, теплом и солнечной свежестью. Горький апельсин и мандарин переплетаются с бархатными нотами красного винограда, розы и магнолии, переходя в изящный шлейф фиалки, корицы и берёзовой древесины. Этот аромат словно приглашает снова и снова возвращаться в Тоскану — где бы вы ни находились.	Верхние ноты: горький апельсин, мандарин\nСредние ноты: красный виноград, роза, магнолия\nБазовые ноты: фиалка, корица, березовая древесина	Гостиная, столовая, кухня, кабинет, прихожая, бутик, дегустационные и винные пространства, зоны приёма гостей	2000000004587	2026-01-25 15:19:43.985	2026-01-25 15:30:33.091	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Arancio e Uva Rossa (Апельсин и красный виноград) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx0cp019p13y4579q45xt	Ароматический диффузор Bellini (Беллини) 250 мл, арт. FRV0059C	aromaticheskiy-diffuzor-bellini-bellini-250-ml-art-frv0059c	Bellini — аромат, вдохновлённый легендарным венецианским коктейлем, лёгкий, солнечный и по-итальянски жизнерадостный. Свежесть бергамота и белого винограда мягко переходит в сочную ноту спелого персика, окружённого цветочными и цитрусовыми акцентами. Тёплый шлейф амбры, кедра и ветивера наполняет пространство ощущением праздника и dolce vita.	\N	15990.00	\N	\N	250 мл	\N	\N	\N	t	f	8	\N	8 х 8 х 16	00725	FRV0059C	Ароматический диффузор	Bellini — аромат, вдохновлённый легендарным венецианским коктейлем, лёгкий, солнечный и по-итальянски жизнерадостный. Свежесть бергамота и белого винограда мягко переходит в сочную ноту спелого персика, окружённого цветочными и цитрусовыми акцентами. Тёплый шлейф амбры, кедра и ветивера наполняет пространство ощущением праздника и dolce vita.	Верхние ноты: бергамот, ландыш, белый виноград\nСердце: персик\nБазовые ноты: литсея кубеба, ветивер, имбирь	Гостиная, столовая, кухня, прихожая, спальня, бутик, зоны отдыха, отели и апартаменты для приёма гостей	2000000007397	2026-01-25 15:19:44.138	2026-01-25 15:30:33.234	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Bellini (Беллини) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx0ee019v13y4yqz2x39g	Ароматический диффузор Bellini (Беллини) 500 мл, арт. FRV0059D	aromaticheskiy-diffuzor-bellini-bellini-500-ml-art-frv0059d	Bellini — аромат, вдохновлённый легендарным венецианским коктейлем, лёгкий, солнечный и по-итальянски жизнерадостный. Свежесть бергамота и белого винограда мягко переходит в сочную ноту спелого персика, окружённого цветочными и цитрусовыми акцентами. Тёплый шлейф амбры, кедра и ветивера наполняет пространство ощущением праздника и dolce vita.	\N	23790.00	\N	\N	500 мл	\N	\N	\N	t	f	7	\N	9,5 х 9,5 х 19,5	00466	FRV0059D	Ароматический диффузор	Bellini — аромат, вдохновлённый легендарным венецианским коктейлем, лёгкий, солнечный и по-итальянски жизнерадостный. Свежесть бергамота и белого винограда мягко переходит в сочную ноту спелого персика, окружённого цветочными и цитрусовыми акцентами. Тёплый шлейф амбры, кедра и ветивера наполняет пространство ощущением праздника и dolce vita.	Верхние ноты: бергамот, ландыш, белый виноград\nСердце: персик\nБазовые ноты: литсея кубеба, ветивер, имбирь	Гостиная, столовая, кухня, прихожая, спальня, бутик, зоны отдыха, отели и апартаменты для приёма гостей	2000000004778	2026-01-25 15:19:44.199	2026-01-25 15:30:33.298	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Bellini (Беллини) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx0g201a113y4seq7sv7y	Ароматический диффузор Fuoco (Огонь) 250 мл, арт. FRV0003C	aromaticheskiy-diffuzor-fuoco-ogon-250-ml-art-frv0003c	Fuoco раскрывается интенсивным, тёплым и пряным ароматом. Нежные верхние ноты лимонного цвета сменяются сердцем из гвоздики и сандала, а завершают композицию богатые акценты звёздчатого аниса, эбенового дерева, шафрана и розового перца. Этот аромат дарит ощущение домашнего уюта, согревает душу и переносит в пространство, где всегда царит тепло и спокойствие.	\N	13090.00	\N	\N	250 мл	\N	\N	\N	t	f	1	\N	8 х 8 х 16	00442	FRV0003C	Ароматический диффузор	Fuoco раскрывается интенсивным, тёплым и пряным ароматом. Нежные верхние ноты лимонного цвета сменяются сердцем из гвоздики и сандала, а завершают композицию богатые акценты звёздчатого аниса, эбенового дерева, шафрана и розового перца. Этот аромат дарит ощущение домашнего уюта, согревает душу и переносит в пространство, где всегда царит тепло и спокойствие.	Верхние ноты: цветы лимона\nСердце: гвоздика, сандал\nБаза: звёздчатый анис, эбеновое дерево, шафран, розовый перец	Кабинет, Современная гостиная, Классическая гостиная	2000000004532	2026-01-25 15:19:44.259	2026-01-25 15:30:33.361	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Fuoco (Огонь) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx0jg01ad13y44wha9e09	Ароматический диффузор Giglio di Firenze (Лилия Флоренции) 500 мл, арт. FRV0068D	aromaticheskiy-diffuzor-giglio-di-firenze-liliya-florentsii-500-ml-art-frv0068d	Giglio di Firenze — это шедевр, созданный для тех, кто ценит гармонию и баланс. Этот утончённый и взрослый аромат раскрывается в вашем доме, мгновенно преображая пространство, наполняя его теплом, уютом и изысканностью.	\N	20590.00	\N	\N	500 мл	\N	\N	\N	t	f	2	\N	9,5 х 9,5 х 19,5	01690	FRV0068D	Ароматический диффузор	Giglio di Firenze — это шедевр, созданный для тех, кто ценит гармонию и баланс. Этот утончённый и взрослый аромат раскрывается в вашем доме, мгновенно преображая пространство, наполняя его теплом, уютом и изысканностью.	Верхние ноты: бергамот, кардамон, лаванда\nСредние ноты: ирис, герань, лабданум\nБазовые ноты: кедровое дерево, пачули, мускатный орех	Гостиная, спальнная и ванная комнаты	2000000017518	2026-01-25 15:19:44.381	2026-01-25 15:30:33.487	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Giglio di Firenze (Лилия Флоренции) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx0qa01at13y4zw31c5lz	Ароматический диффузор Ginger Lime (Имбирь и лайм) 500 мл, арт. FRV0014D	aromaticheskiy-diffuzor-ginger-lime-imbir-i-laym-500-ml-art-frv0014d	Ginger Lime — яркий и экзотичный аромат, наполненный солнечной энергией и ощущением движения. Взрывная свежесть лайма и лимона встречается с пряным имбирём и белым перцем, создавая динамичную, бодрящую композицию. Благородные древесные ноты придают аромату глубину и делают его по-настоящему выразительным.	\N	20590.00	\N	\N	500 мл	\N	\N	\N	t	f	1	\N	9,5 х 9,5 х 19,5	05371	FRV0014D	Ароматический диффузор	Ginger Lime — яркий и экзотичный аромат, наполненный солнечной энергией и ощущением движения. Взрывная свежесть лайма и лимона встречается с пряным имбирём и белым перцем, создавая динамичную, бодрящую композицию. Благородные древесные ноты придают аромату глубину и делают его по-настоящему выразительным.	Верхние ноты: лайм, лимон\nСредние ноты: имбирь, ветивер\nБазовые ноты: белый перец, древесина эбена и гваякового дерева	Гостиная, кухня, прихожая, рабочий кабинет, офис, фитнес-зоны, бутики, общественные пространства с активной атмосферой	2000000055879	2026-01-25 15:19:44.626	2026-01-25 15:30:33.769	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Ginger Lime (Имбирь и лайм) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx2o701gd13y4zujnpl6b	Палочки бамбуковые черные Dr Vranjes 1250 мл	palochki-bambukovye-chernye-dr-vranjes-1250-ml	\N	\N	0.00	\N	\N	1250 мл	\N	\N	\N	t	f	4	\N	\N	05913	\N	\N	\N	\N	\N	2000000061627	2026-01-25 15:19:47.144	2026-01-25 15:30:36.683	cmhz85ach006oupvs06ykeee8	Италия	Италия	Палочки бамбуковые черные Dr Vranjes 1250 мл	Вставьте палочки в диффузор с ароматической жидкостью, через час переверните для равномерного раскрытия аромата — и наслаждайтесь его нежным распространением по всему помещению. Для более насыщенного эффекта переворачивайте палочки регулярно.	1
cmktvx0wt01b913y4s0fdhwrn	Ароматический диффузор Leather Oud (Кожа и Уд) 500 мл, арт. FRV0075MNNEEU	aromaticheskiy-diffuzor-leather-oud-kozha-i-ud-500-ml-art-frv0075mnneeu	Leather Oud — это интерьерный аромат с яркой, роскошной индивидуальностью: экзотичный, глубокий и обволакивающий.\nДрагоценная и смелая композиция раскрывается нотами розы и герани, в сердце звучит тосканская кожа в союзе с ближневосточным удом, а в шлейфе — сандал, мускус и ваниль.	\N	23790.00	\N	\N	500 мл	\N	\N	\N	t	f	4	\N	9,5 х 9,5 х 19,5	04775	FRV0075MNNEEU	Ароматический диффузор	Leather Oud — это интерьерный аромат с яркой, роскошной индивидуальностью: экзотичный, глубокий и обволакивающий.\nДрагоценная и смелая композиция раскрывается нотами розы и герани, в сердце звучит тосканская кожа в союзе с ближневосточным удом, а в шлейфе — сандал, мускус и ваниль.	Верхние ноты: Элеми, герань, роза, ландыш\nСредние ноты: Уд, кожа, ладан, пачули, амбра\nБазовые ноты: Черное дерево, сандал, мускус, ваниль	Гостиная, Кабинет, Офис, Библиотека, Прихожая, Бутик, Шоурум, Переговорная	2000000049717	2026-01-25 15:19:44.862	2026-01-25 15:30:34.016	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Leather Oud (Кожа и Уд) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx0yf01bf13y4qmqb9txs	Ароматический диффузор Limone Cedrato (Лимон и кедр) 250 мл, арт. frv0077mlneeu	aromaticheskiy-diffuzor-limone-cedrato-limon-i-kedr-250-ml-art-frv0077mlneeu	Limone Cedrato — аромат солнечного утра во Флоренции, наполненный сияющей свежестью лимонов и благородных цитрусов. Он наполняет дом светом, чистотой и ощущением гармонии, словно прогулка по садам Медичи. Лёгкий, жизнерадостный и элегантный, этот аромат пробуждает вдохновение и любовь к жизни.	\N	13090.00	\N	\N	250 мл	\N	\N	\N	t	f	7	\N	8 х 8 х 16	05738	frv0077mlneeu	Ароматический диффузор	Limone Cedrato — аромат солнечного утра во Флоренции, наполненный сияющей свежестью лимонов и благородных цитрусов. Он наполняет дом светом, чистотой и ощущением гармонии, словно прогулка по садам Медичи. Лёгкий, жизнерадостный и элегантный, этот аромат пробуждает вдохновение и любовь к жизни.	Верхние ноты: Флорентийский цитрон, бергамот \nСердце аромата: листья цитрусов, цветы \nНоты шлейфа: ветивер, сандал	Гостиная, кухня, прихожая, столовая, офис, бутик, зоны общего пользования.	8053178093116	2026-01-25 15:19:44.919	2026-01-25 15:30:34.086	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Limone Cedrato (Лимон и кедр) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx10101bl13y4xjvywoe2	Ароматический диффузор Limone Cedrato (Лимон и цитрон) 500 мл, арт. frv0077mnneeu	aromaticheskiy-diffuzor-limone-cedrato-limon-i-tsitron-500-ml-art-frv0077mnneeu	Limone Cedrato — аромат солнечного утра во Флоренции, наполненный сияющей свежестью лимонов и благородных цитрусов. Он наполняет дом светом, чистотой и ощущением гармонии, словно прогулка по садам Медичи. Лёгкий, жизнерадостный и элегантный, этот аромат пробуждает вдохновение и любовь к жизни.	\N	20590.00	\N	\N	500 мл	\N	\N	\N	t	f	8	\N	9,5 х 9,5 х 19,5	05739	frv0077mnneeu	Ароматический диффузор	Limone Cedrato — аромат солнечного утра во Флоренции, наполненный сияющей свежестью лимонов и благородных цитрусов. Он наполняет дом светом, чистотой и ощущением гармонии, словно прогулка по садам Медичи. Лёгкий, жизнерадостный и элегантный, этот аромат пробуждает вдохновение и любовь к жизни.	Верхние ноты: Флорентийский цитрон, бергамот \nСердце аромата: листья цитрусов, цветы \nНоты шлейфа: ветивер, сандал	Гостиная, кухня, прихожая, столовая, офис, бутик, зоны общего пользования.	8053178093192	2026-01-25 15:19:44.977	2026-01-25 15:30:34.147	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Limone Cedrato (Лимон и цитрон) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx13b01bx13y4bvco4f00	Ароматический диффузор Maserati (Мазерати) 500 мл, ар. FRV0049D	aromaticheskiy-diffuzor-maserati-mazerati-500-ml-ar-frv0049d	Maserati от Dr. Vranjes — аромат силы, стиля и безупречного вкуса, созданный как ольфакторный символ легендарного бренда Maserati. Свежие зелёно-цитрусовые ноты плавно переходят в элегантное сердце из литсеи кубебы, лаванды и герани, а затем раскрываются благородным шлейфом кожи, сандала и мускуса. Это аромат скорости, уверенности и роскоши с флорентийским характером.	\N	29090.00	\N	\N	500 мл	\N	\N	\N	t	f	10	\N	9,5 х 9,5 х 19,5	00433	FRV0049D	Ароматический диффузор	Maserati от Dr. Vranjes — аромат силы, стиля и безупречного вкуса, созданный как ольфакторный символ легендарного бренда Maserati. Свежие зелёно-цитрусовые ноты плавно переходят в элегантное сердце из литсеи кубебы, лаванды и герани, а затем раскрываются благородным шлейфом кожи, сандала и мускуса. Это аромат скорости, уверенности и роскоши с флорентийским характером.	Верхние ноты: Литсея кубеба (Лемонграсс кубеба), Кориандр\nСердце: Герань, Кардамон\nБаза: Сандал, Чёрный перец	Кабинет, гостиная, холл, офис, автосалон, переговорная, мужская зона, шоурум, лаунж-пространство	2000000004440	2026-01-25 15:19:45.095	2026-01-25 15:30:34.271	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Maserati (Мазерати) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx14z01c313y4dxflp02p	Ароматический диффузор Melograno Menta (Гранат и мята) 250 мл, арт. FRV0022C	aromaticheskiy-diffuzor-melograno-menta-granat-i-myata-250-ml-art-frv0022c	Melograno e Menta — это взрыв свежести и солнечной энергии, где сочный гранат и прохладная мята создают яркий и жизнерадостный аккорд. Фруктовые ноты дыни, красной смородины и дикого винограда наполняют аромат легкостью и естественной сладостью. Освежающий и гармоничный, он мгновенно пробуждает чувства и создает ощущение чистоты и комфорта.	\N	13090.00	\N	\N	250 мл	\N	\N	\N	t	f	6	\N	8 х 8 х 16	00767	FRV0022C	Ароматический диффузор	Melograno e Menta — это взрыв свежести и солнечной энергии, где сочный гранат и прохладная мята создают яркий и жизнерадостный аккорд. Фруктовые ноты дыни, красной смородины и дикого винограда наполняют аромат легкостью и естественной сладостью. Освежающий и гармоничный, он мгновенно пробуждает чувства и создает ощущение чистоты и комфорта.	Верхние ноты: дыня\nСредние ноты: черная смородина, красный виноград\nБазовые ноты: дикая мята	Кухня, гостиная, прихожая, ванная комната, столовая, офис, фитнес-зона, спа-пространство	2000000007823	2026-01-25 15:19:45.155	2026-01-25 15:30:34.337	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Melograno Menta (Гранат и мята) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx1an01cl13y4gwdrdqav	Ароматический диффузор Melograno (Гранат) 500 мл, арт. FRV0009D	aromaticheskiy-diffuzor-melograno-granat-500-ml-art-frv0009d	Яркий и многогранный, Melograno от Dr. Vranjes Firenze раскрывает неожиданную сторону граната — свежую, сочную и элегантную. Арбуз и бергамот придают аромату лёгкость, а жасмин и роза наполняют его утончённой цветочной глубиной. Финальные ноты чёрной смородины и красного винограда оставляют благородный, живой шлейф, к которому хочется возвращаться.	\N	20590.00	\N	\N	500 мл	\N	\N	\N	t	f	3	\N	9,5 х 9,5 х 19,5	00778	FRV0009D	Ароматический диффузор	Яркий и многогранный, Melograno от Dr. Vranjes Firenze раскрывает неожиданную сторону граната — свежую, сочную и элегантную. Арбуз и бергамот придают аромату лёгкость, а жасмин и роза наполняют его утончённой цветочной глубиной. Финальные ноты чёрной смородины и красного винограда оставляют благородный, живой шлейф, к которому хочется возвращаться.	Верхние ноты: арбуз\nСредние ноты: жасмин, роза, бергамот\nБазовые ноты: чёрная смородина, красный виноград	Гостиная, столовая, кухня, прихожая, офис, переговорная, бутик, салон красоты	2000000007939	2026-01-25 15:19:45.36	2026-01-25 15:30:34.552	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Melograno (Гранат) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx1cc01cr13y4rhfw10sr	Ароматический диффузор Milano (Милан) 250 мл, арт. FRV0054C	aromaticheskiy-diffuzor-milano-milan-250-ml-art-frv0054c	Milano — это аромат с характером большого города: насыщенный, элегантный и чувственный. Пряные и древесные ноты переплетаются с апельсиновым цветом и тёплой ванилью, создавая атмосферу утончённой роскоши и внутренней силы. Он наполняет пространство глубиной и стилем, словно вечерняя прогулка по Милану — между модой, искусством и страстью.	\N	15990.00	\N	\N	250 мл	\N	\N	\N	t	f	7	\N	8 х 8 х 16	02279	FRV0054C	Ароматический диффузор	Milano — это аромат с характером большого города: насыщенный, элегантный и чувственный. Пряные и древесные ноты переплетаются с апельсиновым цветом и тёплой ванилью, создавая атмосферу утончённой роскоши и внутренней силы. Он наполняет пространство глубиной и стилем, словно вечерняя прогулка по Милану — между модой, искусством и страстью.	Верхние ноты: пачули, перец, сандаловое дерево.\nСредние ноты: апельсиновый цвет, кориандр, мускатный орех.\nБазовые ноты: кедр, кипарис, звездчатый анис, амбра, ваниль	Гостиная, кабинет, офис, библиотека, холл, бутик, шоурум, переговорная	2000000023786	2026-01-25 15:19:45.42	2026-01-25 15:30:34.612	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Milano (Милан) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx1dx01cx13y4z9ii3vn9	Ароматический диффузор Milano (Милан) 500 мл, арт. FRV0054D	aromaticheskiy-diffuzor-milano-milan-500-ml-art-frv0054d	Milano — это аромат с характером большого города: насыщенный, элегантный и чувственный. Пряные и древесные ноты переплетаются с апельсиновым цветом и тёплой ванилью, создавая атмосферу утончённой роскоши и внутренней силы. Он наполняет пространство глубиной и стилем, словно вечерняя прогулка по Милану — между модой, искусством и страстью.	\N	23790.00	\N	\N	500 мл	\N	\N	\N	t	f	1	\N	9,5 х 9,5 х 19,5	02816	FRV0054D	Ароматический диффузор	Milano — это аромат с характером большого города: насыщенный, элегантный и чувственный. Пряные и древесные ноты переплетаются с апельсиновым цветом и тёплой ванилью, создавая атмосферу утончённой роскоши и внутренней силы. Он наполняет пространство глубиной и стилем, словно вечерняя прогулка по Милану — между модой, искусством и страстью.	Верхние ноты: пачули, перец, сандаловое дерево.\nСредние ноты: апельсиновый цвет, кориандр, мускатный орех.\nБазовые ноты: кедр, кипарис, звездчатый анис, амбра, ваниль	Гостиная, кабинет, офис, библиотека, холл, бутик, шоурум, переговорная	2000000029320	2026-01-25 15:19:45.478	2026-01-25 15:30:34.672	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Milano (Милан) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx1li01df13y4d1pxdagn	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 250 мл, арт. FRV0073C	aromaticheskiy-diffuzor-mirra-zafferano-mirra-i-shafran-250-ml-art-frv0073c	Mirra Zafferano от Dr. Vranjes Firenze — это изысканный Ароматы для дома, который привнесёт в ваши дни сладкие, утончённые и гурманские акценты. \nЭтот аромат раскрывает богатство нот шафрана, ванили и бергамота, подогревая ваше желание к путешествиям и открытиям. Шафран — одна из самых ценных и редких специй в мире, а мирра, почитаемая с древности, придаёт композиции солнечную и соблазнительную индивидуальность. Вместе они создают аромат для тех, кто ценит роскошь и утончённость.	\N	13090.00	\N	\N	250 мл	\N	\N	\N	t	f	1	\N	8 х 8 х 16	03708	FRV0073C	Ароматический диффузор	Mirra Zafferano от Dr. Vranjes Firenze — это изысканный Ароматы для дома, который привнесёт в ваши дни сладкие, утончённые и гурманские акценты. \nЭтот аромат раскрывает богатство нот шафрана, ванили и бергамота, подогревая ваше желание к путешествиям и открытиям. Шафран — одна из самых ценных и редких специй в мире, а мирра, почитаемая с древности, придаёт композиции солнечную и соблазнительную индивидуальность. Вместе они создают аромат для тех, кто ценит роскошь и утончённость.	Верхние ноты: элеми, бергамот\nСердце: мирра, ладан, амбра\nБазовые ноты: ваниль, шафран	Гостиная, столовая, кабинет, библиотека, холл, бутик, шоурум, зона приёма гостей, спальня.	2000000038698	2026-01-25 15:19:45.751	2026-01-25 15:30:35.038	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx1n601dl13y449e09e6a	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 500 мл, арт. FRV0073D	aromaticheskiy-diffuzor-mirra-zafferano-mirra-i-shafran-500-ml-art-frv0073d	Mirra Zafferano от Dr. Vranjes Firenze — это изысканный Ароматы для дома, который привнесёт в ваши дни сладкие, утончённые и гурманские акценты. \nЭтот аромат раскрывает богатство нот шафрана, ванили и бергамота, подогревая ваше желание к путешествиям и открытиям. Шафран — одна из самых ценных и редких специй в мире, а мирра, почитаемая с древности, придаёт композиции солнечную и соблазнительную индивидуальность. Вместе они создают аромат для тех, кто ценит роскошь и утончённость.	\N	20590.00	\N	\N	500 мл	\N	\N	\N	t	f	2	\N	9,5 х 9,5 х 19,5	03709	FRV0073D	Ароматический диффузор	Mirra Zafferano от Dr. Vranjes Firenze — это изысканный Ароматы для дома, который привнесёт в ваши дни сладкие, утончённые и гурманские акценты. \nЭтот аромат раскрывает богатство нот шафрана, ванили и бергамота, подогревая ваше желание к путешествиям и открытиям. Шафран — одна из самых ценных и редких специй в мире, а мирра, почитаемая с древности, придаёт композиции солнечную и соблазнительную индивидуальность. Вместе они создают аромат для тех, кто ценит роскошь и утончённость.	Верхние ноты: элеми, бергамот\nСердце: мирра, ладан, амбра\nБазовые ноты: ваниль, шафран	Гостиная, столовая, кабинет, библиотека, холл, бутик, шоурум, зона приёма гостей, спальня.	2000000038704	2026-01-25 15:19:45.81	2026-01-25 15:30:35.113	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx1ou01dr13y4qxm4x84f	Ароматический диффузор Oud Nobile (Уд благородный) 250 мл, арт. FRV0042C	aromaticheskiy-diffuzor-oud-nobile-ud-blagorodnyy-250-ml-art-frv0042c	Oud Nobile — это воплощение восточной роскоши и силы благородных древесных аккордов. Искрящаяся свежесть бергамота и нероли уступает место глубокому, обволакивающему сердцу уда, мирры и ладана, создавая атмосферу тайны и притяжения. Тёплый шлейф мускуса и ценных пород дерева наполняет пространство ощущением статуса, глубины и чувственной элегантности.	\N	15990.00	\N	\N	250 мл	\N	\N	\N	t	f	6	\N	8 х 8 х 16	00446	FRV0042C	Ароматический диффузор	Oud Nobile — это воплощение восточной роскоши и силы благородных древесных аккордов. Искрящаяся свежесть бергамота и нероли уступает место глубокому, обволакивающему сердцу уда, мирры и ладана, создавая атмосферу тайны и притяжения. Тёплый шлейф мускуса и ценных пород дерева наполняет пространство ощущением статуса, глубины и чувственной элегантности.	Верхние ноты: бергамот, нероли\nСредние ноты: уд, мирра, ладан, амбра, сандал\nБазовые ноты: гваяковое дерево, мускус, нагармота	Гостиная, кабинет, библиотека, офис, холл, бутик, шоурум, сигарная комната, лаунж-зона	2000000004570	2026-01-25 15:19:45.87	2026-01-25 15:30:35.177	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Oud Nobile (Уд благородный) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx1w601e313y4h85xfwt9	Ароматический диффузор Rosa Tabacco (Роза Табак) 250 мл, арт. FRV0074C	aromaticheskiy-diffuzor-rosa-tabacco-roza-tabak-250-ml-art-frv0074c	Rosa Tabacco — изысканный контраст нежной розы и глубокого, тёплого табака, создающий по-настоящему чувственный и смелый Ароматы для дома. Свежие аккорды фиалки и апельсина плавно переходят в роскошное сердце из розы, табака и амбры. Мягкий шлейф ванили, мускуса и сандала окутывает пространство элегантностью и притягательной теплотой.	\N	13090.00	\N	\N	250 мл	\N	\N	\N	t	f	7	\N	8 х 8 х 16	04038	FRV0074C	Ароматический диффузор	Rosa Tabacco — изысканный контраст нежной розы и глубокого, тёплого табака, создающий по-настоящему чувственный и смелый Ароматы для дома. Свежие аккорды фиалки и апельсина плавно переходят в роскошное сердце из розы, табака и амбры. Мягкий шлейф ванили, мускуса и сандала окутывает пространство элегантностью и притягательной теплотой.	Верхние ноты: фиалка, апельсин\nСредние ноты: роза, табак, амбра\nБазовые ноты: ваниль, мускус, сандал	Гостиная, кабинет, спальня, гардеробная, будуар, лаунж-зона, бутик, шоурум, приватный офис	2000000042084	2026-01-25 15:19:46.135	2026-01-25 15:30:35.549	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Rosa Tabacco (Роза Табак) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx1xq01e913y4pve5m281	Ароматический диффузор Rosa Tabacco (Роза Табак) 500 мл, арт. FRV0074D	aromaticheskiy-diffuzor-rosa-tabacco-roza-tabak-500-ml-art-frv0074d	Rosa Tabacco — изысканный контраст нежной розы и глубокого, тёплого табака, создающий по-настоящему чувственный и смелый Ароматы для дома. Свежие аккорды фиалки и апельсина плавно переходят в роскошное сердце из розы, табака и амбры. Мягкий шлейф ванили, мускуса и сандала окутывает пространство элегантностью и притягательной теплотой.	\N	20590.00	\N	\N	500 мл	\N	\N	\N	t	f	9	\N	9,5 х 9,5 х 19,5	04037	FRV0074D	Ароматический диффузор	Rosa Tabacco — изысканный контраст нежной розы и глубокого, тёплого табака, создающий по-настоящему чувственный и смелый Ароматы для дома. Свежие аккорды фиалки и апельсина плавно переходят в роскошное сердце из розы, табака и амбры. Мягкий шлейф ванили, мускуса и сандала окутывает пространство элегантностью и притягательной теплотой.	Верхние ноты: фиалка, апельсин\nСредние ноты: роза, табак, амбра\nБазовые ноты: ваниль, мускус, сандал	Гостиная, кабинет, спальня, гардеробная, будуар, лаунж-зона, бутик, шоурум, приватный офис	2000000042077	2026-01-25 15:19:46.19	2026-01-25 15:30:35.622	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Rosa Tabacco (Роза Табак) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx1zf01ef13y4g5cjjmrv	Ароматический диффузор Rosso Nobile (Красный благородный) 1250 мл, арт. FRV0016K	aromaticheskiy-diffuzor-rosso-nobile-krasnyy-blagorodnyy-1250-ml-art-frv0016k	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	57990.00	\N	\N	250 мл	\N	\N	\N	t	f	4	\N	12,5 х 12,5 х 24,5	00471	FRV0016K	Ароматический диффузор	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Гостиная, столовая, кабинет, библиотека, винная комната, зона отдыха, бутик, переговорная, холл	2000000004822	2026-01-25 15:19:46.251	2026-01-25 15:30:35.685	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Rosso Nobile (Красный благородный) 1250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx22o01er13y4oq1bm235	Ароматический диффузор Rosso Nobile (Красный благородный) 500 мл, арт. FRV0016D	aromaticheskiy-diffuzor-rosso-nobile-krasnyy-blagorodnyy-500-ml-art-frv0016d	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	23790.00	\N	\N	500 мл	\N	\N	\N	t	f	62	\N	9,5 х 9,5 х 19,5	00470	FRV0016D	Ароматический диффузор	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Гостиная, столовая, кабинет, библиотека, винная комната, зона отдыха, бутик, переговорная, холл	2000000004815	2026-01-25 15:19:46.368	2026-01-25 15:30:35.817	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Rosso Nobile (Красный благородный) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx24j01ex13y4012dlxf3	Ароматический диффузор Vaniglia Mandarino (Ваниль и мандарин) 250 мл, арт. FRV0005C	aromaticheskiy-diffuzor-vaniglia-mandarino-vanil-i-mandarin-250-ml-art-frv0005c	Vaniglia Mandarino — нежный и обволакивающий аромат, в котором сладкая ваниль и бобы тонка гармонично сочетаются со свежими, солнечными акцентами мандарина. Эта композиция наполняет пространство теплом, мягкостью и ощущением спокойствия, словно возвращая в беззаботные моменты детства. Лёгкий, уютный и чувственный, аромат дарит ощущение комфорта и душевного равновесия.	\N	13090.00	\N	\N	250 мл	\N	\N	\N	t	f	8	\N	8 х 8 х 16	00462	FRV0005C	Ароматический диффузор	Vaniglia Mandarino — нежный и обволакивающий аромат, в котором сладкая ваниль и бобы тонка гармонично сочетаются со свежими, солнечными акцентами мандарина. Эта композиция наполняет пространство теплом, мягкостью и ощущением спокойствия, словно возвращая в беззаботные моменты детства. Лёгкий, уютный и чувственный, аромат дарит ощущение комфорта и душевного равновесия.	Верхние ноты: мандарин\nСредние ноты: ваниль\nБазовые ноты: бобы тонка	Гостиная, спальня, детская комната, зона отдыха, семейная комната, кабинет, будуар	2000000004730	2026-01-25 15:19:46.435	2026-01-25 15:30:35.883	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Vaniglia Mandarino (Ваниль и мандарин) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx26801f313y460yo8b9v	Ароматический диффузор Vaniglia Mandarino (Ваниль и мандарин) 500 мл, арт. FRV0005D	aromaticheskiy-diffuzor-vaniglia-mandarino-vanil-i-mandarin-500-ml-art-frv0005d	Vaniglia Mandarino — нежный и обволакивающий аромат, в котором сладкая ваниль и бобы тонка гармонично сочетаются со свежими, солнечными акцентами мандарина. Эта композиция наполняет пространство теплом, мягкостью и ощущением спокойствия, словно возвращая в беззаботные моменты детства. Лёгкий, уютный и чувственный, аромат дарит ощущение комфорта и душевного равновесия.	\N	20590.00	\N	\N	500 мл	\N	\N	\N	t	f	4	\N	9,5 х 9,5 х 19,5	00768	FRV0005D	Ароматический диффузор	Vaniglia Mandarino — нежный и обволакивающий аромат, в котором сладкая ваниль и бобы тонка гармонично сочетаются со свежими, солнечными акцентами мандарина. Эта композиция наполняет пространство теплом, мягкостью и ощущением спокойствия, словно возвращая в беззаботные моменты детства. Лёгкий, уютный и чувственный, аромат дарит ощущение комфорта и душевного равновесия.	Верхние ноты: мандарин\nСредние ноты: ваниль\nБазовые ноты: бобы тонка	Гостиная, спальня, детская комната, зона отдыха, семейная комната, кабинет, будуар	2000000007830	2026-01-25 15:19:46.496	2026-01-25 15:30:35.954	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Vaniglia Mandarino (Ваниль и мандарин) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx29p01ff13y4za0vfq5l	Ароматический диффузор Velvet Saffron (Бархатистый шафран) 500 мл, арт. frv0076mnnee	aromaticheskiy-diffuzor-velvet-saffron-barhatistyy-shafran-500-ml-art-frv0076mnnee	Velvet Saffron — изысканный аромат, где тепло шафрана встречается с уютом пачули, а пряный кардамон добавляет характер и динамику. Сердце композиции раскрывается фиалкой и ветивером, создавая глубину и многогранность, словно мягкий шелковый шёпот Флоренции. Этот парфюм наполняет пространство роскошью, утонченностью и чувственной атмосферой.	\N	23790.00	\N	\N	500 мл	\N	\N	\N	t	f	2	\N	9,5 х 9,5 х 19,5	05635	frv0076mnnee	Ароматический диффузор	Velvet Saffron — изысканный аромат, где тепло шафрана встречается с уютом пачули, а пряный кардамон добавляет характер и динамику. Сердце композиции раскрывается фиалкой и ветивером, создавая глубину и многогранность, словно мягкий шелковый шёпот Флоренции. Этот парфюм наполняет пространство роскошью, утонченностью и чувственной атмосферой.	Верхние ноты: кардамон\nСредние ноты: шафран, фиалка, ветивер\nБазовые ноты: пачули, бобы тонка	Гостиная, кабинет, спальня, лаунж-зона, библиотека, бутик, уютные уголки для отдыха	2000000058672	2026-01-25 15:19:46.622	2026-01-25 15:30:36.097	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Velvet Saffron (Бархатистый шафран) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx2be01fl13y4rstrxo5l	Набор для автомобиля. Диспенсер карбон + два сменных аромата ROSSO NOBILE и AMBRA, размеры 16,5 х 8 х 10 см, арт. GFT0095BABLE2	nabor-dlya-avtomobilya-dispenser-karbon-dva-smennyh-aromata-rosso-nobile-i-ambra-razmery-165-h-8-h-10-sm-art-gft0095bable2	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	17490.00	\N	\N	\N	\N	\N	\N	t	f	7	\N	16,5 х 8 х 10	05339	GFT0095BABLE2	Аромат для автомобиля	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Автомобиль	8053178090085	2026-01-25 15:19:46.682	2026-01-25 15:30:36.162	cmhz85ach006oupvs06ykeee8	Италия	Италия	Набор для автомобиля. Диспенсер карбон + два сменных аромата ROSSO NOBILE и AMBRA	Установите клипсу, подходящую для вентиляционной решетки автомобиля, и прикрепите её на заднюю часть устройства. Поверните восьмиугольное\nкольцо против часовой стрелки, чтобы открыть Carparfum. Вставьте ароматическую заправку, разместив логотип внизу.\nЗакрытие: Закройте устройство, повернув кольцо по часовой стрелке до щелчка.\nУстановка: Прикрепите Carparfum к вентиляционной решетке автомобиля.\nРегулировка интенсивности: Регулируйте уровень интенсивности аромата, опуская или поднимая боковой рычажок, по окончании поезки его выключайте.	1
cmktvx2e301fr13y4pgoj9l51	Набор для автомобиля. Диспенсер карбон + два сменных аромата ROSSO NOBILE и ROSA TABACCO, размеры 16,5 х 8 х 10 см, арт. GFT0092BABLE2	nabor-dlya-avtomobilya-dispenser-karbon-dva-smennyh-aromata-rosso-nobile-i-rosa-tabacco-razmery-165-h-8-h-10-sm-art-gft0092bable2	Подарите своему автомобилю характер итальянской виллы. Rosso Nobile — это сама душа Тосканы в благородном аккорде красного вина, ягод и тёплого дерева, что мгновенно переносит вас в умиротворённые холмы Кьянти. А Rosa Tabacco раскрывается смелым и чувственным диалогом нежнейшей розы, бархатистого табака и амбры, оставляя за собой шлейф невероятной элегантности и тепла. Два культовых аромата, легко сменяемые в стильном диспенсере под карбон, — для тех, кто выбирает путешествие в итальянском стиле.	\N	17490.00	\N	\N	\N	\N	\N	\N	t	f	23	\N	16,5 х 8 х 10	05376	GFT0092BABLE2	Аромат для автомобиля	Подарите своему автомобилю характер итальянской виллы. Rosso Nobile — это сама душа Тосканы в благородном аккорде красного вина, ягод и тёплого дерева, что мгновенно переносит вас в умиротворённые холмы Кьянти. А Rosa Tabacco раскрывается смелым и чувственным диалогом нежнейшей розы, бархатистого табака и амбры, оставляя за собой шлейф невероятной элегантности и тепла. Два культовых аромата, легко сменяемые в стильном диспенсере под карбон, — для тех, кто выбирает путешествие в итальянском стиле.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Автомобиль	8056860398346	2026-01-25 15:19:46.78	2026-01-25 15:30:36.267	cmhz85ach006oupvs06ykeee8	Италия	Италия	Набор для автомобиля. Диспенсер карбон + два сменных аромата ROSSO NOBILE и ROSA TABACCO	Установите клипсу, подходящую для вентиляционной решетки автомобиля, и прикрепите её на заднюю часть устройства. Поверните восьмиугольное\nкольцо против часовой стрелки, чтобы открыть Carparfum. Вставьте ароматическую заправку, разместив логотип внизу.\nЗакрытие: Закройте устройство, повернув кольцо по часовой стрелке до щелчка.\nУстановка: Прикрепите Carparfum к вентиляционной решетке автомобиля.\nРегулировка интенсивности: Регулируйте уровень интенсивности аромата, опуская или поднимая боковой рычажок, по окончании поезки его выключайте.	1
cmktvx2j301g113y47xien3d5	Палочки бамбуковые белые 250 мл Dr Vranjes, арт. PFRS0052	palochki-bambukovye-belye-250-ml-dr-vranjes-art-pfrs0052	\N	\N	790.00	\N	\N	250 мл	\N	\N	\N	t	f	98	\N	\N	02101	PFRS0052	\N	\N	\N	\N	2000000021874	2026-01-25 15:19:46.959	2026-01-25 15:30:36.505	cmhz85ach006oupvs06ykeee8	Италия	Италия	Палочки бамбуковые белые 250 мл Dr Vranjes	Вставьте палочки в диффузор с ароматической жидкостью, через час переверните для равномерного раскрытия аромата — и наслаждайтесь его нежным распространением по всему помещению. Для более насыщенного эффекта переворачивайте палочки регулярно.	1
cmktvx2rt01gp13y4vkbpubtg	Подарочный набор Leather Oud (Кожа и Уд) диффузор 250 мл + сменный аромат 150 мл, арт. GFT0075BFCSE1	podarochnyy-nabor-leather-oud-kozha-i-ud-diffuzor-250-ml-smennyy-aromat-150-ml-art-gft0075bfcse1	Leather Oud — это интерьерный аромат с яркой, роскошной индивидуальностью: экзотичный, глубокий и обволакивающий.\nДрагоценная и смелая композиция раскрывается нотами розы и герани, в сердце звучит тосканская кожа в союзе с ближневосточным удом, а в шлейфе — сандал, мускус и ваниль.	\N	16490.00	\N	\N	400 мл	\N	\N	\N	t	f	9	\N	18 х 18 х 10,5	05851	GFT0075BFCSE1	Подарочный набор	Leather Oud — это интерьерный аромат с яркой, роскошной индивидуальностью: экзотичный, глубокий и обволакивающий.\nДрагоценная и смелая композиция раскрывается нотами розы и герани, в сердце звучит тосканская кожа в союзе с ближневосточным удом, а в шлейфе — сандал, мускус и ваниль.	Верхние ноты: Элеми, герань, роза, ландыш\nСредние ноты: Уд, кожа, ладан, пачули, амбра\nБазовые ноты: Черное дерево, сандал, мускус, ваниль	Гостиная, Кабинет, Офис, Библиотека, Прихожая, Бутик, Шоурум, Переговорная	2000000060989	2026-01-25 15:19:47.273	2026-01-25 15:30:36.81	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Leather Oud (Кожа и Уд) диффузор 250 мл + сменный аромат 150 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx2tk01gv13y43u31pu7w	Подарочный набор Melograno (Гранат) диффузор 100 мл + сменный аромат 150 мл, арт. GFT0009BCCSE1	podarochnyy-nabor-melograno-granat-diffuzor-100-ml-smennyy-aromat-150-ml-art-gft0009bccse1	Яркий и многогранный, Melograno от Dr. Vranjes Firenze раскрывает неожиданную сторону граната — свежую, сочную и элегантную. Арбуз и бергамот придают аромату лёгкость, а жасмин и роза наполняют его утончённой цветочной глубиной. Финальные ноты чёрной смородины и красного винограда оставляют благородный, живой шлейф, к которому хочется возвращаться.	\N	11330.00	\N	\N	250 мл	\N	\N	\N	t	f	24	\N	18 х 17,5 х 10,3	05326	GFT0009BCCSE1	Подарочный набор	Яркий и многогранный, Melograno от Dr. Vranjes Firenze раскрывает неожиданную сторону граната — свежую, сочную и элегантную. Арбуз и бергамот придают аромату лёгкость, а жасмин и роза наполняют его утончённой цветочной глубиной. Финальные ноты чёрной смородины и красного винограда оставляют благородный, живой шлейф, к которому хочется возвращаться.	Верхние ноты: арбуз\nСредние ноты: жасмин, роза, бергамот\nБазовые ноты: чёрная смородина, красный виноград	Гостиная, столовая, кухня, прихожая, офис, переговорная, бутик, салон красоты	8056860397479	2026-01-25 15:19:47.337	2026-01-25 15:30:36.867	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Melograno (Гранат) диффузор 100 мл + сменный аромат 150 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx2ua01h113y4mv1uhzt5	Подарочный набор Melograno (Гранат) диффузор 250 мл + сменный аромат 150 мл, арт. GFT0009BFCSE1	podarochnyy-nabor-melograno-granat-diffuzor-250-ml-smennyy-aromat-150-ml-art-gft0009bfcse1	Яркий и многогранный, Melograno от Dr. Vranjes Firenze раскрывает неожиданную сторону граната — свежую, сочную и элегантную. Арбуз и бергамот придают аромату лёгкость, а жасмин и роза наполняют его утончённой цветочной глубиной. Финальные ноты чёрной смородины и красного винограда оставляют благородный, живой шлейф, к которому хочется возвращаться.	\N	15290.00	\N	\N	400 мл	\N	\N	\N	t	f	12	\N	18 х 18 х 10,5	05330	GFT0009BFCSE1	Подарочный набор	Яркий и многогранный, Melograno от Dr. Vranjes Firenze раскрывает неожиданную сторону граната — свежую, сочную и элегантную. Арбуз и бергамот придают аромату лёгкость, а жасмин и роза наполняют его утончённой цветочной глубиной. Финальные ноты чёрной смородины и красного винограда оставляют благородный, живой шлейф, к которому хочется возвращаться.	Верхние ноты: арбуз\nСредние ноты: жасмин, роза, бергамот\nБазовые ноты: чёрная смородина, красный виноград	Гостиная, столовая, кухня, прихожая, офис, переговорная, бутик, салон красоты	8056860397516	2026-01-25 15:19:47.363	2026-01-25 15:30:36.89	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Melograno (Гранат) диффузор 250 мл + сменный аромат 150 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx2yq01hd13y4p9pkmd74	Подарочный набор Oud nobile (Уд благородный) диффузор 250 мл + сменный аромат 150 мл, арт. GFT0042BFCSE1	podarochnyy-nabor-oud-nobile-ud-blagorodnyy-diffuzor-250-ml-smennyy-aromat-150-ml-art-gft0042bfcse1	Oud Nobile — это воплощение восточной роскоши и силы благородных древесных аккордов. Искрящаяся свежесть бергамота и нероли уступает место глубокому, обволакивающему сердцу уда, мирры и ладана, создавая атмосферу тайны и притяжения. Тёплый шлейф мускуса и ценных пород дерева наполняет пространство ощущением статуса, глубины и чувственной элегантности.	\N	16490.00	\N	\N	400 мл	\N	\N	\N	t	f	27	\N	18 х 18 х 10,5	05331	GFT0042BFCSE1	Подарочный набор	Oud Nobile — это воплощение восточной роскоши и силы благородных древесных аккордов. Искрящаяся свежесть бергамота и нероли уступает место глубокому, обволакивающему сердцу уда, мирры и ладана, создавая атмосферу тайны и притяжения. Тёплый шлейф мускуса и ценных пород дерева наполняет пространство ощущением статуса, глубины и чувственной элегантности.	Верхние ноты: бергамот, нероли\nСредние ноты: уд, мирра, ладан, амбра, сандал\nБазовые ноты: гваяковое дерево, мускус, нагармота	Гостиная, кабинет, библиотека, офис, холл, бутик, шоурум, сигарная комната, лаунж-зона	8056860397677	2026-01-25 15:19:47.522	2026-01-25 15:30:37.014	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Oud nobile (Уд благородный) диффузор 250 мл + сменный аромат 150 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx30e01hj13y4w8joq6k3	Подарочный набор Rosa Tabacco (Роза и табак)  диффузор 250 мл и свеча 200 гр, Размеры 23 х 18 х 13,5 см, арт. GFT0074BYCSE1	podarochnyy-nabor-rosa-tabacco-roza-i-tabak-diffuzor-250-ml-i-svecha-200-gr-razmery-23-h-18-h-135-sm-art-gft0074bycse1	Rosa Tabacco — изысканный контраст нежной розы и глубокого, тёплого табака, создающий по-настоящему чувственный и смелый Ароматы для дома. Свежие аккорды фиалки и апельсина плавно переходят в роскошное сердце из розы, табака и амбры. Мягкий шлейф ванили, мускуса и сандала окутывает пространство элегантностью и притягательной теплотой.	\N	23110.00	\N	\N	250 мл	\N	\N	\N	t	f	9	200.00	23 х 18 х 13,5	05336	GFT0074BYCSE1	Подарочный набор	Rosa Tabacco — изысканный контраст нежной розы и глубокого, тёплого табака, создающий по-настоящему чувственный и смелый Ароматы для дома. Свежие аккорды фиалки и апельсина плавно переходят в роскошное сердце из розы, табака и амбры. Мягкий шлейф ванили, мускуса и сандала окутывает пространство элегантностью и притягательной теплотой.	Верхние ноты: фиалка, апельсин\nСредние ноты: роза, табак, амбра\nБазовые ноты: ваниль, мускус, сандал	Гостиная, кабинет, спальня, гардеробная, будуар, лаунж-зона, бутик, шоурум, приватный офис	8056860397592	2026-01-25 15:19:47.582	2026-01-25 15:30:37.073	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Rosa Tabacco (Роза и табак) диффузор 250 мл и свеча 200 гр	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При первом использовании обязательно дайте воску растаять по всей поверхности, чтобы предотвратить образование «туннеля« при следующем использовании. Перед каждым использованием подрезайте фитили свечи на 5 миллиметров в высоту. Не допускайте горение свечи более 2-3 часов подряд. Когда свеча будет израсходована, тщательно вымойте подсвечник, удалив остатки воска и отдушек.	2
cmktvx31101hp13y4v70kxzfw	Подарочный набор Rosa Tabacco (Роза и табак) диффузор 250 мл и свеча 80 гр, (Золотая и синяя коробка) арт. GFT0074BHBOE2	podarochnyy-nabor-rosa-tabacco-roza-i-tabak-diffuzor-250-ml-i-svecha-80-gr-zolotaya-i-sinyaya-korobka-art-gft0074bhboe2	Rosa Tabacco — изысканный контраст нежной розы и глубокого, тёплого табака, создающий по-настоящему чувственный и смелый Ароматы для дома. Свежие аккорды фиалки и апельсина плавно переходят в роскошное сердце из розы, табака и амбры. Мягкий шлейф ванили, мускуса и сандала окутывает пространство элегантностью и притягательной теплотой.	\N	14210.00	\N	\N	250 мл	\N	\N	\N	t	f	1	80.00	18 x 10,5 x 18	05347	GFT0074BHBOE2	Подарочный набор	Rosa Tabacco — изысканный контраст нежной розы и глубокого, тёплого табака, создающий по-настоящему чувственный и смелый Ароматы для дома. Свежие аккорды фиалки и апельсина плавно переходят в роскошное сердце из розы, табака и амбры. Мягкий шлейф ванили, мускуса и сандала окутывает пространство элегантностью и притягательной теплотой.	Верхние ноты: фиалка, апельсин\nСредние ноты: роза, табак, амбра\nБазовые ноты: ваниль, мускус, сандал	Гостиная, кабинет, спальня, гардеробная, будуар, лаунж-зона, бутик, шоурум, приватный офис	8053178090306	2026-01-25 15:19:47.605	2026-01-25 15:30:37.09	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Rosa Tabacco (Роза и табак) диффузор 250 мл и свеча 80 гр	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При первом использовании обязательно дайте воску растаять по всей поверхности, чтобы предотвратить образование «туннеля« при следующем использовании. Перед каждым использованием подрезайте фитили свечи на 5 миллиметров в высоту. Не допускайте горение свечи более 2-3 часов подряд. Когда свеча будет израсходована, тщательно вымойте подсвечник, удалив остатки воска и отдушек.	2
cmktvx4pu01nj13y48s98fa89	Сменный блок Milano (Милан) для автомобиля, арт. CRP005499BLE1	smennyy-blok-milano-milan-dlya-avtomobilya-art-crp005499ble1	Milano — это аромат с характером большого города: насыщенный, элегантный и чувственный. Пряные и древесные ноты переплетаются с апельсиновым цветом и тёплой ванилью, создавая атмосферу утончённой роскоши и внутренней силы. Он наполняет пространство глубиной и стилем, словно вечерняя прогулка по Милану — между модой, искусством и страстью.	\N	5890.00	\N	\N	\N	\N	\N	\N	t	f	3	\N	5 x 5 x 1,5	04305	CRP005499BLE1	Аромат для автомобиля	Milano — это аромат с характером большого города: насыщенный, элегантный и чувственный. Пряные и древесные ноты переплетаются с апельсиновым цветом и тёплой ванилью, создавая атмосферу утончённой роскоши и внутренней силы. Он наполняет пространство глубиной и стилем, словно вечерняя прогулка по Милану — между модой, искусством и страстью.	Верхние ноты: пачули, перец, сандаловое дерево.\nСредние ноты: апельсиновый цвет, кориандр, мускатный орех.\nБазовые ноты: кедр, кипарис, звездчатый анис, амбра, ваниль	Автомобиль	8056860398278	2026-01-25 15:19:49.794	2026-01-25 15:30:39.378	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный блок Milano (Милан) для автомобиля	Установите клипсу, подходящую для вентиляционной решетки автомобиля, и прикрепите её на заднюю часть устройства. Поверните восьмиугольное\nкольцо против часовой стрелки, чтобы открыть Carparfum. Вставьте ароматическую заправку, разместив логотип внизу.\nЗакрытие: Закройте устройство, повернув кольцо по часовой стрелке до щелчка.\nУстановка: Прикрепите Carparfum к вентиляционной решетке автомобиля.\nРегулировка интенсивности: Регулируйте уровень интенсивности аромата, опуская или поднимая боковой рычажок, по окончании поезки его выключайте.	1
cmktvx37z01i113y4ih1yb2gd	Подарочный набор Rosso Nobile (Красный благородный) Диффузор 250 мл Зеленая коробка, арт. GFT0X16MLGRE1	podarochnyy-nabor-rosso-nobile-krasnyy-blagorodnyy-diffuzor-250-ml-zelenaya-korobka-art-gft0x16mlgre1	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	14390.00	\N	\N	250 мл	\N	\N	\N	t	f	14	\N	11 x 11 x 18	05856	GFT0X16MLGRE1	Подарочный набор	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Гостиная, столовая, кабинет, библиотека, винная комната, зона отдыха, бутик, переговорная, холл	2000000061030	2026-01-25 15:19:47.855	2026-01-25 15:30:37.38	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Rosso Nobile (Красный благородный) Диффузор 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx38l01i713y4udbad3ih	Подарочный набор Rosso nobile (Красный благородный) диффузор 250 мл и сменный аромат 150 мл, арт. GFT0016BFCSE2	podarochnyy-nabor-rosso-nobile-krasnyy-blagorodnyy-diffuzor-250-ml-i-smennyy-aromat-150-ml-art-gft0016bfcse2	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	16490.00	\N	\N	400 мл	\N	\N	\N	t	f	10	\N	18 х 18 х 10,5	05852	GFT0016BFCSE2	Подарочный набор	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Гостиная, столовая, кабинет, библиотека, винная комната, зона отдыха, бутик, переговорная, холл	2000000060996	2026-01-25 15:19:47.878	2026-01-25 15:30:37.405	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Rosso nobile (Красный благородный) диффузор 250 мл и сменный аромат 150 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx3a501id13y4fnu3vjsp	Подарочный набор Rosso nobile (Красный благородный) диффузор 250 мл + свеча 80 гр,  Синяя коробка, арт. GFT0X16BHBUE2	podarochnyy-nabor-rosso-nobile-krasnyy-blagorodnyy-diffuzor-250-ml-svecha-80-gr-sinyaya-korobka-art-gft0x16bhbue2	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	16460.00	\N	\N	250 мл	\N	\N	\N	t	f	9	80.00	18 x 10,5 x 18	05858	GFT0X16BHBUE2	Подарочный набор	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Гостиная, столовая, кабинет, библиотека, винная комната, зона отдыха, бутик, переговорная, холл	2000000061054	2026-01-25 15:19:47.933	2026-01-25 15:30:37.493	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Rosso nobile (Красный благородный) диффузор 250 мл + свеча 80 гр	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При первом использовании обязательно дайте воску растаять по всей поверхности, чтобы предотвратить образование «туннеля« при следующем использовании. Перед каждым использованием подрезайте фитили свечи на 5 миллиметров в высоту. Не допускайте горение свечи более 2-3 часов подряд. Когда свеча будет израсходована, тщательно вымойте подсвечник, удалив остатки воска и отдушек.	2
cmktvx3aq01ij13y4p205utkj	Подарочный набор Rosso Nobile (Красный благородный) диффузор 500 мл, Красная коробка Белые полосы, арт. GFT0X16MNRSE1	podarochnyy-nabor-rosso-nobile-krasnyy-blagorodnyy-diffuzor-500-ml-krasnaya-korobka-belye-polosy-art-gft0x16mnrse1	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	21410.00	\N	\N	500 мл	\N	\N	\N	t	f	31	\N	14 x 14 x 22,5	05857	GFT0X16MNRSE1	Подарочный набор	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Гостиная, столовая, кабинет, библиотека, винная комната, зона отдыха, бутик, переговорная, холл	2000000061047	2026-01-25 15:19:47.955	2026-01-25 15:30:37.513	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Rosso Nobile (Красный благородный) диффузор 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx3dy01iv13y4zxb4u45i	Подарочный набор Rosso Nobile (Красный благородный) диффузор 500 мл + сменный аромат 500 мл, арт. GFT0016BJCSE2	podarochnyy-nabor-rosso-nobile-krasnyy-blagorodnyy-diffuzor-500-ml-smennyy-aromat-500-ml-art-gft0016bjcse2	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	37970.00	\N	\N	1000 мл	\N	\N	\N	t	f	10	\N	26 х 23 х 16	05853	GFT0016BJCSE2	Подарочный набор	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Гостиная, столовая, кабинет, библиотека, винная комната, зона отдыха, бутик, переговорная, холл	2000000061009	2026-01-25 15:19:48.07	2026-01-25 15:30:37.628	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Rosso Nobile (Красный благородный) диффузор 500 мл + сменный аромат 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx3hj01j113y4ga2i20dc	Подарочный набор Rosso nobile (Красный благородный) диффузор 250 мл + свеча 200 гр, Размеры 23 х 18 х 13,5 см, арт. GFT0016BYCSE1	podarochnyy-nabor-rosso-nobile-krasnyy-blagorodnyy-diffuzor-250-ml-svecha-200-gr-razmery-23-h-18-h-135-sm-art-gft0016bycse1	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	26990.00	\N	\N	250 мл	\N	\N	\N	t	f	6	200.00	23 х 18 х 13,5	05338	GFT0016BYCSE1	Подарочный набор	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Гостиная, столовая, кабинет, библиотека, винная комната, зона отдыха, бутик, переговорная, холл	8056860397790	2026-01-25 15:19:48.199	2026-01-25 15:30:37.804	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Rosso nobile (Красный благородный) диффузор 250 мл + свеча 200 гр	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При первом использовании обязательно дайте воску растаять по всей поверхности, чтобы предотвратить образование «туннеля« при следующем использовании. Перед каждым использованием подрезайте фитили свечи на 5 миллиметров в высоту. Не допускайте горение свечи более 2-3 часов подряд. Когда свеча будет израсходована, тщательно вымойте подсвечник, удалив остатки воска и отдушек.	2
cmktvx3k101j713y40z2lwle4	Подарочный набор Rosso Nobile (Красный благородный) диффузор 100 мл + сменный аромат 150 мл, арт. GFT0016BCCSE1	podarochnyy-nabor-rosso-nobile-krasnyy-blagorodnyy-diffuzor-100-ml-smennyy-aromat-150-ml-art-gft0016bccse1	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	14790.00	\N	\N	250 мл	\N	\N	\N	t	f	20	\N	18 х 17,5 х 10,3	05327	GFT0016BCCSE1	Подарочный набор	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Гостиная, столовая, кабинет, библиотека, винная комната, зона отдыха, бутик, переговорная, холл	8056860397462	2026-01-25 15:19:48.289	2026-01-25 15:30:37.903	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Rosso Nobile (Красный благородный) диффузор 100 мл + сменный аромат 150 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx3lk01jd13y4shunzufr	Подарочный набор Rosso nobile (Красный благородный) диффузор 250 мл + сменный аромат 150 мл, арт. GFT0016BFCSE1	podarochnyy-nabor-rosso-nobile-krasnyy-blagorodnyy-diffuzor-250-ml-smennyy-aromat-150-ml-art-gft0016bfcse1	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	16490.00	\N	\N	400 мл	\N	\N	\N	t	f	8	\N	18 х 18 х 10,5	05332	GFT0016BFCSE1	Подарочный набор	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Гостиная, столовая, кабинет, библиотека, винная комната, зона отдыха, бутик, переговорная, холл	2000000055442	2026-01-25 15:19:48.344	2026-01-25 15:30:37.976	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Rosso nobile (Красный благородный) диффузор 250 мл + сменный аромат 150 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx3o801jp13y425kly5yu	Подарочный набор Leather Oud (Кожа и Уд) диффузор 500 мл (Золотая и синяя коробка), арт. GFT0075MNBOE1	podarochnyy-nabor-leather-oud-kozha-i-ud-diffuzor-500-ml-zolotaya-i-sinyaya-korobka-art-gft0075mnboe1	Leather Oud — это интерьерный аромат с яркой, роскошной индивидуальностью: экзотичный, глубокий и обволакивающий.\nДрагоценная и смелая композиция раскрывается нотами розы и герани, в сердце звучит тосканская кожа в союзе с ближневосточным удом, а в шлейфе — сандал, мускус и ваниль.	\N	21410.00	\N	\N	500 мл	\N	\N	\N	t	f	1	\N	14 x 14 x 22,5	05345	GFT0075MNBOE1	Подарочный набор	Leather Oud — это интерьерный аромат с яркой, роскошной индивидуальностью: экзотичный, глубокий и обволакивающий.\nДрагоценная и смелая композиция раскрывается нотами розы и герани, в сердце звучит тосканская кожа в союзе с ближневосточным удом, а в шлейфе — сандал, мускус и ваниль.	Верхние ноты: Элеми, герань, роза, ландыш\nСредние ноты: Уд, кожа, ладан, пачули, амбра\nБазовые ноты: Черное дерево, сандал, мускус, ваниль	Гостиная, Кабинет, Офис, Библиотека, Прихожая, Бутик, Шоурум, Переговорная	8053178090368	2026-01-25 15:19:48.441	2026-01-25 15:30:38.068	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Leather Oud (Кожа и Уд) диффузор 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx3or01jv13y4pol0b4ly	Подарочный набор Rosso Nobile (Красный благородный) Декантер 750 мл (красная коробка) Размер 38 х 34 х 19 см арт. FRV0D16MPRSE1	podarochnyy-nabor-rosso-nobile-krasnyy-blagorodnyy-dekanter-750-ml-krasnaya-korobka-razmer-38-h-34-h-19-sm-art-frv0d16mprse1	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	53990.00	\N	\N	750 мл	\N	\N	\N	t	f	3	\N	38 х 34 х 19	05341	FRV0D16MPRSE1	Подарочный набор	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Гостиная, столовая, кабинет, библиотека, винная комната, зона отдыха, бутик, переговорная, холл	2000000055558	2026-01-25 15:19:48.46	2026-01-25 15:30:38.084	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Rosso Nobile (Красный благородный) Декантер 750 мл	Установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx3ug01kd13y41zve350l	Сменный аромат Ambra (Амбра) 500 мл, арт. FRV0012E	smennyy-aromat-ambra-ambra-500-ml-art-frv0012e	Ароматы для дома Ambra обладает загадочной, сладкой и чувственной индивидуальностью.\nОн перенесет вас в мир интенсивных нот амбры, цветов ириса, герани, лабданума и пачули, завершая композицию аккордами благородных пород древесины и мадагаскарской ванили. Представьте себя окруженным редкими ароматами, хранящимися в элегантных бутылочках самых необычных форм, утопающим в роскошных тканях и любимых пряностях.	\N	14590.00	\N	\N	500 мл	\N	\N	\N	t	f	4	\N	7 х 7 х 20,5	05367	FRV0012E	Сменный аромат	Ароматы для дома Ambra обладает загадочной, сладкой и чувственной индивидуальностью.\nОн перенесет вас в мир интенсивных нот амбры, цветов ириса, герани, лабданума и пачули, завершая композицию аккордами благородных пород древесины и мадагаскарской ванили. Представьте себя окруженным редкими ароматами, хранящимися в элегантных бутылочках самых необычных форм, утопающим в роскошных тканях и любимых пряностях.	Верхние ноты: цветы ириса, герань\nСредние ноты: амбра, лабданум, пачули, рокроз\nБазовые ноты: сандаловое дерево, ваниль, кедровое дерево	Классическая гостиная	2000000055831	2026-01-25 15:19:48.664	2026-01-25 15:30:38.342	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Ambra (Амбра) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx3y901kp13y4ycxc4anw	Сменный аромат Bellini (Беллини) 500 мл, арт. FRV0059E	smennyy-aromat-bellini-bellini-500-ml-art-frv0059e	Bellini — аромат, вдохновлённый легендарным венецианским коктейлем, лёгкий, солнечный и по-итальянски жизнерадостный. Свежесть бергамота и белого винограда мягко переходит в сочную ноту спелого персика, окружённого цветочными и цитрусовыми акцентами. Тёплый шлейф амбры, кедра и ветивера наполняет пространство ощущением праздника и dolce vita.	\N	17990.00	\N	\N	500 мл	\N	\N	\N	t	f	7	\N	7 х 7 х 20,5	00460	FRV0059E	Сменный аромат	Bellini — аромат, вдохновлённый легендарным венецианским коктейлем, лёгкий, солнечный и по-итальянски жизнерадостный. Свежесть бергамота и белого винограда мягко переходит в сочную ноту спелого персика, окружённого цветочными и цитрусовыми акцентами. Тёплый шлейф амбры, кедра и ветивера наполняет пространство ощущением праздника и dolce vita.	Верхние ноты: бергамот, ландыш, белый виноград\nСердце: персик\nБазовые ноты: литсея кубеба, ветивер, имбирь	Гостиная, столовая, кухня, прихожая, спальня, бутик, зоны отдыха, отели и апартаменты для приёма гостей	2000000004716	2026-01-25 15:19:48.802	2026-01-25 15:30:38.462	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Bellini (Беллини) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx41501l113y4rok3go9x	Сменный аромат Giglio di Firenze (Лилия Флоренции) 500 мл, арт. FRV0068E	smennyy-aromat-giglio-di-firenze-liliya-florentsii-500-ml-art-frv0068e	Giglio di Firenze — это шедевр, созданный для тех, кто ценит гармонию и баланс. Этот утончённый и взрослый аромат раскрывается в вашем доме, мгновенно преображая пространство, наполняя его теплом, уютом и изысканностью.	\N	14590.00	\N	\N	500 мл	\N	\N	\N	t	f	5	\N	7 х 7 х 20,5	01691	FRV0068E	Сменный аромат	Giglio di Firenze — это шедевр, созданный для тех, кто ценит гармонию и баланс. Этот утончённый и взрослый аромат раскрывается в вашем доме, мгновенно преображая пространство, наполняя его теплом, уютом и изысканностью.	Верхние ноты: бергамот, кардамон, лаванда\nСредние ноты: ирис, герань, лабданум\nБазовые ноты: кедровое дерево, пачули, мускатный орех	Гостиная, спальнная и ванная комнаты	2000000017525	2026-01-25 15:19:48.905	2026-01-25 15:30:38.548	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Giglio di Firenze (Лилия Флоренции) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx42m01l713y463ozy24r	Сменный аромат Ginger Lime (Имбирь и лайм) 500 мл, арт. FRV0014E	smennyy-aromat-ginger-lime-imbir-i-laym-500-ml-art-frv0014e	Ginger Lime — яркий и экзотичный аромат, наполненный солнечной энергией и ощущением движения. Взрывная свежесть лайма и лимона встречается с пряным имбирём и белым перцем, создавая динамичную, бодрящую композицию. Благородные древесные ноты придают аромату глубину и делают его по-настоящему выразительным.	\N	14590.00	\N	\N	500 мл	\N	\N	\N	t	f	3	\N	7 х 7 х 20,5	00481	FRV0014E	Сменный аромат	Ginger Lime — яркий и экзотичный аромат, наполненный солнечной энергией и ощущением движения. Взрывная свежесть лайма и лимона встречается с пряным имбирём и белым перцем, создавая динамичную, бодрящую композицию. Благородные древесные ноты придают аромату глубину и делают его по-настоящему выразительным.	Верхние ноты: лайм, лимон\nСредние ноты: имбирь, ветивер\nБазовые ноты: белый перец, древесина эбена и гваякового дерева	Гостиная, кухня, прихожая, рабочий кабинет, офис, фитнес-зоны, бутики, общественные пространства с активной атмосферой	2000000004921	2026-01-25 15:19:48.958	2026-01-25 15:30:38.628	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Ginger e Lime (Имбирь и лайм) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx47c01lp13y41zlebhlk	Сменный аромат Magnolia Orchidea (Магнолия Орхидея ) 500 мл, арт. FRV0006E	smennyy-aromat-magnolia-orchidea-magnoliya-orhideya-500-ml-art-frv0006e	Magnolia Orchidea — утончённый цветочный аромат, в котором магнолия и орхидея сплетаются в нежную и чувственную симфонию. Он наполняет пространство мягким светом, романтикой и ощущением спокойной элегантности. Этот аромат словно тихая история о встрече цветов, созданная для моментов гармонии и внутреннего равновесия.	\N	14590.00	\N	\N	500 мл	\N	\N	\N	t	f	2	\N	7 х 7 х 20,5	01469	FRV0006E	Сменный аромат	Magnolia Orchidea — утончённый цветочный аромат, в котором магнолия и орхидея сплетаются в нежную и чувственную симфонию. Он наполняет пространство мягким светом, романтикой и ощущением спокойной элегантности. Этот аромат словно тихая история о встрече цветов, созданная для моментов гармонии и внутреннего равновесия.	Верхние ноты: магнолия, орхидея, мимоза, ландыш\nСердце: засахаренный апельсин, нероли\nБаза: иланг-иланг, плющ	Спальня, гостиная, будуар, ванная комната, зона отдыха, салон красоты, спальня-сьют, уютный кабинет	2000000015187	2026-01-25 15:19:49.128	2026-01-25 15:30:38.815	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Magnolia Orchidea (Магнолия Орхидея ) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx4ab01m113y4v75ddjip	Сменный аромат Melograno Menta (Гранат и мята) 500 мл, арт. FRV0022E	smennyy-aromat-melograno-menta-granat-i-myata-500-ml-art-frv0022e	Melograno e Menta — это взрыв свежести и солнечной энергии, где сочный гранат и прохладная мята создают яркий и жизнерадостный аккорд. Фруктовые ноты дыни, красной смородины и дикого винограда наполняют аромат легкостью и естественной сладостью. Освежающий и гармоничный, он мгновенно пробуждает чувства и создает ощущение чистоты и комфорта.	\N	14590.00	\N	\N	500 мл	\N	\N	\N	t	f	9	\N	7 х 7 х 20,5	00482	FRV0022E	Сменный аромат	Melograno e Menta — это взрыв свежести и солнечной энергии, где сочный гранат и прохладная мята создают яркий и жизнерадостный аккорд. Фруктовые ноты дыни, красной смородины и дикого винограда наполняют аромат легкостью и естественной сладостью. Освежающий и гармоничный, он мгновенно пробуждает чувства и создает ощущение чистоты и комфорта.	Верхние ноты: дыня\nСредние ноты: черная смородина, красный виноград\nБазовые ноты: дикая мята	Кухня, гостиная, прихожая, ванная комната, столовая, офис, фитнес-зона, спа-пространство	2000000004938	2026-01-25 15:19:49.235	2026-01-25 15:30:38.928	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Melograno Menta (Гранат и мята) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx4co01md13y41k9s3g90	Сменный аромат Milano (Милан) 500 мл, арт. FRV0054E	smennyy-aromat-milano-milan-500-ml-art-frv0054e	Milano — это аромат с характером большого города: насыщенный, элегантный и чувственный. Пряные и древесные ноты переплетаются с апельсиновым цветом и тёплой ванилью, создавая атмосферу утончённой роскоши и внутренней силы. Он наполняет пространство глубиной и стилем, словно вечерняя прогулка по Милану — между модой, искусством и страстью.	\N	17990.00	\N	\N	500 мл	\N	\N	\N	t	f	6	\N	7 х 7 х 20,5	03417	FRV0054E	Сменный аромат	Milano — это аромат с характером большого города: насыщенный, элегантный и чувственный. Пряные и древесные ноты переплетаются с апельсиновым цветом и тёплой ванилью, создавая атмосферу утончённой роскоши и внутренней силы. Он наполняет пространство глубиной и стилем, словно вечерняя прогулка по Милану — между модой, искусством и страстью.	Верхние ноты: пачули, перец, сандаловое дерево.\nСредние ноты: апельсиновый цвет, кориандр, мускатный орех.\nБазовые ноты: кедр, кипарис, звездчатый анис, амбра, ваниль	Гостиная, кабинет, офис, библиотека, холл, бутик, шоурум, переговорная	2000000035642	2026-01-25 15:19:49.321	2026-01-25 15:30:39.014	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Milano (Милан) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx4g701mp13y4urjxjz87	Сменный аромат Rosa Tabacco (Роза Табак) 500 мл, арт. FRV0074E	smennyy-aromat-rosa-tabacco-roza-tabak-500-ml-art-frv0074e	Rosa Tabacco — изысканный контраст нежной розы и глубокого, тёплого табака, создающий по-настоящему чувственный и смелый Ароматы для дома. Свежие аккорды фиалки и апельсина плавно переходят в роскошное сердце из розы, табака и амбры. Мягкий шлейф ванили, мускуса и сандала окутывает пространство элегантностью и притягательной теплотой.	\N	14590.00	\N	\N	500 мл	\N	\N	\N	t	f	12	\N	7 х 7 х 20,5	04036	FRV0074C	Сменный аромат	Rosa Tabacco — изысканный контраст нежной розы и глубокого, тёплого табака, создающий по-настоящему чувственный и смелый Ароматы для дома. Свежие аккорды фиалки и апельсина плавно переходят в роскошное сердце из розы, табака и амбры. Мягкий шлейф ванили, мускуса и сандала окутывает пространство элегантностью и притягательной теплотой.	Верхние ноты: фиалка, апельсин\nСредние ноты: роза, табак, амбра\nБазовые ноты: ваниль, мускус, сандал	Гостиная, кабинет, спальня, гардеробная, будуар, лаунж-зона, бутик, шоурум, приватный офис	2000000042060	2026-01-25 15:19:49.448	2026-01-25 15:30:39.128	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Rosa Tabacco (Роза Табак) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx4i501n113y409osgnqf	Сменный аромат Rosso Nobile (красный благородный) 500 мл, арт. FRV0016E	smennyy-aromat-rosso-nobile-krasnyy-blagorodnyy-500-ml-art-frv0016e	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	17990.00	\N	\N	500 мл	\N	\N	\N	t	f	39	\N	7 х 7 х 20,5	00757	FRV0016E	Сменный аромат	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Гостиная, столовая, кабинет, библиотека, винная комната, зона отдыха, бутик, переговорная, холл	2000000007717	2026-01-25 15:19:49.517	2026-01-25 15:30:39.195	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Rosso Nobile (красный благородный) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx4o801nd13y462268b3w	Сменный блок Ambra (Амбра) для автомобиля, арт. CRP001299BLE1	smennyy-blok-ambra-ambra-dlya-avtomobilya-art-crp001299ble1	Ароматы для дома Ambra обладает загадочной, сладкой и чувственной индивидуальностью.\nОн перенесет вас в мир интенсивных нот амбры, цветов ириса, герани, лабданума и пачули, завершая композицию аккордами благородных пород древесины и мадагаскарской ванили. Представьте себя окруженным редкими ароматами, хранящимися в элегантных бутылочках самых необычных форм, утопающим в роскошных тканях и любимых пряностях.	\N	5890.00	\N	\N	\N	\N	\N	\N	t	f	2	\N	5 x 5 x 1,5	04303	CRP001299BLE1	Аромат для автомобиля	Ароматы для дома Ambra обладает загадочной, сладкой и чувственной индивидуальностью.\nОн перенесет вас в мир интенсивных нот амбры, цветов ириса, герани, лабданума и пачули, завершая композицию аккордами благородных пород древесины и мадагаскарской ванили. Представьте себя окруженным редкими ароматами, хранящимися в элегантных бутылочках самых необычных форм, утопающим в роскошных тканях и любимых пряностях.	Верхние ноты: цветы ириса, герань\nСредние ноты: амбра, лабданум, пачули, рокроз\nБазовые ноты: сандаловое дерево, ваниль, кедровое дерево	Автомобиль	8056860398230	2026-01-25 15:19:49.737	2026-01-25 15:30:39.313	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный блок Ambra (Амбра) для автомобиля	Установите клипсу, подходящую для вентиляционной решетки автомобиля, и прикрепите её на заднюю часть устройства. Поверните восьмиугольное\nкольцо против часовой стрелки, чтобы открыть Carparfum. Вставьте ароматическую заправку, разместив логотип внизу.\nЗакрытие: Закройте устройство, повернув кольцо по часовой стрелке до щелчка.\nУстановка: Прикрепите Carparfum к вентиляционной решетке автомобиля.\nРегулировка интенсивности: Регулируйте уровень интенсивности аромата, опуская или поднимая боковой рычажок, по окончании поезки его выключайте.	1
cmktvx4te01nv13y4138p4eek	Сменный блок Rosa Tabacco (Роза табак) для автомобиля, арт. CRP007499BLE1	smennyy-blok-rosa-tabacco-roza-tabak-dlya-avtomobilya-art-crp007499ble1	Rosa Tabacco — изысканный контраст нежной розы и глубокого, тёплого табака, создающий по-настоящему чувственный и смелый Ароматы для дома. Свежие аккорды фиалки и апельсина плавно переходят в роскошное сердце из розы, табака и амбры. Мягкий шлейф ванили, мускуса и сандала окутывает пространство элегантностью и притягательной теплотой.	\N	5890.00	\N	\N	\N	\N	\N	\N	t	f	3	\N	5 x 5 x 1,5	05528	CRP007499BLE1	Аромат для автомобиля	Rosa Tabacco — изысканный контраст нежной розы и глубокого, тёплого табака, создающий по-настоящему чувственный и смелый Ароматы для дома. Свежие аккорды фиалки и апельсина плавно переходят в роскошное сердце из розы, табака и амбры. Мягкий шлейф ванили, мускуса и сандала окутывает пространство элегантностью и притягательной теплотой.	Верхние ноты: фиалка, апельсин\nСредние ноты: роза, табак, амбра\nБазовые ноты: ваниль, мускус, сандал	Автомобиль	8056860398292	2026-01-25 15:19:49.922	2026-01-25 15:30:39.494	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный блок Rosa Tabacco (Роза табак) для автомобиля	Установите клипсу, подходящую для вентиляционной решетки автомобиля, и прикрепите её на заднюю часть устройства. Поверните восьмиугольное\nкольцо против часовой стрелки, чтобы открыть Carparfum. Вставьте ароматическую заправку, разместив логотип внизу.\nЗакрытие: Закройте устройство, повернув кольцо по часовой стрелке до щелчка.\nУстановка: Прикрепите Carparfum к вентиляционной решетке автомобиля.\nРегулировка интенсивности: Регулируйте уровень интенсивности аромата, опуская или поднимая боковой рычажок, по окончании поезки его выключайте.	1
cmktvx4uv01o113y4lkpgpjuv	Сменный блок Rosso Nobile (Красный благородный) для автомобиля, арт. CRP001699BLE1	smennyy-blok-rosso-nobile-krasnyy-blagorodnyy-dlya-avtomobilya-art-crp001699ble1	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	5890.00	\N	\N	\N	\N	\N	\N	t	f	14	\N	5 x 5 x 1,5	04301	CRP001699BLE1	Аромат для автомобиля	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Автомобиль	8056860398254	2026-01-25 15:19:49.975	2026-01-25 15:30:39.55	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный блок Rosso Nobile (Красный благородный) для автомобиля	Установите клипсу, подходящую для вентиляционной решетки автомобиля, и прикрепите её на заднюю часть устройства. Поверните восьмиугольное\nкольцо против часовой стрелки, чтобы открыть Carparfum. Вставьте ароматическую заправку, разместив логотип внизу.\nЗакрытие: Закройте устройство, повернув кольцо по часовой стрелке до щелчка.\nУстановка: Прикрепите Carparfum к вентиляционной решетке автомобиля.\nРегулировка интенсивности: Регулируйте уровень интенсивности аромата, опуская или поднимая боковой рычажок, по окончании поезки его выключайте.	1
cmktvx4wc01o713y4pzkstv1u	Спрей для дома Acqua (вода) 100 мл, арт. FRV0001B	sprey-dlya-doma-acqua-voda-100-ml-art-frv0001b	Acqua — это аромат с морской душой, который окутывает легкой свежестью и дарит гармонию. Его композиция начинается с зеленых нот базилика, переходит в сердце, наполненное дыханием морских волн, и завершается мягким мускусом в обрамлении белого кедра. Он наполнит ваш дом свежестью морского бриза, напомнит о счастливых мгновениях у воды и принесет ощущение спокойствия и умиротворения.	\N	7790.00	\N	\N	100 мл	\N	\N	\N	t	f	2	\N	12,5 х 6 х 6	05363	FRV0001B	Спрей для дома	Acqua — это аромат с морской душой, который окутывает легкой свежестью и дарит гармонию. Его композиция начинается с зеленых нот базилика, переходит в сердце, наполненное дыханием морских волн, и завершается мягким мускусом в обрамлении белого кедра. Он наполнит ваш дом свежестью морского бриза, напомнит о счастливых мгновениях у воды и принесет ощущение спокойствия и умиротворения.	Верхние ноты: базилик, мирт\nСердце аромата: морские аккорды, водоросли\nНоты шлейфа: белый мускус, кедр	Ванная комната, Современная гостиная	2000000055794	2026-01-25 15:19:50.028	2026-01-25 15:30:39.611	cmhz85ach006oupvs06ykeee8	Италия	Италия	Спрей для дома Acqua (вода) 100 мл	Спреи для дома наиболее тонко и точно раскрывают богатство парфюмерной композиции. Распылите с небольшого расстояния на текстиль или в воздухе помещения.	1
cmktvx50p01oj13y4azse9h7c	Спрей для дома Ambra (амбра) 100 мл, арт. FRV0012B	sprey-dlya-doma-ambra-ambra-100-ml-art-frv0012b	Ароматы для дома Ambra обладает загадочной, сладкой и чувственной индивидуальностью.\nОн перенесет вас в мир интенсивных нот амбры, цветов ириса, герани, лабданума и пачули, завершая композицию аккордами благородных пород древесины и мадагаскарской ванили. Представьте себя окруженным редкими ароматами, хранящимися в элегантных бутылочках самых необычных форм, утопающим в роскошных тканях и любимых пряностях.	\N	7790.00	\N	\N	100 мл	\N	\N	\N	t	f	2	\N	12,5 х 6 х 6	05366	FRV0012B	Спрей для дома	Ароматы для дома Ambra обладает загадочной, сладкой и чувственной индивидуальностью.\nОн перенесет вас в мир интенсивных нот амбры, цветов ириса, герани, лабданума и пачули, завершая композицию аккордами благородных пород древесины и мадагаскарской ванили. Представьте себя окруженным редкими ароматами, хранящимися в элегантных бутылочках самых необычных форм, утопающим в роскошных тканях и любимых пряностях.	Верхние ноты: цветы ириса, герань\nСредние ноты: амбра, лабданум, пачули, рокроз\nБазовые ноты: сандаловое дерево, ваниль, кедровое дерево	Классическая гостиная	2000000055824	2026-01-25 15:19:50.186	2026-01-25 15:30:39.733	cmhz85ach006oupvs06ykeee8	Италия	Италия	Спрей для дома Ambra (амбра) 100 мл	Спреи для дома наиболее тонко и точно раскрывают богатство парфюмерной композиции. Распылите с небольшого расстояния на текстиль или в воздухе помещения.	1
cmktvx54001ov13y4vxnomd9k	Спрей для дома Bellini (Беллини) 100 мл, арт. FRV0059B	sprey-dlya-doma-bellini-bellini-100-ml-art-frv0059b	Bellini — аромат, вдохновлённый легендарным венецианским коктейлем, лёгкий, солнечный и по-итальянски жизнерадостный. Свежесть бергамота и белого винограда мягко переходит в сочную ноту спелого персика, окружённого цветочными и цитрусовыми акцентами. Тёплый шлейф амбры, кедра и ветивера наполняет пространство ощущением праздника и dolce vita.	\N	10690.00	\N	\N	100 мл	\N	\N	\N	t	f	7	\N	12,5 х 6 х 6	03419	FRV0059B	Спрей для дома	Bellini — аромат, вдохновлённый легендарным венецианским коктейлем, лёгкий, солнечный и по-итальянски жизнерадостный. Свежесть бергамота и белого винограда мягко переходит в сочную ноту спелого персика, окружённого цветочными и цитрусовыми акцентами. Тёплый шлейф амбры, кедра и ветивера наполняет пространство ощущением праздника и dolce vita.	Верхние ноты: бергамот, ландыш, белый виноград\nСердце: персик\nБазовые ноты: литсея кубеба, ветивер, имбирь	Гостиная, столовая, кухня, прихожая, спальня, бутик, зоны отдыха, отели и апартаменты для приёма гостей	2000000035666	2026-01-25 15:19:50.304	2026-01-25 15:30:39.846	cmhz85ach006oupvs06ykeee8	Италия	Италия	Спрей для дома Bellini (Беллини) 100 мл	Спреи для дома наиболее тонко и точно раскрывают богатство парфюмерной композиции. Распылите с небольшого расстояния на текстиль или в воздухе помещения.	1
cmktvx56p01p713y4ccuwt7uu	Спрей для дома Ginger Lime (Имбирь и лайм) 100 мл, арт. FRV0014B	sprey-dlya-doma-ginger-lime-imbir-i-laym-100-ml-art-frv0014b	Ginger Lime — яркий и экзотичный аромат, наполненный солнечной энергией и ощущением движения. Взрывная свежесть лайма и лимона встречается с пряным имбирём и белым перцем, создавая динамичную, бодрящую композицию. Благородные древесные ноты придают аромату глубину и делают его по-настоящему выразительным.	\N	7790.00	\N	\N	100 мл	\N	\N	\N	t	f	1	\N	12,5 х 6 х 6	05372	FRV0014B	Спрей для дома	Ginger Lime — яркий и экзотичный аромат, наполненный солнечной энергией и ощущением движения. Взрывная свежесть лайма и лимона встречается с пряным имбирём и белым перцем, создавая динамичную, бодрящую композицию. Благородные древесные ноты придают аромату глубину и делают его по-настоящему выразительным.	Верхние ноты: лайм, лимон\nСредние ноты: имбирь, ветивер\nБазовые ноты: белый перец, древесина эбена и гваякового дерева	Гостиная, кухня, прихожая, рабочий кабинет, офис, фитнес-зоны, бутики, общественные пространства с активной атмосферой	2000000055886	2026-01-25 15:19:50.402	2026-01-25 15:30:39.964	cmhz85ach006oupvs06ykeee8	Италия	Италия	Спрей для дома Ginger Lime (Имбирь и лайм) 100 мл	Спреи для дома наиболее тонко и точно раскрывают богатство парфюмерной композиции. Распылите с небольшого расстояния на текстиль или в воздухе помещения.	1
cmktvx59p01pj13y4j310ycpo	Спрей для дома Limone Cedrato (Лимон и Кедр) 100 мл, арт. frv0s77mgneeu	sprey-dlya-doma-limone-cedrato-limon-i-kedr-100-ml-art-frv0s77mgneeu	Limone Cedrato — аромат солнечного утра во Флоренции, наполненный сияющей свежестью лимонов и благородных цитрусов. Он наполняет дом светом, чистотой и ощущением гармонии, словно прогулка по садам Медичи. Лёгкий, жизнерадостный и элегантный, этот аромат пробуждает вдохновение и любовь к жизни.	\N	7790.00	\N	\N	100 мл	\N	\N	\N	t	f	7	\N	12,5 х 6 х 6	05737	frv0s77mgneeu	Спрей для дома	Limone Cedrato — аромат солнечного утра во Флоренции, наполненный сияющей свежестью лимонов и благородных цитрусов. Он наполняет дом светом, чистотой и ощущением гармонии, словно прогулка по садам Медичи. Лёгкий, жизнерадостный и элегантный, этот аромат пробуждает вдохновение и любовь к жизни.	Верхние ноты: Флорентийский цитрон, бергамот \nСердце аромата: листья цитрусов, цветы \nНоты шлейфа: ветивер, сандал	Гостиная, кухня, прихожая, столовая, офис, бутик, зоны общего пользования.	8053178093109	2026-01-25 15:19:50.509	2026-01-25 15:30:40.074	cmhz85ach006oupvs06ykeee8	Италия	Италия	Спрей для дома Limone Cedrato (Лимон и Кедр) 100 мл	Спреи для дома наиболее тонко и точно раскрывают богатство парфюмерной композиции. Распылите с небольшого расстояния на текстиль или в воздухе помещения.	1
cmktvx5d501pv13y4zu2l7jni	Спрей для дома Milano (Милан) 100 мл, арт. FRV0054B	sprey-dlya-doma-milano-milan-100-ml-art-frv0054b	Milano — это аромат с характером большого города: насыщенный, элегантный и чувственный. Пряные и древесные ноты переплетаются с апельсиновым цветом и тёплой ванилью, создавая атмосферу утончённой роскоши и внутренней силы. Он наполняет пространство глубиной и стилем, словно вечерняя прогулка по Милану — между модой, искусством и страстью.	\N	10690.00	\N	\N	100 мл	\N	\N	\N	t	f	5	\N	12,5 х 6 х 6	03420	FRV0054B	Спрей для дома	Milano — это аромат с характером большого города: насыщенный, элегантный и чувственный. Пряные и древесные ноты переплетаются с апельсиновым цветом и тёплой ванилью, создавая атмосферу утончённой роскоши и внутренней силы. Он наполняет пространство глубиной и стилем, словно вечерняя прогулка по Милану — между модой, искусством и страстью.	Верхние ноты: пачули, перец, сандаловое дерево.\nСредние ноты: апельсиновый цвет, кориандр, мускатный орех.\nБазовые ноты: кедр, кипарис, звездчатый анис, амбра, ваниль	Гостиная, кабинет, офис, библиотека, холл, бутик, шоурум, переговорная	2000000035673	2026-01-25 15:19:50.634	2026-01-25 15:30:40.185	cmhz85ach006oupvs06ykeee8	Италия	Италия	Спрей для дома Milano (Милан) 100 мл	Спреи для дома наиболее тонко и точно раскрывают богатство парфюмерной композиции. Распылите с небольшого расстояния на текстиль или в воздухе помещения.	1
cmktvx5g401q713y4j5ldt4xy	Спрей для дома Rosa Tabacco (Роза Табак) 100 мл, арт. FRV0074B	sprey-dlya-doma-rosa-tabacco-roza-tabak-100-ml-art-frv0074b	Rosa Tabacco — изысканный контраст нежной розы и глубокого, тёплого табака, создающий по-настоящему чувственный и смелый Ароматы для дома. Свежие аккорды фиалки и апельсина плавно переходят в роскошное сердце из розы, табака и амбры. Мягкий шлейф ванили, мускуса и сандала окутывает пространство элегантностью и притягательной теплотой.	\N	7790.00	\N	\N	100 мл	\N	\N	\N	t	f	5	\N	12,5 х 6 х 6	04034	FRV0074B	Спрей для дома	Rosa Tabacco — изысканный контраст нежной розы и глубокого, тёплого табака, создающий по-настоящему чувственный и смелый Ароматы для дома. Свежие аккорды фиалки и апельсина плавно переходят в роскошное сердце из розы, табака и амбры. Мягкий шлейф ванили, мускуса и сандала окутывает пространство элегантностью и притягательной теплотой.	Верхние ноты: фиалка, апельсин\nСредние ноты: роза, табак, амбра\nБазовые ноты: ваниль, мускус, сандал	Гостиная, кабинет, спальня, гардеробная, будуар, лаунж-зона, бутик, шоурум, приватный офис	2000000042046	2026-01-25 15:19:50.74	2026-01-25 15:30:40.297	cmhz85ach006oupvs06ykeee8	Италия	Италия	Спрей для дома Rosa Tabacco (Роза Табак) 100 мл	Спреи для дома наиболее тонко и точно раскрывают богатство парфюмерной композиции. Распылите с небольшого расстояния на текстиль или в воздухе помещения.	1
cmktvwzpx018713y406yny8qv	Ароматический диффузор Acqua (вода) 250 мл, арт. FRV0001C	aromaticheskiy-diffuzor-acqua-voda-250-ml-art-frv0001c	Acqua — это аромат с морской душой, который окутывает легкой свежестью и дарит гармонию. Его композиция начинается с зеленых нот базилика, переходит в сердце, наполненное дыханием морских волн, и завершается мягким мускусом в обрамлении белого кедра. Он наполнит ваш дом свежестью морского бриза, напомнит о счастливых мгновениях у воды и принесет ощущение спокойствия и умиротворения.	\N	13090.00	\N	\N	250 мл	\N	\N	\N	t	f	3	\N	8 х 8 х 16	00775	FRV0001C	Ароматический диффузор	Acqua — это аромат с морской душой, который окутывает легкой свежестью и дарит гармонию. Его композиция начинается с зеленых нот базилика, переходит в сердце, наполненное дыханием морских волн, и завершается мягким мускусом в обрамлении белого кедра. Он наполнит ваш дом свежестью морского бриза, напомнит о счастливых мгновениях у воды и принесет ощущение спокойствия и умиротворения.	Верхние ноты: базилик, мирт\nСердце аромата: морские аккорды, водоросли\nНоты шлейфа: белый мускус, кедр	Ванная комната, Современная гостиная	2000000007908	2026-01-25 15:19:43.317	2026-01-25 15:30:32.339	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Acqua (вода) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx5j301qj13y4px7dfwdv	Спрей для дома Vaniglia Mandarino (Ваниль мандарин) 100 мл, арт. FRV0005B	sprey-dlya-doma-vaniglia-mandarino-vanil-mandarin-100-ml-art-frv0005b	Vaniglia Mandarino — нежный и обволакивающий аромат, в котором сладкая ваниль и бобы тонка гармонично сочетаются со свежими, солнечными акцентами мандарина. Эта композиция наполняет пространство теплом, мягкостью и ощущением спокойствия, словно возвращая в беззаботные моменты детства. Лёгкий, уютный и чувственный, аромат дарит ощущение комфорта и душевного равновесия.	\N	7790.00	\N	\N	100 мл	\N	\N	\N	t	f	4	\N	12,5 х 6 х 6	04417	FRV0005B	Спрей для дома	Vaniglia Mandarino — нежный и обволакивающий аромат, в котором сладкая ваниль и бобы тонка гармонично сочетаются со свежими, солнечными акцентами мандарина. Эта композиция наполняет пространство теплом, мягкостью и ощущением спокойствия, словно возвращая в беззаботные моменты детства. Лёгкий, уютный и чувственный, аромат дарит ощущение комфорта и душевного равновесия.	Верхние ноты: мандарин\nСредние ноты: ваниль\nБазовые ноты: бобы тонка	Гостиная, спальня, детская комната, зона отдыха, семейная комната, кабинет, будуар	2000000045979	2026-01-25 15:19:50.847	2026-01-25 15:30:40.464	cmhz85ach006oupvs06ykeee8	Италия	Италия	Спрей для дома Vaniglia Mandarino (Ваниль мандарин) 100 мл	Спреи для дома наиболее тонко и точно раскрывают богатство парфюмерной композиции. Распылите с небольшого расстояния на текстиль или в воздухе помещения.	1
cmktvx03b018v13y4xfx5q6ti	Ароматический диффузор Ambra (амбра) 500 мл, арт. FRV0012D	aromaticheskiy-diffuzor-ambra-ambra-500-ml-art-frv0012d	Ароматы для дома Ambra обладает загадочной, сладкой и чувственной индивидуальностью.\nОн перенесет вас в мир интенсивных нот амбры, цветов ириса, герани, лабданума и пачули, завершая композицию аккордами благородных пород древесины и мадагаскарской ванили. Представьте себя окруженным редкими ароматами, хранящимися в элегантных бутылочках самых необычных форм, утопающим в роскошных тканях и любимых пряностях.	\N	20590.00	\N	\N	500 мл	\N	\N	\N	t	f	1	\N	9,5 х 9,5 х 19,5	05365	FRV0012D	Ароматический диффузор	Ароматы для дома Ambra обладает загадочной, сладкой и чувственной индивидуальностью.\nОн перенесет вас в мир интенсивных нот амбры, цветов ириса, герани, лабданума и пачули, завершая композицию аккордами благородных пород древесины и мадагаскарской ванили. Представьте себя окруженным редкими ароматами, хранящимися в элегантных бутылочках самых необычных форм, утопающим в роскошных тканях и любимых пряностях.	Верхние ноты: цветы ириса, герань\nСредние ноты: амбра, лабданум, пачули, рокроз\nБазовые ноты: сандаловое дерево, ваниль, кедровое дерево	Классическая гостиная	2000000055817	2026-01-25 15:19:43.799	2026-01-25 15:30:32.876	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Ambra (амбра) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx0a6019j13y4w3w6bfj7	Ароматический диффузор Arancio Uva Rossa (Апельсин и виноград) 500 мл, арт. FRV0019D	aromaticheskiy-diffuzor-arancio-uva-rossa-apelsin-i-vinograd-500-ml-art-frv0019d	Arancio e Uva Rossa — аромат тосканского виноградника, наполненный светом, теплом и солнечной свежестью. Горький апельсин и мандарин переплетаются с бархатными нотами красного винограда, розы и магнолии, переходя в изящный шлейф фиалки, корицы и берёзовой древесины. Этот аромат словно приглашает снова и снова возвращаться в Тоскану — где бы вы ни находились.	\N	20590.00	\N	\N	500 мл	\N	\N	\N	t	f	4	\N	9,5 х 9,5 х 19,5	00875	FRV0019D	Ароматический диффузор	Arancio e Uva Rossa — аромат тосканского виноградника, наполненный светом, теплом и солнечной свежестью. Горький апельсин и мандарин переплетаются с бархатными нотами красного винограда, розы и магнолии, переходя в изящный шлейф фиалки, корицы и берёзовой древесины. Этот аромат словно приглашает снова и снова возвращаться в Тоскану — где бы вы ни находились.	Верхние ноты: горький апельсин, мандарин\nСредние ноты: красный виноград, роза, магнолия\nБазовые ноты: фиалка, корица, березовая древесина	Гостиная, столовая, кухня, кабинет, прихожая, бутик, дегустационные и винные пространства, зоны приёма гостей	2000000008936	2026-01-25 15:19:44.046	2026-01-25 15:30:33.167	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Arancio Uva Rossa (Апельсин и виноград) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx0hq01a713y4l8mmxhd6	Ароматический диффузор Giglio di Firenze (Лилия Флоренции) 250 мл, арт. FRV0068C	aromaticheskiy-diffuzor-giglio-di-firenze-liliya-florentsii-250-ml-art-frv0068c	Giglio di Firenze — это шедевр, созданный для тех, кто ценит гармонию и баланс. Этот утончённый и взрослый аромат раскрывается в вашем доме, мгновенно преображая пространство, наполняя его теплом, уютом и изысканностью.	\N	13090.00	\N	\N	250 мл	\N	\N	\N	t	f	5	\N	8 х 8 х 16	01689	FRV0068C	Ароматический диффузор	Giglio di Firenze — это шедевр, созданный для тех, кто ценит гармонию и баланс. Этот утончённый и взрослый аромат раскрывается в вашем доме, мгновенно преображая пространство, наполняя его теплом, уютом и изысканностью.	Верхние ноты: бергамот, кардамон, лаванда\nСредние ноты: ирис, герань, лабданум\nБазовые ноты: кедровое дерево, пачули, мускатный орех	Гостиная, спальнная и ванная комнаты	2000000017501	2026-01-25 15:19:44.319	2026-01-25 15:30:33.424	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Giglio di Firenze (Лилия Флоренции) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx0ld01aj13y4lzmunsl4	Ароматический диффузор Ginger Lime (Имбирь и лайм) 250 мл, арт. FRV0014C	aromaticheskiy-diffuzor-ginger-lime-imbir-i-laym-250-ml-art-frv0014c	Ginger Lime — яркий и экзотичный аромат, наполненный солнечной энергией и ощущением движения. Взрывная свежесть лайма и лимона встречается с пряным имбирём и белым перцем, создавая динамичную, бодрящую композицию. Благородные древесные ноты придают аромату глубину и делают его по-настоящему выразительным.	\N	13090.00	\N	\N	250 мл	\N	\N	\N	t	f	1	\N	8 х 8 х 16	00434	FRV0014C	Ароматический диффузор	Ginger Lime — яркий и экзотичный аромат, наполненный солнечной энергией и ощущением движения. Взрывная свежесть лайма и лимона встречается с пряным имбирём и белым перцем, создавая динамичную, бодрящую композицию. Благородные древесные ноты придают аромату глубину и делают его по-настоящему выразительным.	Верхние ноты: лайм, лимон\nСредние ноты: имбирь, ветивер\nБазовые ноты: белый перец, древесина эбена и гваякового дерева	Гостиная, кухня, прихожая, рабочий кабинет, офис, фитнес-зоны, бутики, общественные пространства с активной атмосферой	2000000004457	2026-01-25 15:19:44.449	2026-01-25 15:30:33.55	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Ginger e Lime (Имбирь и лайм) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx0v401b313y4x0ainhcr	Ароматический диффузор Leather Oud (Кожа и Уд) 250 мл, арт. FRV0075MLNEEU	aromaticheskiy-diffuzor-leather-oud-kozha-i-ud-250-ml-art-frv0075mlneeu	Leather Oud — это интерьерный аромат с яркой, роскошной индивидуальностью: экзотичный, глубокий и обволакивающий.\nДрагоценная и смелая композиция раскрывается нотами розы и герани, в сердце звучит тосканская кожа в союзе с ближневосточным удом, а в шлейфе — сандал, мускус и ваниль.	\N	15990.00	\N	\N	250 мл	\N	\N	\N	t	f	5	\N	8 х 8 х 16	04773	FRV0075MLNEEU	Ароматический диффузор	Leather Oud — это интерьерный аромат с яркой, роскошной индивидуальностью: экзотичный, глубокий и обволакивающий.\nДрагоценная и смелая композиция раскрывается нотами розы и герани, в сердце звучит тосканская кожа в союзе с ближневосточным удом, а в шлейфе — сандал, мускус и ваниль.	Верхние ноты: Элеми, герань, роза, ландыш\nСредние ноты: Уд, кожа, ладан, пачули, амбра\nБазовые ноты: Черное дерево, сандал, мускус, ваниль	Гостиная, Кабинет, Офис, Библиотека, Прихожая, Бутик, Шоурум, Переговорная	2000000049694	2026-01-25 15:19:44.801	2026-01-25 15:30:33.957	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Leather Oud (Кожа и Уд) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx11n01br13y4h79m6e71	Ароматический диффузор Magnolia Orchidea (Магнолия орхидея) 250 мл, арт. FRV0006C	aromaticheskiy-diffuzor-magnolia-orchidea-magnoliya-orhideya-250-ml-art-frv0006c	Magnolia Orchidea — утончённый цветочный аромат, в котором магнолия и орхидея сплетаются в нежную и чувственную симфонию. Он наполняет пространство мягким светом, романтикой и ощущением спокойной элегантности. Этот аромат словно тихая история о встрече цветов, созданная для моментов гармонии и внутреннего равновесия.	\N	13090.00	\N	\N	250 мл	\N	\N	\N	t	f	1	\N	8 х 8 х 16	00776	FRV0006C	Ароматический диффузор	Magnolia Orchidea — утончённый цветочный аромат, в котором магнолия и орхидея сплетаются в нежную и чувственную симфонию. Он наполняет пространство мягким светом, романтикой и ощущением спокойной элегантности. Этот аромат словно тихая история о встрече цветов, созданная для моментов гармонии и внутреннего равновесия.	Верхние ноты: магнолия, орхидея, мимоза, ландыш\nСердце: засахаренный апельсин, нероли\nБаза: иланг-иланг, плющ	Спальня, гостиная, будуар, ванная комната, зона отдыха, салон красоты, спальня-сьют, уютный кабинет	2000000007915	2026-01-25 15:19:45.035	2026-01-25 15:30:34.209	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Magnolia Orchidea (Магнолия орхидея) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx17201c913y4g7p2qu6j	Ароматический диффузор Melograno Menta (Гранат и мята) 500 мл, арт. FRV0022D	aromaticheskiy-diffuzor-melograno-menta-granat-i-myata-500-ml-art-frv0022d	Melograno e Menta — это взрыв свежести и солнечной энергии, где сочный гранат и прохладная мята создают яркий и жизнерадостный аккорд. Фруктовые ноты дыни, красной смородины и дикого винограда наполняют аромат легкостью и естественной сладостью. Освежающий и гармоничный, он мгновенно пробуждает чувства и создает ощущение чистоты и комфорта.	\N	20590.00	\N	\N	500 мл	\N	\N	\N	t	f	4	\N	9,5 х 9,5 х 19,5	00963	FRV0022D	Ароматический диффузор	Melograno e Menta — это взрыв свежести и солнечной энергии, где сочный гранат и прохладная мята создают яркий и жизнерадостный аккорд. Фруктовые ноты дыни, красной смородины и дикого винограда наполняют аромат легкостью и естественной сладостью. Освежающий и гармоничный, он мгновенно пробуждает чувства и создает ощущение чистоты и комфорта.	Верхние ноты: дыня\nСредние ноты: черная смородина, красный виноград\nБазовые ноты: дикая мята	Кухня, гостиная, прихожая, ванная комната, столовая, офис, фитнес-зона, спа-пространство	2000000009858	2026-01-25 15:19:45.231	2026-01-25 15:30:34.426	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Melograno Menta (Гранат и мята) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx19001cf13y4k4qiz12z	Ароматический диффузор Melograno (Гранат) 250 мл, арт. FRV0009C	aromaticheskiy-diffuzor-melograno-granat-250-ml-art-frv0009c	Яркий и многогранный, Melograno от Dr. Vranjes Firenze раскрывает неожиданную сторону граната — свежую, сочную и элегантную. Арбуз и бергамот придают аромату лёгкость, а жасмин и роза наполняют его утончённой цветочной глубиной. Финальные ноты чёрной смородины и красного винограда оставляют благородный, живой шлейф, к которому хочется возвращаться.	\N	13090.00	\N	\N	250 мл	\N	\N	\N	t	f	6	\N	8 х 8 х 16	00458	FRV0009C	Ароматический диффузор	Яркий и многогранный, Melograno от Dr. Vranjes Firenze раскрывает неожиданную сторону граната — свежую, сочную и элегантную. Арбуз и бергамот придают аромату лёгкость, а жасмин и роза наполняют его утончённой цветочной глубиной. Финальные ноты чёрной смородины и красного винограда оставляют благородный, живой шлейф, к которому хочется возвращаться.	Верхние ноты: арбуз\nСредние ноты: жасмин, роза, бергамот\nБазовые ноты: чёрная смородина, красный виноград	Гостиная, столовая, кухня, прихожая, офис, переговорная, бутик, салон красоты	2000000004693	2026-01-25 15:19:45.3	2026-01-25 15:30:34.487	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Melograno (Гранат) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx1fl01d313y419puvafs	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 100 мл, арт. FRV0073A	aromaticheskiy-diffuzor-mirra-zafferano-mirra-i-shafran-100-ml-art-frv0073a	Mirra Zafferano от Dr. Vranjes Firenze — это изысканный Ароматы для дома, который привнесёт в ваши дни сладкие, утончённые и гурманские акценты. \nЭтот аромат раскрывает богатство нот шафрана, ванили и бергамота, подогревая ваше желание к путешествиям и открытиям. Шафран — одна из самых ценных и редких специй в мире, а мирра, почитаемая с древности, придаёт композиции солнечную и соблазнительную индивидуальность. Вместе они создают аромат для тех, кто ценит роскошь и утончённость.	\N	7790.00	\N	\N	100 мл	\N	\N	\N	t	f	1	\N	12,5 х 6 х 6	04467	FRV0073A	Ароматический диффузор	Mirra Zafferano от Dr. Vranjes Firenze — это изысканный Ароматы для дома, который привнесёт в ваши дни сладкие, утончённые и гурманские акценты. \nЭтот аромат раскрывает богатство нот шафрана, ванили и бергамота, подогревая ваше желание к путешествиям и открытиям. Шафран — одна из самых ценных и редких специй в мире, а мирра, почитаемая с древности, придаёт композиции солнечную и соблазнительную индивидуальность. Вместе они создают аромат для тех, кто ценит роскошь и утончённость.	Верхние ноты: элеми, бергамот\nСердце: мирра, ладан, амбра\nБазовые ноты: ваниль, шафран	Гостиная, столовая, кабинет, библиотека, холл, бутик, шоурум, зона приёма гостей, спальня.	2000000046501	2026-01-25 15:19:45.537	2026-01-25 15:30:34.737	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Mirra Zafferano (Мирра и шафран) 100 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx1um01dx13y4g4vbt3ai	Ароматический диффузор Oud Nobile (Уд благородный) 500 мл, арт. FRV0042D	aromaticheskiy-diffuzor-oud-nobile-ud-blagorodnyy-500-ml-art-frv0042d	Oud Nobile — это воплощение восточной роскоши и силы благородных древесных аккордов. Искрящаяся свежесть бергамота и нероли уступает место глубокому, обволакивающему сердцу уда, мирры и ладана, создавая атмосферу тайны и притяжения. Тёплый шлейф мускуса и ценных пород дерева наполняет пространство ощущением статуса, глубины и чувственной элегантности.	\N	23790.00	\N	\N	500 мл	\N	\N	\N	t	f	2	\N	9,5 х 9,5 х 19,5	00463	FRV0042D	Ароматический диффузор	Oud Nobile — это воплощение восточной роскоши и силы благородных древесных аккордов. Искрящаяся свежесть бергамота и нероли уступает место глубокому, обволакивающему сердцу уда, мирры и ладана, создавая атмосферу тайны и притяжения. Тёплый шлейф мускуса и ценных пород дерева наполняет пространство ощущением статуса, глубины и чувственной элегантности.	Верхние ноты: бергамот, нероли\nСредние ноты: уд, мирра, ладан, амбра, сандал\nБазовые ноты: гваяковое дерево, мускус, нагармота	Гостиная, кабинет, библиотека, офис, холл, бутик, шоурум, сигарная комната, лаунж-зона	2000000004747	2026-01-25 15:19:46.079	2026-01-25 15:30:35.475	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Oud Nobile (Уд благородный) 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx21201el13y44807lbmx	Ароматический диффузор Rosso Nobile (Красный благородный) 250 мл, арт. FRV0016C	aromaticheskiy-diffuzor-rosso-nobile-krasnyy-blagorodnyy-250-ml-art-frv0016c	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	15990.00	\N	\N	250 мл	\N	\N	\N	t	f	74	\N	8 х 8 х 16	00469	FRV0016C	Ароматический диффузор	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Гостиная, столовая, кабинет, библиотека, винная комната, зона отдыха, бутик, переговорная, холл	2000000004808	2026-01-25 15:19:46.311	2026-01-25 15:30:35.749	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Rosso Nobile (Красный благородный) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx27y01f913y4gqtbc5ah	Ароматический диффузор Velvet Saffron (Бархатистый шафран) 250 мл, арт. frv0076mlnee	aromaticheskiy-diffuzor-velvet-saffron-barhatistyy-shafran-250-ml-art-frv0076mlnee	Velvet Saffron — изысканный аромат, где тепло шафрана встречается с уютом пачули, а пряный кардамон добавляет характер и динамику. Сердце композиции раскрывается фиалкой и ветивером, создавая глубину и многогранность, словно мягкий шелковый шёпот Флоренции. Этот парфюм наполняет пространство роскошью, утонченностью и чувственной атмосферой.	\N	15990.00	\N	\N	250 мл	\N	\N	\N	t	f	3	\N	8 х 8 х 16	05634	frv0076mlnee	Ароматический диффузор	Velvet Saffron — изысканный аромат, где тепло шафрана встречается с уютом пачули, а пряный кардамон добавляет характер и динамику. Сердце композиции раскрывается фиалкой и ветивером, создавая глубину и многогранность, словно мягкий шелковый шёпот Флоренции. Этот парфюм наполняет пространство роскошью, утонченностью и чувственной атмосферой.	Верхние ноты: кардамон\nСредние ноты: шафран, фиалка, ветивер\nБазовые ноты: пачули, бобы тонка	Гостиная, кабинет, спальня, лаунж-зона, библиотека, бутик, уютные уголки для отдыха	2000000058665	2026-01-25 15:19:46.558	2026-01-25 15:30:36.025	cmhz85ach006oupvs06ykeee8	Италия	Италия	Ароматический диффузор Velvet Saffron (Бархатистый шафран) 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx2q901gj13y4jbnumicw	Подарочный набор Ginger lime (Имбирь и лайм) диффузор 250 мл + сменный аромат 150 мл, арт. GFT0014BFCSE1	podarochnyy-nabor-ginger-lime-imbir-i-laym-diffuzor-250-ml-smennyy-aromat-150-ml-art-gft0014bfcse1	Ginger Lime — яркий и экзотичный аромат, наполненный солнечной энергией и ощущением движения. Взрывная свежесть лайма и лимона встречается с пряным имбирём и белым перцем, создавая динамичную, бодрящую композицию. Благородные древесные ноты придают аромату глубину и делают его по-настоящему выразительным.	\N	15290.00	\N	\N	400 мл	\N	\N	\N	t	f	5	\N	18 х 18 х 10,5	05329	GFT0014BFCSE1	Подарочный набор	Ginger Lime — яркий и экзотичный аромат, наполненный солнечной энергией и ощущением движения. Взрывная свежесть лайма и лимона встречается с пряным имбирём и белым перцем, создавая динамичную, бодрящую композицию. Благородные древесные ноты придают аромату глубину и делают его по-настоящему выразительным.	Верхние ноты: лайм, лимон\nСредние ноты: имбирь, ветивер\nБазовые ноты: белый перец, древесина эбена и гваякового дерева	Гостиная, кухня, прихожая, рабочий кабинет, офис, фитнес-зоны, бутики, общественные пространства с активной атмосферой	8053178090566	2026-01-25 15:19:47.218	2026-01-25 15:30:36.752	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Ginger lime (Имбирь и лайм) диффузор 250 мл + сменный аромат 150 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx2wb01h713y4ydvmjytm	Подарочный набор Oud Nobile (Уд благородный) диффузор 250 мл и свеча 200 гр, Размеры 23 х 18 х 13,5 см, арт. GFT0042BYCSE1	podarochnyy-nabor-oud-nobile-ud-blagorodnyy-diffuzor-250-ml-i-svecha-200-gr-razmery-23-h-18-h-135-sm-art-gft0042bycse1	Oud Nobile — это воплощение восточной роскоши и силы благородных древесных аккордов. Искрящаяся свежесть бергамота и нероли уступает место глубокому, обволакивающему сердцу уда, мирры и ладана, создавая атмосферу тайны и притяжения. Тёплый шлейф мускуса и ценных пород дерева наполняет пространство ощущением статуса, глубины и чувственной элегантности.	\N	26990.00	\N	\N	250 мл	\N	\N	\N	t	f	9	200.00	23 х 18 х 13,5	05337	GFT0042BYCSE1	Подарочный набор	Oud Nobile — это воплощение восточной роскоши и силы благородных древесных аккордов. Искрящаяся свежесть бергамота и нероли уступает место глубокому, обволакивающему сердцу уда, мирры и ладана, создавая атмосферу тайны и притяжения. Тёплый шлейф мускуса и ценных пород дерева наполняет пространство ощущением статуса, глубины и чувственной элегантности.	Верхние ноты: бергамот, нероли\nСредние ноты: уд, мирра, ладан, амбра, сандал\nБазовые ноты: гваяковое дерево, мускус, нагармота	Гостиная, кабинет, библиотека, офис, холл, бутик, шоурум, сигарная комната, лаунж-зона	8056860397585	2026-01-25 15:19:47.435	2026-01-25 15:30:36.952	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Oud Nobile (Уд благородный) диффузор 250 мл и свеча 200 гр	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При первом использовании обязательно дайте воску растаять по всей поверхности, чтобы предотвратить образование «туннеля« при следующем использовании. Перед каждым использованием подрезайте фитили свечи на 5 миллиметров в высоту. Не допускайте горение свечи более 2-3 часов подряд. Когда свеча будет израсходована, тщательно вымойте подсвечник, удалив остатки воска и отдушек.	2
cmktvx33m01hv13y4zpbfighv	Подарочный набор Rosso Nobile (Красный благородный) диффузор 500 мл + сменный аромат 500 мл, Размеры 31 х 25 х 13 см, арт. FRV19-A16	podarochnyy-nabor-rosso-nobile-krasnyy-blagorodnyy-diffuzor-500-ml-smennyy-aromat-500-ml-razmery-31-h-25-h-13-sm-art-frv19-a16	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	37970.00	\N	\N	500 мл	\N	\N	\N	t	f	7	\N	31 х 25 х 13	05335	FRV19-A16	Подарочный набор	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Гостиная, столовая, кабинет, библиотека, винная комната, зона отдыха, бутик, переговорная, холл	2000000055497	2026-01-25 15:19:47.699	2026-01-25 15:30:37.218	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Rosso Nobile (Красный благородный) диффузор 500 мл + сменный аромат 500 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx3c801ip13y40f6x9r9n	Подарочный набор Rosso Nobile (Красный благородный) диффузор 500 мл + свеча 500 гр, арт. GFT0016BKCSE2	podarochnyy-nabor-rosso-nobile-krasnyy-blagorodnyy-diffuzor-500-ml-svecha-500-gr-art-gft0016bkcse2	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	39950.00	\N	\N	500 мл	\N	\N	\N	t	f	4	\N	26 х 23 х 16	05854	GFT0016BKCSE2	Подарочный набор	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Гостиная, столовая, кабинет, библиотека, винная комната, зона отдыха, бутик, переговорная, холл	2000000061016	2026-01-25 15:19:48.009	2026-01-25 15:30:37.571	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Rosso Nobile (Красный благородный) диффузор 500 мл + свеча 500 гр	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При первом использовании обязательно дайте воску растаять по всей поверхности, чтобы предотвратить образование «туннеля« при следующем использовании. Перед каждым использованием подрезайте фитили свечи на 5 миллиметров в высоту. Не допускайте горение свечи более 2-3 часов подряд. Когда свеча будет израсходована, тщательно вымойте подсвечник, удалив остатки воска и отдушек.	2
cmktvx4rx01np13y41i54m6bd	Сменный блок Oud Nobile (Уд благородный) для автомобиля, арт. CRP004299BLE1	smennyy-blok-oud-nobile-ud-blagorodnyy-dlya-avtomobilya-art-crp004299ble1	Oud Nobile — это воплощение восточной роскоши и силы благородных древесных аккордов. Искрящаяся свежесть бергамота и нероли уступает место глубокому, обволакивающему сердцу уда, мирры и ладана, создавая атмосферу тайны и притяжения. Тёплый шлейф мускуса и ценных пород дерева наполняет пространство ощущением статуса, глубины и чувственной элегантности.	\N	5890.00	\N	\N	\N	\N	\N	\N	t	f	1	\N	5 x 5 x 1,5	04304	CRP004299BLE1	Аромат для автомобиля	Oud Nobile — это воплощение восточной роскоши и силы благородных древесных аккордов. Искрящаяся свежесть бергамота и нероли уступает место глубокому, обволакивающему сердцу уда, мирры и ладана, создавая атмосферу тайны и притяжения. Тёплый шлейф мускуса и ценных пород дерева наполняет пространство ощущением статуса, глубины и чувственной элегантности.	Верхние ноты: бергамот, нероли\nСредние ноты: уд, мирра, ладан, амбра, сандал\nБазовые ноты: гваяковое дерево, мускус, нагармота	Автомобиль	8056860398261	2026-01-25 15:19:49.869	2026-01-25 15:30:39.44	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный блок Oud Nobile (Уд благородный) для автомобиля	Установите клипсу, подходящую для вентиляционной решетки автомобиля, и прикрепите её на заднюю часть устройства. Поверните восьмиугольное\nкольцо против часовой стрелки, чтобы открыть Carparfum. Вставьте ароматическую заправку, разместив логотип внизу.\nЗакрытие: Закройте устройство, повернув кольцо по часовой стрелке до щелчка.\nУстановка: Прикрепите Carparfum к вентиляционной решетке автомобиля.\nРегулировка интенсивности: Регулируйте уровень интенсивности аромата, опуская или поднимая боковой рычажок, по окончании поезки его выключайте.	1
cmktvx3ni01jj13y4emcmx2j0	Подарочный набор Albero di Natale (Рождественская ель) диффузор 250 мл (Золотая и синяя коробка), арт. GFT0018MLBOE1	podarochnyy-nabor-albero-di-natale-rozhdestvenskaya-el-diffuzor-250-ml-zolotaya-i-sinyaya-korobka-art-gft0018mlboe1	Аромат Albero di Natale наполняет дом теплом и радостью, согревая сердце и создавая атмосферу уюта. Ноты звездчатого аниса, хлорофилла, древесины и сосновой смолы, дикой мяты и лесных мускусов соединяются, чтобы передать магию праздников в выразительном аромате, которым можно наслаждаться круглый год. Albero di Natale — это праздничные моменты, возвращающие вас к теплым семейным воспоминаниям.	\N	14390.00	\N	\N	250 мл	\N	\N	\N	t	f	8	\N	11 x 11 x 18	05342	GFT0018MLBOE1	Подарочный набор	Аромат Albero di Natale наполняет дом теплом и радостью, согревая сердце и создавая атмосферу уюта. Ноты звездчатого аниса, хлорофилла, древесины и сосновой смолы, дикой мяты и лесных мускусов соединяются, чтобы передать магию праздников в выразительном аромате, которым можно наслаждаться круглый год. Albero di Natale — это праздничные моменты, возвращающие вас к теплым семейным воспоминаниям.	Верхние ноты: Розмарин, мята\nСердце аромата: Еловая древесина, еловые смолы\nНоты шлейфа: Сандаловое дерево, мускус	Гостиная, Кабинет, Офис, Холл, Прихожая	8053178090320	2026-01-25 15:19:48.415	2026-01-25 15:30:38.046	cmhz85ach006oupvs06ykeee8	Италия	Италия	Подарочный набор Albero di Natale (Рождественская ель) диффузор 250 мл	Откройте диффузор, снимите защитный колпачок и установите ротанговые палочки в ароматическую жидкость.\nЧерез час переверните палочки, чтобы усилить аромат.\nРегулируйте интенсивность аромата, добавляя или убирая количество палочек.\nДля поддержания яркости аромата переворачивайте палочки регулярно. При смене аромата замените палочки на новые.	2
cmktvx3rk01k113y4hwhrfc42	Сменный аромат Acqua (Вода) 500 мл, арт. FRV0001E	smennyy-aromat-acqua-voda-500-ml-art-frv0001e	Acqua — это аромат с морской душой, который окутывает легкой свежестью и дарит гармонию. Его композиция начинается с зеленых нот базилика, переходит в сердце, наполненное дыханием морских волн, и завершается мягким мускусом в обрамлении белого кедра. Он наполнит ваш дом свежестью морского бриза, напомнит о счастливых мгновениях у воды и принесет ощущение спокойствия и умиротворения.	\N	14590.00	\N	\N	500 мл	\N	\N	\N	t	f	3	\N	7 х 7 х 20,5	00779	FRV0001E	Сменный аромат	Acqua — это аромат с морской душой, который окутывает легкой свежестью и дарит гармонию. Его композиция начинается с зеленых нот базилика, переходит в сердце, наполненное дыханием морских волн, и завершается мягким мускусом в обрамлении белого кедра. Он наполнит ваш дом свежестью морского бриза, напомнит о счастливых мгновениях у воды и принесет ощущение спокойствия и умиротворения.	Верхние ноты: базилик, мирт\nСердце аромата: морские аккорды, водоросли\nНоты шлейфа: белый мускус, кедр	Ванная комната, Современная гостиная	2000000007946	2026-01-25 15:19:48.56	2026-01-25 15:30:38.205	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Acqua (Вода) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx3t001k713y4kj4pu5t8	Сменный аромат Albero di Natale (Рождественская ель) 500 мл, арт. FRV0018E	smennyy-aromat-albero-di-natale-rozhdestvenskaya-el-500-ml-art-frv0018e	Аромат Albero di Natale наполняет дом теплом и радостью, согревая сердце и создавая атмосферу уюта. Ноты звездчатого аниса, хлорофилла, древесины и сосновой смолы, дикой мяты и лесных мускусов соединяются, чтобы передать магию праздников в выразительном аромате, которым можно наслаждаться круглый год. Albero di Natale — это праздничные моменты, возвращающие вас к теплым семейным воспоминаниям.	\N	17990.00	\N	\N	500 мл	\N	\N	\N	t	f	9	\N	7 х 7 х 20,5	04780	FRV0018E	Сменный аромат	Аромат Albero di Natale наполняет дом теплом и радостью, согревая сердце и создавая атмосферу уюта. Ноты звездчатого аниса, хлорофилла, древесины и сосновой смолы, дикой мяты и лесных мускусов соединяются, чтобы передать магию праздников в выразительном аромате, которым можно наслаждаться круглый год. Albero di Natale — это праздничные моменты, возвращающие вас к теплым семейным воспоминаниям.	Верхние ноты: Розмарин, мята\nСердце аромата: Еловая древесина, еловые смолы\nНоты шлейфа: Сандаловое дерево, мускус	Гостиная, Кабинет, Офис, Холл, Прихожая	2000000049762	2026-01-25 15:19:48.612	2026-01-25 15:30:38.261	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Albero di Natale (Рождественская ель) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx3wo01kj13y42nekvqwf	Сменный аромат Arancio Cannella (Апельсин и корица) 500 мл, арт. FRV0010E	smennyy-aromat-arancio-cannella-apelsin-i-koritsa-500-ml-art-frv0010e	Пряности и спелые фрукты, согретые солнцем, создают неповторимую и сияющую атмосферу. Arancio Canella — это не просто аромат, а настоящая поэзия, написанная корицей и цедрой горького апельсина, чтобы подарить ощущения уюта и умиротворения.\nСоблазнительный букет, заключенный в аромате Arancio Canella воплощает счастливые моменты семейного уюта, придавая любому пространству тепло и даря ощущение благополучия.	\N	14590.00	\N	\N	500 мл	\N	\N	\N	t	f	4	\N	7 х 7 х 20,5	00964	FRV0010E	Сменный аромат	Пряности и спелые фрукты, согретые солнцем, создают неповторимую и сияющую атмосферу. Arancio Canella — это не просто аромат, а настоящая поэзия, написанная корицей и цедрой горького апельсина, чтобы подарить ощущения уюта и умиротворения.\nСоблазнительный букет, заключенный в аромате Arancio Canella воплощает счастливые моменты семейного уюта, придавая любому пространству тепло и даря ощущение благополучия.	Верхние ноты: цветы горького апельсина\nСредние ноты: апельсин\nБазовые ноты: цейлонская корица	Гостиная, кухня, столовая, будуар, комната для чтения, зона камина, прихожая, зимний сад	2000000009865	2026-01-25 15:19:48.744	2026-01-25 15:30:38.404	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Arancio Cannella (Апельсин и корица) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx3zp01kv13y4dz8q0b59	Сменный аромат Fuoco (Огонь) 500 мл, арт. FRV0003E	smennyy-aromat-fuoco-ogon-500-ml-art-frv0003e	Fuoco раскрывается интенсивным, тёплым и пряным ароматом. Нежные верхние ноты лимонного цвета сменяются сердцем из гвоздики и сандала, а завершают композицию богатые акценты звёздчатого аниса, эбенового дерева, шафрана и розового перца. Этот аромат дарит ощущение домашнего уюта, согревает душу и переносит в пространство, где всегда царит тепло и спокойствие.	\N	14590.00	\N	\N	500 мл	\N	\N	\N	t	f	3	\N	7 х 7 х 20,5	00930	FRV0003E	Сменный аромат	Fuoco раскрывается интенсивным, тёплым и пряным ароматом. Нежные верхние ноты лимонного цвета сменяются сердцем из гвоздики и сандала, а завершают композицию богатые акценты звёздчатого аниса, эбенового дерева, шафрана и розового перца. Этот аромат дарит ощущение домашнего уюта, согревает душу и переносит в пространство, где всегда царит тепло и спокойствие.	Верхние ноты: цветы лимона\nСердце: гвоздика, сандал\nБаза: звёздчатый анис, эбеновое дерево, шафран, розовый перец	Кабинет, Современная гостиная, Классическая гостиная	2000000009490	2026-01-25 15:19:48.853	2026-01-25 15:30:38.521	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Fuoco (Огонь) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx44701ld13y433frioeg	Сменный аромат Leather Oud (Кожа и Уд) 500 мл, арт. FRV0R75MNNEEU	smennyy-aromat-leather-oud-kozha-i-ud-500-ml-art-frv0r75mnneeu	Leather Oud — это интерьерный аромат с яркой, роскошной индивидуальностью: экзотичный, глубокий и обволакивающий.\nДрагоценная и смелая композиция раскрывается нотами розы и герани, в сердце звучит тосканская кожа в союзе с ближневосточным удом, а в шлейфе — сандал, мускус и ваниль.	\N	17990.00	\N	\N	500 мл	\N	\N	\N	t	f	7	\N	7 х 7 х 20,5	04774	FRV0R75MNNEEU	Сменный аромат	Leather Oud — это интерьерный аромат с яркой, роскошной индивидуальностью: экзотичный, глубокий и обволакивающий.\nДрагоценная и смелая композиция раскрывается нотами розы и герани, в сердце звучит тосканская кожа в союзе с ближневосточным удом, а в шлейфе — сандал, мускус и ваниль.	Верхние ноты: Элеми, герань, роза, ландыш\nСредние ноты: Уд, кожа, ладан, пачули, амбра\nБазовые ноты: Черное дерево, сандал, мускус, ваниль	Гостиная, Кабинет, Офис, Библиотека, Прихожая, Бутик, Шоурум, Переговорная	2000000049700	2026-01-25 15:19:49.015	2026-01-25 15:30:38.689	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Leather Oud (Кожа и Уд) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx45o01lj13y43guzxcuj	Сменный аромат Limone Cedrato (Лимон и цитрон) 500 мл, арт. frv0r77mnneeu	smennyy-aromat-limone-cedrato-limon-i-tsitron-500-ml-art-frv0r77mnneeu	Limone Cedrato — аромат солнечного утра во Флоренции, наполненный сияющей свежестью лимонов и благородных цитрусов. Он наполняет дом светом, чистотой и ощущением гармонии, словно прогулка по садам Медичи. Лёгкий, жизнерадостный и элегантный, этот аромат пробуждает вдохновение и любовь к жизни.	\N	14590.00	\N	\N	500 мл	\N	\N	\N	t	f	7	\N	7 х 7 х 20,5	05740	frv0r77mnneeu	Сменный аромат	Limone Cedrato — аромат солнечного утра во Флоренции, наполненный сияющей свежестью лимонов и благородных цитрусов. Он наполняет дом светом, чистотой и ощущением гармонии, словно прогулка по садам Медичи. Лёгкий, жизнерадостный и элегантный, этот аромат пробуждает вдохновение и любовь к жизни.	Верхние ноты: Флорентийский цитрон, бергамот \nСердце аромата: листья цитрусов, цветы \nНоты шлейфа: ветивер, сандал	Гостиная, кухня, прихожая, столовая, офис, бутик, зоны общего пользования.	8053178093161	2026-01-25 15:19:49.068	2026-01-25 15:30:38.749	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Limone Cedrato (Лимон и цитрон) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx48s01lv13y40djqe7ga	Сменный аромат Maserati (Мазерати) 500 мл, арт. FRV0049E	smennyy-aromat-maserati-mazerati-500-ml-art-frv0049e	Maserati от Dr. Vranjes — аромат силы, стиля и безупречного вкуса, созданный как ольфакторный символ легендарного бренда Maserati. Свежие зелёно-цитрусовые ноты плавно переходят в элегантное сердце из литсеи кубебы, лаванды и герани, а затем раскрываются благородным шлейфом кожи, сандала и мускуса. Это аромат скорости, уверенности и роскоши с флорентийским характером.	\N	21290.00	\N	\N	500 мл	\N	\N	\N	t	f	7	\N	7 х 7 х 20,5	00464	FRV0049E	Сменный аромат	Maserati от Dr. Vranjes — аромат силы, стиля и безупречного вкуса, созданный как ольфакторный символ легендарного бренда Maserati. Свежие зелёно-цитрусовые ноты плавно переходят в элегантное сердце из литсеи кубебы, лаванды и герани, а затем раскрываются благородным шлейфом кожи, сандала и мускуса. Это аромат скорости, уверенности и роскоши с флорентийским характером.	Верхние ноты: Литсея кубеба (Лемонграсс кубеба), Кориандр\nСердце: Герань, Кардамон\nБаза: Сандал, Чёрный перец	Кабинет, гостиная, холл, офис, автосалон, переговорная, мужская зона, шоурум, лаунж-пространство	2000000004754	2026-01-25 15:19:49.18	2026-01-25 15:30:38.87	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Maserati (Мазерати) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx4b801m713y4caqnjglv	Сменный аромат Melograno (Гранат) 500 мл, арт. FRV0009E	smennyy-aromat-melograno-granat-500-ml-art-frv0009e	Яркий и многогранный, Melograno от Dr. Vranjes Firenze раскрывает неожиданную сторону граната — свежую, сочную и элегантную. Арбуз и бергамот придают аромату лёгкость, а жасмин и роза наполняют его утончённой цветочной глубиной. Финальные ноты чёрной смородины и красного винограда оставляют благородный, живой шлейф, к которому хочется возвращаться.	\N	14590.00	\N	\N	500 мл	\N	\N	\N	t	f	6	\N	7 х 7 х 20,5	00773	FRV0009E	Сменный аромат	Яркий и многогранный, Melograno от Dr. Vranjes Firenze раскрывает неожиданную сторону граната — свежую, сочную и элегантную. Арбуз и бергамот придают аромату лёгкость, а жасмин и роза наполняют его утончённой цветочной глубиной. Финальные ноты чёрной смородины и красного винограда оставляют благородный, живой шлейф, к которому хочется возвращаться.	Верхние ноты: арбуз\nСредние ноты: жасмин, роза, бергамот\nБазовые ноты: чёрная смородина, красный виноград	Гостиная, столовая, кухня, прихожая, офис, переговорная, бутик, салон красоты	2000000007885	2026-01-25 15:19:49.268	2026-01-25 15:30:38.953	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Melograno (Гранат) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx4eo01mj13y487i8eulw	Сменный аромат Oud Nobile (Уд благородный) 500 мл, арт. FRV0042E	smennyy-aromat-oud-nobile-ud-blagorodnyy-500-ml-art-frv0042e	Oud Nobile — это воплощение восточной роскоши и силы благородных древесных аккордов. Искрящаяся свежесть бергамота и нероли уступает место глубокому, обволакивающему сердцу уда, мирры и ладана, создавая атмосферу тайны и притяжения. Тёплый шлейф мускуса и ценных пород дерева наполняет пространство ощущением статуса, глубины и чувственной элегантности.	\N	17990.00	\N	\N	500 мл	\N	\N	\N	t	f	13	\N	7 х 7 х 20,5	00459	FRV0042E	Сменный аромат	Oud Nobile — это воплощение восточной роскоши и силы благородных древесных аккордов. Искрящаяся свежесть бергамота и нероли уступает место глубокому, обволакивающему сердцу уда, мирры и ладана, создавая атмосферу тайны и притяжения. Тёплый шлейф мускуса и ценных пород дерева наполняет пространство ощущением статуса, глубины и чувственной элегантности.	Верхние ноты: бергамот, нероли\nСредние ноты: уд, мирра, ладан, амбра, сандал\nБазовые ноты: гваяковое дерево, мускус, нагармота	Гостиная, кабинет, библиотека, офис, холл, бутик, шоурум, сигарная комната, лаунж-зона	2000000004709	2026-01-25 15:19:49.393	2026-01-25 15:30:39.072	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Oud Nobile (Уд благородный) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx4ht01mv13y4uw9zn4ko	Сменный аромат Rosso nobile (Красный благородный) 1000 мл, арт. FRV0R16MPRSE2	smennyy-aromat-rosso-nobile-krasnyy-blagorodnyy-1000-ml-art-frv0r16mprse2	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	38790.00	\N	\N	1000 мл	\N	\N	\N	t	f	1	\N	7 х 7 х 20,5	05374	FRV0R16MPRSE2	Сменный аромат	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Гостиная, столовая, кабинет, библиотека, винная комната, зона отдыха, бутик, переговорная, холл	8056860398612	2026-01-25 15:19:49.506	2026-01-25 15:30:39.183	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Rosso nobile (Красный благородный) 1000 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx4mp01n713y4zublibm0	Сменный аромат Vaniglia Mandarino (Ваниль и мандарин) 500 мл, арт. FRV0005E	smennyy-aromat-vaniglia-mandarino-vanil-i-mandarin-500-ml-art-frv0005e	Vaniglia Mandarino — нежный и обволакивающий аромат, в котором сладкая ваниль и бобы тонка гармонично сочетаются со свежими, солнечными акцентами мандарина. Эта композиция наполняет пространство теплом, мягкостью и ощущением спокойствия, словно возвращая в беззаботные моменты детства. Лёгкий, уютный и чувственный, аромат дарит ощущение комфорта и душевного равновесия.	\N	14590.00	\N	\N	500 мл	\N	\N	\N	t	f	7	\N	7 х 7 х 20,5	00480	FRV0005E	Сменный аромат	Vaniglia Mandarino — нежный и обволакивающий аромат, в котором сладкая ваниль и бобы тонка гармонично сочетаются со свежими, солнечными акцентами мандарина. Эта композиция наполняет пространство теплом, мягкостью и ощущением спокойствия, словно возвращая в беззаботные моменты детства. Лёгкий, уютный и чувственный, аромат дарит ощущение комфорта и душевного равновесия.	Верхние ноты: мандарин\nСредние ноты: ваниль\nБазовые ноты: бобы тонка	Гостиная, спальня, детская комната, зона отдыха, семейная комната, кабинет, будуар	2000000004914	2026-01-25 15:19:49.681	2026-01-25 15:30:39.25	cmhz85ach006oupvs06ykeee8	Италия	Италия	Сменный аромат Vaniglia Mandarino (Ваниль и мандарин) 500 мл	Залейте сменную жидкость в флакон диффузора.\nУстановите палочки для аромата.\nДля оптимального результата периодически переворачивайте палочки или обновляйте их при смене аромата.	2
cmktvx4z701od13y4db8rydak	Спрей для дома Albero di Natale (Рождественская ель) 100 мл, арт. FRV0018B	sprey-dlya-doma-albero-di-natale-rozhdestvenskaya-el-100-ml-art-frv0018b	Аромат Albero di Natale наполняет дом теплом и радостью, согревая сердце и создавая атмосферу уюта. Ноты звездчатого аниса, хлорофилла, древесины и сосновой смолы, дикой мяты и лесных мускусов соединяются, чтобы передать магию праздников в выразительном аромате, которым можно наслаждаться круглый год. Albero di Natale — это праздничные моменты, возвращающие вас к теплым семейным воспоминаниям.	\N	10690.00	\N	\N	100 мл	\N	\N	\N	t	f	7	\N	12,5 х 6 х 6	04781	FRV0018B	Спрей для дома	Аромат Albero di Natale наполняет дом теплом и радостью, согревая сердце и создавая атмосферу уюта. Ноты звездчатого аниса, хлорофилла, древесины и сосновой смолы, дикой мяты и лесных мускусов соединяются, чтобы передать магию праздников в выразительном аромате, которым можно наслаждаться круглый год. Albero di Natale — это праздничные моменты, возвращающие вас к теплым семейным воспоминаниям.	Верхние ноты: Розмарин, мята\nСердце аромата: Еловая древесина, еловые смолы\nНоты шлейфа: Сандаловое дерево, мускус	Гостиная, Кабинет, Офис, Холл, Прихожая	2000000049779	2026-01-25 15:19:50.131	2026-01-25 15:30:39.675	cmhz85ach006oupvs06ykeee8	Италия	Италия	Спрей для дома Albero di Natale (Рождественская ель) 100 мл	Спреи для дома наиболее тонко и точно раскрывают богатство парфюмерной композиции. Распылите с небольшого расстояния на текстиль или в воздухе помещения.	1
cmktvx52j01op13y4m9rwujmp	Спрей для дома Arancio Uva Rossa (Апельсин и красный виноград) 100 мл, арт. FRV0019B	sprey-dlya-doma-arancio-uva-rossa-apelsin-i-krasnyy-vinograd-100-ml-art-frv0019b	Arancio e Uva Rossa — аромат тосканского виноградника, наполненный светом, теплом и солнечной свежестью. Горький апельсин и мандарин переплетаются с бархатными нотами красного винограда, розы и магнолии, переходя в изящный шлейф фиалки, корицы и берёзовой древесины. Этот аромат словно приглашает снова и снова возвращаться в Тоскану — где бы вы ни находились.	\N	7790.00	\N	\N	100 мл	\N	\N	\N	t	f	8	\N	12,5 х 6 х 6	04536	FRV0019B	Спрей для дома	Arancio e Uva Rossa — аромат тосканского виноградника, наполненный светом, теплом и солнечной свежестью. Горький апельсин и мандарин переплетаются с бархатными нотами красного винограда, розы и магнолии, переходя в изящный шлейф фиалки, корицы и берёзовой древесины. Этот аромат словно приглашает снова и снова возвращаться в Тоскану — где бы вы ни находились.	Верхние ноты: горький апельсин, мандарин\nСредние ноты: красный виноград, роза, магнолия\nБазовые ноты: фиалка, корица, березовая древесина	Гостиная, столовая, кухня, кабинет, прихожая, бутик, дегустационные и винные пространства, зоны приёма гостей	2000000047256	2026-01-25 15:19:50.252	2026-01-25 15:30:39.791	cmhz85ach006oupvs06ykeee8	Италия	Италия	Спрей для дома Arancio Uva Rossa (Апельсин и красный виноград) 100 мл	Спреи для дома наиболее тонко и точно раскрывают богатство парфюмерной композиции. Распылите с небольшого расстояния на текстиль или в воздухе помещения.	1
cmktvx55g01p113y4m38f1rx6	Спрей для дома Fuoco (Огонь) 100 мл, арт. FRV0003B	sprey-dlya-doma-fuoco-ogon-100-ml-art-frv0003b	Fuoco раскрывается интенсивным, тёплым и пряным ароматом. Нежные верхние ноты лимонного цвета сменяются сердцем из гвоздики и сандала, а завершают композицию богатые акценты звёздчатого аниса, эбенового дерева, шафрана и розового перца. Этот аромат дарит ощущение домашнего уюта, согревает душу и переносит в пространство, где всегда царит тепло и спокойствие.	\N	7790.00	\N	\N	100 мл	\N	\N	\N	t	f	1	\N	12,5 х 6 х 6	05369	FRV0003B	Спрей для дома	Fuoco раскрывается интенсивным, тёплым и пряным ароматом. Нежные верхние ноты лимонного цвета сменяются сердцем из гвоздики и сандала, а завершают композицию богатые акценты звёздчатого аниса, эбенового дерева, шафрана и розового перца. Этот аромат дарит ощущение домашнего уюта, согревает душу и переносит в пространство, где всегда царит тепло и спокойствие.	Верхние ноты: цветы лимона\nСердце: гвоздика, сандал\nБаза: звёздчатый анис, эбеновое дерево, шафран, розовый перец	Кабинет, Современная гостиная, Классическая гостиная	2000000055855	2026-01-25 15:19:50.357	2026-01-25 15:30:39.9	cmhz85ach006oupvs06ykeee8	Италия	Италия	Спрей для дома Fuoco (Огонь) 100 мл	Спреи для дома наиболее тонко и точно раскрывают богатство парфюмерной композиции. Распылите с небольшого расстояния на текстиль или в воздухе помещения.	1
cmktvx58701pd13y4g8fxo6fd	Спрей для дома Leather Oud (Кожа и Уд) 100 мл, арт. FRV0S75MGNEEU	sprey-dlya-doma-leather-oud-kozha-i-ud-100-ml-art-frv0s75mgneeu	Leather Oud — это интерьерный аромат с яркой, роскошной индивидуальностью: экзотичный, глубокий и обволакивающий.\nДрагоценная и смелая композиция раскрывается нотами розы и герани, в сердце звучит тосканская кожа в союзе с ближневосточным удом, а в шлейфе — сандал, мускус и ваниль.	\N	10690.00	\N	\N	100 мл	\N	\N	\N	t	f	3	\N	12,5 х 6 х 6	04776	FRV0S75MGNEEU	Спрей для дома	Leather Oud — это интерьерный аромат с яркой, роскошной индивидуальностью: экзотичный, глубокий и обволакивающий.\nДрагоценная и смелая композиция раскрывается нотами розы и герани, в сердце звучит тосканская кожа в союзе с ближневосточным удом, а в шлейфе — сандал, мускус и ваниль.	Верхние ноты: Элеми, герань, роза, ландыш\nСредние ноты: Уд, кожа, ладан, пачули, амбра\nБазовые ноты: Черное дерево, сандал, мускус, ваниль	Гостиная, Кабинет, Офис, Библиотека, Прихожая, Бутик, Шоурум, Переговорная	2000000049724	2026-01-25 15:19:50.456	2026-01-25 15:30:40.02	cmhz85ach006oupvs06ykeee8	Италия	Италия	Спрей для дома Leather Oud (Кожа и Уд) 100 мл	Спреи для дома наиболее тонко и точно раскрывают богатство парфюмерной композиции. Распылите с небольшого расстояния на текстиль или в воздухе помещения.	1
cmktvx5bq01pp13y4v7ab5c7f	Спрей для дома Melograno (Гранат) 100 мл, арт. FRV0009B	sprey-dlya-doma-melograno-granat-100-ml-art-frv0009b	Яркий и многогранный, Melograno от Dr. Vranjes Firenze раскрывает неожиданную сторону граната — свежую, сочную и элегантную. Арбуз и бергамот придают аромату лёгкость, а жасмин и роза наполняют его утончённой цветочной глубиной. Финальные ноты чёрной смородины и красного винограда оставляют благородный, живой шлейф, к которому хочется возвращаться.	\N	7790.00	\N	\N	100 мл	\N	\N	\N	t	f	4	\N	12,5 х 6 х 6	05373	FRV0009B	Спрей для дома	Яркий и многогранный, Melograno от Dr. Vranjes Firenze раскрывает неожиданную сторону граната — свежую, сочную и элегантную. Арбуз и бергамот придают аромату лёгкость, а жасмин и роза наполняют его утончённой цветочной глубиной. Финальные ноты чёрной смородины и красного винограда оставляют благородный, живой шлейф, к которому хочется возвращаться.	Верхние ноты: арбуз\nСредние ноты: жасмин, роза, бергамот\nБазовые ноты: чёрная смородина, красный виноград	Гостиная, столовая, кухня, прихожая, офис, переговорная, бутик, салон красоты	2000000055893	2026-01-25 15:19:50.582	2026-01-25 15:30:40.131	cmhz85ach006oupvs06ykeee8	Италия	Италия	Спрей для дома Melograno (Гранат) 100 мл	Спреи для дома наиболее тонко и точно раскрывают богатство парфюмерной композиции. Распылите с небольшого расстояния на текстиль или в воздухе помещения.	1
cmktvx5em01q113y48p6ds7di	Спрей для дома Oud Nobile (Уд благородный) 100 мл, арт. FRV0042B	sprey-dlya-doma-oud-nobile-ud-blagorodnyy-100-ml-art-frv0042b	Oud Nobile — это воплощение восточной роскоши и силы благородных древесных аккордов. Искрящаяся свежесть бергамота и нероли уступает место глубокому, обволакивающему сердцу уда, мирры и ладана, создавая атмосферу тайны и притяжения. Тёплый шлейф мускуса и ценных пород дерева наполняет пространство ощущением статуса, глубины и чувственной элегантности.	\N	10690.00	\N	\N	100 мл	\N	\N	\N	t	f	5	\N	12,5 х 6 х 6	03418	FRV0042B	Спрей для дома	Oud Nobile — это воплощение восточной роскоши и силы благородных древесных аккордов. Искрящаяся свежесть бергамота и нероли уступает место глубокому, обволакивающему сердцу уда, мирры и ладана, создавая атмосферу тайны и притяжения. Тёплый шлейф мускуса и ценных пород дерева наполняет пространство ощущением статуса, глубины и чувственной элегантности.	Верхние ноты: бергамот, нероли\nСредние ноты: уд, мирра, ладан, амбра, сандал\nБазовые ноты: гваяковое дерево, мускус, нагармота	Гостиная, кабинет, библиотека, офис, холл, бутик, шоурум, сигарная комната, лаунж-зона	2000000035659	2026-01-25 15:19:50.687	2026-01-25 15:30:40.241	cmhz85ach006oupvs06ykeee8	Италия	Италия	Спрей для дома Oud Nobile (Уд благородный) 100 мл	Спреи для дома наиболее тонко и точно раскрывают богатство парфюмерной композиции. Распылите с небольшого расстояния на текстиль или в воздухе помещения.	1
cmktvx5hk01qd13y4go7nfls5	Спрей для дома Rosso Nobile (Красный благородный) 100 мл, арт. FRV0016B	sprey-dlya-doma-rosso-nobile-krasnyy-blagorodnyy-100-ml-art-frv0016b	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	\N	10690.00	\N	\N	100 мл	\N	\N	\N	t	f	28	\N	12,5 х 6 х 6	02282	FRV0016B	Спрей для дома	Rosso Nobile — культовый Ароматы для дома, воплощающий душу Тосканы. Он раскрывается благородными нотами тосканского красного вина, апельсинового цвета, спелых ягод и тёплого аккорда дуба и берёзы. Один вдох — и вы словно оказываетесь среди виноградников Кьянти, в атмосфере спокойствия и утончённой роскоши.	Верхние ноты: апельсин, апельсиновый цвет, фиалка\nСредние ноты: клубника, лесные ягоды\nБазовые ноты: древесина дуба и берёзы	Гостиная, столовая, кабинет, библиотека, винная комната, зона отдыха, бутик, переговорная, холл	2000000023816	2026-01-25 15:19:50.792	2026-01-25 15:30:40.386	cmhz85ach006oupvs06ykeee8	Италия	Италия	Спрей для дома Rosso Nobile (Красный благородный) 100 мл	Спреи для дома наиболее тонко и точно раскрывают богатство парфюмерной композиции. Распылите с небольшого расстояния на текстиль или в воздухе помещения.	1
cmktvx5kk01qp13y4yrino100	Спрей для дома Velvet Saffron (Бархатистый шафран) 100 мл, арт. frv0s76mgnee	sprey-dlya-doma-velvet-saffron-barhatistyy-shafran-100-ml-art-frv0s76mgnee	Velvet Saffron — изысканный аромат, где тепло шафрана встречается с уютом пачули, а пряный кардамон добавляет характер и динамику. Сердце композиции раскрывается фиалкой и ветивером, создавая глубину и многогранность, словно мягкий шелковый шёпот Флоренции. Этот парфюм наполняет пространство роскошью, утонченностью и чувственной атмосферой.	\N	10690.00	\N	\N	100 мл	\N	\N	\N	t	f	1	\N	12,5 х 6 х 6	05636	frv0s76mgnee	Спрей для дома	Velvet Saffron — изысканный аромат, где тепло шафрана встречается с уютом пачули, а пряный кардамон добавляет характер и динамику. Сердце композиции раскрывается фиалкой и ветивером, создавая глубину и многогранность, словно мягкий шелковый шёпот Флоренции. Этот парфюм наполняет пространство роскошью, утонченностью и чувственной атмосферой.	Верхние ноты: кардамон\nСредние ноты: шафран, фиалка, ветивер\nБазовые ноты: пачули, бобы тонка	Гостиная, кабинет, спальня, лаунж-зона, библиотека, бутик, уютные уголки для отдыха	2000000058689	2026-01-25 15:19:50.9	2026-01-25 15:30:40.518	cmhz85ach006oupvs06ykeee8	Италия	Италия	Спрей для дома Velvet Saffron (Бархатистый шафран) 100 мл	Спреи для дома наиболее тонко и точно раскрывают богатство парфюмерной композиции. Распылите с небольшого расстояния на текстиль или в воздухе помещения.	1
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, "userId", "productId", rating, title, comment, "isVerified", "createdAt", "updatedAt", "isApproved", "userEmail", "userName") FROM stdin;
\.


--
-- Data for Name: seasonal_discount_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seasonal_discount_categories (id, "discountId", "categoryId", "createdAt") FROM stdin;
\.


--
-- Data for Name: seasonal_discount_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seasonal_discount_products (id, "discountId", "productId", "createdAt") FROM stdin;
\.


--
-- Data for Name: seasonal_discounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seasonal_discounts (id, name, discount, "startDate", "endDate", "isActive", "applyTo", "createdAt", "updatedAt") FROM stdin;
cmh1yg35d0000538qye1xtkp1	Осенняя распродажа	15	2025-09-30 00:00:00	2025-11-17 00:00:00	t	products	2025-10-22 12:13:53.521	2025-11-16 12:41:53.397
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (id, key, value, type, "createdAt", "updatedAt") FROM stdin;
cmkjmx8jx0000se6iox9j8m4r	maintenance_enabled	true	boolean	2026-01-18 11:10:16.462	2026-01-19 12:56:41.787
cmkjmx8k30001se6intzzwsbg	maintenance_date	2026-02-11T23:00:00.000Z	string	2026-01-18 11:10:16.468	2026-01-19 12:56:41.79
cmkivs2v10000120rpwkwg0r4	chat_enabled	false	boolean	2026-01-17 22:30:26.173	2026-01-18 21:29:13
cmkk0i6y20002se6iise5rvyy	SMTP_HOST	smtp.mail.ru	string	2026-01-18 17:30:29.162	2026-01-19 08:51:32.434
cmkk0i6y40003se6i00j5lxfy	SMTP_PORT	465	string	2026-01-18 17:30:29.165	2026-01-19 08:51:32.437
cmkk0i6y50004se6iiors82qj	SMTP_USER	zakaz@aromarussia.ru	string	2026-01-18 17:30:29.166	2026-01-19 08:51:32.438
cmkk0i6y70005se6ikss9j91x	SMTP_PASS	Yestr1OfwBevjPBfOTIb	string	2026-01-18 17:30:29.168	2026-01-19 08:51:32.439
cmkk0i6y80006se6i1tztzm03	SMTP_FROM	zakaz@aromarussia.ru	string	2026-01-18 17:30:29.169	2026-01-19 08:51:32.44
\.


--
-- Data for Name: task_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task_messages (id, "taskId", "userId", message, "fileUrl", "fileName", "createdAt", "updatedAt") FROM stdin;
cmkcogjq80007lbyd57j33r88	cmkcobskl0001lbyd8ya4l9a0	cmkcofnsw0005lbyd9hzmn1py	Юля, опиши подробнее, что нужно	\N	\N	2026-01-13 14:18:53.792	2026-01-13 14:18:53.792
cmkk96q7o000adx8ta1tn3yrp	cmkk95un20008dx8t3fnx5c52	cmkcofnsw0005lbyd9hzmn1py	Плюс к этому: \n[17:46, 18.01.2026] +7 921 789-27-77: info@aromarussia.ru\n[17:46, 18.01.2026] +7 921 789-27-77: opt@aromarussia.ru\n[17:47, 18.01.2026] +7 921 789-27-77: market@aromarussia.ru\n[17:47, 18.01.2026] +7 921 789-27-77: office@aromarussia.ru	\N	\N	2026-01-18 21:33:30.804	2026-01-18 21:33:30.804
cmktwpxla023h13y42bwni8ak	cmkk95un20008dx8t3fnx5c52	cmkcofnsw0005lbyd9hzmn1py	я сделать, пока что, zakaz и info\nпотом по потребностям сделаем другие	\N	\N	2026-01-25 15:42:13.582	2026-01-25 15:42:13.582
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tasks (id, title, description, status, priority, "fileUrl", "fileName", "createdById", "createdAt", "updatedAt") FROM stdin;
cmkk0o9w7000nse6iobhchf38	Если товара нет на сайте	Если товара нет на сайте, например, обновили excel, то в карточке товара должна быть возможность для клиента спросить, когда товар появится в продаже. \nПример в виде ссылки и ввиде скрина направляю https://randewoo.ru/product/passion-34895\n	new	normal	/uploads/products/1768757712825-ryjf2dtzi2b.png	Снимок экрана 2026-01-18 203732.png	cmh1woio4000011n4qsje0699	2026-01-18 17:35:12.92	2026-01-18 17:35:12.92
cmkk0ug0r000use6i2ewcns4c	виш-лист	Для клиента можно сделать в карточке товара кнопку: хочу в подарок. \nНажимаем на кнопку и копирует ссылку или как-то отправляет прям со страницы на чей-то телефон, мэйл. \n	new	normal	/uploads/products/1768758000717-6k6t4mqju3.jpeg	c026f3b6-6f17-4b49-be09-3e6b5afd1b5d.jpeg	cmh1woio4000011n4qsje0699	2026-01-18 17:40:00.796	2026-01-18 17:40:00.796
cmkcobskl0001lbyd8ya4l9a0	Добавить отзывы на сайт	Отобразить для всех товаров функционал отзывов\nДобавить отзывы в админку	done	normal	\N	\N	cmh1woio4000011n4qsje0699	2026-01-13 14:15:11.974	2026-01-19 10:15:05.247
cmkk95un20008dx8t3fnx5c52	Создать email с доменным именем	zakaz@aromarussia.ru	done	normal	\N	\N	cmkcofnsw0005lbyd9hzmn1py	2026-01-18 21:32:49.886	2026-01-25 15:42:18.224
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, name, phone, password, role, "isActive", "createdAt", "updatedAt", "termsAcceptedAt", "privacyAcceptedAt", "allowedAdminSections", "marketingConsent", "marketingConsentAt", unsubscribed) FROM stdin;
cmh1woio4000011n4qsje0699	admin@idylle.spb.ru	Администратор	\N	$2a$12$RQ63aY4nkHcboh0uUwUwSejSOq4crNusS1DeRZcH3JGR2wStacnh6	super_admin	t	2025-10-22 11:24:27.652	2025-10-25 12:06:36.425	2025-10-22 11:24:27.64	2025-10-22 11:24:27.64	{products,categories,filters,users,orders,administrators,seasonal-discounts}	\N	\N	f
cmh7qsx9y0000131895gf5r13	ognew.d@gmail.com	Дмитрий Огнев	+79210914280	$2a$12$MCvuDTIR/h/RI0Zov00NSuC0xHZVUVJvvbAqeWdTVF0XQzLbYtKGi	user	t	2025-10-26 13:26:32.567	2025-10-26 14:16:19.737	2025-10-26 13:26:31.949	2025-10-26 13:26:31.949	{}	\N	\N	f
cmkcofnsw0005lbyd9hzmn1py	ognewd@gmail.com	Дима	\N	$2a$10$sN2Q.7I6OqPV1w/GGJeDr.M/R2lfT9BVd3m3n9DzR.zqjIzvk8aYO	admin	t	2026-01-13 14:18:12.417	2026-01-13 14:18:12.417	\N	\N	{products,categories,seasonal-discounts,filters,users,orders,administrators}	\N	\N	f
cmkl0b0170004xth4p7rhsbd8	idylle.spb1@gmail.com	Вика	\N	$2a$10$IA4K33yofL8lN3BFkP7.UuO9AKYCnSoVsNjKAnnE8QcFXIp0D8KaK	admin	t	2026-01-19 10:12:39.787	2026-01-19 11:32:46.964	\N	\N	{products,categories,seasonal-discounts,filters,users,orders,administrators}	\N	\N	f
\.


--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wishlist_items (id, "userId", "productId", "createdAt") FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);


--
-- Name: email_campaign_recipients email_campaign_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaign_recipients
    ADD CONSTRAINT email_campaign_recipients_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns email_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns
    ADD CONSTRAINT email_campaigns_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: email_unsubscribes email_unsubscribes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_unsubscribes
    ADD CONSTRAINT email_unsubscribes_pkey PRIMARY KEY (id);


--
-- Name: filter_groups filter_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filter_groups
    ADD CONSTRAINT filter_groups_pkey PRIMARY KEY (id);


--
-- Name: filter_options filter_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filter_options
    ADD CONSTRAINT filter_options_pkey PRIMARY KEY (id);


--
-- Name: newsletter newsletter_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter
    ADD CONSTRAINT newsletter_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: seasonal_discount_categories seasonal_discount_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasonal_discount_categories
    ADD CONSTRAINT seasonal_discount_categories_pkey PRIMARY KEY (id);


--
-- Name: seasonal_discount_products seasonal_discount_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasonal_discount_products
    ADD CONSTRAINT seasonal_discount_products_pkey PRIMARY KEY (id);


--
-- Name: seasonal_discounts seasonal_discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasonal_discounts
    ADD CONSTRAINT seasonal_discounts_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: task_messages task_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_messages
    ADD CONSTRAINT task_messages_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- Name: brands_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX brands_name_key ON public.brands USING btree (name);


--
-- Name: brands_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX brands_slug_key ON public.brands USING btree (slug);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: email_campaign_recipients_campaignId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "email_campaign_recipients_campaignId_status_idx" ON public.email_campaign_recipients USING btree ("campaignId", status);


--
-- Name: email_campaign_recipients_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX email_campaign_recipients_email_idx ON public.email_campaign_recipients USING btree (email);


--
-- Name: email_campaigns_status_scheduledAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "email_campaigns_status_scheduledAt_idx" ON public.email_campaigns USING btree (status, "scheduledAt");


--
-- Name: email_templates_type_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX email_templates_type_status_idx ON public.email_templates USING btree (type, status);


--
-- Name: email_unsubscribes_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX email_unsubscribes_email_idx ON public.email_unsubscribes USING btree (email);


--
-- Name: email_unsubscribes_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX email_unsubscribes_token_key ON public.email_unsubscribes USING btree (token);


--
-- Name: newsletter_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX newsletter_email_key ON public.newsletter USING btree (email);


--
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- Name: pages_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pages_slug_key ON public.pages USING btree (slug);


--
-- Name: product_categories_productId_categoryId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "product_categories_productId_categoryId_key" ON public.product_categories USING btree ("productId", "categoryId");


--
-- Name: products_myWarehouseCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "products_myWarehouseCode_idx" ON public.products USING btree ("myWarehouseCode");


--
-- Name: products_myWarehouseCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "products_myWarehouseCode_key" ON public.products USING btree ("myWarehouseCode");


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- Name: seasonal_discount_categories_discountId_categoryId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "seasonal_discount_categories_discountId_categoryId_key" ON public.seasonal_discount_categories USING btree ("discountId", "categoryId");


--
-- Name: seasonal_discount_products_discountId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "seasonal_discount_products_discountId_productId_key" ON public.seasonal_discount_products USING btree ("discountId", "productId");


--
-- Name: settings_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX settings_key_key ON public.settings USING btree (key);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: wishlist_items_userId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "wishlist_items_userId_productId_key" ON public.wishlist_items USING btree ("userId", "productId");


--
-- Name: addresses addresses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: categories categories_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: chat_messages chat_messages_chatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT "chat_messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES public.chat_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: email_campaign_recipients email_campaign_recipients_campaignId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaign_recipients
    ADD CONSTRAINT "email_campaign_recipients_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES public.email_campaigns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: email_campaigns email_campaigns_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns
    ADD CONSTRAINT "email_campaigns_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public.email_templates(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: filter_options filter_options_filterGroupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.filter_options
    ADD CONSTRAINT "filter_options_filterGroupId_fkey" FOREIGN KEY ("filterGroupId") REFERENCES public.filter_groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_addressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_categories product_categories_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT "product_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_categories product_categories_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT "product_categories_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_images product_images_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variants product_variants_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: reviews reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: seasonal_discount_categories seasonal_discount_categories_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasonal_discount_categories
    ADD CONSTRAINT "seasonal_discount_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: seasonal_discount_categories seasonal_discount_categories_discountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasonal_discount_categories
    ADD CONSTRAINT "seasonal_discount_categories_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES public.seasonal_discounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: seasonal_discount_products seasonal_discount_products_discountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasonal_discount_products
    ADD CONSTRAINT "seasonal_discount_products_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES public.seasonal_discounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: seasonal_discount_products seasonal_discount_products_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seasonal_discount_products
    ADD CONSTRAINT "seasonal_discount_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_messages task_messages_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_messages
    ADD CONSTRAINT "task_messages_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_messages task_messages_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_messages
    ADD CONSTRAINT "task_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tasks tasks_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "tasks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: wishlist_items wishlist_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT "wishlist_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT "wishlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict hejalofcRXfsbQ5OyfPfc6WxbQZ8ATQTIY6hDlhC9xIEQMrIyInDVRaPZXmULKG

