import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { commonErrors, catchAsync } from "../middlewares/error.middleware.js";
import { JWT_EXPIRES_IN, JWT_SECRET, APP_URL } from "../config/env.js";
import { tokenBlacklist } from "../utils/token-blacklist.js";
import { sendPasswordResetEmail } from "./mailjet.controler.js";

export const signIn = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw commonErrors.missingFields(['email', 'password']);
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      throw commonErrors.invalidInput("Email o contraseña incorrectos");
    }

    // Check if account is pending activation (stop here if true)
    if (user.status === "pendiente") {
      throw commonErrors.invalidInput("Cuenta pendiente de activación");
    }
    
    // Only validate password if user is active
    // Check if user has a password set
    if (!user.password) {
      throw commonErrors.invalidInput("Usuario no tiene contraseña configurada");
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw commonErrors.invalidInput("Contraseña incorrecta");
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, purpose: "login" }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(200).json({
      status: "success",
      message: "Usuario autenticado con éxito",
      data: {
        token,
        user: user.toJSON(), // Excludes password
      },

    });
    
  } catch (error) {
    next(error);
  }
});

export const signOut = catchAsync(async (req, res, next) => {
  try {
    tokenBlacklist.add(req.headers.authorization.split(" ")[1]);
    res.status(200).json({
      status: "success",
      message: "Cerrar sesión",
    });
  } catch (error) {
    next(error);
  }
});

export const verifyInvitationToken = catchAsync(async(req, res, next) => {
  try {
    // The token has already been validated by middleware
    // Just return the user info
    res.status(200).json({
      status: "success",
      message: "Token de invitación válido",
      data: {
        user: {
          name: req.tokenUser.full_name,
          email: req.tokenUser.email
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export const activateAccount = catchAsync(async(req, res, next) => {
  try {
     const { password } = req.body;
     if (!password) {
      throw commonErrors.missingFields(['password']);
     }
 
     // Hash the password
     const salt = await bcrypt.genSalt(12);
     const hashedPassword = await bcrypt.hash(password, salt);
     
     // Update user
     const user = await User.updateById(req.tokenUser.id, {
       password: hashedPassword,
       status: "activo"
     });

     // Blacklist invitation token after successful activation
     const invitationToken = req.query.token || req.body.token;
     if (invitationToken) {
       tokenBlacklist.add(invitationToken);
     }
     
     res.status(200).json({
       status: "success",
       message: "Cuenta activada con éxito",
       data: {
         user: user.toJSON()
       }
     });

  } catch (error) {
    next(error)
  }
})

// Change password (for logged in users)
export const changePassword = catchAsync(async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      throw commonErrors.missingFields(['currentPassword', 'newPassword']);
    }
    
    // Get user from database (we already have user ID from protect middleware)
    const user = await User.findById(req.user.id);
    
    // Check if current password is correct
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      throw commonErrors.invalidInput("Contraseña actual incorrecta");
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update user with new password
    await User.updateById(user.id, { password: hashedPassword });

    // Blacklist the current login token after password change
    if (req.token) {
      tokenBlacklist.add(req.token);
    }
    
    res.status(200).json({
      status: "success",
      message: "Contraseña actualizada con éxito"
    });
  } catch (error) {
    next(error);
  }
});

// Request password reset (forgot password)
export const forgotPassword = catchAsync(async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log({email, body: req.body});
    if (!email) {
      throw commonErrors.missingFields(['email']);
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      // Just return success message anyway
      return res.status(200).json({
        status: "success",
        message: "Si el correo existe, se ha enviado un enlace para restablecer la contraseña"
      });
    }
    
    // Check if user is active
    if (user.status !== 'activo') {
      // Don't reveal account status
      return res.status(200).json({
        status: "success",
        message: "Si el correo existe, se ha enviado un enlace para restablecer la contraseña"
      });
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      {
        email: user.email,
        userId: user.id,
        purpose: "reset"
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    // Send reset email
    try {
      await sendPasswordResetEmail(
        { name: user.name, email: user.email },
        resetToken,
        APP_URL
      );
      
      res.status(200).json({
        status: "success",
        message: "Se ha enviado un enlace para restablecer la contraseña"
      });
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);
      throw commonErrors.serverError("Error al enviar el correo de restablecimiento");
    }
  } catch (error) {
    next(error);
  }
});

// Verify reset token
export const verifyResetToken = catchAsync(async (req, res, next) => {
  try {
    // The token has already been validated by middleware
    // Just return the user info
    res.status(200).json({
      status: "success",
      message: "Token de restablecimiento válido",
      data: {
        user: {
          name: req.tokenUser.name,
          email: req.tokenUser.email
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Reset password with token
export const resetPassword = catchAsync(async (req, res, next) => {
  try {
    const { password, token } = req.body;
    if (!password) {
      throw commonErrors.missingFields(['password']);
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update user with new password
    const user = await User.updateById(req.tokenUser.id, {
      password: hashedPassword
    });
    
    res.status(200).json({
      status: "success",
      message: "Contraseña restablecida con éxito",
      data: {
        user: user.toJSON()
      }
    });

    // delete reset token
    tokenBlacklist.add(token);
  } catch (error) {
    next(error);
  }
});
