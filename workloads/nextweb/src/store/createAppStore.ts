import { createStore } from 'zustand/vanilla';

import { createFilterSlice, FilterSlice } from './slices/FilterSlice';
import { createTaskSlice, TaskSlice } from './slices/TaskSlice';

export type AppStoreState = FilterSlice & TaskSlice;

export const createAppStore = () => createStore<AppStoreState>((...a) => ({
  ...createFilterSlice(...a),
  ...createTaskSlice(...a),
}));
