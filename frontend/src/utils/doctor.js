export function formatDoctorName(name="") {
  if (!name) return "";
  const t = name.trim();
  return /^dr[\.\s]/i.test(t) ? t : `Dr. ${t}`;
}

export function stripDrPrefix(name="") {
  return name.replace(/^dr[\.\s]+/i,"").trim();
}
