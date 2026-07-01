/**
 * Middleware de manejo de errores para aplicación Express
 * Maneja errores comunes incluyendo MongoDB, validación y errores HTTP
 */

// Clase de error personalizada para errores específicos de la aplicación
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Manejar Error de Cast de MongoDB (ObjectId inválido)
const handleCastErrorDB = (err) => {
    const message = `Valor inválido para ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

// Manejar Error de Campos Duplicados en MongoDB
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Valor duplicado: ${value}. ¡Por favor use otro valor!`;
    return new AppError(message, 400);
};

// Manejar Error de Validación de Mongoose
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Datos de entrada inválidos. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

// Manejar Error de Token JWT
const handleJWTError = () =>
    new AppError('Token inválido. ¡Por favor inicie sesión nuevamente!', 401);

// Manejar Error de Token JWT Expirado
const handleJWTExpiredError = () =>
    new AppError('¡Su token ha expirado! Por favor inicie sesión nuevamente.', 401);

// Enviar respuesta de error en desarrollo
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

// Enviar respuesta de error en producción
const sendErrorProd = (err, res) => {
    // Error operacional, confiable: enviar mensaje al cliente
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        // Error de programación u otro error desconocido: no filtrar detalles
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: '¡Algo salió mal!'
        });
    }
};

// Middleware principal de manejo de errores
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        // Manejar tipos específicos de errores
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};

// Middleware para manejar errores 404 en rutas no definidas
export const notFound = (req, res, next) => {
    const err = new AppError(`No se encontró ${req.originalUrl} en este servidor!`, 404);
    next(err);
};

// Wrapper para manejar errores en funciones asíncronas
export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// Respuestas de error comunes
export const commonErrors = {
    // Errores de autenticación
    unauthorized: (message = 'No autorizado') => new AppError(message || '¡No ha iniciado sesión! Por favor ingrese para obtener acceso.', 401),
    forbidden: (message = 'No tiene permiso para realizar esta acción') => new AppError( message, 403),
    botDetected: () => new AppError('Los bots no están permitidos', 403),

    // Errores de recursos
    notFound: (resource = 'Recurso') => new AppError(`${resource} no encontrado`, 404),
    alreadyExists: (resource = 'Recurso') => new AppError(`${resource} ya existe`, 409),

    // Errores de validación
    invalidInput: (message = 'Datos de entrada inválidos') => new AppError(message, 400),
    missingFields: (fields) => new AppError(`Campos requeridos faltantes: ${fields.join(', ')}`, 400),

    // Errores del servidor
    serverError: (message = 'Error interno del servidor') => new AppError(message, 500),
    databaseError: () => new AppError('Error de conexión a la base de datos', 500),

    // Límite de tasa
    tooManyRequests: () => new AppError('Demasiadas solicitudes desde esta IP, por favor intente nuevamente más tarde.', 429)
};

export default errorHandler;