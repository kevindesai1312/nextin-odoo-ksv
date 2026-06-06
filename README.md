# VendorBridge

VendorBridge is a comprehensive full-stack B2B Procurement and Vendor Management platform. It streamlines the end-to-end procurement lifecycle from Request for Quotations (RFQs) to Purchase Orders and Invoices, featuring role-based workflows and an integrated AI assistant.

## Features

*   **Role-Based Access Control (RBAC):** Tailored dashboards and workflows for **Admins**, **Managers**, **Officers**, and **Vendors**.
*   **RFQ Management:** Create, broadcast, and track Requests for Quotations seamlessly.
*   **Bidding System:** Vendors can easily submit competitive quotes against active RFQs.
*   **Approval Workflows:** Multi-tiered approval processes for Managers to review and approve purchases.
*   **Purchase Orders & Invoicing:** Automated PO generation and digital invoice tracking.
*   **AI Chatbot Assistant:** Integrated Hugging Face AI (Zephyr model) to assist users navigating the procurement processes.
*   **Profile Management:** All roles can edit personal details, contact info, and securely update passwords.
*   **Interactive Dashboard:** Visual analytics, spend tracking, and activity monitoring using Recharts.

##  Tech Stack

**Frontend:**
*   React 18 (Vite)
*   TypeScript
*   Tailwind CSS (Vibrant Blue Palette UI)
*   Lucide React (Icons)
*   Recharts (Data Visualization)
*   React Router DOM

**Backend:**
*   Node.js & Express.js
*   MongoDB (Mongoose ODM)
*   JSON Web Tokens (JWT) for Authentication
*   Bcryptjs for Password Hashing
*   Native Node.js HTTPS module (For AI Proxy routing)

##  Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [MongoDB](https://www.mongodb.com/) (Running locally or via MongoDB Atlas)
*   A [Hugging Face](https://huggingface.co/) API token (with "Make calls to the serverless Inference API" permissions)

##  Getting Started

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/kevindesai1312/nextin-odoo-ksv.git
cd nextin-odoo-ksv
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`

Create a `.env` file inside the `backend` directory:
\`\`\`env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/vendorbridge
JWT_SECRET=your_super_secret_jwt_key
HF_API_KEY=your_huggingface_finegrained_token
\`\`\`

Run the database seeder (Optional - populates default roles & users):
\`\`\`bash
node seedUsers.js
\`\`\`

Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

### 3. Frontend Setup
Open a new terminal window:
\`\`\`bash
cd fronthend
npm install
\`\`\`

Start the frontend development server:
\`\`\`bash
npm run dev
\`\`\`

### 4. Access the Application
Open your browser and navigate to `http://localhost:3000`.

**Default Test Credentials:**
*   **Admin:** `kevindesai` / `password123`
*   **Manager:** `harrymehta` / `password123`
*   **Officer:** `prathemmehta` / `password123`
*   **Vendor:** `adu@example.com` / `password123`

##  Security
*   All passwords are cryptographically hashed using `bcryptjs` prior to database insertion.
*   API endpoints are protected via JWT Bearer tokens.
*   Sensitive Environment Variables (`.env`) are intentionally ignored via `.gitignore` to prevent secret leaks to GitHub.

##  License
This project is licensed under the MIT License.
