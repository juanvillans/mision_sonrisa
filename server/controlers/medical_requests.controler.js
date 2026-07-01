import MedicalRequest from '../models/medicalRequest.model.js';
import { catchAsync, commonErrors } from "../middlewares/error.middleware.js";

/**
 * Get all medical requests with pagination, sorting, filtering, and search
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Records per page (default: 25)
 * - sortField: Field to sort by (default: 'created_at')
 * - sortOrder: Sort order 'asc' or 'desc' (default: 'desc')
 * - search: Global search term
 * - filters: JSON string of column-specific filters
 */
export const getMedicalRequests = catchAsync(async (req, res, next) => {
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
  const result = await MedicalRequest.getPaginated({
    page: parseInt(page),
    limit: parseInt(limit),
    sortField,
    sortOrder,
    search,
    filters: parsedFilters
  });

  res.status(200).json({
    status: 'success',
    cases: {
      data: result.data,
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
});

/**
 * Get a single medical request by ID
 */
export const getMedicalRequestById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const medicalRequest = await MedicalRequest.getById(id);

  if (!medicalRequest) {
    throw commonErrors.notFound('Solicitud médica');
  }

  res.status(200).json({
    status: 'success',
    data: medicalRequest
  });
});

/**
 * Create a new medical request
 */
export const createMedicalRequest = catchAsync(async (req, res, next) => {
  // Filter out fields that don't belong to medical_requests table
  const { statute_name, statute_color, creation_date_formatted, status_date_formatted, created_at_formatted, ...medicalRequestData } = req.body;

  const medicalRequest = await MedicalRequest.create(medicalRequestData);

  res.status(201).json({
    status: 'success',
    data: medicalRequest,
    message: 'Solicitud médica creada exitosamente'
  });
});

/**
 * Update an existing medical request
 */
export const updateMedicalRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Filter out fields that don't belong to medical_requests table (read-only fields from JOINs)
  const { statute_name, statute_color, creation_date_formatted, status_date_formatted, created_at_formatted, ...medicalRequestData } = req.body;

  const medicalRequest = await MedicalRequest.update(id, medicalRequestData);

  if (!medicalRequest) {
    throw commonErrors.notFound('Solicitud médica');
  }

  res.status(200).json({
    status: 'success',
    data: medicalRequest,
    message: 'Solicitud médica actualizada exitosamente'
  });
});

/**
 * Delete a medical request
 */
export const deleteMedicalRequest = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deleted = await MedicalRequest.delete(id);

  if (!deleted) {
    throw commonErrors.notFound('Solicitud médica');
  }

  res.status(200).json({
    status: 'success',
    message: 'Solicitud médica eliminada exitosamente'
  });
});


