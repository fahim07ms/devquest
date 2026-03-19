import {ZodError} from "zod";
import {sendErrorResponse} from "../utils/error.js";

export const validateBody = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        return next();
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.log(error);
        
        if (error instanceof ZodError) {
            // Provide field specified errors
            const errors = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            
            return sendErrorResponse(
                res,
                400,
                "Validation failed.",
                errors
            )
        }
        
        return sendErrorResponse(
            res,
            400,
            "Invalid request body."
        )
    }
}