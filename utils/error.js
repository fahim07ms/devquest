export const sendErrorResponse = (res, statusCode, message, errors) => {
    return res.status(statusCode).json({
        message: message,
        ...(errors && { errors })
    })
}
