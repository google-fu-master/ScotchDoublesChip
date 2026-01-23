import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}