/**
 * Emails transaccionales. HTML simple y a prueba de clientes de correo:
 * tablas, estilos inline, sin webfonts (los mails caen a system fonts;
 * la identidad la llevan los colores de marca).
 */

const C = {
  amatista: "#5B4A9E",
  lila: "#8A76C9",
  jade: "#4FA98A",
  crema: "#F5F2EC",
  noche: "#2E2645",
  gris: "#8C85A0",
};

export function emailEntrega(d: {
  nombre: string;
  numero: string;
  archivos: { nombre: string; url: string }[];
  vigenciaDias: number;
}): string {
  const primerNombre = d.nombre.trim().split(/\s+/)[0];

  const filas = d.archivos
    .map(
      (a) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #E8E3F2;">
          <a href="${a.url}"
             style="color:${C.amatista};font-weight:bold;text-decoration:none;font-size:15px;">
            ⬇&nbsp;&nbsp;${a.nombre}
          </a>
        </td>
      </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:${C.crema};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.crema};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:14px;overflow:hidden;font-family:Georgia,'Times New Roman',serif;">

        <tr><td style="background:${C.noche};padding:28px 40px;text-align:center;">
          <div style="color:${C.crema};font-size:22px;letter-spacing:6px;">S I E N T O L U Z</div>
        </td></tr>

        <tr><td style="padding:36px 40px 8px;">
          <p style="color:${C.noche};font-size:17px;margin:0 0 6px;">Hola ${primerNombre} ✧</p>
          <p style="color:${C.noche};font-size:15px;line-height:1.6;margin:0;">
            Tu compra ya está lista. Cada archivo lleva tu nombre — es tu ejemplar,
            para siempre.
          </p>
        </td></tr>

        <tr><td style="padding:20px 40px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${filas}</table>
        </td></tr>

        <tr><td style="padding:18px 40px 6px;">
          <p style="color:${C.gris};font-size:12.5px;line-height:1.6;margin:0;">
            Los links duran ${d.vigenciaDias} días: guardá los archivos en tu compu o
            tu teléfono apenas puedas. Si se te vencen, escribime y te los reactivo.
          </p>
        </td></tr>

        <tr><td style="padding:16px 40px 34px;">
          <p style="color:${C.noche};font-size:14px;line-height:1.6;margin:0;">
            Que lo disfrutes mucho. Cualquier duda que aparezca en el camino,
            respondé este mail y te leo.
          </p>
          <p style="color:${C.lila};font-size:14px;margin:14px 0 0;">— SientoLuz</p>
        </td></tr>

        <tr><td style="background:${C.crema};padding:16px 40px;text-align:center;">
          <span style="color:${C.gris};font-size:11px;">
            Orden ${d.numero} · sientoluz.com · @sientoluz
          </span>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function emailMagicLink(d: { url: string; minutos: number }): string {
  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:${C.crema};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.crema};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="440" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:14px;overflow:hidden;font-family:Georgia,'Times New Roman',serif;">

        <tr><td style="background:${C.noche};padding:22px 32px;text-align:center;">
          <div style="color:${C.crema};font-size:16px;letter-spacing:5px;">S I E N T O L U Z</div>
        </td></tr>

        <tr><td style="padding:32px 32px 8px;text-align:center;">
          <p style="color:${C.noche};font-size:16px;margin:0 0 22px;">Tu acceso al panel</p>
          <a href="${d.url}"
             style="display:inline-block;background:${C.amatista};color:#ffffff;
                    text-decoration:none;padding:13px 30px;border-radius:8px;font-size:15px;">
            Entrar al panel
          </a>
        </td></tr>

        <tr><td style="padding:20px 32px 30px;text-align:center;">
          <p style="color:${C.gris};font-size:12px;line-height:1.6;margin:0;">
            El link sirve por ${d.minutos} minutos.<br>
            Si no lo pediste vos, ignorá este mail: sin hacer clic, no pasa nada.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
