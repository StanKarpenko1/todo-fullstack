// User returned from backend
export interface User {
  id: string;
  email: string;
  name: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Register data
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Auth response from backend
export interface AuthResponse {
  token: string;
  user: User;
}
