module.exports = (err, req, res, next) => {
  if (err && err.type === 'validation') return res.status(400).json({ error: err.message });
  if (err && err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
  const status = err && err.status ? err.status : 500;
  return res.status(status).json({ error: (err && err.message) || 'Server error' });
};


