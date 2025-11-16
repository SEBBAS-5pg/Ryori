// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Tu archivo de Tailwind

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ryori Recetario",
  description: "Recetario con Next.js y Go",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      {/* Aplicamos las clases de Tailwind al body:
        - bg-gray-900: Fondo oscuro
        - text-white: Texto blanco por defecto
        - min-h-screen: Asegura que ocupe al menos toda la pantalla
      */}
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen`}>
        {/* Aquí podríamos poner un Navbar */}
        
        {children}
        
        {/* Aquí podríamos poner un Footer */}
        <footer className="text-center p-4 mt-12 text-gray-600">
          Ryori Project &copy; 2025
        </footer>
      </body>
    </html>
  );
}