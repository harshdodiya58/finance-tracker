# 💰 Finance Tracker

A full-stack MERN application for managing personal finances, tracking budgets, monitoring investments, and maintaining financial wellness.

![Tech Stack](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 📊 Dashboard
- Real-time financial overview with summary cards
- Interactive charts (Income vs Expense trends, Category breakdowns)
- Recent transactions display
- Budget progress indicators
- Quick action buttons

### 💸 Transaction Management
- Full CRUD operations for income and expenses
- Advanced search and filtering
- Category-based organization
- Date-wise tracking
- Transaction type indicators

### 📈 Budget Tracking
- Create and manage category-wise budgets
- Visual progress bars with status indicators
- Real-time spending tracking
- Budget period customization (weekly/monthly/yearly)
- Warning alerts for overspending

### 💎 Investment Portfolio
- Track multiple investment types (Stocks, Bonds, Mutual Funds, Crypto, Real Estate)
- Automatic profit/loss calculations
- Portfolio overview with key metrics
- Return percentage tracking
- Investment performance monitoring

### 👤 User Profile
- Profile management (name, email)
- Secure password change
- User authentication with JWT

## 🚀 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router v7** - Routing
- **Tailwind CSS v3** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icons

## 📁 Project Structure

```
pft/
├── backend/
│   ├── server/
│   │   ├── app.js              # Express server setup
│   │   ├── controllers/        # Business logic
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API routes
│   │   └── middleware/        # Auth & validation
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   └── layout/       # Layout components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React Context
│   │   ├── services/         # API services
│   │   ├── utils/            # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the backend directory:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/your_dbname
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

Server will run on http://localhost:5001

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Application will run on http://localhost:5173

## 🎯 Usage

1. **Register/Login**: Create a new account or login with existing credentials
2. **Dashboard**: View your financial overview and key metrics
3. **Transactions**: Add, edit, delete income and expense transactions
4. **Budgets**: Create budgets for different categories and track spending
5. **Investments**: Manage your investment portfolio and track returns
6. **Profile**: Update your profile information and change password

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/changepassword` - Change password
- `POST /api/auth/logout` - Logout user

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id` - Get single budget
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Investments
- `GET /api/investments` - Get all investments
- `GET /api/investments/:id` - Get single investment
- `POST /api/investments` - Create investment
- `PUT /api/investments/:id` - Update investment
- `DELETE /api/investments/:id` - Delete investment
- `GET /api/investments/portfolio` - Get portfolio overview

## 🎨 Features Showcase

### Beautiful UI/UX
- 🎨 Modern gradient designs
- ✨ Smooth animations and transitions
- 📱 Fully responsive (mobile, tablet, desktop)
- 🌈 Color-coded categories and status indicators
- 💫 Interactive charts and visualizations

### Security
- 🔒 JWT-based authentication
- 🔐 Password hashing with bcryptjs
- 🛡️ Protected API routes
- ✅ Input validation

### Performance
- ⚡ Fast API responses
- 🚀 Optimized React components
- 📦 Code splitting with Vite
- 💨 Efficient state management

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👨‍💻 Author

Your Name
- GitHub: [@Vatsal636](https://github.com/Vatsal636)

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

## 📞 Support

For support, email vatsalgokani2@gmail.com or create an issue in this repository.

---

⭐ Star this repo if you find it helpful!
