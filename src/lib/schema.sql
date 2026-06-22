-- ═══════════════════════════════════════════════════════════
--  AuraMed — Schema de base de datos (Supabase / PostgreSQL)
--  Ejecutar en el SQL Editor de tu proyecto Supabase
-- ═══════════════════════════════════════════════════════════

-- ─── Extensión UUID ───────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Especialidades médicas ───────────────────────────────
CREATE TABLE especialidades (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre     TEXT NOT NULL UNIQUE,
  icono      TEXT,                    -- nombre del ícono Lucide
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO especialidades (nombre, icono) VALUES
  ('Medicina General',   'stethoscope'),
  ('Cardiología',        'heart'),
  ('Pediatría',          'baby'),
  ('Traumatología',      'bone'),
  ('Neurología',         'brain'),
  ('Dermatología',       'scan'),
  ('Gastroenterología',  'activity'),
  ('Ginecología',        'user'),
  ('Oftalmología',       'eye'),
  ('Psiquiatría',        'smile');

-- ─── Médicos ──────────────────────────────────────────────
CREATE TABLE medicos (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre           TEXT NOT NULL,
  apellido         TEXT NOT NULL,
  especialidad_id  UUID REFERENCES especialidades(id) ON DELETE SET NULL,
  disponible       BOOLEAN DEFAULT TRUE,
  foto_url         TEXT,
  box_numero       INTEGER,           -- número de box/consulta
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Triajes ──────────────────────────────────────────────
CREATE TABLE triajes (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Datos del paciente
  paciente_nombre         TEXT NOT NULL,
  paciente_rut            TEXT,
  paciente_edad           INTEGER,
  paciente_genero         TEXT CHECK (paciente_genero IN ('M', 'F', 'Otro')),
  -- Síntomas
  sintomas_texto          TEXT NOT NULL,      -- input libre del paciente
  zona_corporal           TEXT[],             -- zonas seleccionadas en el cuerpo SVG
  -- Resultado IA
  prioridad               TEXT NOT NULL CHECK (prioridad IN ('URGENCIA','PRIORITARIO','GENERAL')),
  especialidad_recomendada TEXT NOT NULL,
  resumen_clinico         TEXT,
  recomendaciones         TEXT[],
  preguntas_seguimiento   TEXT[],
  nivel_confianza         DECIMAL(3,2),
  tiempo_espera_estimado  INTEGER,            -- en minutos
  -- Gestión
  estado                  TEXT DEFAULT 'en_espera' CHECK (estado IN ('en_espera','en_consulta','atendido','derivado')),
  medico_id               UUID REFERENCES medicos(id) ON DELETE SET NULL,
  numero_turno            SERIAL,             -- número correlativo del día
  -- Auditoría
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Trigger: actualiza updated_at automáticamente ────────
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_medicos_updated_at
  BEFORE UPDATE ON medicos
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_triajes_updated_at
  BEFORE UPDATE ON triajes
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

-- ─── Índices para rendimiento ─────────────────────────────
CREATE INDEX idx_triajes_prioridad    ON triajes(prioridad);
CREATE INDEX idx_triajes_estado       ON triajes(estado);
CREATE INDEX idx_triajes_created_at   ON triajes(created_at DESC);
CREATE INDEX idx_triajes_paciente_rut ON triajes(paciente_rut);
CREATE INDEX idx_medicos_disponible   ON medicos(disponible);
CREATE INDEX idx_medicos_especialidad ON medicos(especialidad_id);

-- ─── Habilitar Realtime en las tablas clave ───────────────
ALTER PUBLICATION supabase_realtime ADD TABLE triajes;
ALTER PUBLICATION supabase_realtime ADD TABLE medicos;

-- ─── RLS (Row Level Security) — desactivado para MVP ──────
-- En producción: activar y definir políticas por rol de usuario
-- ALTER TABLE triajes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE medicos ENABLE ROW LEVEL SECURITY;

-- ─── Datos de prueba: médicos ─────────────────────────────
INSERT INTO medicos (nombre, apellido, especialidad_id, disponible, box_numero)
SELECT 'Carlos', 'Mendoza', id, TRUE, 1  FROM especialidades WHERE nombre = 'Cardiología'
UNION ALL
SELECT 'Ana',    'Torres',  id, TRUE, 2  FROM especialidades WHERE nombre = 'Pediatría'
UNION ALL
SELECT 'Luis',   'Herrera', id, FALSE, 3 FROM especialidades WHERE nombre = 'Traumatología'
UNION ALL
SELECT 'María',  'Soto',    id, TRUE, 4  FROM especialidades WHERE nombre = 'Medicina General'
UNION ALL
SELECT 'Jorge',  'Vargas',  id, TRUE, 5  FROM especialidades WHERE nombre = 'Neurología';
