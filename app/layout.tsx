import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import { LanguageProvider } from './components/LanguageContext';

const inter = Inter({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <title>Under Construction</title>
                <meta name="description" content="Site is undergoing construction currently." />
            </head>
            <body className={inter.className}>
                <LanguageProvider>
                    <Navbar />
                    {children}
                </LanguageProvider>
            </body>
        </html>
    );
}
