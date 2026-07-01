import aj from "../config/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";
import { commonErrors } from "./error.middleware.js";

export const arcjetMiddleware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, { requested: 1 }); 

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw commonErrors.tooManyRequests();
      } else if (decision.reason.isBot()) {
        throw commonErrors.botDetected();
      } else {
        throw commonErrors.forbidden();
      }
    } else if (decision.results.some(isSpoofedBot)) {
      throw commonErrors.forbidden();
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

export default arcjetMiddleware;
