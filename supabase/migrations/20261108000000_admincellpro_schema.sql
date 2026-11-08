CREATE SCHEMA IF NOT EXISTS "AdminCellPro";

CREATE TABLE "AdminCellPro"."sectores" (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    codigo TEXT NOT NULL,
    descripcion TEXT,
    creado_en TEXT NOT NULL DEFAULT (now()::text)
);

CREATE TABLE "AdminCellPro"."periodos" (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    fecha_inicio TEXT,
    fecha_fin TEXT,
    creado_en TEXT NOT NULL DEFAULT (now()::text)
);

CREATE TABLE "AdminCellPro"."reportes" (
    id BIGSERIAL PRIMARY KEY,
    periodo_id INTEGER NOT NULL,
    sector_id INTEGER NOT NULL,
    personas INTEGER NOT NULL DEFAULT 0,
    asistencias INTEGER NOT NULL DEFAULT 0,
    inasistencias INTEGER NOT NULL DEFAULT 0,
    invitados INTEGER NOT NULL DEFAULT 0,
    ninos INTEGER NOT NULL DEFAULT 0,
    activo INTEGER NOT NULL DEFAULT 1,
    observaciones TEXT,
    creado_en TEXT NOT NULL DEFAULT (now()::text),
    actualizado_en TEXT NOT NULL DEFAULT (now()::text)
);

CREATE TABLE "AdminCellPro"."lideres" (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    telefono TEXT,
    creado_en TEXT NOT NULL DEFAULT (now()::text)
);

CREATE TABLE "AdminCellPro"."reporte_lideres" (
    reporte_id INTEGER NOT NULL,
    lider_id INTEGER NOT NULL,
    PRIMARY KEY (reporte_id, lider_id)
);

CREATE POLICY "AdminCellPro_anon_select_sectores" ON "AdminCellPro"."sectores" FOR SELECT TO anon USING (true);
CREATE POLICY "AdminCellPro_anon_insert_sectores" ON "AdminCellPro"."sectores" FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_update_sectores" ON "AdminCellPro"."sectores" FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_delete_sectores" ON "AdminCellPro"."sectores" FOR DELETE TO anon USING (true);

CREATE POLICY "AdminCellPro_anon_select_periodos" ON "AdminCellPro"."periodos" FOR SELECT TO anon USING (true);
CREATE POLICY "AdminCellPro_anon_insert_periodos" ON "AdminCellPro"."periodos" FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_update_periodos" ON "AdminCellPro"."periodos" FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_delete_periodos" ON "AdminCellPro"."periodos" FOR DELETE TO anon USING (true);

CREATE POLICY "AdminCellPro_anon_select_reportes" ON "AdminCellPro"."reportes" FOR SELECT TO anon USING (true);
CREATE POLICY "AdminCellPro_anon_insert_reportes" ON "AdminCellPro"."reportes" FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_update_reportes" ON "AdminCellPro"."reportes" FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_delete_reportes" ON "AdminCellPro"."reportes" FOR DELETE TO anon USING (true);

CREATE POLICY "AdminCellPro_anon_select_lideres" ON "AdminCellPro"."lideres" FOR SELECT TO anon USING (true);
CREATE POLICY "AdminCellPro_anon_insert_lideres" ON "AdminCellPro"."lideres" FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_update_lideres" ON "AdminCellPro"."lideres" FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_delete_lideres" ON "AdminCellPro"."lideres" FOR DELETE TO anon USING (true);

CREATE POLICY "AdminCellPro_anon_select_reporte_lideres" ON "AdminCellPro"."reporte_lideres" FOR SELECT TO anon USING (true);
CREATE POLICY "AdminCellPro_anon_insert_reporte_lideres" ON "AdminCellPro"."reporte_lideres" FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_update_reporte_lideres" ON "AdminCellPro"."reporte_lideres" FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_delete_reporte_lideres" ON "AdminCellPro"."reporte_lideres" FOR DELETE TO anon USING (true);

ALTER TABLE "AdminCellPro"."sectores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminCellPro"."periodos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminCellPro"."reportes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminCellPro"."lideres" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminCellPro"."reporte_lideres" ENABLE ROW LEVEL SECURITY;
