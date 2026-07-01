import { Router } from "express";
import {
  getMedicalRequests,
  getMedicalRequestById,
  createMedicalRequest,
  updateMedicalRequest,
  deleteMedicalRequest
} from "../controlers/medical_requests.controler.js";
import { protect } from "../middlewares/auth.middleware.js";

const medicalRequestsRouter = Router();

// All routes require authentication
medicalRequestsRouter.use(protect);

// GET all medical requests (with pagination, sorting, filtering)
medicalRequestsRouter.get("/", getMedicalRequests);

// GET single medical request by ID

// POST create new medical request
medicalRequestsRouter.post("/", createMedicalRequest);

// PUT update medical request
medicalRequestsRouter.put("/:id", updateMedicalRequest);

// DELETE medical request
medicalRequestsRouter.delete("/:id", deleteMedicalRequest);

export default medicalRequestsRouter;
