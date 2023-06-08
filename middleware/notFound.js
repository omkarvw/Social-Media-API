const notFound = (req, res) => {
    res.status(404).json({
        message: `Route ${req.originalUrl} not found. The resource you have requested does not exist.`,
    })
}

module.exports = notFound
