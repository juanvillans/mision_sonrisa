import ExcelImportModel from '../models/excel_import.model.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ExcelImportController {
  constructor() {
    this.model = new ExcelImportModel();
    this.uploadsDir = path.join(__dirname, '../../uploads');

    // Asegurar que el directorio de uploads exista
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }

    // Bind methods to preserve 'this' context
    this.importExcel = this.importExcel.bind(this);
    this.getImportHistory = this.getImportHistory.bind(this);
    this.getBatchDetails = this.getBatchDetails.bind(this);
    this.deleteBatch = this.deleteBatch.bind(this);
    this.getStatistics = this.getStatistics.bind(this);
    this.downloadTemplate = this.downloadTemplate.bind(this);
  }

  /**
   * Maneja la importación de archivos Excel
   */
  async importExcel(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      const userId = req.user?.id || 1; // Ajusta según tu sistema de autenticación
      const filePath = req.file.path;
      const originalFilename = req.file.originalname; // Nombre original del archivo

      const result = await this.model.importMedicalRequests(filePath, userId, originalFilename);

      // Opcional: limpiar archivo después de importar
      // fs.unlinkSync(filePath);

      return res.status(200).json({
        success: true,
        message: 'Importación completada',
        data: result
      });

    } catch (error) {
      console.error('Error en importExcel:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al procesar el archivo',
        error: error.message
      });
    }
  }

  /**
   * Obtiene el historial de importaciones con paginación, ordenamiento, búsqueda y filtros
   * Query params:
   * - page: Número de página (default: 1)
   * - limit: Registros por página (default: 20)
   * - sortField: Campo para ordenar (default: 'created_at')
   * - sortOrder: Orden 'asc' o 'desc' (default: 'desc')
   * - search: Término de búsqueda global
   * - filters: JSON string de filtros por columna
   */
  async getImportHistory(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        sortField = 'created_at',
        sortOrder = 'desc',
        search = '',
        filters
      } = req.query;

      // Parse filters if provided
      let parsedFilters = {};
      if (filters) {
        try {
          parsedFilters = JSON.parse(filters);
        } catch (error) {
          return res.status(400).json({
            status: 'fail',
            message: 'Invalid filters format. Must be valid JSON.'
          });
        }
      }

      const userId = req.user?.id || null;

      // Get paginated data
      const result = await this.model.getImportBatches({
        page: parseInt(page),
        limit: parseInt(limit),
        sortField,
        sortOrder,
        search,
        filters: parsedFilters,
        userId
      });

      return res.status(200).json({
        status: 'success',
        data: {
          batches: result.data,
          total: result.total,
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
          totalPages: Math.ceil(result.total / parseInt(limit))
        },
        // Debug info (can be removed in production)
        debug: {
          searchTerm: search,
          appliedFilters: parsedFilters,
          sortField,
          sortOrder,
          recordsOnPage: result.data.length
        }
      });

    } catch (error) {
      console.error('Error en getImportHistory:', error);
      return res.status(500).json({
        status: 'fail',
        message: 'Error al obtener el historial',
        error: error.message
      });
    }
  }

  /**
   * Obtiene detalles de un lote de importación
   */
  async getBatchDetails(req, res) {
    try {
      const { batchId } = req.params;

      if (!batchId) {
        return res.status(400).json({
          success: false,
          message: 'ID del lote no proporcionado'
        });
      }

      const result = await this.model.getBatchDetails(batchId);

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error en getBatchDetails:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener detalles del lote',
        error: error.message
      });
    }
  }

  /**
   * Elimina un lote de importación
   */
  async deleteBatch(req, res) {
    try {
      const { batchId } = req.params;

      if (!batchId) {
        return res.status(400).json({
          success: false,
          message: 'ID del lote no proporcionado'
        });
      }

      const deleted = await this.model.deleteBatch(batchId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Lote no encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Lote eliminado correctamente'
      });

    } catch (error) {
      console.error('Error en deleteBatch:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar el lote',
        error: error.message
      });
    }
  }

  /**
   * Obtiene estadísticas de importaciones
   */
  async getStatistics(req, res) {
    try {
      const stats = await this.model.getImportStatistics();

      return res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error en getStatistics:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }

  /**
   * Descarga template de Excel
   */
  async downloadTemplate(req, res) {
    try {
      const templatePath = path.join(__dirname, '../../templates/medical_requests_template.xlsx');
      
      if (!fs.existsSync(templatePath)) {
        return res.status(404).json({
          success: false,
          message: 'Template no encontrado'
        });
      }

      return res.download(templatePath, 'template_solicitudes_medicas.xlsx');

    } catch (error) {
      console.error('Error en downloadTemplate:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al descargar template',
        error: error.message
      });
    }
  }
}

export default new ExcelImportController();