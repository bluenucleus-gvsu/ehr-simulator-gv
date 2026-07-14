import type { Metadata } from "next";
import { UserProvider } from "@/context/UserContext";
import "./globals.css";
import { Toaster } from "sonner";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";


const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "GVSU EHR Simulator",
  description: "A web application for simulating the clinical experience of a patient in a hospital.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={robotoMono.variable}>
      <body>
        <UserProvider>
          <Toaster position="top-right" />
          <main className="w-full">
            {children}
          </main>
        </UserProvider>
      </body>
    </html>

  );
}
