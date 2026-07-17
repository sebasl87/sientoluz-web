import { rgb } from "pdf-lib";

/**
 * Tokens de marca · Manual SientoLuz v1.0
 * Espejo de globals.css, para lo que se dibuja en PDF.
 */
export const MARCA = {
  amatista: rgb(0x5b / 255, 0x4a / 255, 0x9e / 255), // #5B4A9E
  lila: rgb(0x8a / 255, 0x76 / 255, 0xc9 / 255), // #8A76C9
  jade: rgb(0x4f / 255, 0xa9 / 255, 0x8a / 255), // #4FA98A
  lavanda: rgb(0xd9 / 255, 0xcf / 255, 0xf0 / 255), // #D9CFF0
  crema: rgb(0xf5 / 255, 0xf2 / 255, 0xec / 255), // #F5F2EC
  noche: rgb(0x2e / 255, 0x26 / 255, 0x45 / 255), // #2E2645

  /** Tono del pie de página. Más claro que lavanda: no debe competir con el texto. */
  marcaAgua: rgb(0xbf / 255, 0xb6 / 255, 0xd6 / 255), // #BFB6D6
} as const;

/** A4 en puntos, tal como salió de WeasyPrint. */
export const A4 = { ancho: 595.3, alto: 841.9 } as const;
