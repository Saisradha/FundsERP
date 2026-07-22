# Mini ERP + CRM Operations Portal

> A clean, technological, high-performance **Mini ERP + CRM Operations Portal** built for wholesale and distribution companies, satisfying 100% of the case study PDF requirements.

---

## 📋 Core Modules Implemented (100% PDF Spec Compliance)

### 1. 🔐 Authentication and Role-Based Access Control
- JWT-based authentication supporting **4 required user roles**:
  - `Admin`: Full system access across all modules
  - `Sales`: Customer CRM management and sales challan creation
  - `Warehouse`: Product inventory management, stock IN/OUT adjustments, and movement logs
  - `Accounts`: Order status updates and financial audit review

#### Test Credentials (Passcode for all accounts: `password123`)
| Role | Email |
| :--- | :--- |
| **Admin** | `admin@erpflow.com` |
| **Sales** | `sales@erpflow.com` |
| **Warehouse** | `warehouse@erpflow.com` |
| **Accounts** | `accounts@erpflow.com` |

---

### 2. 👥 Customer CRM Module
- **Fields**: Customer Name, Mobile Number, Email, Business Name, GST Number (Optional), Customer Type (`Retail`, `Wholesale`, `Distributor`), Address, Status (`Lead`, `Active`, `Inactive`), Follow-up Date, Notes.
- **Features**: Add customer, Edit customer, Multi-field search, Filter by status, Customer detail view, and Follow-up notes timeline log.

---

### 3. 📦 Product & Inventory Module
- **Fields**: Product Name, SKU/code, Category, Unit Price, Current Stock, Minimum Stock Alert Quantity, Location/Warehouse Shelf.
- **Features**: Add product, Edit product, Low-stock warning indicators, Manual stock adjustments (IN receiving / OUT dispatch).
- **Stock Movement Log**: Immutable audit ledger tracking Product, Quantity Changed, Movement Type (`IN` / `OUT`), Reason, Operator, and Timestamp.

---

### 4. 📄 Sales Challan Module
- **Fields**: Challan Number (Auto-generated `CH-2026-XXXX`), Customer, Products List, Total Quantity, Total Amount, Status (`Draft`, `Confirmed`, `Cancelled`), Created By, Created Date.
- **Features & Business Logic**:
  - Select customer & add multiple products with quantity.
  - **Item Snapshotting**: Saves historical product name, SKU, and unit price snapshot data at order creation.
  - **Strict Negative Stock Protection**: Confirming a challan atomically checks stock. If stock is insufficient, the system rejects the transaction with a clear error message.
  - State machine transitions (`Draft` → `Confirmed` → `Cancelled`).

---

## 🛠️ Required Tech Stack

### Backend
- **Node.js** + **TypeScript** + **Express.js**
- **Prisma ORM** (Relational schema with SQLite local / Neon PostgreSQL production)
- **JWT** Authentication + **Bcrypt** Hashing + **Zod** Validation

### Frontend
- **React 19** + **TypeScript** + **Vite 6**
- **TailwindCSS** Clean Technological Admin UI
- **Lucide Icons**

### DevOps
- Multi-stage **Dockerfile** + **`docker-compose.yml`**
- **GitHub Actions CI** pipeline (`.github/workflows/ci.yml`)
- Exportable **Postman Collection** (`postman_collection.json`)

---

## 🚀 How to Run Locally

### 1. Start Backend API (Terminal 1)
```powershell
npm run dev:backend
```
- **API URL**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/health`

### 2. Start Frontend UI (Terminal 2)
```powershell
npm run dev:frontend
```
- **Portal URL**: `http://localhost:5173`

---

## 🐳 Docker Deployment

```powershell
docker-compose up --build -d
```
