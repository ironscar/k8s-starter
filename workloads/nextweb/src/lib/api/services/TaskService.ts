import { AxiosError } from 'axios';

import { api } from '../client/axiosInstance';

import { Task } from '@/store/slices/TaskSlice';

export const TaskService = {
  getAll: async (limit: number): Promise<{ data: Task[]; error: AxiosError | null }> =>
    await api.get(`/tasks?limit=${limit}`),
  createTask: async (task: Task): Promise<{ data: Task | null; error: AxiosError | null }> =>
    api.post('/tasks', task),
  updateTask: async (task: Task): Promise<{ data: Task | null; error: AxiosError | null }> =>
    api.put(`/tasks/${task.id}`, task),
};
