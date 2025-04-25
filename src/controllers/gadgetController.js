// import { PrismaClient } from "@prisma/client";
import { formatResponse, formatError } from "../utils/responseFormatter.js";
import {
  generateCodename,
  generateSuccessProbability,
  generateSelfDestructCode,
} from "../utils/codeGenerator.js";
import prisma from "../models/db.js";


// const prisma = new PrismaClient();

export const getAllGadgets = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const where = {};
    if (status) {
      where.status = status;
    }

    const gadgets = await prisma.gadget.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const gadgetsWithProbability = gadgets.map((gadget) => ({
      ...gadget,
      successProbability: `${generateSuccessProbability()}%`,
    }));

    return res
      .status(200)
      .json(formatResponse(gadgetsWithProbability, "Gadgets retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

export const getGadgetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const gadget = await prisma.gadget.findUnique({
      where: { id },
    });

    if (!gadget) {
      return res.status(404).json(formatError("Gadget not found", 404));
    }

    const gadgetWithProbability = {
      ...gadget,
      successProbability: `${generateSuccessProbability()}%`,
    };

    return res
      .status(200)
      .json(formatResponse(gadgetWithProbability, "Gadget retrieved successfully"));
  } catch (error) {
    next(error);
  }
};

export const createGadget = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json(formatError("Gadget name is required", 400));
    }

    let codename;
    let isUnique = false;

    while (!isUnique) {
      codename = generateCodename();
      const existingGadget = await prisma.gadget.findUnique({
        where: { codename },
      });
      if (!existingGadget) {
        isUnique = true;
      }
    }

    const gadget = await prisma.gadget.create({
      data: {
        name,
        codename,
        status: "Available",
      },
    });

    return res
      .status(201)
      .json(formatResponse(gadget, "Gadget created successfully", 201));
  } catch (error) {
    next(error);
  }
};

export const updateGadget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    if (status && !["Available", "Deployed", "Destroyed", "Decommissioned"].includes(status)) {
      return res.status(400).json(
        formatError(
          "Invalid status. Must be one of: Available, Deployed, Destroyed, Decommissioned",
          400
        )
      );
    }

    const existingGadget = await prisma.gadget.findUnique({
      where: { id },
    });

    if (!existingGadget) {
      return res.status(404).json(formatError("Gadget not found", 404));
    }

    const updatedGadget = await prisma.gadget.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
      },
    });

    return res
      .status(200)
      .json(formatResponse(updatedGadget, "Gadget updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const deleteGadget = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingGadget = await prisma.gadget.findUnique({
      where: { id },
    });

    if (!existingGadget) {
      return res.status(404).json(formatError("Gadget not found", 404));
    }

    const decommissionedGadget = await prisma.gadget.update({
      where: { id },
      data: {
        status: "Decommissioned",
        decommissionedAt: new Date(),
      },
    });

    return res
      .status(200)
      .json(formatResponse(decommissionedGadget, "Gadget decommissioned successfully"));
  } catch (error) {
    next(error);
  }
};

export const selfDestruct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { confirmationCode } = req.body;

    const gadget = await prisma.gadget.findUnique({
      where: { id },
      include: { selfDestructCodes: true },
    });

    if (!gadget) {
      return res.status(404).json(formatError("Gadget not found", 404));
    }

    if (gadget.status === "Destroyed") {
      return res
        .status(400)
        .json(formatError("Gadget has already been destroyed", 400));
    }

    if (!confirmationCode) {
      const code = generateSelfDestructCode();
      
      await prisma.selfDestructCode.create({
        data: {
          code,
          gadgetId: id,
        },
      });

      return res.status(200).json(
        formatResponse(
          { code },
          "Self-destruct sequence initiated. Use the provided code to confirm.",
          200
        )
      );
    }

    const validCode = gadget.selfDestructCodes.find(
      (c) => c.code === confirmationCode && !c.used
    );

    if (!validCode) {
      return res
        .status(400)
        .json(formatError("Invalid or expired confirmation code", 400));
    }

    await prisma.selfDestructCode.update({
      where: { id: validCode.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    const destroyedGadget = await prisma.gadget.update({
      where: { id },
      data: {
        status: "Destroyed",
      },
    });

    return res
      .status(200)
      .json(formatResponse(destroyedGadget, "Gadget has been destroyed"));
  } catch (error) {
    next(error);
  }
};
