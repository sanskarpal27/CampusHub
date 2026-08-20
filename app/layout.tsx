import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createServerClient } from "@/utils/supabase/server";
import { TopNav } from "@/components/top-nav";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CampusHub",
    template: "%s | CampusHub",
  },
  description:
    "Your all-in-one campus companion — buy, sell, and recover lost items on campus.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Fetch the authenticated user on the server so the nav can conditionally
  // render the Sign In button vs the avatar. getUser() verifies against
  // Supabase's server — more secure than getSession() which reads the JWT only.
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <TopNav user={user} />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} CampusHub · Built for students, by
          students.
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
