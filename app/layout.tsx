import type { Metadata } from 'next';
import { Space_Mono } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import CustomCursor from './components/CustomCursor';
import { LanguageProvider } from './components/LanguageContext';

const spaceMono = Space_Mono({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-space-mono',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Badr Obtel — Hardware Engineer',
    description: 'Embedded systems, PCB design, shipped hardware. Welcome to my domain.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={spaceMono.variable}>
            <head>
                {/* Mark JS as live before first paint, so hero-enter start-states (which hide the
                    hero until the entrance hands off) apply ONLY when JS can animate them back in.
                    No-JS keeps everything visible. */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: "document.documentElement.classList.add('js')",
                    }}
                />
                {/* Display + body faces (Fontshare). Self-hosting via next/font/local is the
                    production-hardening step noted in AESTHETIC_DIRECTION.md §3. */}
                <link rel="preconnect" href="https://api.fontshare.com" />
                <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
                <link
                    rel="stylesheet"
                    href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600&f[]=satoshi@400,500,700&display=swap"
                />
            </head>
            <body>
                <LanguageProvider>
                    <CustomCursor />
                    <Navbar />
                    {children}
                </LanguageProvider>
            </body>
        </html>
    );
}
