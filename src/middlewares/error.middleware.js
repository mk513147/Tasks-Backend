export const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (!err.isOperational) {
        statusCode = 500;
        message = "Internal Server Error";
    }
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        error: err.errors || null,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    })
}