import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nosana Agents 102 Challenge',
  description: 'Production-ready AI agent application with MCP server, Mastra agent, and Next.js frontend',
  keywords: ['AI', 'Agents', 'MCP', 'Mastra', 'Code Review', 'IoT'],
  authors: [{ name: 'Nosana Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="nosana-gradient w-8 h-8 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">N</span>
                  </div>
                  <h1 className="text-xl font-bold">Nosana Agents 102</h1>
                </div>
                <nav className="hidden md:flex space-x-6">
                  <a href="/" className="text-sm font-medium hover:text-primary">
                    Dashboard
                  </a>
                  <a href="/code-review" className="text-sm font-medium hover:text-primary">
                    Code Review
                  </a>
                  <a href="/iot-devices" className="text-sm font-medium hover:text-primary">
                    IoT Devices
                  </a>
                  <a href="/agent" className="text-sm font-medium hover:text-primary">
                    Agent
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t mt-auto">
            <div className="container mx-auto px-4 py-4">
              <div className="text-center text-sm text-muted-foreground">
                <p>Nosana Agents 102 Challenge - AI Agent Application</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
