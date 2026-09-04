import { StateCreator } from 'zustand';

import { AppStoreState } from '../createAppStore';

export type Filter = 'all' | 'todo' | 'completed';

export interface FilterSlice {
  filter: Filter;
  setFilter: (filter: Filter) => void;
}

export const createFilterSlice: StateCreator<AppStoreState, [], [], FilterSlice> = (set) => ({
  filter: 'all',
  setFilter: (filter: Filter) => set({ filter }),
});
