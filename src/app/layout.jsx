import './globals.css';
import { ProveedorTema } from '@/context/TemaContext';
import { ProveedorNotificaciones } from '@/context/NotificacionesContext';
import { ProveedorDatos } from '@/context/DatosContext';
import Layout from '@/components/Layout';

export const metadata = {
  title: 'AdminCell Pro',
  description: 'Sistema comunitario de sectores, períodos y reportes de células. Funciona sin conexión.'
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d9488'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <ProveedorTema>
          <ProveedorNotificaciones>
            <ProveedorDatos>
              <Layout>{children}</Layout>
            </ProveedorDatos>
          </ProveedorNotificaciones>
        </ProveedorTema>
      </body>
    </html>
  );
}
