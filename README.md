# Aura - Advanced Social Media Platform

Aura is a feature-rich social media platform built with Next.js 15, React, TypeScript, and Supabase. It combines modern design with powerful functionality including real-time user activity tracking, comprehensive admin management, and advanced user engagement features.

---

### 🌟 **What is Aura? (For Everyone)**

Aura is a modern, fast, and secure social space where you can connect with others, share your stories through photos, and keep up with what's happening in your community. Think of it as a premium, privacy-focused alternative to mainstream social networks.

**Why you'll love it:**
- **Lightning Fast**: We've recently upgraded how images load, meaning the app feels snappier and uses less data on your phone.
- **Real-Time Connection**: See exactly who's online or when they were last active with our smart "Presence" system.
- **Clean & Simple**: Designed to be intuitive and beautiful, so you can focus on the content that matters.
- **Peace of Mind**: Built with modern security to keep your data safe and your experience smooth.

---

## ✨ Key Features

### 🔐 **Advanced User Management**
- **Secure Authentication**: Email/password with email verification
- **Real-time Activity Tracking**: Smart presence indicators (Online, Just left, Minutes/Hours/Days ago)
- **User Deactivation System**: Admin-controlled account management with proper database flags
- **Account Recovery**: Password reset with secure email verification
- **Signup Validation**: Real-time duplicate email/username checking

### 👑 **Admin Dashboard**
- **Comprehensive User Management**: View, search, and manage all users
- **User Activity Monitoring**: Real-time status tracking with 6-tier activity system
- **Content Moderation**: Admin-only post deletion and content management
- **Admin Controls**: Secure admin-only functions with proper authorization
- **Advanced Search**: Filter users and posts with pagination support

### 📱 **Social Features**
- **Post Management**: Create, edit, delete posts with image uploads
- **Following System**: Personalized following feed with real-time updates
- **Social Interactions**: Like, save, and comment on posts
- **User Profiles**: Customizable profiles with activity status
- **Content Discovery**: Explore page with search functionality

### 🎨 **User Experience**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Live notifications and activity tracking
- **Infinite Scroll**: Smooth content loading experience
- **Smart Search**: Advanced search with debounced input
- **Modern UI**: Clean, Instagram-inspired interface

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with custom components
- **Backend**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with custom user management
- **Storage**: Supabase Storage for image uploads
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Shadcn/ui with custom extensions
- **State Management**: React Query + Context API
- **Real-time Features**: Custom hooks for activity tracking

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account and project

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/maazajaz/aura.git
cd aura-nextjs
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

4. **Set up the database:**
   - Run the SQL files in your Supabase SQL editor:
     - `add_user_status_columns.sql` - Adds user activity tracking columns
     - `admin_policies.sql` - Sets up admin access policies
     - `reset_user_activity.sql` - Initializes user activity data (optional)

5. **Configure initial admin:**
   - Update `INITIAL_ADMIN_EMAILS` in `src/lib/supabase/api.ts` with your email
   - Or manually set `is_admin = true` in your users table

6. **Run the development server:**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
├── app/                           # Next.js App Router
│   ├── api/                      # API routes
│   │   └── admin/               # Admin-only API endpoints
│   ├── admin/                   # Admin dashboard pages
│   ├── auth/                    # Authentication pages
│   └── [various-pages]/         # Main app pages
├── src/
│   ├── _auth/                   # Authentication components
│   │   └── forms/              # Auth forms (signin, signup)
│   ├── _root/                   # Main app layout
│   │   └── pages/              # Main app pages
│   ├── components/              # Reusable components
│   │   ├── forms/              # Form components
│   │   ├── shared/             # Shared components
│   │   └── ui/                 # Base UI components
│   ├── context/                 # React contexts
│   ├── hooks/                   # Custom hooks
│   │   └── useUserActivity.ts  # Real-time activity tracking
│   ├── lib/                     # Utilities and configurations
│   │   ├── react-query/        # React Query setup
│   │   ├── supabase/           # Supabase client & API
│   │   ├── utils/              # Helper functions
│   │   └── validation/         # Form validation schemas
│   └── types/                   # TypeScript definitions
├── Database Files:
│   ├── add_user_status_columns.sql    # User activity schema
│   ├── admin_policies.sql             # Admin RLS policies
│   ├── reset_user_activity.sql        # Test data generator
│   └── test_activity_states.sql       # Activity testing
```

## 🔧 New Features & Updates

### Real-time User Activity System
- **Smart Presence Detection**: 6-tier status system (Online → Just left → Minutes ago → Hours ago → Days ago → Never active → Deactivated)
- **Activity Tracking**: Automatic heartbeat every 2 minutes with 15-minute timeout
- **Background Processing**: Intelligent cleanup with configurable intervals
- **Performance Optimized**: Throttled updates (30s intervals) to reduce API load

### Advanced Admin Dashboard
- **User Management**: Complete CRUD operations with search and pagination
- **Activity Monitoring**: Real-time user status with color-coded indicators
- **Content Moderation**: Post management with admin-only deletion
- **Security Features**: Protected routes with proper authorization checks

### Enhanced Authentication
- **Improved Validation**: Live email/username availability checking
- **Better UX**: Real-time feedback with loading states
- **Account Security**: Deactivation prevention with proper error handling
- **Password Recovery**: Secure reset flow with email verification

### Database Improvements
- **New Columns**: `is_active`, `is_deactivated`, `last_active` for user management
- **Optimized Queries**: Indexed columns for better performance
- **RLS Policies**: Enhanced security with admin-specific policies
- **Audit System**: Optional logging for admin actions

## 🎯 Key Components

### User Activity Tracking (`useUserActivity.ts`)
```typescript
// Automatically tracks user presence with:
// - Mouse/keyboard activity detection
// - Page visibility monitoring  
// - Background/foreground state handling
// - Configurable timeout intervals
```

### Admin User Management (`AdminUserManagement.tsx`)
```typescript
// Comprehensive admin interface featuring:
// - Real-time user status indicators
// - Search and pagination
// - User activation/deactivation controls
// - Content moderation tools
```

### Enhanced Authentication (`SignupForm.tsx`, `SigninForm.tsx`)
```typescript
// Improved auth experience with:
// - Live validation feedback
// - Duplicate checking
// - Better error handling
// - Loading states
```

## 🔐 Admin Features

### Access Control
- Set your email in `INITIAL_ADMIN_EMAILS` constant
- Admin-only routes and API endpoints
- Secure RLS policies for data protection

### User Management
- View all users with real-time activity status
- Search and filter users
- Activate/deactivate user accounts
- Prevent admin self-modification

### Content Moderation
- View and manage all posts
- Delete inappropriate content
- Admin audit logging (optional)

## 📊 Performance Optimizations

- **React Query**: Intelligent caching with automatic invalidation
- **Throttled Updates**: Activity tracking with 30-second intervals
- **Optimized Queries**: Database indexes on activity columns
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Next.js Image component with Supabase Storage

## 🔒 Security Features

- **Row Level Security**: Supabase RLS policies
- **Admin Protection**: Cannot deactivate other admins
- **CSRF Protection**: Secure API routes
- **Input Validation**: Zod schemas for all forms
- **Rate Limiting**: Protected against spam and abuse

## 🌐 Deployment

### Vercel (Recommended)

1. **Deploy to Vercel:**
```bash
npx vercel --prod
```

2. **Set environment variables in Vercel dashboard:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Configure domain and SSL** (automatic with Vercel)

### Manual Deployment

1. **Build the project:**
```bash
npm run build
```

2. **Start production server:**
```bash
npm start
```

## 🔄 Recent Updates (Latest Release)

### v2.1.0 - Performance & Type Safety Optimization
- ✅ **Full Image Optimization**: Replaced all native `<img>` tags with Next.js `<Image />` component for improved LCP and bandwidth efficiency.
- ✅ **Global Image Coverage**: Optimized images in navigation, posts, profiles, grids, and notification systems.
- ✅ **TypeScript Type Refinement**: Resolved all `any` type warnings in file uploaders and shared components for enhanced developer experience.
- ✅ **Zero Lint Warnings**: Successfully eliminated all ESLint warnings for a cleaner, production-ready codebase.

### v2.0.0 - Comprehensive User Management System
- ✅ **Real-time Activity Tracking**: Smart presence indicators with 6-tier system
- ✅ **Admin Dashboard**: Complete user and post management interface
- ✅ **Enhanced Authentication**: Live validation with duplicate checking
- ✅ **Database Improvements**: New user status columns with proper indexing
- ✅ **Performance Optimization**: Throttled updates and intelligent caching
- ✅ **Security Enhancements**: Advanced RLS policies and admin protections

### Technical Improvements
- 📈 **Build Performance**: Optimized TypeScript compilation
- 🔧 **Code Quality**: ESLint and Prettier configuration
- 🛡️ **Type Safety**: Enhanced TypeScript definitions
- 📱 **Mobile Experience**: Improved responsive design
- 🚀 **API Optimization**: Enhanced React Query integration

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** and test thoroughly
4. **Commit with conventional commits:**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
5. **Push to your branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request** with detailed description

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add proper error handling
- Include proper TypeScript types
- Test on multiple devices/browsers

## 📈 Future Roadmap

- [ ] **Real-time Chat**: Direct messaging system
- [ ] **Push Notifications**: Browser and mobile notifications  
- [ ] **Advanced Analytics**: User engagement metrics
- [ ] **Content Reporting**: User-driven moderation
- [ ] **API Rate Limiting**: Enhanced security measures
- [ ] **Multi-language Support**: Internationalization
- [ ] **Advanced Search**: Elasticsearch integration
- [ ] **Stories Feature**: Temporary content sharing

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🌐 Official Links

- **Live Application**: [https://aura.in](https://aura.in)
- **GitHub Repository**: [https://github.com/maazajaz/aura](https://github.com/maazajaz/aura)
- **Documentation**: Available in repository wiki

## 👨‍💻 Author

**Maaz Ajaz**
- 🌐 **Portfolio**: [https://maazajaz.com](https://maazajaz.com)
- 💻 **GitHub**: [@maazajaz](https://github.com/maazajaz)
- 🚀 **Other Projects**: [Trimizy](https://github.com/maazajaz/trimizy)
- 📧 **Contact**: Available through portfolio website

## 🙏 Acknowledgments

### Technologies
- **[Next.js](https://nextjs.org/)** - The React framework for production
- **[Supabase](https://supabase.com/)** - Open source Firebase alternative
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI component library
- **[React Query](https://tanstack.com/query)** - Powerful data synchronization
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library

### Inspiration
- **Instagram** - UI/UX design inspiration
- **Modern social platforms** - Feature concepts and user experience
- **Open source community** - Countless examples and best practices

---

## 📊 Repository Stats

![GitHub stars](https://img.shields.io/github/stars/maazajaz/aura)
![GitHub forks](https://img.shields.io/github/forks/maazajaz/aura)
![GitHub issues](https://img.shields.io/github/issues/maazajaz/aura)
![GitHub license](https://img.shields.io/github/license/maazajaz/aura)

---

**⭐ If you found this project helpful, please consider giving it a star!**

*Built with ❤️ by [Maaz Ajaz](https://maazajaz.com)*
