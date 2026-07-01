// const xlsx = require('xlsx');
// const knex = require('../config/database'); // Ajusta la ruta según tu estructura
// const { parseExcelDate } = require('../utils/dateUtils'); // Opcional: crea un helper para fechas
import xlsx from 'xlsx';
import { db } from "../database/postgre.js";


class ExcelImportModel {
  constructor() {
    this.medicalRequestsTable = 'medical_requests'; // Ajusta según tu nombre de tabla
    this.importBatchesTable = 'import_batches';
  }

  /**
   * Importa datos desde un archivo Excel
   * @param {string} filePath - Ruta del archivo Excel
   * @param {number} userId - ID del usuario que importa
   * @param {string} originalFilename - Nombre original del archivo (opcional)
   * @returns {Promise<Object>} Resultados de la importación
   */
  async importMedicalRequests(filePath, userId, originalFilename = null) {
    // 1. Leer el archivo Excel
    const workbook = xlsx.readFile(filePath, {
      cellText: false,  // Leer valores tal como están
      cellDates: true,
      cellNF: false
    });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convertir a JSON preservando el formato original
    // raw: true mantiene los números como números (no strings)
    // Luego los convertiremos manualmente en mapExcelRowToModel
    const data = xlsx.utils.sheet_to_json(worksheet, {
      raw: true,       // Mantener valores originales
      defval: '',      // Valor por defecto para celdas vacías
      blankrows: false // Ignorar filas vacías
    });

    // 2. Crear registro de lote de importación
    const [batch] = await db(this.importBatchesTable)
      .insert({
        filename: originalFilename || filePath.split('/').pop(), // Usar nombre original o fallback al nombre del servidor
        total_records: data.length,
        user_id: userId,
        status: 'processing'
      })
      .returning('*');
    
    const errors = [];
    const successfulImports = [];
    
    // 3. Procesar cada fila
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Mapear campos del Excel a la tabla
        const medicalRequestData = this.mapExcelRowToModel(row, batch.id);
        
        // Validar datos requeridos
        this.validateRowData(medicalRequestData);
        
        // Insertar en la base de datos
        const [importedRecord] = await db(this.medicalRequestsTable)
          .insert(medicalRequestData)
          .returning('*');
        
        successfulImports.push(importedRecord);
        
      } catch (error) {
        errors.push({
          row: i + 2, // +2 porque Excel empieza en fila 1 y la fila 1 son headers
          error: error.message,
          raw_data: row
        });
        console.error(`Error en fila ${i + 2}:`, error.message);
      }
    }
    
    // 4. Actualizar el lote de importación con resultados
    const status = errors.length === 0 ? 'completed' : 
                   successfulImports.length > 0 ? 'partial' : 'failed';
    
    await db(this.importBatchesTable)
      .where('id', batch.id)
      .update({
        imported_records: successfulImports.length,
        failed_records: errors.length,
        errors: errors.length > 0 ? errors : null,
        status: status,
        completed_at: db.fn.now()
      });
    
    return {
      batch_id: batch.id,
      total: data.length,
      imported: successfulImports.length,
      failed: errors.length,
      errors: errors,
      status: status
    };
  }

  /**
   * Mapea una fila de Excel al modelo de base de datos
   * @param {Object} row - Fila de datos del Excel
   * @param {number} batchId - ID del lote de importación
   * @returns {Object} Datos mapeados
   */
  mapExcelRowToModel(row, batchId) {
    // Helper para convertir valores a string y evitar notación científica
    const toString = (value) => {
      if (value === null || value === undefined) return '';

      // Si es número, convertir a string sin notación científica
      if (typeof value === 'number') {
        // Para números grandes (como teléfonos), usar toFixed(0) para evitar notación científica
        if (value > 999999999) {
          return Math.floor(value).toString();
        }
        return value.toString();
      }

      // Si es string, retornar limpio
      return String(value).trim();
    };

    return {
      code: toString(row.CODIGO || row.Código || row.codigo),
      ci: toString(row.CEDULA || row.Cédula || row.cedula),
      name: toString(row.DENUNCIANTE || row.Denunciante || row.denunciante),
      phone: toString(row.TELEFONO || row.Teléfono || row.telefono),
      state: toString(row.ESTADO || row.Estado || row.estado),
      municipality: toString(row.MUNICIPIO || row.Municipio || row.municipio),
      parish: toString(row.PARROQ || row.Parroquia || row.parroquia),
      health_center: toString(row['CENTRO DE SALUD'] || row['Centro de Salud'] || row.centro_salud),
      description: toString(row.DESCRIP || row.Descripción || row.descripcion),
      subcategory: toString(row.SUBCATEG || row['Sub Categoría'] || row.subcategoria),
      extended_category: toString(row.EXTCATEG || row['Categoría Extendida'] || row.categoria_extendida),
      request: toString(row.SOLICITUD || row.Solicitud || row.solicitud),
      requirement: toString(row.REQUERIMIENTO || row.Requerimiento || row.requerimiento),
      creation_date: this.parseDate(row['FECHA CREACION'] || row['Fecha Creación'] || row.fecha_creacion),
      status_date: this.parseDate(row['FECHA STATUS'] || row['Fecha Status'] || row.fecha_status),
      statute_id: 1, // Asignar un valor por defecto o mapear según corresponda el estado
      import_batch_id: batchId,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  /**
   * Valida los datos de una fila
   * @param {Object} data - Datos a validar
   * @throws {Error} Si faltan campos requeridos
   */
  validateRowData(data) {
    const requiredFields = ['code', 'name', 'state', 'municipality'];
    
    for (const field of requiredFields) {
      if (!data[field] || data[field].toString().trim() === '') {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }
  }

  /**
   * Parsea fechas desde Excel
   * @param {any} dateValue - Valor de fecha
   * @returns {Date|null} Fecha parseada
   */
  parseDate(dateValue) {
    if (!dateValue) return null;
    
    // Si es número (formato Excel)
    if (typeof dateValue === 'number') {
      // Excel usa base 1900 con bug del 29/02/1900
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
      
      // Ajustar por bug de Excel (trata 1900 como año bisiesto)
      if (dateValue > 59) date.setDate(date.getDate() - 1);
      
      return date;
    }
    
    // Si es string
    if (typeof dateValue === 'string') {
      // Intentar diferentes formatos de fecha
      const formats = [
        'DD/MM/YYYY',
        'MM/DD/YYYY',
        'YYYY-MM-DD',
        'DD-MM-YYYY',
        'MM-DD-YYYY'
      ];
      
      for (const format of formats) {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    // Si ya es Date
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return dateValue;
    }
    
    return null;
  }

  /**
   * Obtiene el historial de importaciones con paginación, ordenamiento, búsqueda y filtros
   * @param {Object} options - Opciones de consulta
   * @param {number} options.page - Página actual
   * @param {number} options.limit - Límite por página
   * @param {string} options.sortField - Campo para ordenar
   * @param {string} options.sortOrder - Orden ('asc' o 'desc')
   * @param {string} options.search - Término de búsqueda global
   * @param {Object} options.filters - Filtros por columna
   * @param {number} options.userId - ID del usuario (opcional)
   * @returns {Promise<{data: Array, total: number}>} Historial paginado
   */
  async getImportBatches({
    page = 1,
    limit = 20,
    sortField = 'created_at',
    sortOrder = 'desc',
    search = '',
    filters = {},
    userId = null
  }) {
    const offset = (page - 1) * limit;

    // Build base query with user join
    let query = db('import_batches')
      .innerJoin('users', 'import_batches.user_id', 'users.id')
      .select(
        'import_batches.*',
        'users.full_name as user_name',
        db.raw('to_char(import_batches.created_at, \'YYYY-MM-DD HH24:MI:SS\') as created_at_formatted'),
        db.raw('to_char(import_batches.completed_at, \'YYYY-MM-DD HH24:MI:SS\') as completed_at_formatted')
      );

    // Global search across multiple fields
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query = query.where(function() {
        this.where('import_batches.filename', 'ilike', searchTerm)
          .orWhere('users.full_name', 'ilike', searchTerm)
          .orWhere('import_batches.status', 'ilike', searchTerm);
      });
    }

    // Column-specific filters
    if (filters && Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([field, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          // Handle user_name filter specially since it's from joined table
          if (field === 'user_name') {
            query = query.where('users.full_name', 'ilike', `%${value}%`);
          } else {
            query = query.where(`import_batches.${field}`, 'ilike', `%${value}%`);
          }
        }
      });
    }

    // Filter by user if specified
    if (userId) {
      query = query.where('import_batches.user_id', userId);
    }

    // Field mapping for sorting
    const fieldMapping = {
      'id': 'import_batches.id',
      'filename': 'import_batches.filename',
      'total_records': 'import_batches.total_records',
      'imported_records': 'import_batches.imported_records',
      'failed_records': 'import_batches.failed_records',
      'status': 'import_batches.status',
      'user_name': 'users.full_name',
      'created_at': 'import_batches.created_at',
      'completed_at': 'import_batches.completed_at'
    };

    const actualSortField = fieldMapping[sortField] || 'import_batches.created_at';

    // Clone query for count
    const countQuery = query.clone().clearSelect().clearOrder().count('* as count').first();

    // Apply sorting and pagination
    query = query
      .orderBy(actualSortField, sortOrder)
      .limit(parseInt(limit))
      .offset(offset);

    // Execute both queries in parallel
    const [batches, totalResult] = await Promise.all([
      query,
      countQuery
    ]);

    return {
      data: batches,
      total: parseInt(totalResult.count)
    };
  }

  /**
   * Obtiene detalles de un lote de importación
   * @param {number} batchId - ID del lote
   * @returns {Promise<Object>} Detalles del lote
   */
  async getBatchDetails(batchId) {
    const batch = await db(this.importBatchesTable)
      .where('id', batchId)
      .first();
    
    if (!batch) {
      throw new Error('Lote de importación no encontrado');
    }
    
    const records = await db(this.medicalRequestsTable)
      .where('import_batch_id', batchId)
      .select('*')
      .orderBy('id');
    
    return {
      batch,
      records,
      total_records: records.length
    };
  }

  /**
   * Elimina un lote de importación y sus registros asociados
   * @param {number} batchId - ID del lote
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  async deleteBatch(batchId) {
    // Usar transacción para mantener consistencia
    return await db.transaction(async (trx) => {
      // Eliminar registros asociados
      await trx(this.medicalRequestsTable)
        .where('import_batch_id', batchId)
        .delete();
      
      // Eliminar el lote
      const deleted = await trx(this.importBatchesTable)
        .where('id', batchId)
        .delete();
      
      return deleted > 0;
    });
  }

  /**
   * Obtiene estadísticas de importaciones
   * @returns {Promise<Object>} Estadísticas
   */
  async getImportStatistics() {
    const stats = await db(this.importBatchesTable)
      .select(
        db.raw('COUNT(*) as total_batches'),
        db.raw('SUM(total_records) as total_records'),
        db.raw('SUM(imported_records) as total_imported'),
        db.raw('SUM(failed_records) as total_failed'),
        db.raw('AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_duration_seconds')
      )
      .first();
    
    const lastImport = await db(this.importBatchesTable)
      .select('*')
      .orderBy('created_at', 'desc')
      .first();
    
    return {
      total_batches: parseInt(stats.total_batches) || 0,
      total_records: parseInt(stats.total_records) || 0,
      total_imported: parseInt(stats.total_imported) || 0,
      total_failed: parseInt(stats.total_failed) || 0,
      avg_duration_seconds: parseFloat(stats.avg_duration_seconds) || 0,
      last_import: lastImport
    };
  }
}

export default ExcelImportModel;