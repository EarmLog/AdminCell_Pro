/** Devuelve la fecha/hora local en formato ISO (YYYY-MM-DD HH:MM:SS). */
export function fechaLocalAhora() {
  const ahora = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())} ` +
    `${pad(ahora.getHours())}:${pad(ahora.getMinutes())}:${pad(ahora.getSeconds())}`
  );
}
