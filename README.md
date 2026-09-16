# 🏨 Stay Sync — Hotel Management System

> A production-ready, multi-tenant SaaS platform designed to streamline hotel and restaurant operations — from POS billing to inventory management, all in one place.

---

## 📌 Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Team](#team)

---

## 📖 About the Project

Existing hotel management systems are fragmented, expensive and complex — making it difficult for small and mid-sized hotels to manage daily operations efficiently.

**Stay Sync** is an affordable, integrated SaaS platform that solves this by combining POS billing with KOT printing, menu management, inventory tracking and table management into a single easy-to-use solution — enabling hotel owners to streamline operations, reduce costs and focus on delivering better hospitality.

---

## 🛠️ Tech Stack

### Frontend:
| Technology | Purpose |
|-----------|---------|
| React.js | UI Framework |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| Axios | HTTP Client |
| React Router | Navigation |

### Backend:
| Technology | Purpose |
|-----------|---------|
| Spring Boot | Backend Framework |
| Spring Security | Authentication & Authorization |
| Spring Data JPA | Database ORM |
| Hibernate | ORM Implementation |
| JWT | Token Based Auth |
| JavaMailSender | Email OTP |
| BCrypt | Password Encoding |

### Database:
| Technology | Purpose |
|-----------|---------|
| PostgreSQL | Primary Database |
| pgAdmin | Database Management |

### Tools:
| Tool | Purpose |
|------|---------|
| Git & GitHub | Version Control |
| Postman | API Testing |
| IntelliJ IDEA | Backend IDE |
| VS Code | Frontend IDE |

---

## ✨ Features

### 🔐 Authentication & Security
- JWT based stateless authentication
- BCrypt password encoding
- Role based access control (ADMIN / SUPER_ADMIN)
- Email OTP based forgot password
- Subscription expiry auto-detection
- Protected routes on frontend

### 🧾 POS Billing System
- Real-time KOT (Kitchen Order Ticket) printing
- Table management with zone filtering (Hall/Family/Parcel)
- Multiple payment modes (Cash / UPI / Card / Online)
- GST and discount calculations
- Bill settlement and history
- Thermal printer support (RETSOL RTP-81)

### 🍽️ Menu Management
- Add / Edit / Delete menu items
- Veg / Non-Veg categorization
- Real-time sync with billing page
- Search and filter functionality

### 📦 Inventory Management
- Stock tracking with low stock alerts
- Stock In / Mark Used functionality
- Transaction history log
- Minimum quantity threshold alerts

### ⚙️ Settings Module
- Restaurant info management (Name, GST, FSSAI, Address)
- Tax / GST configuration
- Operating hours setup (per day)
- Table management

### 👑 Super Admin Panel
- Separate Super Admin table and login
- Multi-tenant subscription management
- Plans: Trial (7 days) / Basic (3 months) / Standard (6 months) / Premium (12 months)
- Hotel onboarding and access control
- Subscription activation / deactivation
- Auto expiry warning (5 days before)
- Blocked page on subscription expiry

### 📱 Responsive Design
- Mobile and desktop compatible
- Mobile tab bar navigation
- Responsive tables and cards

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         Frontend (React.js)         │
│  Axios + axiosInstance (JWT Token)  │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│      Spring Boot Backend            │
│  JwtAuthenticationFilter            │
│  Controller → Service → Repository  │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│        PostgreSQL Database          │
│           (hotel_db)                │
└─────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites:
- Java 17+
- Node.js 18+
- PostgreSQL 15+
- Maven

---

### Backend Setup:

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stay-sync-backend.git
cd stay-sync-backend
```

2. Create PostgreSQL database:
```sql
CREATE DATABASE hotel_db;
```

3. Update `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hotel_db
spring.datasource.username=postgres
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
server.port=8080

# Gmail SMTP
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=youremail@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

4. Run the project:
```bash
mvn spring-boot:run
```

---

### Frontend Setup:

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stay-sync-frontend.git
cd stay-sync-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```
VITE_API_URL=http://localhost:8080
```

4. Run the project:
```bash
npm run dev
```

5. Open browser:
```
http://localhost:5173
```

---

### Create Super Admin:

**POST** `http://localhost:8080/api/super-admin/auth/create`
```json
{
    "name": "Super Admin",
    "email": "superadmin@sync.com",
    "password": "SuperAdmin@123",
    "contactNumber": "0000000000"
}
```

---

## 📡 API Endpoints

### Auth:
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new hotel |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/change-password` | Change password |
| POST | `/api/auth/forgot-password` | Send OTP |
| POST | `/api/auth/reset-password/{token}` | Reset password |

### Menu:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get all items |
| POST | `/api/menu` | Add item |
| PUT | `/api/menu/{id}` | Update item |
| DELETE | `/api/menu/{id}` | Delete item |

### Tables:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tables` | Get all tables |
| POST | `/api/tables` | Add table |
| DELETE | `/api/tables/{id}` | Delete table |

### Inventory:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | Get all items |
| POST | `/api/inventory` | Add item |
| PATCH | `/api/inventory/{id}/stock-in` | Stock in |
| PATCH | `/api/inventory/{id}/mark-used` | Mark used |

### Settings:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurant` | Get restaurant info |
| PUT | `/api/restaurant` | Update restaurant info |
| GET | `/api/taxes` | Get all taxes |
| POST | `/api/taxes` | Add tax |
| PUT | `/api/taxes/{id}` | Update tax |
| DELETE | `/api/taxes/{id}` | Delete tax |
| GET | `/api/hours` | Get operating hours |
| POST | `/api/hours/save-all` | Save all hours |

### Subscription:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/super-admin/users` | Get all users |
| PUT | `/api/super-admin/users/{id}/activate` | Activate subscription |
| PUT | `/api/super-admin/users/{id}/deactivate` | Deactivate subscription |
| POST | `/api/super-admin/users` | Create user |

### Super Admin Auth:
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/super-admin/auth/login` | Super admin login |
| POST | `/api/super-admin/auth/create` | Create super admin |

---

## 🗄️ Database Schema

```
users
├── id
├── name
├── email
├── password
├── role (ADMIN / SUPER_ADMIN)
├── contact_number
├── subscription_status (TRIAL / ACTIVE / EXPIRED)
├── subscription_plan (TRIAL / BASIC / STANDARD / PREMIUM)
├── subscription_start
└── subscription_end

super_admins
├── id
├── name
├── email
├── password
└── contact_number

menu_items
├── id
├── name
├── price
└── category

tables
├── id
├── name
└── zone

inventory
├── id
├── name
├── unit
├── stock
└── min_qty

restaurant_info
├── id
├── name
├── email
├── phone
├── address
├── gst
├── fssai
└── website

taxes
├── id
├── name
├── rate
└── enabled

operating_hours
├── id
├── day
├── open
├── close
└── closed
```

---

## 👥 Team

| Name | Role |
|------|------|
| Harshal Katware | Full Stack Developer |
| Akif Panari | Full Stack Developer |
| Rushikesh Jadhav | Full Stack Developer |
| Yuvraj patil  | Full Stack Developer |

---

## 📄 License

This project is licensed under the MIT License.

---

---

> Built with ❤️ by Team Stay Sync
