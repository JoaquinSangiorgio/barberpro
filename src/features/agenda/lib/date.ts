export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
export function addMinutesISO(iso: string, min: number) {
  const d = new Date(iso); d.setMinutes(d.getMinutes() + min); return d.toISOString();
}
export const hours = Array.from({ length: 12 }, (_, i) => 8 + i); // 8..19
export function fmtHM(d: Date) {
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}
