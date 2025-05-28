import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as a common sans-serif font
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import ProtectedRoute from "@/components/ProtectedRoute"; // Import ProtectedRoute
import UserAvatar from "@/components/UserAvatar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans", // Using a more generic variable name
});

export const metadata: Metadata = {
  title: "Agentsly AI", // Updated title
  description: "AI Powered Sales Agent Assistant", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased bg-white`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <AppProvider>
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
                <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
                  <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold text-slate-800">AGENTSLY.AI</h1>
                    <UserAvatar />
                  </div>
                </header>
                <main className="flex-grow">
                  {children}
                </main>
                <BottomNav />
              </div>
            </ProtectedRoute>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
