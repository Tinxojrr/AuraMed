# ⚕️ AuraMed - Asistente Clínico de Triaje con IA

![AuraMed Banner](https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

AuraMed es una plataforma de **Triaje Médico Inteligente** diseñada para modernizar las salas de urgencia. Utiliza **Inteligencia Artificial Generativa (Claude 3.5 Sonnet)** para analizar en lenguaje natural los síntomas de los pacientes, clasificar su nivel de urgencia y derivarlos instantáneamente al box del especialista adecuado.

---

## ✨ Características Principales

1. **Triaje Automatizado por IA**
   - El paciente ingresa sus síntomas usando su propia voz o texto.
   - Claude IA evalúa el riesgo clínico en milisegundos, asignando una de 3 prioridades: `URGENCIA`, `PRIORITARIO` o `GENERAL`.
   - Derivación automática a más de 10 especialidades médicas.
   - **Modo AuraZen:** Protocolo especial de contención psicológica para pacientes con crisis de salud mental.

2. **Panel Kanban Médico (Realtime)**
   - Recepcionistas y Jefes de Urgencia tienen una vista panorámica de la sala de espera.
   - Tablero *Drag & Drop* para mover pacientes entre "En Espera", "En Consulta" y "Atendido".
   - Sincronización en tiempo real vía **Supabase**.

3. **Portal del Especialista (Mi Box)**
   - Interfaz dedicada para el médico tratante.
   - Filtro automático: El cardiólogo solo ve las derivaciones de cardiología.
   - **Cajón Clínico:** Acceso inmediato al resumen generado por la IA, formulario de notas médicas y generación automática de **Ficha Médica en PDF**.

4. **Ticket Digital y Tracker Familiar**
   - Los pacientes pueden escanear un código QR para ver en su celular cuántos turnos faltan para ser atendidos.
   - Los familiares reciben actualizaciones de estado en tiempo real.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 18 + Vite
- **Estilos:** CSS3 Vanilla con diseño *Glassmorphism* y Modo Claro/Oscuro.
- **Base de Datos & Auth:** Supabase (PostgreSQL + Realtime Subscriptions).
- **Inteligencia Artificial:** Anthropic API (Claude 3.5 Sonnet).
- **Gestión de Estado:** Context API y Hooks personalizados.
- **Componentes:** `lucide-react` (íconos), `dnd-kit` (Drag & Drop), `jsPDF` (Exportación de PDF).

---

## 🚀 Instalación y Desarrollo Local

1. Clona este repositorio:
   ```bash
   git clone https://github.com/Tinxojrr/AuraMed.git
   cd auramed
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura tus variables de entorno:
   Crea un archivo `.env` en la raíz del proyecto y añade tus credenciales:
   ```env
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   VITE_ANTHROPIC_API_KEY=tu_anthropic_api_key
   ```

4. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

---

## 🔒 Consideraciones de Seguridad

- **API Keys:** Las llaves de Anthropic y Supabase se gestionan a través de variables de entorno y NUNCA se exponen en el repositorio público (gracias al archivo `.gitignore`). En el entorno de producción (Vercel), estas se inyectan de forma segura.
- **Base de Datos:** El esquema actual está diseñado para un Producto Mínimo Viable (MVP) y demostraciones académicas. Para un paso a producción en un entorno hospitalario real, es imperativo habilitar las **Row Level Security (RLS)** de PostgreSQL en Supabase, asegurando que solo el personal con roles de "Médico" o "Admin" puedan realizar operaciones de lectura/escritura en historiales sensibles.

---

## 👨‍💻 Autor

**Martin Aburto**  
*Proyecto de Título / Portafolio - 2026*
