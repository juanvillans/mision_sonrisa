/**
 * Example usage of the error middleware in your routes
 * This file demonstrates how to use the error handling utilities
 */

import { Router } from "express";
import { AppError, catchAsync, commonErrors } from "../middlewares/error.middleware.js";

const exampleRouter = Router();

// Example 1: Using catchAsync to handle async errors automatically
exampleRouter.get("/async-example", catchAsync(async (req, res, next) => {
    // Simulate an async operation that might fail
    const data = await someAsyncOperation();
    
    if (!data) {
        // This will be caught by catchAsync and passed to error middleware
        throw commonErrors.notFound('User');
    }
    
    res.json({
        status: 'success',
        data
    });
}));

// Example 2: Using next() to pass errors to error middleware
exampleRouter.get("/manual-error", (req, res, next) => {
    try {
        // Some operation that might fail
        const result = riskyOperation();
        
        if (!result) {
            // Pass error to error middleware
            return next(commonErrors.notFound('Resource'));
        }
        
        res.json({ status: 'success', data: result });
    } catch (error) {
        // Pass any caught error to error middleware
        next(error);
    }
});

// Example 3: Using AppError directly
exampleRouter.post("/create-user", catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
        throw commonErrors.missingFields(['email', 'password']);
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw commonErrors.alreadyExists('User');
    }
    
    // Create user
    const user = await User.create({ email, password });
    
    res.status(201).json({
        status: 'success',
        data: { user }
    });
}));

// Example 4: Custom error with AppError
exampleRouter.get("/custom-error", (req, res, next) => {
    const customError = new AppError('This is a custom error message', 418);
    next(customError);
});

// Example 5: Different types of common errors
exampleRouter.get("/error-types/:type", (req, res, next) => {
    const { type } = req.params;
    
    switch (type) {
        case 'unauthorized':
            next(commonErrors.unauthorized());
            break;
        case 'forbidden':
            next(commonErrors.forbidden());
            break;
        case 'not-found':
            next(commonErrors.notFound('Item'));
            break;
        case 'validation':
            next(commonErrors.invalidInput('Invalid email format'));
            break;
        case 'server':
            next(commonErrors.serverError());
            break;
        case 'rate-limit':
            next(commonErrors.tooManyRequests());
            break;
        default:
            next(commonErrors.notFound('Error type'));
    }
});

// Mock functions for examples
async function someAsyncOperation() {
    // Simulate async operation
    return Math.random() > 0.5 ? { id: 1, name: 'Test' } : null;
}

function riskyOperation() {
    // Simulate operation that might fail
    return Math.random() > 0.3 ? { success: true } : null;
}

export default exampleRouter;
