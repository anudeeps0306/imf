import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import { PrismaClient } from "@prisma/client";
import prisma from "../models/db.js";
import { formatResponse, formatError } from "../utils/responseFormatter.js";

// const prisma = new PrismaClient();

export const register = async (req, res, next) => {
  try {
    const { username, password, role = "agent" } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json(formatError("Username and password are required", 400));
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json(formatError("Username already taken", 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return res
      .status(201)
      .json(formatResponse(user, "User registered successfully", 201));
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json(formatError("Username and password are required", 400));
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res
        .status(401)
        .json(formatError("Invalid username or password", 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json(formatError("Invalid username or password", 401));
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json(
      formatResponse(
        {
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
          },
        },
        "Login successful",
        200
      )
    );
  } catch (error) {
    next(error);
  }
};
