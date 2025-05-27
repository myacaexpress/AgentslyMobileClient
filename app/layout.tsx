import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as a common sans-serif font
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import ProtectedRoute from "@/components/ProtectedRoute"; // Import ProtectedRoute

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
      >
        <AuthProvider>
          <AppProvider>
            <ProtectedRoute>
              <div className="flex flex-col min-h-screen">
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
