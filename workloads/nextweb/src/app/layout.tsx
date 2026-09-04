import '../styles/globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { AppStoreProvider } from '@/providers/AppStoreProvider';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <QueryProvider>
            <AppStoreProvider>
              {children}
            </AppStoreProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
