export function errorHandler(err, req, res, next) {
    console.error(err);

    if (err.code === 'P2002') {
        return res.status(400).json({ error: 'Duplicate field value' });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Resource not found' });
    }

    res.status(500).json({ error: 'Internal Server Error' });
}