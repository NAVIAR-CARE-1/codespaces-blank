import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error.response?.data || error.message);
      }
    );
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    return this.client.get(url);
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.client.post(url, data);
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.client.put(url, data);
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.client.delete(url);
  }
}

export const apiClient = new ApiClient();
