# Custodia Compartida

App web universal (iOS, Android y escritorio) para gestionar la custodia compartida de hijos. Calendario mensual con custodia, festivos, no lectivos, comentarios por día, cuadro de mando con estadísticas e historial de cambios y exportación del año a PDF.

- **Stack**: React 18 + Vite + Tailwind CSS
- **Base de datos**: Supabase (Postgres + Realtime)
- **Hosting**: Netlify
- **PWA**: instalable opcionalmente, funciona como web normal sin instalar

---

## 1. Configurar Supabase

1. Entra en [supabase.com](https://supabase.com) y crea un proyecto nuevo (plan gratuito sobra).
2. Ve a **SQL Editor** → **New query** → copia y pega TODO el contenido de `supabase/schema.sql` → pulsa **Run**.
3. Ve a **Project Settings** → **Data API** y copia:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public key**

> Nota de privacidad: como pediste no usar login, las políticas RLS son públicas. Cualquiera con la URL de tu app y la anon key podrá leer y escribir. Si más adelante quieres restringir el acceso, podemos añadir un PIN compartido o autenticación.

---

## 2. Probar en local

```bash
# 1. Instala dependencias
npm install

# 2. Copia el archivo de entorno y rellénalo
cp .env.example .env
# Edita .env y pega tu VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

# 3. Arranca el servidor de desarrollo
npm run dev
```

Abre `http://localhost:5173` en el navegador.

---

## 3. Desplegar en Netlify

### Opción A: Desde GitHub (recomendado)

1. Sube el proyecto a un repositorio de GitHub.
2. Entra en [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
3. Selecciona tu repo. Netlify detectará automáticamente:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Antes de hacer deploy, ve a **Site settings** → **Environment variables** → **Add a variable** y añade:
   - `VITE_SUPABASE_URL` = tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu anon key
5. Pulsa **Deploy**.

### Opción B: Drag & drop

```bash
npm run build
```

Y arrastra la carpeta `dist/` a [app.netlify.com/drop](https://app.netlify.com/drop). Luego añade las variables de entorno como en la Opción A y vuelve a desplegar.

---

## 4. Iconos PWA (opcional)

Si quieres que la app sea instalable con icono propio, añade dos imágenes PNG en `public/`:

- `public/icon-192.png` (192×192 px)
- `public/icon-512.png` (512×512 px)

Sin ellas la app funciona igual desde el navegador, simplemente no se podrá instalar con icono.

---

## 5. Cómo se usa

- **Pulsa un día**: aplica al día la configuración actual de la barra (custodia + festivo + no lectivo).
- **Selector "Ninguno"**: limpia la custodia del día.
- **Toggle Festivo**: el día se muestra con el número en rojo y negrita.
- **Toggle No lectivo**: el día muestra una estrella.
- **Mantén pulsado un día** (o clic derecho en escritorio): abre el modal para añadir/editar comentario.
- **Botón Resumen**: cuadro de mando con totales del año, porcentajes y últimos cambios (2 meses).
- **Botón PDF**: descarga el calendario anual del año visible.
- **Chip de usuario** (esquina superior derecha): permite cambiar entre Padre/Madre. Cada cambio se registra con el autor.

---

## Estructura del proyecto

```
custodia-app/
├── public/                  # Estáticos (favicon, iconos PWA)
├── src/
│   ├── components/          # Componentes React
│   ├── hooks/               # Hooks (useCalendar)
│   ├── lib/                 # Cliente Supabase, utilidades fechas, PDF
│   ├── App.jsx              # Componente raíz
│   └── main.jsx             # Entry point
├── supabase/
│   └── schema.sql           # Esquema de la base de datos
├── netlify.toml             # Configuración de despliegue
├── .env.example
└── package.json
```
