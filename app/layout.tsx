import "./globals.css";

import { AuthProvider } from "@/app/context/AuthContext";
import { ClientSideWrapper } from "@/components/ClientSideWrapper";
import Provider from "@/components/providers/SessionProvider";

import { Josefin_Sans } from 'next/font/google';


// Configure the font with desired weights
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
      <body className="font-noto-serif" suppressHydrationWarning>
        <Provider>
          <AuthProvider>
            {/* Use only one sidebar-containing component */}
            <ClientSideWrapper>{children}</ClientSideWrapper>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}