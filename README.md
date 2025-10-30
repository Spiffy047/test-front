# IT ServiceDesk Frontend

React frontend application for the IT ServiceDesk platform with role-based dashboards, real-time messaging, and intelligent file handling.

## Features

### Role-Based Dashboards
- **Normal User Dashboard** - Personal ticket management with file attachments
- **Technical User Dashboard** - Agent portal with SLA monitoring and workload tracking
- **Technical Supervisor Dashboard** - Team analytics and performance oversight
- **System Admin Dashboard** - Complete system management and user administration

### Advanced File Upload System
- **Ticket creation uploads** - Attach files during ticket creation
- **Timeline uploads** - Add files to existing ticket conversations
- **Multiple format support** - Images, documents, PDFs, and more
- **Drag & drop interface** - User-friendly file selection
- **Real-time preview** - Immediate file display in timeline

### Interactive Components
- **Real-time ticket timeline** - Live conversation view with file attachments
- **Agent name resolution** - Shows actual agent names instead of IDs
- **Responsive design** - Works on desktop, tablet, and mobile
- **Toast notifications** - User-friendly feedback system
- **Search and filtering** - Find tickets quickly

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
echo "VITE_API_URL=http://localhost:5001/api" > .env.local

# Run development server
npm run dev
# Opens at http://localhost:5173
```

## Technology Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **React Hook Form** - Form validation
- **Recharts** - Data visualization
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

## Project Structure

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
├── utils/
│   ├── api.js            # Secure API utilities
│   └── styleHelpers.js   # CSS utility functions
├── config/
│   └── api.js            # API configuration
├── App.jsx               # Main application component
└── main.jsx             # Application entry point
```

## Key Components

### Dashboards
- `NormalUserDashboard.jsx` - Personal ticket view with file upload
- `TechnicalUserDashboard.jsx` - Agent portal with SLA alerts
- `TechnicalSupervisorDashboard.jsx` - Team management and analytics
- `SystemAdminDashboard.jsx` - System administration

### Ticket Management
- `TicketDetailDialog.jsx` - Comprehensive ticket view with timeline
- `TicketCreationForm.jsx` - New ticket form with file attachments
- `Timeline.jsx` - Message and file timeline display

### File Handling
- `FileUpload.jsx` - File upload component
- `FilePreview.jsx` - File display and preview
- `AttachmentList.jsx` - File attachment management

## API Integration

### Secure API Utilities
- **SSRF prevention** - URL validation and domain allowlisting
- **CSRF protection** - Token-based security for state changes
- **Content-Type handling** - Proper headers for JSON and FormData
- **Error handling** - Comprehensive error parsing and display

### File Upload Integration
- **Multipart form data** - Proper handling for file uploads
- **Progress tracking** - Upload progress indicators
- **Error recovery** - Retry mechanisms for failed uploads

## Environment Variables

```bash
VITE_API_URL=http://localhost:5001/api  # Backend API URL
```

## Build & Deployment

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Production (Vercel)
npm run build        # Build application
# Deploy dist/ folder to Vercel
```

## Deployment

The frontend is deployed on Vercel with automatic deployments from the main branch.

- **Production URL**: https://hotfix-ochre.vercel.app
- **Preview deployments** - Automatic for pull requests

## Recent Updates

- ✅ Fixed Content-Type headers for file uploads
- ✅ Enhanced file upload with proper field names
- ✅ Added agent name display instead of IDs
- ✅ Improved error handling and user feedback
- ✅ Fixed timeline file upload integration