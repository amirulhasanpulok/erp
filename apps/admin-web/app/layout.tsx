import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';
import { AppProviders } from '@/components/providers/app-providers';
import './globals.css';

const fontSans = Manrope({ subsets: ['latin'], variable: '--font-sans' });
const fontHeading = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: 'ERP Admin',
  description: 'Enterprise ERP dashboard'
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontHeading.variable} min-h-screen antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
