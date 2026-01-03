# Smart Finance & Wellness Tracker - Backend

A comprehensive MERN stack backend application for managing personal finances, budgets, and investments.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Transaction Management**: Full CRUD operations with filtering and analytics
- **Budget Tracking**: Budget creation with progress monitoring and alerts
- **Investment Portfolio**: Track stocks and crypto investments with profit/loss analytics
- **Advanced Analytics**: Comprehensive financial analytics and insights
- **Data Security**: Protected routes, input validation, and error handling

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Project Structure

```
server/
├── models/
│   ├── User.js          # User authentication model
│   ├── Transaction.js   # Financial transaction model
│   ├── Budget.js        # Budget management model
│   └── Investment.js    # Investment tracking model
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── transactionController.js # Transaction CRUD & analytics
│   ├── budgetController.js      # Budget management logic
│   └── investmentController.js  # Investment portfolio logic
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── transactions.js  # Transaction API routes
│   ├── budgets.js       # Budget API routes
│   └── investments.js   # Investment API routes
├── middleware/
│   └── auth.js          # JWT authentication middleware
├── app.js               # Main application file
└── .env                 # Environment variables
```

## Installation & Setup

1. **Clone and Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**
   - Copy `server/.env` file and update the following variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure secret key for JWT tokens
   - `FRONTEND_URL`: Your frontend application URL (for CORS)

3. **Database Setup**
   - Create a MongoDB database (local or cloud)
   - Update the `MONGO_URI` in your `.env` file

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Start Production Server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/changepassword` - Change password
- `GET /api/auth/logout` - Logout user

### Transactions
- `GET /api/transactions` - Get all transactions (with filters)
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get single transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/analytics` - Get transaction analytics

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create new budget
- `GET /api/budgets/:id` - Get single budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/analytics` - Get budget analytics

### Investments
- `GET /api/investments` - Get all investments
- `POST /api/investments` - Create new investment
- `GET /api/investments/:id` - Get single investment
- `PUT /api/investments/:id` - Update investment
- `DELETE /api/investments/:id` - Delete investment
- `PUT /api/investments/:id/value` - Update current value
- `GET /api/investments/portfolio` - Get portfolio summary
- `GET /api/investments/analytics` - Get investment analytics

## Query Parameters

### Transaction Filters
- `category` - Filter by category
- `type` - Filter by income/expense
- `paymentMethod` - Filter by payment method
- `borrowOrLend` - Filter by borrow/lend status
- `settlementStatus` - Filter by settlement status
- `startDate` & `endDate` - Date range filter
- `page` & `limit` - Pagination
- `sort` - Sort order (default: -date)

### Budget Filters
- `category` - Filter by category
- `period` - Filter by monthly/weekly

### Investment Filters
- `type` - Filter by stock/crypto
- `symbol` - Search by symbol
- `page` & `limit` - Pagination
- `sort` - Sort order

## Data Models

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (user/admin)
}
```

### Transaction Model
```javascript
{
  user: ObjectId (required),
  amount: Number (required),
  type: String (income/expense),
  description: String,
  category: String (required),
  paymentMethod: String (required),
  borrowOrLend: String (none/borrow/lend),
  personName: String,
  contactDetails: String,
  settlementStatus: String (pending/settled),
  date: Date
}
```

### Budget Model
```javascript
{
  user: ObjectId (required),
  category: String (required),
  limit: Number (required),
  period: String (monthly/weekly)
}
```

### Investment Model
```javascript
{
  user: ObjectId (required),
  type: String (stock/crypto),
  symbol: String (required),
  amountInvested: Number (required),
  currentValue: Number,
  quantity: Number,
  purchasePrice: Number,
  date: Date
}
```

## Error Handling

The application includes comprehensive error handling for:
- Validation errors
- Authentication errors
- Database errors
- Route not found errors
- Server errors

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes middleware
- Input validation
- CORS configuration
- Error message sanitization

## Development

- Use `npm run dev` for development with nodemon
- Environment variables are loaded from `.env` file
- MongoDB connection with automatic retry
- Request logging in development mode
- Graceful shutdown handling

## Environment Variables

Required environment variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRES_IN` - JWT expiration time
- `FRONTEND_URL` - Frontend URL for CORS

## Health Check

Visit `http://localhost:5000/health` to check if the API is running.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.