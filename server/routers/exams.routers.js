import { Router } from "express";
import { createExam, getExams, findExamById, updateExam, deleteExam, validateExam, getChartData } from "../controlers/exams.controler.js";
import { generateToken, sendExamResults, updateMessageStatusEndpoint } from "../controlers/examResults.controler.js";
import { protect, requireValidateExam, requireHandleExams } from "../middlewares/auth.middleware.js";

const examsRouter = Router();

examsRouter.get("/", protect, requireHandleExams, getExams);
// Mover las rutas específicas ANTES de las rutas con parámetros
examsRouter.get("/chart-data/:period", protect, getChartData);
examsRouter.post("/generate-results-token", protect, requireHandleExams, generateToken);
examsRouter.post("/send-results", protect, requireHandleExams, sendExamResults);
examsRouter.put("/update-message-status/:id", updateMessageStatusEndpoint);
examsRouter.put("/validate-exam", protect, requireHandleExams, requireValidateExam, validateExam);
examsRouter.post("/", protect, requireHandleExams, createExam);

// Las rutas con parámetros van AL FINAL
examsRouter.get("/:id", protect, requireHandleExams, findExamById);
examsRouter.put("/:id", protect, requireHandleExams, updateExam);
examsRouter.delete("/:id", protect, requireHandleExams, deleteExam);

export default examsRouter;
