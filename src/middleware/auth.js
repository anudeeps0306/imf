import jwt from "jsonwebtoken";
import { formatError } from "../utils/responseFormatter.js";
import prisma from "../models/db.js";

// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json(formatError("Authentication required", 401));
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json(formatError("Invalid token", 401));
    }

    // Add user to request object
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json(formatError("Invalid token", 401));
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json(formatError("Token expired", 401));
    }
    return res.status(500).json(formatError("Server error", 500));
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json(formatError("Authentication required", 401));
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json(formatError("Insufficient permissions", 403));
    }

    next();
  };
};
