// const express = require('express');
// const router = express.Router();
// const excelImportController = require('../controllers/excelImportController');
// const upload = require('../middlewares/uploadMiddleware'); // Necesitarás crear este middleware

// // Middleware de autenticación (si lo tienes)
// const authMiddleware = require('../middlewares/authMiddleware');

import { Router } from "express";
import excelImportController from "../controlers/excel_import.controler.js";
import multer from "multer";
import { protect } from "../middlewares/auth.middleware.js";


const upload = multer({ dest: "uploads/" });
const router = Router();

// Ruta para importar Excel
router.post(
  "/import",
  protect, // Opcional
  upload.single("file"), // Middleware para subir archivos
  excelImportController.importExcel,
);

// Ruta para obtener historial
router.get(
  "/history",
  protect, // Opcional
  excelImportController.getImportHistory,
);

// Ruta para obtener detalles de un lote
router.get(
  "/batch/:batchId",
  protect, // Opcional
  excelImportController.getBatchDetails,
);

// Ruta para eliminar un lote
router.delete(
  "/batch/:batchId",
  protect, // Opcional
  excelImportController.deleteBatch,
);

// Ruta para estadísticas
router.get(
  "/statistics",
  protect, // Opcional
  excelImportController.getStatistics,
);

// Ruta para descargar template
router.get("/template", excelImportController.downloadTemplate);

export default router;
