import { Router } from "express";
import { getExamResultsByToken, downloadExamResultsPDF } from "../controlers/examResults.controler.js";

const resultsRouter = Router();

// Public routes - no authentication required
resultsRouter.get("/:token", getExamResultsByToken);
resultsRouter.get("/:token/pdf", downloadExamResultsPDF);

export default resultsRouter;
