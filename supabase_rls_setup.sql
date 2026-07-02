-- 1. Habilitar RLS en todas las tablas clave
ALTER TABLE especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE triajes ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para 'especialidades'
-- Lectura pública (para que el frontend pueda llenar los selectores)
CREATE POLICY "Permitir SELECT publico" ON especialidades FOR SELECT USING (true);
-- Escritura solo para personal (autenticados)
CREATE POLICY "Permitir INSERT a staff" ON especialidades FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Permitir UPDATE a staff" ON especialidades FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Permitir DELETE a staff" ON especialidades FOR DELETE TO authenticated USING (true);

-- 3. Políticas para 'medicos'
-- Lectura pública (los pacientes necesitan ver a quién se les asignó)
CREATE POLICY "Permitir SELECT publico" ON medicos FOR SELECT USING (true);
-- Escritura solo para personal (autenticados)
CREATE POLICY "Permitir INSERT a staff" ON medicos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Permitir UPDATE a staff" ON medicos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Permitir DELETE a staff" ON medicos FOR DELETE TO authenticated USING (true);

-- 4. Políticas para 'triajes' (La tabla más sensible)
-- Inserción pública (cualquiera puede crear un nuevo ticket desde urgencias)
CREATE POLICY "Permitir INSERT publico" ON triajes FOR INSERT WITH CHECK (true);
-- Lectura pública (los pacientes consultan su caso vía RUT o UUID)
CREATE POLICY "Permitir SELECT publico" ON triajes FOR SELECT USING (true);
-- Modificación (Aprobar, reasignar, poner notas médicas) SOLO para médicos/staff (autenticados)
CREATE POLICY "Permitir UPDATE a staff" ON triajes FOR UPDATE TO authenticated USING (true);
-- Borrado de triajes (SOLO staff)
CREATE POLICY "Permitir DELETE a staff" ON triajes FOR DELETE TO authenticated USING (true);
