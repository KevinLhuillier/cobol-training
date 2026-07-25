import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. On configure Inter et on force le nom de la variable CSS
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Code Legacy - Maîtrisez le Mainframe",
  description: "Plateforme d'apprentissage COBOL, JCL, CICS et DB2",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      // 2. On ajoute className="dark" pour forcer le thème sombre sur les composants shadcn
      <html lang="fr" className="dark">
      {/* 3. On applique la variable de police et l'antialiasing */}
      <body className={`${inter.variable} font-sans antialiased`}>
      {children}
      </body>
      </html>
  );
}