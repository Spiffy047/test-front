# IT ServiceDesk Frontend

React + TypeScript frontend for the IT ServiceDesk platform with role-based dashboards, real-time chat, and comprehensive analytics.

## 🚀 Live Demo

**URL**: https://hotfix-ochre.vercel.app

## 🛠 Technology Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **React Hook Form** - Form validation
- **Recharts** - Data visualization
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

## ✨ Key Features

### 🎭 Role-Based Dashboards
- **Normal User**: Personal ticket management
- **Technical User**: Agent portal with SLA monitoring
- **Technical Supervisor**: Team analytics and oversight
- **System Admin**: Complete system management

### 💬 Interactive Components
- Real-time ticket chat with timeline view
- Image upload and display with Cloudinary
- Responsive data tables with pagination
- Interactive charts and analytics
- Toast notifications and alerts

### 📊 Analytics & Reporting
- SLA adherence tracking
- Ticket aging analysis
- Agent performance scorecards
- Real-time dashboard updates

## 🚀 Local Development

```bash
# Clone and setup
git clone <repository-url>
cd it-servicedesk-frontend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
# Opens at http://localhost:5173
```

## 🔧 Environment Variables

```bash
# .env.local
VITE_API_URL=http://localhost:5001/api
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-hook-form": "^7.43.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-select": "^1.2.0",
    "recharts": "^2.5.0",
    "lucide-react": "^0.263.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.28",
    "@types/react-dom": "^18.0.11",
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.2.0",
    "tailwindcss": "^3.2.7",
    "postcss": "^8.4.21",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.38.0"
  }
}
```

## 🎨 Component Structure

```
src/
├── components/
│   ├── analytics/          # Charts and analytics components
│   ├── auth/              # Authentication components
│   ├── common/            # Reusable UI components
│   ├── dashboards/        # Role-specific dashboards
│   ├── forms/             # Form components
│   ├── notifications/     # Notification system
│   └── tickets/           # Ticket management components
├── App.jsx               # Main application component
├── main.jsx             # Application entry point
└── index.css           # Global styles
```

### Key Components

#### Dashboards
- `NormalUserDashboard.jsx` - Personal ticket view
- `TechnicalUserDashboard.jsx` - Agent portal with SLA alerts
- `TechnicalSupervisorDashboard.jsx` - Team management and analytics
- `SystemAdminDashboard.jsx` - System administration

#### Shared Components
- `TicketDetailDialog.jsx` - Comprehensive ticket view with chat
- `DataModal.jsx` - Reusable data display modal
- `Pagination.jsx` - List navigation component
- `NotificationBell.jsx` - Real-time notifications

#### Analytics
- `SLAAdherenceCard.jsx` - SLA tracking display
- `TicketAgingAnalysis.jsx` - Aging analysis charts
- `AgentPerformanceScorecard.jsx` - Performance metrics

## 🎯 User Roles & Features

### Normal User
- View and create personal tickets
- Real-time chat with support agents
- Track ticket status and resolution
- Upload images and files

### Technical User
- Manage assigned tickets
- SLA violation alerts with "Take Action" functionality
- Update ticket status (Pending, Resolved)
- Access to all tickets for assignment

### Technical Supervisor
- Team analytics and performance metrics
- Ticket aging analysis
- Agent workload management
- SLA adherence monitoring

### System Admin
- Complete user management (CRUD)
- System health monitoring
- Advanced analytics dashboard
- User role assignment

## 🔒 Authentication & Security

- JWT token-based authentication
- Role-based access control (RBAC)
- Protected routes based on user roles
- Secure API communication with CORS
- Form validation with React Hook Form

## 📱 Responsive Design

- Mobile-first approach with Tailwind CSS
- Responsive breakpoints for all screen sizes
- Touch-friendly interactions
- Accessible navigation and components

## 🚀 Build & Deployment

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Production (Vercel)
```bash
# Build and deploy
npm run build
# Deploy dist/ folder to Vercel

# Or connect GitHub repository for auto-deployment
```

## 🎨 Styling & Theming

### Tailwind CSS Configuration
- Custom color palette for branding
- Responsive utilities for all components
- Dark mode ready (can be implemented)
- Consistent spacing and typography

### Component Styling
- Utility-first approach with Tailwind
- Consistent design system
- Accessible color contrasts
- Professional UI/UX patterns

## 📊 State Management

- React hooks for local state
- Context API for global state (if needed)
- Form state with React Hook Form
- API state management with fetch

## 🧪 Development Workflow

1. **Component Development**
   - Create reusable components in appropriate directories
   - Use TypeScript for type safety
   - Follow React best practices

2. **Styling**
   - Use Tailwind CSS utilities
   - Maintain consistent design patterns
   - Ensure responsive behavior

3. **Integration**
   - Connect to backend API endpoints
   - Handle loading and error states
   - Implement proper data validation

## 📈 Performance Optimizations

- Code splitting with React.lazy (ready for implementation)
- Image optimization via Cloudinary
- Efficient re-renders with React.memo
- Optimized bundle size with Vite

## 🔮 Future Enhancements

- Progressive Web App (PWA) features
- Real-time updates with WebSockets
- Advanced search and filtering
- Offline capabilities
- Push notifications

## 📄 License

MIT License - see LICENSE file for details.