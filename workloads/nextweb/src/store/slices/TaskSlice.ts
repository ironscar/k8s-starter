import { StateCreator } from 'zustand';

import { AppStoreState } from '../createAppStore';

export type Task = { userId: number | null; id: number | null; title: string; completed: boolean };

export interface TaskSlice {
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
}

export const createTaskSlice: StateCreator<AppStoreState, [], [], TaskSlice> = (set) => ({
  selectedTask: null,
  setSelectedTask: (task: Task | null) => set({ selectedTask: task }),
});
