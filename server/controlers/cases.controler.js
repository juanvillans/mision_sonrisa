import Case from '../models/cases.model.js';
import { catchAsync, commonErrors } from "../middlewares/error.middleware.js";

/**
 * Get all cases with pagination, sorting, filtering, and search
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 25)
 * - sortField: Field to sort by (default: 'created_at')
 * - sortOrder: Sort order 'asc' or 'desc' (default: 'desc')
 * - search: Global search term
 * - filters: JSON string of column-specific filters
 */
export const getCases = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 25,
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

  // Get paginated data
  const result = await Case.getPaginated({
    page: parseInt(page),
    limit: parseInt(limit),
    sortField,
    sortOrder,
    search,
    filters: parsedFilters
  });

  res.status(200).json({
    status: 'success',
    data: {
      cases: result.data,
      pagination: {
        total: result.total,
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
        totalPages: Math.ceil(result.total / parseInt(limit))
      }
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
});

/**
 * Get a single case by ID
 */
export const getCaseById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const caseData = await Case.getById(id);

  if (!caseData) {
    throw commonErrors.notFound('Caso no encontrado');
  }

  res.status(200).json({
    status: 'success',
    data: caseData
  });
});

/**
 * Create a new case
 */
export const createCase = catchAsync(async (req, res, next) => {
  // Filter out fields that don't belong to cases table
  const {
    id,
    code,
    creation_date_formatted,
    tdi_date_formatted,
    rdm_date_formatted,
    threaded_date_formatted,
    polished_date_formatted,
    birth_date_formatted,
    created_at_formatted,
    updated_at_formatted,
    created_at,
    updated_at,
    ...caseData
  } = req.body;
 
  /** turn date to null if is empty */
  if (caseData.tdi_date=== '') {
    caseData.tdi_date= null;
  }
  if (caseData.rdm_date=== '') {
    caseData.rdm_date= null;
  }
  if (caseData.threaded_date=== '') {
    caseData.threaded_date= null;
  }
  if (caseData.polished_date=== '') {
    caseData.polished_date= null;
  }
  if (caseData.birth_date=== '') {
    caseData.birth_date= null;
  }
  console.log("Received case data for creation:", caseData);
  if (!caseData.name) {
    throw commonErrors.badRequest('El campo "name" es requerido');
  }
  if (!caseData.type_of_prosthesis) {
    throw commonErrors.badRequest('El campo "type_of_prosthesis" es requerido');
  }
  if (!caseData.statute) {
    throw commonErrors.badRequest('El campo "statute" es requerido');
  }

  // Validate ENUM values
  const validOrigins = ['Misión sonrisa', '1x10'];
  if (caseData.origin && !validOrigins.includes(caseData.origin)) {
    throw commonErrors.badRequest(`Origin debe ser uno de: ${validOrigins.join(', ')}`);
  }

  const validSex = ['M', 'F'];
  if (caseData.sex && !validSex.includes(caseData.sex)) {
    throw commonErrors.badRequest(`Sex debe ser: ${validSex.join(' o ')}`);
  }

  const validProsthesisTypes = [
    'Total', 'Total Bimaxilar', 'Total Superior', 'Total Inferior',
    'Parcial', 'Parcial Bimaxilar', 'Parcial Superior', 'Parcial Inferior'
  ];
  if (caseData.type_of_prosthesis && !validProsthesisTypes.includes(caseData.type_of_prosthesis)) {
    throw commonErrors.badRequest(`type_of_prosthesis debe ser uno de: ${validProsthesisTypes.join(', ')}`);
  }

  const validStatutes = ['En proceso', 'Terminado', 'Entregado'];
  if (caseData.statute && !validStatutes.includes(caseData.statute)) {
    throw commonErrors.badRequest(`statute debe ser uno de: ${validStatutes.join(', ')}`);
  }

  const newCase = await Case.create(caseData);

  res.status(201).json({
    status: 'success',
    data: newCase,
    message: 'Caso creado exitosamente'
  });
});

/**
 * Update an existing case
 */
export const updateCase = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Filter out fields that don't belong to cases table
  const {
    code,
    creation_date_formatted,
    tdi_date_formatted,
    rdm_date_formatted,
    threaded_date_formatted,
    polished_date_formatted,
    birth_date_formatted,
    created_at_formatted,
    updated_at_formatted,
    created_at,
    updated_at,
    ...caseData
  } = req.body;

  // Validate ENUM values if present
  const validOrigins = ['Misión sonrisa', '1x10'];
  if (caseData.origin && !validOrigins.includes(caseData.origin)) {
    throw commonErrors.badRequest(`Origin debe ser uno de: ${validOrigins.join(', ')}`);
  }

  const validSex = ['M', 'F'];
  if (caseData.sex && !validSex.includes(caseData.sex)) {
    throw commonErrors.badRequest(`Sex debe ser: ${validSex.join(' o ')}`);
  }

  const validProsthesisTypes = [
    'Total', 'Total Bimaxilar', 'Total Superior', 'Total Inferior',
    'Parcial', 'Parcial Bimaxilar', 'Parcial Superior', 'Parcial Inferior'
  ];
  if (caseData.type_of_prosthesis && !validProsthesisTypes.includes(caseData.type_of_prosthesis)) {
    throw commonErrors.badRequest(`type_of_prosthesis debe ser uno de: ${validProsthesisTypes.join(', ')}`);
  }

  const validStatutes = ['En proceso', 'Terminado', 'Entregado'];
  if (caseData.statute && !validStatutes.includes(caseData.statute)) {
    throw commonErrors.badRequest(`statute debe ser uno de: ${validStatutes.join(', ')}`);
  }

  const updatedCase = await Case.update(id, caseData);

  if (!updatedCase) {
    throw commonErrors.notFound('Caso no encontrado');
  }

  res.status(200).json({
    status: 'success',
    data: updatedCase,
    message: 'Caso actualizado exitosamente'
  });
});

/* Mark case as delivered  (patch) */
export const markCaseAsDelivered = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedCase = await Case.update(id, { statute: 'Entregado' });

  if (!updatedCase) {
    throw commonErrors.notFound('Caso no encontrado');
  }

  res.status(200).json({
    status: 'success',
    data: updatedCase,
    message: 'Caso marcado como entregado exitosamente'
  });
});

/**
 * Delete a case
 */
export const deleteCase = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deleted = await Case.delete(id);

  if (!deleted) {
    throw commonErrors.notFound('Caso no encontrado');
  }

  res.status(200).json({
    status: 'success',
    message: 'Caso eliminado exitosamente'
  });
});

/**
 * Get cases statistics for dashboard
 */
export const getCasesStats = catchAsync(async (req, res, next) => {
  const stats = await Case.getStats();

  res.status(200).json({
    status: 'success',
    data: stats
  });
});

/**
 * Get all unique origin values
 */
export const getOrigins = catchAsync(async (req, res, next) => {
  const origins = await Case.getOrigins();

  res.status(200).json({
    status: 'success',
    data: origins
  });
});

/**
 * Get all unique prosthesis types
 */
export const getProsthesisTypes = catchAsync(async (req, res, next) => {
  const prosthesisTypes = await Case.getProsthesisTypes();

  res.status(200).json({
    status: 'success',
    data: prosthesisTypes
  });
});

/**
 * Bulk update cases status
 * Body: { ids: [1,2,3], statute: 'Terminado' }
 */
export const bulkUpdateStatus = catchAsync(async (req, res, next) => {
  const { ids, statute } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw commonErrors.badRequest('Se requiere un array de IDs');
  }

  if (!statute) {
    throw commonErrors.badRequest('Se requiere el campo "statute"');
  }

  const validStatutes = ['En proceso', 'Terminado', 'Entregado'];
  if (!validStatutes.includes(statute)) {
    throw commonErrors.badRequest(`statute debe ser uno de: ${validStatutes.join(', ')}`);
  }

  // Update all cases
  const updatePromises = ids.map(id => 
    Case.update(id, { statute })
  );

  const results = await Promise.all(updatePromises);
  const updatedCases = results.filter(c => c !== null);

  res.status(200).json({
    status: 'success',
    data: {
      updated: updatedCases.length,
      total: ids.length,
      cases: updatedCases
    },
    message: `${updatedCases.length} casos actualizados exitosamente`
  });
});

/**
 * Export cases to CSV (or Excel)
 */
export const exportCases = catchAsync(async (req, res, next) => {
  const { filters, search } = req.query;

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

  // Get all cases without pagination
  const result = await Case.getPaginated({
    page: 1,
    limit: 999999, // Large number to get all
    sortField: 'created_at',
    sortOrder: 'desc',
    search: search || '',
    filters: parsedFilters
  });

  // Here you would format the data for CSV/Excel export
  // For now, just return the data
  res.status(200).json({
    status: 'success',
    data: result.data,
    total: result.total,
    message: `${result.total} casos exportados`
  });
});