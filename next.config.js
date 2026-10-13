/** @type {import('next').NextConfig} */
// Configuración de Next.js para exportación estática (SSG).
// Se genera la carpeta `out/` que consumen Vercel, Capacitor (Android) y Tauri.
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  reactStrictMode: true
};

module.exports = nextConfig;
