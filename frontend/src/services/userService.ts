import axiosInstance from './api';

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  dateOfBirth?: string;
  active: boolean;
}

export const userService = {
  getUser: (userId: string) => {
    return axiosInstance.get<User>(`/users/${userId}`);
  },

  updateUser: (userId: string, data: Partial<User>) => {
    return axiosInstance.put<User>(`/users/${userId}`, data);
  },
};
