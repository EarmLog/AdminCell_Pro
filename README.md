# AdminCell Pro

Aplicación administrativa **multiplataforma** para llevar el registro de **sectores, períodos, líderes y reportes de células** de la comunidad, reemplazando el control manual en Excel.

Una sola base de código funciona en:

- **Web** (Vercel / PWA) — base de datos en el navegador (IndexedDB).
- **Escritorio** (Windows / Linux / macOS) — app nativa con **Tauri 2** y SQLite.
- **Android** — APK con **Capacitor** y SQLite.

Sin cuentas ni inicio de sesión: es de **uso directo** y guarda todo **localmente** en el dispositivo (funciona sin conexión).

## ¿Qué resuelve?

- **Períodos primero**: todo comienza creando un período. Sin período no se registra ni se analiza nada.
- **Reportes por período y sector**: código de célula, líderes, Personas, Asistencias, Inasistencias (sugeridas = Personas − Asistencias, editables), Invitados, Niños, Observaciones y **% de asistencia con semáforo** (rojo < 30 %, ámbar 30–70 %, verde ≥ 70 %). Puede haber varios reportes por sector.
- **Código de célula automático**: consecutivo por período y sector (`001`, `002`, …) con botón **Auto** o edición manual.
- **Líderes reutilizables**: se registran una vez y se vinculan a los reportes (relación muchos a muchos).
- **Análisis General**: totales y gráficas (SVG) del período activo, agrupados por sector.
- **Análisis por Período**: comparación de **todos** los períodos (no se filtra).
- **Impresión**: botón Imprimir que solo deja tablas y gráficas.
- **Modo claro/oscuro** y diseño responsive.
- **Respaldo**: exportar/importar toda la base en un archivo JSON desde Ajustes.

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Interfaz | Next.js 14 (exportación estática) + React 18 + Tailwind CSS |
| Base de datos | **Dexie** (IndexedDB) en Web · **SQLite** en Escritorio (Tauri) y Android (Capacitor) |
| Escritorio | Tauri 2 |
| Android | Capacitor 6 |
| Contenedores | Docker + Nginx |
| CI/CD | GitHub Actions (Vercel, Tauri y APK) |

La capa de datos es **agnóstica a la plataforma**: `src/lib/db/dbAdapter.js` detecta el entorno y carga el adaptador adecuado, exponiendo siempre la misma interfaz (`listar`, `obtener`, `insertar`, `actualizar`, `eliminar`, `eliminarPor`). La lógica de negocio vive en `src/lib/repositorio.js` y no sabe dónde se está ejecutando.

## Estructura del proyecto

```
AdminCell_Pro/
├── src/
│   ├── app/                  # Rutas (App Router) y estilos globales de Next.js
│   ├── components/           # UI base, iconos, tablas, gráficas, modales y navegación
│   ├── context/              # Tema, notificaciones y datos globales
│   └── lib/
│       ├── db/               # Esquema, adaptadores (Dexie/SQLite), drivers y dbAdapter
│       ├── repositorio.js    # Lógica de negocio y análisis
│       ├── sanitizar.js      # Normalización de entradas
│       ├── formato.js        # Formato de números, fechas y descargas
│       └── plataforma.js     # Detección de plataforma
├── src-tauri/                # Aplicación de escritorio (Tauri 2)
├── android/                  # Proyecto Android (Capacitor)
├── docker/                   # Configuración de Nginx
├── Dockerfile · docker-compose.yml
├── capacitor.config.json
├── next.config.js / tailwind.config.js / postcss.config.js
└── .github/workflows/        # Flujos de Vercel, Tauri y Android
```

## Requisitos

- Node.js 20+
- Para compilar Escritorio: Rust + las dependencias de Tauri de cada sistema.
- Para compilar Android: JDK 21 + Android SDK.

## Desarrollo

```bash
npm install
npm run dev        # servidor de desarrollo en http://localhost:3000
```

La base de datos de la Web usa IndexedDB (Dexie). En Escritorio y Android usa SQLite.

### Escritorio (Tauri)

```bash
npm run tauri:dev     # desarrollo
npm run tauri:build   # genera el instalador (requiere Rust)
```

### Android (APK)

```bash
npm run build         # exportación estática en out/
npm run cap:add       # solo la primera vez (crea la carpeta android/)
npm run cap:sync      # compila y copia los assets al proyecto Android
npm run cap:open      # abre Android Studio
# o compilar el APK por línea de comandos:
cd android && ./gradlew assembleDebug
```

### Docker

```bash
docker compose up             # desarrollo
docker build -t admincell-pro .
docker run -p 8080:80 admincell-pro   # sirve el sitio estático con Nginx
```

## Publicación (CI/CD)

Cada push a `main` dispara los flujos de GitHub Actions:

- **Vercel**: compila y publica la web (requiere los secretos `VERCEL_TOKEN`, `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID`).
- **Tauri**: genera los instaladores de Windows y Linux como artefactos.
- **Android**: genera el APK de depuración como artefacto.

## Lógica de negocio clave

1. **El período habilita todo**: sin períodos, Reportes y Análisis muestran un aviso. El período activo (elegido en el menú) filtra Reportes y Análisis General; **Análisis por Período** siempre muestra todos.
2. **Inasistencia sugerida** = `Personas − Asistencias` (auto-calculada, editable).
3. **% de asistencia** = `Asistencias / Personas` (0 si no hay personas).
4. **Código de célula** = siguiente consecutivo por período y sector (mayor número final + 1, a 3 dígitos).
5. **Líderes** = tabla `lideres` + relación `reporte_lideres` (muchos a muchos).
6. **Borrado en cascada** de las relaciones al eliminar entidades; en la Web (IndexedDB) se aplica manualmente desde el repositorio para que el comportamiento sea idéntico en todas las plataformas.

La aplicación arranca **vacía**: cree sus sectores, luego un período y comience a registrar reportes.
