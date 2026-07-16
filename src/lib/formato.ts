const pesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function precio(ars: number) {
  return pesos.format(ars);
}

export function descuento(real: number, ancla: number | null) {
  if (!ancla || ancla <= real) return null;
  return Math.round((1 - real / ancla) * 100);
}
