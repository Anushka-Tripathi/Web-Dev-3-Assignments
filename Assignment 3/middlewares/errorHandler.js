const errorHandler = (err, req, res, next) => {
    console.error(err);

    // Invalid MongoDB ObjectId
    if (err.name === 'CastError') {
        return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
    }

    // Duplicate key error (e.g., duplicate SKU)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue).join(', ');
        return res.status(409).json({ error: `Duplicate value for field: ${field}` });
    }

    // Mongoose schema validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        return res.status(400).json({ error: messages.join('; ') });
    }

    res.status(err.statusCode || 500).json({
        error: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;