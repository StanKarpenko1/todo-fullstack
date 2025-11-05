# Todo App - Quick Start Guide

## Setup (First Time Only)

```bash
# Backend
cd backend
npm install
npx prisma migrate dev

# Frontend
cd ../frontend
npm install
```

## Running the App

### Backend (Terminal 1)
```bash
cd backend
npm run dev
```
**Runs on:** http://localhost:5000

### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
**Runs on:** http://localhost:5173

## Testing

```bash
cd backend
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

## Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## API Endpoints

- **Health:** GET http://localhost:5000/health
- **Register:** POST http://localhost:5000/api/auth/register
- **Login:** POST http://localhost:5000/api/auth/login
- **Todos:** GET/POST/PUT/DELETE http://localhost:5000/api/todos
