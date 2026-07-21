-- ============================================================
-- SientoLuz · Bucket de imágenes para posts programados
-- Ejecutar en el Supabase de SientoLuz → SQL Editor
-- (La tabla posts_programados ya existe, se creó aparte.)
-- ============================================================

-- Bucket PÚBLICO, a diferencia de 'cursos'/'entregas'/'comprobantes'.
-- Instagram exige una image_url que pueda bajar sin firma ni auth, y
-- estas imágenes son de marketing: no hay nada sensible en mostrarlas.
-- Con public = true, Supabase sirve los objetos desde
-- /storage/v1/object/public/posts-programados/<ruta> sin necesitar
-- una policy de select en storage.objects.
insert into storage.buckets (id, name, public)
values ('posts-programados', 'posts-programados', true)
on conflict (id) do nothing;

-- Las escrituras (subida) las hace siempre el servidor con la
-- service role key (supabaseServidor(), ver src/lib/supabase.ts),
-- que ignora RLS. No hace falta ninguna policy de insert tampoco.
