import axiosInstance from './api';

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: string | null;
  zipCode?: string | null;
  city?: string | null;
  state?: string | null;
  dateOfBirth?: string | null;
  active: boolean;
  profileComplete: boolean;
}

export interface UserUpdatePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  dateOfBirth?: string;
}

export const userService = {
  getMe: () => axiosInstance.get<User>('/users/me'),
  updateMe: (data: UserUpdatePayload) => axiosInstance.put<User>('/users/me', data),
};
