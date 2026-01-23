import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-provider';

export const metadata: Metadata = {
  title: 'Player Dashboard - Scotch Doubles',
  description: 'Player dashboard for scotch doubles tournaments',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          defaultTheme="system"
          storageKey="player-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}