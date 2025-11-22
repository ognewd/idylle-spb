# 🌸 Idylle - Luxury Perfume & Home Goods E-commerce Platform

A modern, feature-rich e-commerce platform for luxury perfumes and home goods, built with Next.js 14, TypeScript, and Tailwind CSS.

## ✨ Features

### 🛒 E-commerce Core
- **Advanced Product Catalog** with filtering, sorting, and search
- **Product Variants** - multiple options (volumes) with individual prices and discounts
- **Enhanced Product Cards** with image carousels, wishlist, and quick view
- **Dynamic Product Pages** with detailed information, reviews, and related products
- **Russian Transliteration** - automatic URL slug generation from Cyrillic
- **Responsive Design** optimized for all devices

### 💳 Payment System
- **Multiple Payment Methods**:
  - 💳 Card payments (Stripe, YooKassa, Tinkoff)
  - 🧾 Bank transfer for legal entities
  - 💵 Cash on delivery (Saint Petersburg)
  - 🏬 Cash at pickup (boutique)
- **Commission Management** with admin controls
- **Payment Instructions** for each method

### 👤 User Management
- **User Registration & Authentication** with NextAuth.js
- **Personal Account** with order history, addresses, and wishlist
- **GDPR Compliance** with terms and privacy policy acceptance
- **Secure Password Handling** with bcrypt

### 📧 Newsletter System
- **Double Opt-in Subscription** with email confirmation
- **Admin Management** for subscriber lists
- **Multiple Subscription Forms** (footer, inline, standalone)
- **Export Functionality** for subscriber data

### 🎨 Modern UI/UX
- **Beautiful Design** with Tailwind CSS and Radix UI
- **Smooth Animations** with Framer Motion
- **Accessible Components** following WCAG guidelines
- **Mobile-First Approach** with responsive design

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom Components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe, YooKassa, Tinkoff
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## 📁 Project Structure

```
idylle-spb/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── catalog/           # Product catalog
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── layout/           # Layout components
│   │   ├── product/          # Product-related components
│   │   └── forms/            # Form components
│   ├── lib/                  # Utility functions
│   └── types/                # TypeScript type definitions
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### 1. Clone and Setup
```bash
git clone <repository-url>
cd idylle-spb
npm install
```

### 2. Environment Configuration
Create `.env.local` file with minimal required configuration:

```env
# Required
DATABASE_URL="postgresql://username:password@localhost:5432/idylle_spb"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional (for full functionality)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 3. Database Setup
```bash
# Create database (PostgreSQL)
createdb idylle_spb

# Apply migrations and seed data
npm run db:push
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

### 🔑 Default Access
- **Admin Panel**: http://localhost:3000/admin
- **Admin Login**: admin@idylle.spb.ru / admin123

### 🛠️ Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with test data
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset and reseed database
```

### 📖 Documentation
- **Detailed Setup**: See [SETUP.md](./SETUP.md)
- **Product Variants Guide**: See [VARIANTS_GUIDE.md](./VARIANTS_GUIDE.md)
- **Features Overview**: See [FEATURES.md](./FEATURES.md)

## 🎯 Key Features Implementation

### Product Variants System
Products can have multiple variants (e.g., different volumes) with individual prices:

```typescript
// Product variant example
interface ProductVariant {
  id: string;
  name: string;        // "Духи"
  value: string;       // "60мл"
  price: number;       // 13516
  comparePrice?: number; // 19309 (for discounts)
  stock: number;       // 8
  isDefault: boolean;  // Default selected variant
}
```

**Features:**
- Individual prices and discounts per variant
- Separate stock management
- Beautiful UI with price cards (inspired by Randewoo)
- Automatic discount calculation
- Default variant selection

See [VARIANTS_GUIDE.md](./VARIANTS_GUIDE.md) for detailed documentation.

### Payment System
The payment system supports multiple methods with flexible configuration:

```typescript
// Payment method configuration
interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'bank_transfer' | 'cash_delivery' | 'cash_pickup';
  isActive: boolean;
  commission: number;
  instructions?: string;
}
```

### Advanced Filtering
The catalog includes sophisticated filtering with URL state management:

- Filter by brand, category, price range, gender, aroma family
- Multi-select support with dynamic URL updates
- Responsive mobile-friendly filter sidebar
- Real-time product count updates

### User Authentication
GDPR-compliant user registration with required consent:

```typescript
// User registration with GDPR compliance
const user = await prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword,
    termsAcceptedAt: new Date(),
    privacyAcceptedAt: new Date(),
  },
});
```

### Newsletter System
Double opt-in newsletter subscription with admin management:

- Email confirmation required
- Unsubscribe functionality
- Admin export capabilities
- Integration with email marketing services

## 🎨 Design System

The project uses a comprehensive design system with:

- **Color Palette**: Carefully selected colors for luxury branding
- **Typography**: Inter font with proper hierarchy
- **Spacing**: Consistent spacing scale
- **Components**: Reusable UI components with variants
- **Animations**: Smooth transitions and micro-interactions

## 📱 Responsive Design

The platform is fully responsive with:

- **Mobile-First Approach**: Designed for mobile devices first
- **Breakpoints**: Tailwind CSS responsive breakpoints
- **Touch-Friendly**: Optimized for touch interactions
- **Performance**: Optimized images and lazy loading

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **CSRF Protection**: Built-in Next.js protection
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: React's built-in protection

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Docker
```bash
# Build Docker image
docker build -t idylle-spb .

# Run container
docker run -p 3000:3000 idylle-spb
```

## 📊 Database Schema

The database includes comprehensive models for:

- **Users**: Authentication and profile data
- **Products**: Product information with variants
- **Orders**: Order management and tracking
- **Payments**: Payment method configuration
- **Newsletter**: Subscription management
- **Reviews**: Product reviews and ratings

## �� Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@idylle.spb.ru
- Phone: +7 (812) 123-45-67

## 🎉 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Radix UI for accessible component primitives
- The open-source community for inspiration and tools

---

Built with ❤️ for the luxury retail industry
