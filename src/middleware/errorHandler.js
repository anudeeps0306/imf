import { formatError } from "../utils/responseFormatter.js";

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code && err.code.startsWith("P")) {
    if (err.code === "P2002") {
      return res
        .status(409)
        .json(formatError(`Duplicate entry: ${err.meta?.target}`, 409));
    }
    if (err.code === "P2025") {
      return res.status(404).json(formatError("Resource not found", 404));
    }
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  
  return res.status(statusCode).json(formatError(message, statusCode));
};
