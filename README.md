# MERN Stack Project

This is a MERN (MongoDB, Express.js, React.js, Node.js) stack project using CommonJS modules for CPanel compatibility.

## Project Structure

```
root/
│
├── backend/         # Node.js/Express server
├── frontend/        # React application
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Create a `.env` file in the backend directory with your environment variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   ```

## Running the Application

### Development Mode

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   npm run client
   ```

Or run both simultaneously:
```bash
npm run dev:full
```

### Production Mode

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Important Notes

- This project uses CommonJS modules (require) instead of ES Modules (import) for CPanel compatibility
- Make sure to update environment variables before deployment
- The backend API will be available at `http://localhost:5000`
- The frontend development server will run at `http://localhost:3000` 