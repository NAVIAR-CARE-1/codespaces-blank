export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'consultant' | 'employee' | 'manager';
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  country: string;
  employees: number;
  subscription: 'free' | 'standard' | 'professional' | 'enterprise';
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  id: string;
  employeeId: string;
  consultantId: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  startTime: string;
  endTime: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  organizationId: string;
  uploadedBy: string;
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
