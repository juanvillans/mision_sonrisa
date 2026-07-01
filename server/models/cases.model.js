
import { db } from "../database/postgre.js";

class MedicalRequest {
  constructor(data) {
    this.id = data.id;
    this.code = data.code;
    this.ci = data.ci;
    this.name = data.name;
    this.phone = data.phone;
    this.state = data.state;
    this.municipality = data.municipality;
    this.parish = data.parish;
    this.health_center = data.health_center;
    this.description = data.description;
    this.subcategory = data.subcategory;
    this.extended_category = data.extended_category;
    this.request = data.request;
    this.requirement = data.requirement;
    this.creation_date = data.creation_date;
    this.status_date = data.status_date;
    this.statute_id = data.statute_id;
    this.statute = data.statute; // For joined data
    this.statute_name = data.statute_name; // Statute name from JOIN
    this.statute_color = data.statute_color; // Statute color from JOIN
    this.import_batch_id = data.import_batch_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    // Formatted dates
    this.creation_date_formatted = data.creation_date_formatted;
    this.status_date_formatted = data.status_date_formatted;
    this.created_at_formatted = data.created_at_formatted;
  }

  /**
   * Get paginated medical requests with advanced filtering, sorting, and search
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Records per page
   * @param {string} options.sortField - Field to sort by
   * @param {string} options.sortOrder - Sort order ('asc' or 'desc')
   * @param {string} options.search - Global search term
   * @param {Object} options.filters - Column-specific filters
   * @returns {Promise<{data: MedicalRequest[], total: number}>}
   */
  static async getPaginated({ page = 1, limit = 25, sortField = 'created_at', sortOrder = 'desc', search = '', filters = {} }) {
    const offset = (page - 1) * limit;

    // Build base query with statute join
    let query = db('medical_requests')
      .leftJoin('statutes', 'medical_requests.statute_id', 'statutes.id')
      .select(
        'medical_requests.*',
        db.raw('to_char(medical_requests.creation_date, \'YYYY-MM-DD\') as creation_date_formatted'),
        db.raw('to_char(medical_requests.status_date, \'YYYY-MM-DD\') as status_date_formatted'),
        db.raw('to_char(medical_requests.created_at, \'YYYY-MM-DD HH24:MI:SS\') as created_at_formatted'),
        'statutes.name as statute_name',
        'statutes.color as statute_color'
      );

    // Apply global search across multiple fields
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query = query.where(function() {
        this.where('medical_requests.code', 'ilike', searchTerm)
          .orWhere('medical_requests.ci', 'ilike', searchTerm)
          .orWhere('medical_requests.name', 'ilike', searchTerm)
          .orWhere('medical_requests.phone', 'ilike', searchTerm)
          .orWhere('medical_requests.state', 'ilike', searchTerm)
          .orWhere('medical_requests.municipality', 'ilike', searchTerm)
          .orWhere('medical_requests.parish', 'ilike', searchTerm)
          .orWhere('medical_requests.health_center', 'ilike', searchTerm)
          .orWhere('medical_requests.description', 'ilike', searchTerm)
          .orWhere('medical_requests.subcategory', 'ilike', searchTerm)
          .orWhere('medical_requests.extended_category', 'ilike', searchTerm)
          .orWhere('statutes.name', 'ilike', searchTerm);
      });
    }

    // Apply column-specific filters
    if (filters && Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([field, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          // Handle statute filter specially (it's a joined field)
          if (field === 'statute_name') {
            query = query.where('statutes.name', 'ilike', `%${value}%`);
          } else if (field === 'statute_id') {
            query = query.where('medical_requests.statute_id', value);
          } else {
            // For other fields, use ILIKE for partial matching
            query = query.where(`medical_requests.${field}`, 'ilike', `%${value}%`);
          }
        }
      });
    }

    // Get total count before pagination
    const totalCountQuery = query.clone().clearSelect().clearOrder().count('medical_requests.id as count').first();

    // Field mapping for sorting
    const fieldMapping = {
      id: 'medical_requests.id',
      code: 'medical_requests.code',
      ci: 'medical_requests.ci',
      name: 'medical_requests.name',
      phone: 'medical_requests.phone',
      state: 'medical_requests.state',
      municipality: 'medical_requests.municipality',
      parish: 'medical_requests.parish',
      health_center: 'medical_requests.health_center',
      subcategory: 'medical_requests.subcategory',
      extended_category: 'medical_requests.extended_category',
      statute_name: 'statutes.name',
      statute_id: 'medical_requests.statute_id',
      
      creation_date: 'medical_requests.creation_date',
      status_date: 'medical_requests.status_date',
      created_at: 'medical_requests.created_at',
      updated_at: 'medical_requests.updated_at',
    };

    // Apply sorting
    const actualSortField = fieldMapping[sortField] || 'medical_requests.created_at';
    query = query.orderBy(actualSortField, sortOrder);

    // Apply pagination
    query = query.limit(parseInt(limit)).offset(offset);

    // Execute queries
    const [medicalRequests, totalResult] = await Promise.all([
      query,
      totalCountQuery
    ]);

    const total = parseInt(totalResult.count);

    return {
      data: medicalRequests.map(mr => new MedicalRequest(mr)),
      total
    };
  }

 
  static async create(medicalRequestData) {
    const [medicalRequest] = await db("medical_requests")
      .insert(medicalRequestData)
      .returning("*");

    return new MedicalRequest(medicalRequest);
  }

  static async update(id, medicalRequestData) {
    const [updated] = await db("medical_requests")
      .where("id", id)
      .update({
        ...medicalRequestData,
        updated_at: db.fn.now()
      })
      .returning("*");

    return updated ? new MedicalRequest(updated) : null;
  }

  static async delete(id) {
    const deleted = await db("medical_requests")
      .where("id", id)
      .del();

    return deleted > 0;
  }
}

export default MedicalRequest;
