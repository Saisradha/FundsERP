# ERPFlow — Digital Warehouse OS

> A futuristic, industrial-grade **Digital Warehouse Operating System** combining Apple-inspired minimalism, Stripe-like precision, Linear-tier speed, and an interactive 3D Three.js engine.

---

## ⚡ Key Highlights & Features

- 🛡️ **Industrial Security Gate Login**: Laser scanner badge authentication experience with role-based clearance.
- 🎛️ **Mission Control Telemetry**: Live KPI widgets tracking dispatch revenue, inventory levels, customer pipeline, and low-stock alerts.
- 📦 **3D Digital Twin Warehouse**: Real-time interactive Three.js 3D warehouse floor with dynamic shelves, box stock density, low-stock emission glows, and patrolling 3D forklifts.
- 🌌 **3D Customer CRM Galaxy**: Orbital 3D node graph displaying enterprise clients categorized by status (`Active` cyan, `Lead` orange, `Inactive` gray) with interaction note logs.
- 🚛 **Sales Challan Dispatch Engine**: Drag-and-drop shipment creation with product snapshotting, animated truck loading, and **transactional negative stock protection**.
- 🤖 **AURA Holographic AI Assistant**: Floating AI overlay for voice/text telemetry queries and instant navigation routing.
- ⌨️ **Global Command Palette (`CTRL + K`)**: Instantaneous system-wide search.

---

## 🔐 Test Credentials (All 4 Required Roles)

All accounts share the default passcode: **`password123`**

| Role | Email Address | Access Permissions |
| :--- | :--- | :--- |
| **Admin** | `admin@erpflow.com` | Full administrative system clearance across all modules & settings |
| **Sales** | `sales@erpflow.com` | Customer CRM management, quotation follow-ups, and sales challans |
| **Warehouse** | `warehouse@erpflow.com` | SKU catalog management, stock receiving (IN), dispatches (OUT), and audit logs |
| **Accounts** | `accounts@erpflow.com` | Dispatch revenue review, customer credit terms, and status audit logs |

---

## 🛠️ Required Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite 6
- **3D Engine**: React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`), Three.js
- **Animations**: Framer Motion
- **Styling**: Industrial Dark Glassmorphism Design System (TailwindCSS v4)
- **State Management**: Zustand
- **Icons**: Lucide Icons

### Backend
- **Runtime & Server**: Node.js + Express + TypeScript
- **Database ORM**: Prisma ORM (Relational SQLite / Neon PostgreSQL)
- **Authentication**: JSON Web Tokens (JWT Access + Refresh tokens)
- **Validation**: Zod schema validation
- **Architecture**: Service-Controller-Repository pattern with transactional guarantees

### DevOps & Deployment
- **Containerization**: Multi-stage Dockerfiles + `docker-compose.yml`
- **CI/CD**: GitHub Actions workflow (`.github/workflows/ci.yml`)

---

## 📐 ER Diagram & System Architecture

```
+------------------+         +--------------------+         +--------------------+
|       User       |         |      Customer      |         |    CustomerNote    |
+------------------+         +--------------------+         +--------------------+
| id (UUID) PK     |         | id (UUID) PK       |<------->| id (UUID) PK       |
| name             |         | name               |         | customerId FK      |
| email (Unique)   |         | businessName       |         | note               |
| password (Bcrypt)|         | status (Enum)      |         | createdBy          |
| role (Enum)      |         | customerType (Enum)|         | createdAt          |
+------------------+         +--------------------+         +--------------------+
                                      |
                                      v
+------------------+         +--------------------+         +--------------------+
|    StockLog      |         |    SalesChallan    |         |    ChallanItem     |
+------------------+         +--------------------+         +--------------------+
| id (UUID) PK     |         | id (UUID) PK       |<------->| id (UUID) PK       |
| productId FK     |<------- | challanNumber (UQ) |         | challanId FK       |
| quantity         |         | customerId FK      |         | productId FK       |
| type (IN/OUT)    |         | status (Enum)      |         | productName (Snap) |
| reason           |         | totalAmount        |         | unitPrice (Snap)   |
| createdBy        |         +--------------------+         | quantity           |
+------------------+                                        +--------------------+
```

---

## 🚀 Local Quickstart Guide

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/user/erpflow.join
cd erpflow

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install --legacy-peer-deps && cd ..
```

### 2. Setup Database & Seed Test Data
```bash
cd backend
npx prisma db push
npx ts-node prisma/seed.ts
cd ..
```

### 3. Run Development Servers Concurrently
```bash
npm run dev:backend   # Starts API server on http://localhost:5000
npm run dev:frontend  # Starts 3D UI on http://localhost:5173
```

---

## 🐳 Docker Deployment

To launch the complete production stack using Docker Compose:

```bash
docker-compose up --build -d
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 📡 REST API Reference

| Method | Endpoint | Description | Role Clearance |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate badge credentials and return JWT tokens | Public |
| `GET` | `/api/auth/me` | Fetch active user clearance profile | Authenticated |
| `GET` | `/api/customers` | Query customer CRM list with search and status filters | Authenticated |
| `POST` | `/api/customers` | Register new enterprise customer | Admin, Sales |
| `POST` | `/api/customers/:id/notes` | Log follow-up interaction note | Admin, Sales, Accounts |
| `GET` | `/api/products` | Retrieve warehouse products with low-stock alerts | Authenticated |
| `POST` | `/api/products/:id/stock` | Perform manual stock receiving (IN) or audit reduction (OUT) | Admin, Warehouse |
| `GET` | `/api/products/logs` | Fetch stock movement audit telemetry logs | Authenticated |
| `POST` | `/api/challans` | Generate sales challan order with negative stock protection | Admin, Sales, Warehouse |
| `PATCH` | `/api/challans/:id/status` | Update challan status (`DRAFT` → `CONFIRMED` → `CANCELLED`) | Admin, Sales, Warehouse, Accounts |

---

## 📄 Postman Collection

An exportable Postman collection is available at [`postman_collection.json`](./postman_collection.json). Import it directly into Postman for endpoint testing.

---

## 🏆 Project Achievements & Satisfaction of Requirements

- ✅ 100% compliance with all core assignment modules (Auth, CRM, Products, Inventory, Stock Logs, Sales Challan with snapshots, Negative Stock Protection).
- ✅ Clean multi-layered Express architecture with strict TypeScript typing.
- ✅ Industrial Dark Glassmorphism theme with high-end 3D React Three Fiber graphics.
- ✅ Production-ready Docker containerization and GitHub Actions CI workflow.
