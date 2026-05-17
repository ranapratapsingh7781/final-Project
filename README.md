# Online E-Wallet Final Year Project

## Project Overview

This is a MERN stack E-wallet application built as a final year project. It allows users to register, log in, manage wallet balance, transfer money, and review transaction history through a professional web interface.

## Project Objectives

- Build a secure wallet system with authentication
- Provide intuitive wallet management for end users
- Support credit, debit, and peer-to-peer transfer operations
- Maintain a transaction audit history
- Present a clean UI suitable for a final year project demonstration

## Key Features

- Secure user registration and login with JWT
- Real-time wallet balance overview
- Add money and withdraw funds
- Transfer money to another user by email
- Transaction history table with timestamps
- Responsive dashboard and polished project UI

## Technical Stack

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT

## Installation

1. Open the project root in a terminal.
2. Install all dependencies:
   ```bash
   npm run install-all
   ```
3. Create `backend/.env` with the following values:
   ```env
   MONGO_URI=mongodb://localhost:27017/ewallet
   JWT_SECRET=your_jwt_secret
   ```
4. Start the application:
   ```bash
   npm run dev
   ```

## Running Individually

- Backend only:
  ```bash
  cd backend
  npm run dev
  ```
- Frontend only:
  ```bash
  cd frontend
  npm start
  ```

## API Reference

### Auth

- `POST /api/auth/register` – register a new user
- `POST /api/auth/login` – login and receive JWT
- `GET /api/auth/me` – retrieve current authenticated user

### Wallet

- `GET /api/wallet/balance` – current wallet balance
- `POST /api/wallet/add` – credit wallet
- `POST /api/wallet/withdraw` – debit wallet
- `POST /api/wallet/transfer` – send money to another user
- `GET /api/wallet/transactions` – transaction history

## Implementation Highlights

- Auth flow with JWT and bcrypt hashing
- Clean React dashboard with wallet metrics
- Peer-to-peer transfers and transactional records
- Improved error handling and validation

## Notes

- Make sure MongoDB is running locally before starting the backend.
- Use a strong value for `JWT_SECRET` in production.

## License

MIT License