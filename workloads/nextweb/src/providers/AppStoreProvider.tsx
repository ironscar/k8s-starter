'use client'

import { createContext, useContext, useRef } from "react";

import { createAppStore, AppStoreState } from "@/store/createAppStore";
import { useStore } from "zustand/react";

export type AppStoreApi = ReturnType<typeof createAppStore>;

export const AppStoreContext = createContext<AppStoreApi | null>(null);

export interface AppStoreProviderProps {
    // any server fetched data should come here as well
    children: React.ReactNode;
}

export const AppStoreProvider = ({children}: AppStoreProviderProps) => {
    const storeRef = useRef<AppStoreApi>(null);

    if (!storeRef.current) {
        storeRef.current = createAppStore();
    }

    return (
        <AppStoreContext value={storeRef.current}>{children}</AppStoreContext>
    );
};

export const useAppStore = <T,>(selector: (store: AppStoreState) => T): T => {
    const appStoreContext = useContext(AppStoreContext);
    if (!appStoreContext) {
        throw new Error("useAppStore must be used within a StoreProvider");
    }
    return useStore(appStoreContext, selector);
};
