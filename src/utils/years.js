export function formatYearRange(birthYear, deathYear) {
  const by = birthYear ?? null;
  const dy = deathYear ?? null;

  const hasBY = typeof by === 'number' && !Number.isNaN(by);
  const hasDY = typeof dy === 'number' && !Number.isNaN(dy);

  if (hasBY && hasDY) return `${by}-${dy}`;
  if (hasBY && !hasDY) return `${by}-?`;
  if (!hasBY && hasDY) return `?-${dy}`;
  return `?-?`;
}


