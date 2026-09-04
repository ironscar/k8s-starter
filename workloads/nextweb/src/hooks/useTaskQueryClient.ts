import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { TaskService } from '@/lib/api/services/TaskService';
import { Task } from '@/store/slices/TaskSlice';

export const useTaskList = (limit: number) =>
  useQuery({
    queryKey: ['tasks', limit],
    queryFn: () => TaskService.getAll(limit),
  });

export const useCreateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (task: Task) => TaskService.createTask(task),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
};

export const useUpdateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (task: Task) => TaskService.updateTask(task),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
};
