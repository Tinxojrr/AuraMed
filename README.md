# AuraMed — Sistema de Triaje Inteligente

Sistema de triaje automatizado para atención primaria de salud, impulsado por Inteligencia Artificial.

## Stack tecnológico

- **Frontend:** React 18 + Vite
- **Base de datos:** Supabase (PostgreSQL + Realtime)
- **IA:** Claude API (Anthropic)
- **UI:** Framer Motion + Lucide Icons + Recharts

## Instalación

### 1. Clonar e instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:
- `VITE_SUPABASE_URL` → URL de tu proyecto en supabase.com
- `VITE_SUPABASE_ANON_KEY` → Anon key de tu proyecto Supabase
- `VITE_ANTHROPIC_API_KEY` → API key de console.anthropic.com

### 3. Crear la base de datos

En el **SQL Editor** de tu proyecto Supabase, ejecuta el contenido de:
```
src/lib/schema.sql
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`

## Estructura del proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── ui/           # Botones, inputs, badges, etc.
│   ├── layout/       # Navbar, Sidebar, Layout
│   └── shared/       # Cuerpo SVG, Kanban, Charts
├── pages/            # Vistas principales
│   ├── Landing.jsx   # Pantalla de bienvenida
│   ├── Triage.jsx    # Formulario de triaje
│   ├── Dashboard.jsx # Analytics en tiempo real
│   ├── MedicalPanel  # Panel Kanban de médicos
│   └── History.jsx   # Historial clínico
├── services/
│   ├── claude.js     # Integración con Claude API
│   └── supabase.js   # Queries y suscripciones Realtime
├── store/
│   └── ThemeContext   # Modo oscuro/claro
├── lib/
│   ├── supabase.js   # Cliente Supabase
│   └── schema.sql    # Schema de la base de datos
└── styles/
    └── globals.css   # Variables CSS y animaciones
```

## Rutas

| Ruta         | Descripción                          |
|--------------|--------------------------------------|
| `/`          | Landing page animada                 |
| `/triaje`    | Formulario de síntomas + IA          |
| `/dashboard` | Dashboard analytics en tiempo real   |
| `/panel`     | Panel Kanban para médicos            |
| `/historial` | Historial clínico del paciente       |
