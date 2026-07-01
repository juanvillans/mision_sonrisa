import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { commonErrors, catchAsync } from "../middlewares/error.middleware.js";
import { JWT_EXPIRES_IN, JWT_SECRET, APP_URL } from "../config/env.js";
import { sendInvitationEmail } from "./mailjet.controler.js";

export const createUser = catchAsync(async (req, res, next) => {
  try {
    const {
      email,
      full_name,
      is_admin,
    } = req.body;

    // Validate required fields
    if (!full_name) {
      throw commonErrors.missingFields(["full_name"]);
    }
    
    if (!email) {
      throw commonErrors.missingFields(["email"]);
    }

    
    // Validate email format
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      throw commonErrors.invalidInput("Please enter a valid email address");
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw commonErrors.alreadyExists("User");
    }
    
    // Create the user (always in pending status, no password)
    const user = await User.create({
      full_name,
      is_admin,
      email,
      status: "pending",
    });

    try {
      // Create invitation token after user is created
      const invitationToken = jwt.sign(
        {
          email: user.email,
          userId: user.id,
          full_name: user.full_name,
          purpose: "invitation",
        },
        JWT_SECRET,
        { expiresIn: "48h" }
      );
      
      
      await sendInvitationEmail(
        { full_name: user.full_name, email: user.email },
        invitationToken,
        APP_URL
      );
      
      res.status(201).json({
        status: "success",
        message: "User created successfully and invitation sent",
        data: {
          user: user.toJSON(),
        },
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);

      res.status(201).json({
        status: "success",
        message: "User created successfully but invitation email failed to send",
        data: {
          user: user.toJSON(),
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

export const getUsers = catchAsync(async (req, res, next) => {
  try {
    const users = await User.getAllUsers();
    const totalCount = users.length;

    res.status(200).json({
      status: "success",
      data: {
        users,
        totalCount,
      },
    });

  } catch (error) {
    next(error);
  }
});

export const findUserById = catchAsync(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw commonErrors.notFound("User");
    }
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
});

export const blockUser = catchAsync(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw commonErrors.notFound("User");
    }
    await User.updateById(req.params.id, { status: "bloqueado" });
    res.status(200).json({
      status: "success",
      message: "Usuario eliminado con éxito",
    });
  } catch (error) {
    next(error);
  }
});

export const updateUser = catchAsync(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw commonErrors.notFound("User");
    }
    if (req.body.email && req.body.email !== user.email) {
      throw commonErrors.invalidInput("No se puede cambiar el email");
    }

    await User.updateById(req.params.id, req.body);
    res.status(200).json({
      status: "success",
      message: "Usuario actualizado con éxito",
    });
  } catch (error) {
    next(error);
  }
});


