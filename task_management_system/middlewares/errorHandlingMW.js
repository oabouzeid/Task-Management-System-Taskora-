export default (error, req, res, next) => {
    let statusCode = error.status || 500;
    let message = error.message || "internal server error";
    let errors = error.errors;

    // mongoose duplicate key error
    if (error.code === 11000) {
        statusCode = 400;
        const field = Object.keys(error.keyValue)[0];
        const value = error.keyValue[field];
        message = `${field} with value "${value}" already exists`;
    }

    // mongoose validation error
    if (error.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(error.errors).map((el) => ({
            field: el.path,
            message: el.message,
        }));
    }

    return res.status(statusCode).json({
        status: "error",
        message,
        ...(errors && { errors }),
    });
};
