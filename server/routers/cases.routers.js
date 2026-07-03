import { Router } from "express";
import {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  getCasesStats,
  getOrigins,
  getProsthesisTypes,
  bulkUpdateStatus,
  exportCases
} from "../controlers/cases.controler.js";
import { protect } from "../middlewares/auth.middleware.js";

const casesRouter = Router();

// All routes require authentication
casesRouter.use(protect);

// GET all cases (with pagination, sorting, filtering)
casesRouter.get("/", getCases);

// GET cases statistics for dashboard
casesRouter.get("/stats", getCasesStats);

// GET all unique origin values
casesRouter.get("/origins", getOrigins);

// GET all unique prosthesis types
casesRouter.get("/prosthesis-types", getProsthesisTypes);

// GET export cases
casesRouter.get("/export", exportCases);

// POST bulk update cases status
casesRouter.post("/bulk-update", bulkUpdateStatus);

// GET single case by ID
casesRouter.get("/:id", getCaseById);

// POST create new case
casesRouter.post("/", createCase);

// PUT update case
casesRouter.put("/:id", updateCase);

// DELETE case
casesRouter.delete("/:id", deleteCase);

export default casesRouter;