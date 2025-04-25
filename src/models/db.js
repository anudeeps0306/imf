import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
    return prisma;
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
  console.log("Database disconnected");
};

// Export the prisma client for use in other files
export default prisma;
