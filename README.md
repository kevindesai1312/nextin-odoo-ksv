# VendorBridge - Procurement Management System

A modern procurement management system built with React, TypeScript, and Vite.

## Features

- 🔐 **Authentication System** - Complete login and registration with user management
- 📊 **Dashboard** - Overview of procurement activities
- 👥 **Vendor Management** - Manage vendor information and relationships
- 📝 **RFQs & Quotations** - Create and manage requests for quotations
- ✅ **Approval Workflow** - Streamlined approval process
- 🛒 **Purchase Orders** - Track and manage purchase orders
- 💰 **Invoices** - Invoice management and tracking
- 📈 **Reports** - Comprehensive reporting and analytics
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

## Authentication

### Demo Credentials
You can use these demo credentials to log in:
- **Username:** admin
- **Password:** admin123

### Registration
New users can register by:
1. Clicking "Register" on the login page
2. Filling in all required fields (First Name, Last Name, Email, Phone, Username, Password)
3. Selecting a role (Admin, Officer, Manager, or Vendor)
4. Providing additional information (optional)
5. Clicking the Register button

### Features
- User data is stored in localStorage (persists across sessions)
- Password validation (minimum 6 characters)
- Password confirmation matching
- Duplicate username/email detection
- Automatic login after successful registration
- Protected routes (requires authentication)
- Logout functionality in sidebar

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

The application will be available at http://localhost:3001 (or another port if 3000-3001 are in use).

## Tech Stack

- **Frontend Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite 7
- **Routing:** React Router 7
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui components
│   └── Sidebar.tsx  # Navigation sidebar
├── contexts/         # React contexts
│   └── AuthContext.tsx  # Authentication context
├── pages/           # Page components
│   ├── Login.tsx    # Login page
│   ├── Register.tsx # Registration page
│   ├── Dashboard.tsx
│   └── ...
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
└── data/            # Demo data
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Development

### Adding New Features

1. Create new pages in `src/pages/`
2. Add routes in `src/App.tsx` (wrap with `<ProtectedRoute>` if needed)
3. Add navigation items in `src/components/Sidebar.tsx`
4. Use Tailwind CSS classes for styling

### Authentication Integration

To protect a route, wrap it with the `ProtectedRoute` component:

```tsx
<Route
  path="/your-page"
  element={
    <ProtectedRoute>
      <AppLayout>
        <YourPage />
      </AppLayout>
    </ProtectedRoute>
  }
/>
```

To use authentication in components:

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, logout, isAuthenticated } = useAuth();
  
  return <div>Welcome, {user?.username}</div>;
}
```

## License

MIT
