import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'God Squad — Build the Greatest Team in Sports History',
  description: 'Draft players from historic eras and simulate a perfect season. Can your God Squad go undefeated?',
  keywords: ['sports', 'fantasy', 'NBA', 'NFL', 'MLB', 'NHL', 'team builder', 'simulation'],
  openGraph: {
    title: 'God Squad',
    description: 'Build your perfect historical sports team and go undefeated.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0a] text-gray-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
