# SientoLuz · web

Tienda propia en Next.js 15 (App Router) + Supabase + Mercado Pago Checkout Pro.
Dominio principal: **sientoluz.com** (el `.com.ar` redirige). Compra sin registro.

## Poner a andar

```bash
npm install
cp .env.example .env.local   # y completá los valores
npm run dev
```

## Supabase

1. Proyecto nuevo → SQL Editor → correr `supabase/01-schema.sql` y después `supabase/02-seed.sql`.
2. Storage: el schema crea tres buckets **privados**:
   - `cursos` → subí ahí los 6 PDFs maestros con el nombre exacto de la columna `archivo` (`numerologia-completa.pdf`, `pendulo.pdf`, `limpieza-aurica.pdf`, `limpieza-ambientes.pdf`, `chakras.pdf`, `meditacion.pdf`).
   - `entregas` → lo escribe n8n con el PDF ya marcado al agua por comprador.
   - `comprobantes` → comprobantes de transferencia.
3. Copiá `URL`, `anon key` y `service_role key` al `.env.local`.

**RLS:** el catálogo (`cursos`, `kits`, `kit_cursos`) se lee público solo si `activo = true`. `clientes`, `ordenes`, `orden_items` y `entregas` no tienen policy: son inaccesibles con la anon key y solo se tocan con `service_role` (la web del lado del servidor y n8n).

## Mercado Pago

1. Panel de MP → credenciales de producción → `MP_ACCESS_TOKEN`.
2. Webhooks → URL `https://sientoluz.com/api/webhooks/mercadopago`, evento **Pagos** → copiá la clave secreta a `MP_WEBHOOK_SECRET`.
3. Probá primero con credenciales de prueba y las tarjetas de test de MP.

El webhook valida la firma HMAC, **vuelve a consultar el pago a la API de MP** (nunca confía en el body) y recién ahí marca la orden como `pagado`. Es idempotente: si MP reintenta, la segunda vez no hace nada.

## Enganche con Fase 3 (n8n)

Cuando una orden queda `pagado`, la web hace `POST` a `N8N_WEBHOOK_URL` con:

```json
{ "orden": "SL-26-1001", "orden_id": "uuid" }
```

n8n arranca de ahí: lee la orden y sus items, expande los kits vía `kit_cursos`, reemplaza `{{NOMBRE_COMPRADOR}}`, `{{EMAIL}}` y `{{ORDEN}}` en el PDF, lo deja en `entregas`, manda el mail con link firmado y escribe la fila en `entregas` + `entregado_en`.

Si n8n está caído, la orden queda en `pagado` y el flujo la puede reintentar consultando `ordenes where estado = 'pagado'`. Nada se pierde.

## Transferencias

`/transferencia/[numero]` muestra CBU, alias, importe y el número de orden como concepto, más un botón de WhatsApp con el mensaje precargado. Los datos salen de las variables `NEXT_PUBLIC_TRANSF_*`. La confirmación es manual: pasás la orden a `pagado` en Supabase y el flujo de n8n hace el resto (mismo camino que Mercado Pago).

## Decisiones tomadas

- **Precio siempre desde la base.** El cliente manda slug, no importe.
- **Snapshot en `orden_items`.** Nombre y precio quedan congelados al momento de la compra: si subís precios, las órdenes viejas no se reescriben.
- **Meditación tiene `solo_en_kit = true`.** No aparece suelta en el catálogo ni se puede comprar directo, pero tiene precio cargado para poder mostrar el ahorro del kit.
- **Sin carrito.** Un ítem por orden. Los kits ya cumplen la función de "llevar varios".
- **Nombre de comprador en el formulario:** el placeholder aclara que es el que va en el certificado, así no lo escriben en minúscula ni con apodo.

## Pendientes antes de publicar

- [ ] Texto real de **Sobre mí** (hoy hay un borrador marcado con TODO).
- [ ] Revisión legal de `/terminos` y `/privacidad` (botón de arrepentimiento, Ley 25.326).
- [ ] Imagen `public/marca/og.png` para compartir en redes (1200×630).
- [ ] Cargar `paginas` de cada curso en la base (hoy va `null` y esa línea no se muestra).
- [ ] Links reales de Instagram y Facebook en `Header`/`Footer`/`Sobre mí`.
- [ ] Redirect de `sientoluz.com.ar` → `sientoluz.com` (en el DNS/hosting, o en `next.config.ts`).

## Estructura

```
src/
  app/
    page.tsx                       Home (hero con la espiral animada)
    cursos/page.tsx                Catálogo
    cursos/[slug]/page.tsx         Ficha de curso + upsell a kits
    kits/[slug]/page.tsx           Ficha de kit
    checkout/                      Formulario y selección de método de pago
    transferencia/[numero]/        CBU, alias y botón de WhatsApp
    gracias/                       Post-compra (contempla pago pendiente)
    api/checkout/                  Crea cliente + orden + preferencia MP
    api/webhooks/mercadopago/      Confirma el pago y dispara n8n
  components/                      Espiral, Separador, Precio, tarjetas, header, footer
  lib/                             Supabase, catálogo, tipos, formato
supabase/                          01-schema.sql, 02-seed.sql
```
