import jwt from "jsonwebtoken";
import { commonErrors, catchAsync } from "./error.middleware.js";
import User from "../models/user.model.js";
import { JWT_SECRET } from "../config/env.js";
import { tokenBlacklist } from "../utils/token-blacklist.js";

export const protect = catchAsync(async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {

      throw commonErrors.unauthorized("No se encontró token");
    }

    // Check if token is blacklisted (logged out)
    if (tokenBlacklist.has(token)) {
      throw commonErrors.unauthorized("User is logged out");
    }

    // 2) Verification token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.purpose !== 'login') {
      throw commonErrors.invalidInput( `token invalido ${decoded.purpose}`);
    }
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      throw commonErrors.unauthorized();
    }

    // 4) Check if user changed password after the token was issued
    // if (currentUser.changedPasswordAfter(decoded.iat)) {
    //   throw commonErrors.unauthorized();
    // }

    // Grant access to protected route
    req.user = currentUser;
    req.token = token;
    next();
  } catch (error) {
    
    next(error);
  }
});

export const requireAdmin = (req, res, next) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.is_admin) {
      throw commonErrors.forbidden();
    }
    
    next();
  } catch (error) {
    next(error);
  }
};



// Middleware to validate invitation tokens
export const validateInvitationToken = catchAsync(async (req, res, next) => {
  try {
    // Get token from request query parameters
    const token = req.query.token || req.body.token;
    
    if (!token) {
      throw commonErrors.missingFields(['token']);
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      // Handle different JWT verification errors
      if (error.name === 'TokenExpiredError') {
        throw commonErrors.invalidInput("Invitation token has expired");
      } else {
        throw commonErrors.invalidInput("Invalid invitation token");
      }
    }
    
    // Check token purpose
    if (decoded.purpose !== 'invitation') {
      throw commonErrors.invalidInput("Invalid token type");
    }
    
    // Find user by email from token
    const user = await User.findByEmail(decoded.email);
    if (!user) {
      throw commonErrors.notFound("User");
    }
    
    // Check if account is already activated
    if (user.status !== 'pendiente') {
      throw commonErrors.invalidInput("Tu cuenta ya ha sido activada");
    }
    
    // Store decoded token and user in request for later use
    req.decodedToken = decoded;
    req.tokenUser = user;
    
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware to validate password reset tokens
export const validateResetToken = catchAsync(async (req, res, next) => {
  try {
    // Get token from request query parameters
    const token = req.query.token || req.body.token;
    
    if (!token) {
      throw commonErrors.missingFields(['token']);
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      // Handle different JWT verification errors
      if (error.name === 'TokenExpiredError') {
        throw commonErrors.invalidInput("Reset token has expired");
      } else {
        throw commonErrors.invalidInput("Invalid reset token");
      }
    }
    
    // Check token purpose
    if (decoded.purpose !== 'reset') {
      throw commonErrors.invalidInput("Invalid token type");
    }
    if (tokenBlacklist.has(token)) {
      throw commonErrors.invalidInput("Token is blacklisted");
    }
    
    // Find user by email from token
    const user = await User.findByEmail(decoded.email);
    if (!user) {
      throw commonErrors.notFound("User");
    }
    
    // Check if account is active
    if (user.status !== 'activo') {
      throw commonErrors.invalidInput("Account is not active");
    }
    
    // Store decoded token and user in request for later use
    req.decodedToken = decoded;
    req.tokenUser = user;
    
    next();
  } catch (error) {
    next(error);
  }
});

export const requireValidateExam = (req, res, next) => {
  try {
    // Check if user has permission to validate exams
    if (!req.user || !req.user.allow_validate_exam) {
      throw commonErrors.forbidden();
    }
    
    next();
  } catch (error) {
    next(error);
  }
};