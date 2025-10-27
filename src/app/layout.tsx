/**
 * @fileoverview Root layout component for Next.js app
 * @module app/layout
 * 
 * Provides global app structure including:
 * - Font loading (Geist Sans and Geist Mono)
 * - Clerk authentication provider
 * - Top navigation bar
 * - Bottom navigation (for mobile, authenticated users only)
 * - Floating background elements
 * - Page content container
 * 
 * Wraps all pages and provides shared layout and providers.
 */

"use client"

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider, useUser } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

// Load Geist Sans font with CSS variables
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Load Geist Mono font with CSS variables
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Inner layout content with authentication-aware components
 * 
 * Renders page content with navigation. BottomNav only shows
 * for authenticated users. Handles auth state via useUser hook.
 * 
 * @param {Object} props - Props with children
 * @returns {JSX.Element} Layout structure with nav and content
 */
function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser();
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dynamic-bg`}
      >
        {/* Floating Background Elements */}
        <div className="floating-elements">
          <div className="floating-element"></div>
          <div className="floating-element"></div>
          <div className="floating-element"></div>
        </div>
        
        <Navbar />
        <main className="pt-20 pb-20 max-w-2xl mx-auto px-4 relative z-10">{children}</main>
        {isSignedIn && (
          <BottomNav />
        )}
      </body>
    </html>
  );
}

/**
 * Root layout component - App shell wrapper
 * 
 * Wraps entire app with ClerkProvider for authentication.
 * This is the top-level component that provides authentication
 * context to all pages.
 * 
 * @param {Object} props - Props with children
 * @returns {JSX.Element} ClerkProvider with LayoutContent
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <LayoutContent>{children}</LayoutContent>
    </ClerkProvider>
  );
}
