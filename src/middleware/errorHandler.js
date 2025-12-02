const globalErrorHandler = (err, req, res, next) => {

    console.error(`[${err.status?.toUpperCase() || 'ERROR'}]`, {
        message: err.message,
        statusCode: err.statusCode || 500,
        type: err.status,                                                                 // ← "fail" o "error"
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    if (!(err instanceof AppError)) {
        console.error('Unhandled Error:', err);
        err = new AppError("Ocurrió un error interno", 500);
    }

    const statusCode = err.statusCode || 500;

    const response = { 
        success: false,       
        message: err.message 
    };

    res.status(statusCode).json(response);
}

export default globalErrorHandler