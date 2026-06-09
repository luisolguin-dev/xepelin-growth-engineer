import type { Metadata } from "next";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xepelin Growth",
  description: "Lead enrichment pipeline",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Xepelin Growth</span>
            <UserButton />
          </header>
          <main style={{ padding: '1rem' }}>
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}