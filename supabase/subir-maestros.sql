-- ═══════════════════════════════════════════════════════════
-- SientoLuz · apuntar el catálogo a los maestros limpios
-- Ejecutar en Supabase → SQL Editor, DESPUÉS de subir los PDFs
-- al bucket 'cursos'.
-- ═══════════════════════════════════════════════════════════

-- 1. Ver a qué apunta hoy cada curso
select slug, nombre, archivo from cursos order by orden;

-- 2. Si los nombres de archivo coinciden con los del zip
--    (01-Numerologia-Completa.pdf, etc.) no hay que tocar nada:
--    alcanza con reemplazar los archivos del bucket.
--
--    Si no coinciden, corregir así:
/*
update cursos set archivo = '01-Numerologia-Completa.pdf' where slug = 'numerologia-completa';
update cursos set archivo = '02-Pendulo.pdf'              where slug = 'pendulo';
update cursos set archivo = '03-Limpieza-Aurica.pdf'      where slug = 'limpieza-aurica';
update cursos set archivo = '04-Limpieza-de-Ambientes.pdf' where slug = 'limpieza-ambientes';
update cursos set archivo = '05-Chakras.pdf'              where slug = 'chakras';
update cursos set archivo = '06-Meditacion.pdf'           where slug = 'meditacion';
*/

-- 3. Verificación: ningún curso debe quedar sin archivo
select slug, archivo from cursos where archivo is null or archivo = '';
