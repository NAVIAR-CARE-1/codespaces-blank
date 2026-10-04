export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'consultant' | 'employee' | 'manager';
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  payload?: T;
  error?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  type: 'admin' | 'consultant' | 'employee' | 'manager';
}

export interface Consultation {
  id: string;
  employeeId: string;
  consultantId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}
