function formatYear(yearString) {
  if (!yearString || String(yearString).trim() === '') return null;
  const year = parseInt(yearString, 10);
  if (Number.isNaN(year) || year < 1 || year > 2100) return null;
  return year;
}

module.exports = { formatYear };


