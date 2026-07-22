# 🚀 FundsERP

> **Modern ERP for Wholesale Distribution & Inventory Management**

FundsERP is a full-stack Enterprise Resource Planning (ERP) platform designed for wholesalers, distributors, and warehouse operations. It streamlines inventory management, customer records, supplier management, billing, purchase workflows, delivery challans, analytics, and business operations through a modern, responsive web interface.

---

## ✨ Features

### 📦 Inventory Management

* Real-time stock tracking
* Product catalog management
* Category organization
* Low-stock monitoring
* Stock movement history

### 👥 Customer Management

* Customer database
* Purchase history
* Outstanding balance tracking
* Search & filtering
* Customer profiles

### 🏢 Supplier Management

* Supplier records
* Purchase management
* Contact management
* Transaction history

### 🛒 Purchase Management

* Create purchase orders
* Update inventory automatically
* Purchase history
* Supplier-wise purchases

### 🧾 Sales & Billing

* Invoice generation
* Sales management
* Order processing
* Revenue tracking

### 🚚 Delivery Challans

* Draft & confirm challans
* Shipment records
* Delivery tracking
* Print-ready challans

### 📊 Dashboard & Analytics

* Business KPIs
* Revenue overview
* Inventory insights
* Sales statistics
* Recent activities

### 🔐 Authentication

* Secure login
* User authentication
* Protected routes
* Session management

---

# 🏗️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router

## Backend

* Node.js
* Express.js
* TypeScript

## Database

* PostgreSQL

## ORM

* Prisma

## UI Components

* shadcn/ui
* Lucide Icons

## Development Tools

* ESLint
* Prettier
* Git
* GitHub

---

# 📂 Project Structure

```text
FundsERP/
│
├── client/                 # React Frontend
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── assets/
│
├── server/                 # Express Backend
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   └── utils/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
├── package.json
└── README.md
```

---

# ⚙️ Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/Saisradha/FundsERP.git

cd FundsERP
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the root directory.

```env
DATABASE_URL=your_postgresql_database_url

PORT=5000

JWT_SECRET=your_secret_key
```

---

## 4. Setup Database

```bash
npx prisma migrate dev

npx prisma generate
```

---

## 5. Start Development Server

```bash
npm run dev
```

Application runs at:

```
Frontend:
http://localhost:5173

Backend:
http://localhost:5000
```

---

# 🎯 Core Modules

* Dashboard
* Inventory
* Products
* Customers
* Suppliers
* Purchase Orders
* Sales
* Delivery Challans
* Reports
* Authentication
* Settings

---

# 📈 Future Roadmap

* Barcode & QR Scanning
* GST Billing
* Multi-Warehouse Support
* Purchase Forecasting
* AI Inventory Prediction
* Role-Based Access Control
* Notification System
* Mobile Responsive PWA
* Export to Excel & PDF
* Dark / Light Theme
* Audit Logs
* Email Notifications

---

# 📸 Screenshots

> Add screenshots inside a `/screenshots` folder.

Example:

```
screenshots/

dashboard.png

inventory.png

customers.png

billing.png

analytics.png
```

Then include them like:

```md
## Dashboard

![Dashboard](screenshots/dashboard.png)

## Inventory

![Inventory](screenshots/inventory.png)
```

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push your branch

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# ⭐ Why FundsERP?

FundsERP focuses on delivering a modern ERP experience with:

* Fast performance
* Responsive UI
* Scalable architecture
* Clean codebase
* Enterprise-ready design
* Modular backend
* Real-world business workflows

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Sai Sradha**

GitHub: https://github.com/Saisradha

If you found this project helpful, consider giving it a ⭐ on GitHub.
