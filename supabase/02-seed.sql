-- SientoLuz · catálogo inicial
-- Precios de Fase 0: individual 15.000 / kit de 3 → 36.000 / pack completo 55.000.
-- Los precios ancla son el "valor de lista" tachado.

insert into cursos (slug, nombre, bajada, descripcion, aprendes, dirigido_a, temario,
                    precio_ars, precio_ancla_ars, archivo, destacado, solo_en_kit, orden)
values
(
  'numerologia-completa',
  'Numerología Completa',
  'Tu fecha de nacimiento guarda un mapa. Acá aprendés a leerlo.',
  'El taller más pedido de SientoLuz, ahora completo: la carta numerológica entera, número por número, con los siete aspectos de cada uno. Aprendés a calcular tu carta y la de quien quieras, y a interpretarla sin depender de nadie.',
  array[
    'Calcular tu carta numerológica completa desde tu nombre y tu fecha',
    'Interpretar los siete aspectos de cada número: alma, personalidad, misión, karma, talento, hogar y vibración anual',
    'Leer la vibración del año que estás transitando',
    'Hacer lecturas para otras personas con criterio y responsabilidad'
  ],
  'Personas que quieren entenderse a sí mismas y, si lo desean, empezar a hacer lecturas. No hace falta ningún conocimiento previo.',
  array[
    'Qué es la numerología y de dónde viene',
    'La tabla pitagórica: de las letras a los números',
    'Cómo se arma la carta paso a paso',
    'Los números del 1 al 9 y los maestros: perfil completo de cada uno',
    'Vibración anual: leer el año en curso',
    'Ética de la lectura'
  ],
  15000, 22000, 'numerologia-completa.pdf', true, false, 1
),
(
  'pendulo',
  'Péndulo Hebreo y Tradicional',
  'Aprender a preguntar bien es la mitad del trabajo.',
  'El taller completo de péndulo: la técnica tradicional y el péndulo hebreo con sus etiquetas. Medición de centros energéticos capa por capa, lectura de vulnerabilidades, armonización y cierre. Incluye un capítulo de ética que no está en ningún otro curso del rubro.',
  array[
    'Calibrar tu péndulo y establecer tu convención mental',
    'Medir los siete centros energéticos en sus siete capas',
    'Usar las etiquetas del péndulo hebreo y el campo electromagnético',
    'Armonizar y cerrar una sesión completa',
    'Trabajar a distancia y con permiso del alma'
  ],
  'Personas que ya sienten la energía y quieren una herramienta concreta para trabajarla. Ideal si venís de Chakras o Limpieza Áurica.',
  array[
    'Qué es el péndulo y cómo elegirlo',
    'Calibración y convención mental',
    'Péndulo tradicional: técnica base',
    'Péndulo hebreo: las etiquetas y su uso',
    'Medición capa por capa y lectura de vulnerabilidad',
    'Armonización y cierre de sesión',
    'Trabajo a distancia',
    'Ética del péndulo: qué se dice y qué no'
  ],
  15000, 22000, 'pendulo.pdf', true, false, 2
),
(
  'limpieza-aurica',
  'Limpieza Áurica, Protección y Amuletos',
  'Limpiar, proteger, sostener. En ese orden.',
  'Baños energéticos, oraciones, piedras de protección, amuletos y el calendario lunar aplicado a tu ritual personal. Todo con recetas concretas: qué usar, cuánto, qué día y por qué.',
  array[
    'Reconocer cuándo tu campo áurico necesita una limpieza',
    'Preparar baños energéticos con recetas paso a paso',
    'Elegir y activar tus piedras de protección',
    'Armar amuletos con intención',
    'Usar las fases lunares como calendario de tu ritual personal'
  ],
  'Cualquier persona que sienta que carga energía que no es suya. Es el punto de entrada más simple al trabajo energético.',
  array[
    'Qué es el aura y cómo se ensucia',
    'Baños energéticos: recetas completas',
    'Oraciones y decretos',
    'Piedras de protección y sus usos',
    'Amuletos: armado y activación',
    'Calendario lunar de tu ritual personal'
  ],
  15000, 22000, 'limpieza-aurica.pdf', false, false, 3
),
(
  'limpieza-ambientes',
  'Limpieza Energética de Ambientes',
  'Tu casa también acumula.',
  'Cómo limpiar y armonizar espacios: la casa, el consultorio, el local, la oficina. Sahumado, sales, aguas preparadas, ubicación de piedras y el calendario lunar aplicado a la limpieza del espacio.',
  array[
    'Detectar los puntos donde el espacio se carga',
    'Limpiar con sahumado, sales y aguas preparadas',
    'Armonizar después de limpiar (limpiar sin armonizar deja el lugar vacío)',
    'Ubicar piedras según la función de cada ambiente',
    'Sostener el espacio con un calendario lunar de mantenimiento'
  ],
  'Quien esté mudándose, abriendo un espacio de trabajo, o sienta que en su casa la energía no circula.',
  array[
    'Cómo se carga un espacio',
    'Sahumado: qué quemar y en qué orden',
    'Sales, aguas y preparados',
    'Armonización posterior',
    'Piedras por ambiente',
    'Calendario lunar de limpieza del espacio'
  ],
  15000, 22000, 'limpieza-ambientes.pdf', false, false, 4
),
(
  'chakras',
  'Limpieza y Desbloqueo de Chakras',
  'Siete centros, un mapa, una práctica diaria.',
  'El taller más completo del catálogo: cada chakra en exceso y en defecto, un test de autodiagnóstico, higiene energética diaria, mantras bija y un diario de seguimiento de ocho semanas.',
  array[
    'Reconocer cada chakra en exceso y en defecto (no solo "bloqueado")',
    'Autodiagnosticarte con un test guiado',
    'Aplicar higiene energética diaria: sacudida, bostezo, nombrar la emoción, sonido',
    'Trabajar cada centro con su mantra bija',
    'Seguir tu proceso con un diario de ocho semanas'
  ],
  'Desde cero. Es el mejor primer curso si querés una práctica diaria y no solo teoría.',
  array[
    'Los siete centros: función y correspondencias',
    'Exceso y defecto en cada chakra',
    'Test de autodiagnóstico',
    'Higiene energética diaria',
    'Práctica por chakra con mantras bija',
    'Diario de seguimiento de ocho semanas'
  ],
  15000, 22000, 'chakras.pdf', true, false, 5
),
(
  'meditacion',
  'Meditación',
  'Cinco meditaciones guiadas y un diario de cuatro semanas.',
  'Preparación del espacio y del cuerpo, cinco meditaciones guiadas completas (anclaje, luz violeta, gratitud, perdón y protección), qué hacer cuando no funciona, y un diario de práctica de cuatro semanas con objetivos progresivos.',
  array[
    'Preparar el espacio y el cuerpo antes de meditar',
    'Practicar cinco meditaciones guiadas con guion completo',
    'Resolver los obstáculos típicos (no puedo parar la cabeza, me duermo, no siento nada)',
    'Sostener la práctica cuatro semanas con objetivos semanales'
  ],
  'Incluido en los kits. Es el complemento de cualquier práctica energética.',
  array[
    'Preparar el espacio',
    'Preparar el cuerpo',
    'Meditación de anclaje',
    'Meditación de luz violeta',
    'Meditación de gratitud',
    'Meditación de perdón',
    'Meditación de protección',
    'Cuando no funciona',
    'Diario de práctica de cuatro semanas'
  ],
  15000, 22000, 'meditacion.pdf', false, true, 6
)
on conflict (slug) do nothing;

insert into kits (slug, nombre, bajada, descripcion, precio_ars, precio_ancla_ars, destacado, orden)
values
(
  'kit-limpieza-energetica',
  'Kit de Limpieza Energética',
  'Vos, tu casa y tus siete centros. Los tres a la vez.',
  'Limpiar el aura sin limpiar el ambiente es empezar de nuevo cada día. Este kit junta los tres talleres que se sostienen entre sí: tu campo, tu espacio y tus centros energéticos.',
  36000, 45000, true, 1
),
(
  'kit-autoconocimiento',
  'Kit de Autoconocimiento',
  'Leer tu mapa y aprender a habitarlo.',
  'La numerología te da el mapa, los chakras te dicen dónde estás parada hoy, y la meditación es la práctica que sostiene todo lo demás.',
  36000, 45000, false, 2
),
(
  'kit-pendulo',
  'Kit del Péndulo',
  'La herramienta y todo lo que se testea con ella.',
  'El péndulo no se usa en el vacío: se usa para medir chakras y para chequear una limpieza áurica. Este kit trae la herramienta y los dos mapas que necesita.',
  36000, 45000, false, 3
),
(
  'pack-sientoluz',
  'Pack SientoLuz',
  'Los seis talleres. El camino completo.',
  'Todo el catálogo de SientoLuz junto: numerología, péndulo, limpieza áurica, ambientes, chakras y meditación. Llevás los seis por menos de lo que salen cuatro.',
  55000, 90000, true, 4
)
on conflict (slug) do nothing;

-- Composición de los kits
insert into kit_cursos (kit_id, curso_id, orden)
select k.id, c.id, x.orden from (values
  ('kit-limpieza-energetica', 'limpieza-aurica',     1),
  ('kit-limpieza-energetica', 'limpieza-ambientes',  2),
  ('kit-limpieza-energetica', 'chakras',             3),
  ('kit-autoconocimiento',    'numerologia-completa',1),
  ('kit-autoconocimiento',    'chakras',             2),
  ('kit-autoconocimiento',    'meditacion',          3),
  ('kit-pendulo',             'pendulo',             1),
  ('kit-pendulo',             'chakras',             2),
  ('kit-pendulo',             'limpieza-aurica',     3),
  ('pack-sientoluz',          'numerologia-completa',1),
  ('pack-sientoluz',          'pendulo',             2),
  ('pack-sientoluz',          'limpieza-aurica',     3),
  ('pack-sientoluz',          'limpieza-ambientes',  4),
  ('pack-sientoluz',          'chakras',             5),
  ('pack-sientoluz',          'meditacion',          6)
) as x(kit_slug, curso_slug, orden)
join kits k on k.slug = x.kit_slug
join cursos c on c.slug = x.curso_slug
on conflict do nothing;
