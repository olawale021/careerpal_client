import { Josefin_Sans } from 'next/font/google';
import { SidebarLayout } from '@/components/SidebarLayout';
import "@/app/globals.css";

const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-josefin-sans',
});

export const metadata = {
  title: 'CareerPal',
  description: 'Your AI Career Assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${josefinSans.variable}`}>
      <body>
        <SidebarLayout>
          {children}
        </SidebarLayout>
      </body>
    </html>
  );
}

