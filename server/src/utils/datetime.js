/** Parse chuỗi datetime-local (giờ VN) hoặc ISO → Date. */
function parseEnrollmentDatetime(str) {
  if (!str || !String(str).trim()) return null;
  const s = String(str).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (m) {
    const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00+07:00`;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

module.exports = { parseEnrollmentDatetime };
