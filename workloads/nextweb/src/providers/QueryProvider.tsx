'use client';

import { environmentManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';

let browserClient: QueryClient | null = null;

function createQueryClient() {
  // define the query client with default options
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function getQueryClient() {
  if (environmentManager.isServer()) {
    // if SSR, always create a new client for each request to avoid sharing state between users
    return createQueryClient();
  }
  if (!browserClient) {
    // if client and no existing client, create one and reuse for the rest of the session
    browserClient = createQueryClient();
  }
  return browserClient;
}

export function QueryProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
