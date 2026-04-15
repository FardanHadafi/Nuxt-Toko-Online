<p align="center">
  <img src="https://nuxt.com/assets/design-kit/icon-green.svg" width="80" alt="Nuxt Logo" />
</p>

<h1 align="center">Toko Online</h1>

<p align="center">
  <strong>Modern E-Commerce Storefront</strong> — built with Nuxt 4, Tailwind CSS 4, and Midtrans Payment Gateway.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Nuxt-4.x-00DC82?logo=nuxt.js&logoColor=white" alt="Nuxt 4" />
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Pinia-3-FEDD3A?logo=vue.js&logoColor=black" alt="Pinia" />
  <img src="https://img.shields.io/badge/Bun-runtime-F9F1E1?logo=bun&logoColor=black" alt="Bun" />
  <img src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="MIT License" />
</p>

---

## ✨ Overview

**Toko Online** is a full-featured e-commerce storefront frontend that delivers a premium shopping experience. It features a responsive catalog, real-time cart management, integrated payment via Midtrans Snap, and a complete admin dashboard for managing products, categories, orders, and store settings.

The frontend communicates with a **Go (Gin)** backend API through a Nuxt server proxy, ensuring clean separation of concerns and secure API routing.

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Nuxt 4 (SSR)                         │
│  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌────────────┐  │
│  │  Pages   │  │Components│  │ Store  │  │Composables │  │
│  │ (Views)  │  │   (UI)   │  │(Pinia) │  │  (API/FX)  │  │
│  └────┬─────┘  └─────┬────┘  └───┬────┘  └──────┬─────┘  │
│       └──────────────┴──────────┴───────────────┘        │
│                         │                                │
│              Nuxt Server Proxy (/api/**)                 │
└─────────────────────────┬────────────────────────────────┘
                          │  HTTP
              ┌───────────▼───────────┐
              │   Go Gin Backend API  │
              │  (PostgreSQL · Redis  │
              │  Cloudinary · Midtrans)│
              └───────────────────────┘
```

---

## 🚀 Features

### Storefront

- 🛍 **Product Catalog** — browse products with category filtering
- 🔍 **Product Detail** — view full product info with image, description & stock
- 🛒 **Shopping Cart** — add, update qty, remove items (Pinia-powered)
- 💳 **Checkout & Payment** — guest checkout with Midtrans Snap integration
- 📱 **Responsive Design** — mobile-first layout with Tailwind CSS 4
- ✨ **GSAP Animations** — smooth scroll-triggered transitions and micro-interactions
- ℹ️ **About Page** — FAQ accordion, feature grid & CTA section

### Admin Dashboard

- 🔐 **Auth** — session-based login with JWT & CSRF protection
- 📊 **Dashboard** — revenue overview and order statistics
- 📦 **Product Management** — CRUD with image upload (Cloudinary)
- 🏷 **Category Management** — create, edit & organize categories
- 📋 **Order Management** — view and track all customer orders
- ⚙️ **Store Settings** — configure store name, WhatsApp number & address

---

## 🛠 Tech Stack

| Layer            | Technology                                           |
| ---------------- | ---------------------------------------------------- |
| Framework        | [Nuxt 4](https://nuxt.com)                           |
| UI Library       | [Vue 3.5](https://vuejs.org)                         |
| Styling          | [Tailwind CSS 4](https://tailwindcss.com)            |
| State            | [Pinia 3](https://pinia.vuejs.org)                   |
| Animations       | [GSAP 3](https://greensock.com/gsap/)                |
| Icons            | [Nuxt Icon](https://nuxt.com/modules/icon) (Iconify) |
| Payment          | [Midtrans Snap](https://midtrans.com)                |
| Runtime          | [Bun](https://bun.sh)                                |
| Containerization | [Docker](https://docker.com)                         |

---

## 📁 Project Structure

```
Nuxt-Toko-Online/
├── app/
│   ├── assets/css/         # Global styles (Tailwind entry)
│   ├── components/         # Reusable Vue components
│   │   ├── Footer.vue
│   │   ├── Home.vue
│   │   ├── Login.vue
│   │   ├── Navbar.vue
│   │   └── ProductCard.vue
│   ├── composables/        # Shared logic & API utilities
│   │   ├── gsap.client.ts  # GSAP client-side plugin
│   │   ├── useApi.ts       # API composable (fetch + CSRF)
│   │   └── useSmoother.ts  # Smooth scroll helper
│   ├── data/               # Static/mock product data
│   ├── layouts/            # App layouts
│   │   ├── admin.vue       # Admin dashboard layout
│   │   └── default.vue     # Public storefront layout
│   ├── middleware/          # Route middleware
│   │   └── admin.ts        # Admin auth guard
│   ├── pages/              # File-based routing
│   │   ├── index.vue       # Homepage
│   │   ├── cart.vue         # Shopping cart
│   │   ├── about/          # About page
│   │   ├── category/       # Category browsing
│   │   ├── products/[id]   # Product detail (dynamic)
│   │   └── admin/          # Admin panel
│   │       ├── login.vue
│   │       ├── dashboard.vue
│   │       ├── products.vue
│   │       ├── categories.vue
│   │       └── orders.vue
│   ├── store/              # Pinia stores
│   │   ├── auth.ts         # Authentication state
│   │   ├── cart.ts         # Cart state & actions
│   │   └── product.ts      # Product state
│   └── types/              # TypeScript interfaces
│       └── index.ts
├── public/                 # Static assets
├── apispec.yaml            # OpenAPI 3.1 specification
├── nuxt.config.ts          # Nuxt configuration
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Docker Compose services
├── package.json
└── tsconfig.json
```

---

## ⚡ Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1+ (recommended) or Node.js 20+
- Go backend API running (see [API Spec](#-api-reference))

### 1. Clone the repository

```bash
git clone https://github.com/FardanHadafi/Nuxt-Toko-Online.git
cd Nuxt-Toko-Online
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment

Create a `.env` file in the project root:

```env
NUXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_MERCHANT_ID=your_midtrans_merchant_id
NUXT_PROXY_TARGET=http://localhost
```

| Variable                          | Description                            |
| --------------------------------- | -------------------------------------- |
| `NUXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Midtrans Sandbox/Production client key |
| `MIDTRANS_MERCHANT_ID`            | Midtrans merchant ID                   |
| `NUXT_PROXY_TARGET`               | Backend API base URL for proxy routing |

### 4. Start development server

```bash
bun run dev
```

The app will be available at **`http://localhost:3000`**.

---

## 🐳 Docker Deployment

### Build & run with Docker Compose

```bash
docker compose up --build -d
```

This will:

1. Build the Nuxt app using a multi-stage Dockerfile (`oven/bun` → `oven/bun:alpine`)
2. Output an optimized SSR production bundle
3. Serve on port **3000**

### Standalone Docker build

```bash
docker build \
  --build-arg NUXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_key \
  --build-arg NUXT_PROXY_TARGET=http://host.docker.internal \
  -t toko-online .

docker run -p 3000:3000 toko-online
```

---

## 📡 API Reference

The frontend consumes a RESTful backend API. The full OpenAPI 3.1 specification is available in [`apispec.yaml`](./apispec.yaml).

### Key Endpoints

| Method   | Endpoint                  | Description                   | Auth     |
| -------- | ------------------------- | ----------------------------- | -------- |
| `GET`    | `/api/products`           | List all products (cached)    | Public   |
| `POST`   | `/api/products`           | Create product                | JWT+CSRF |
| `GET`    | `/api/products/:id`       | Get product detail            | Public   |
| `PATCH`  | `/api/products/:id`       | Update product                | JWT+CSRF |
| `DELETE` | `/api/products/:id`       | Delete product                | JWT+CSRF |
| `GET`    | `/api/categories`         | List categories               | Public   |
| `POST`   | `/api/categories`         | Create category               | JWT+CSRF |
| `PATCH`  | `/api/categories/:id`     | Update category               | JWT+CSRF |
| `DELETE` | `/api/categories/:id`     | Delete category               | JWT+CSRF |
| `POST`   | `/api/checkout`           | Create order + get Snap token | CSRF     |
| `POST`   | `/api/webhook/midtrans`   | Midtrans payment callback     | —        |
| `GET`    | `/api/orders`             | List all orders (admin)       | JWT      |
| `GET`    | `/api/orders/:id`         | Get order detail              | JWT      |
| `POST`   | `/api/admin/login`        | Admin authentication          | CSRF     |
| `POST`   | `/api/admin/logout`       | Admin session invalidation    | JWT+CSRF |
| `GET`    | `/api/profile/:id`        | Get admin profile             | JWT      |
| `PATCH`  | `/api/profile/:id`        | Update admin profile          | JWT+CSRF |
| `GET`    | `/api/settings`           | Get store settings            | Public   |
| `PATCH`  | `/api/settings`           | Update store settings         | JWT+CSRF |
| `POST`   | `/api/upload`             | Upload image to Cloudinary    | JWT+CSRF |

---

## 📜 Available Scripts

| Command               | Description                            |
| --------------------- | -------------------------------------- |
| `bun run dev`         | Start development server               |
| `bun run build`       | Build for production (SSR)             |
| `bun run preview`     | Preview production build locally       |
| `bun run generate`    | Generate static site                   |
| `bun run postinstall` | Prepare Nuxt (auto-runs after install) |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---
