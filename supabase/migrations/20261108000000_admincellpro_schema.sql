CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE "public"."sectores" (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    codigo TEXT NOT NULL,
    descripcion TEXT,
    creado_en TEXT NOT NULL DEFAULT (now()::text)
);

CREATE TABLE "public"."periodos" (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    fecha_inicio TEXT,
    fecha_fin TEXT,
    creado_en TEXT NOT NULL DEFAULT (now()::text)
);

CREATE TABLE "public"."reportes" (
    id BIGSERIAL PRIMARY KEY,
    periodo_id INTEGER NOT NULL,
    sector_id INTEGER NOT NULL,
    codigo TEXT NOT NULL DEFAULT '',
    lideres TEXT,
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

CREATE TABLE "public"."lideres" (
    id BIGSERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    telefono TEXT,
    creado_en TEXT NOT NULL DEFAULT (now()::text)
);

CREATE TABLE "public"."reporte_lideres" (
    reporte_id INTEGER NOT NULL,
    lider_id INTEGER NOT NULL,
    PRIMARY KEY (reporte_id, lider_id)
);

CREATE POLICY "AdminCellPro_anon_select_sectores" ON "public"."sectores" FOR SELECT TO anon USING (true);
CREATE POLICY "AdminCellPro_anon_insert_sectores" ON "public"."sectores" FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_update_sectores" ON "public"."sectores" FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_delete_sectores" ON "public"."sectores" FOR DELETE TO anon USING (true);

CREATE POLICY "AdminCellPro_anon_select_periodos" ON "public"."periodos" FOR SELECT TO anon USING (true);
CREATE POLICY "AdminCellPro_anon_insert_periodos" ON "public"."periodos" FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_update_periodos" ON "public"."periodos" FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_delete_periodos" ON "public"."periodos" FOR DELETE TO anon USING (true);

CREATE POLICY "AdminCellPro_anon_select_reportes" ON "public"."reportes" FOR SELECT TO anon USING (true);
CREATE POLICY "AdminCellPro_anon_insert_reportes" ON "public"."reportes" FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_update_reportes" ON "public"."reportes" FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_delete_reportes" ON "public"."reportes" FOR DELETE TO anon USING (true);

CREATE POLICY "AdminCellPro_anon_select_lideres" ON "public"."lideres" FOR SELECT TO anon USING (true);
CREATE POLICY "AdminCellPro_anon_insert_lideres" ON "public"."lideres" FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_update_lideres" ON "public"."lideres" FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_delete_lideres" ON "public"."lideres" FOR DELETE TO anon USING (true);

CREATE POLICY "AdminCellPro_anon_select_reporte_lideres" ON "public"."reporte_lideres" FOR SELECT TO anon USING (true);
CREATE POLICY "AdminCellPro_anon_insert_reporte_lideres" ON "public"."reporte_lideres" FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_update_reporte_lideres" ON "public"."reporte_lideres" FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "AdminCellPro_anon_delete_reporte_lideres" ON "public"."reporte_lideres" FOR DELETE TO anon USING (true);

ALTER TABLE "public"."sectores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."periodos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reportes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."lideres" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reporte_lideres" ENABLE ROW LEVEL SECURITY;
