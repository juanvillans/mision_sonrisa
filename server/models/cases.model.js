import { db } from "../database/postgre.js";

class Case {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.ci = data.ci;
    this.origin = data.origin;
    this.sex = data.sex;
    this.birth_date = data.birth_date;
    this.age = data.age;
    this.phone = data.phone;
    this.email = data.email;
    this.address = data.address;
    this.type_of_prosthesis = data.type_of_prosthesis;
    this.tooth_color = data.tooth_color;
    this.creation_date = data.creation_date;
    this.number_of_models = data.number_of_models;
    this.is_tdi_completed = data.is_tdi_completed;
    this.tdi_date = data.tdi_date;
    this.number_of_tdi = data.number_of_tdi;
    this.model_only = data.model_only;
    this.model_rodete = data.model_rodete;
    this.is_rdm_completed = data.is_rdm_completed;
    this.rdm_date = data.rdm_date;
    this.is_threaded_completed = data.is_threaded_completed;
    this.threaded_date = data.threaded_date;
    this.is_polished_completed = data.is_polished_completed;
    this.polished_date = data.polished_date;
    this.statute = data.statute;
    this.observation = data.observation;
    
    // Timestamps
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    
    // Formatted dates (para mostrar en frontend)
    this.creation_date_formatted = data.creation_date_formatted;
    this.tdi_date_formatted = data.tdi_date_formatted;
    this.rdm_date_formatted = data.rdm_date_formatted;
    this.threaded_date_formatted = data.threaded_date_formatted;
    this.polished_date_formatted = data.polished_date_formatted;
    this.birth_date_formatted = data.birth_date_formatted;
    this.created_at_formatted = data.created_at_formatted;
    this.updated_at_formatted = data.updated_at_formatted;
  }

  /**
   * Get paginated cases with advanced filtering, sorting, and search
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Records per page
   * @param {string} options.sortField - Field to sort by
   * @param {string} options.sortOrder - Sort order ('asc' or 'desc')
   * @param {string} options.search - Global search term
   * @param {Object} options.filters - Column-specific filters
   * @returns {Promise<{data: Case[], total: number}>}
   */
  static async getPaginated({ 
    page = 1, 
    limit = 25, 
    sortField = 'created_at', 
    sortOrder = 'desc', 
    search = '', 
    filters = {} 
  }) {
    const offset = (page - 1) * limit;

    // Build base query
    let query = db('cases')
      .select(
        'cases.*',
        db.raw('to_char(cases.creation_date, \'YYYY-MM-DD\') as creation_date_formatted'),
        db.raw('to_char(cases.tdi_date, \'YYYY-MM-DD\') as tdi_date_formatted'),
        db.raw('to_char(cases.rdm_date, \'YYYY-MM-DD\') as rdm_date_formatted'),
        db.raw('to_char(cases.threaded_date, \'YYYY-MM-DD\') as threaded_date_formatted'),
        db.raw('to_char(cases.polished_date, \'YYYY-MM-DD\') as polished_date_formatted'),
        db.raw('to_char(cases.birth_date, \'YYYY-MM-DD\') as birth_date_formatted'),
        db.raw('to_char(cases.created_at, \'YYYY-MM-DD HH24:MI:SS\') as created_at_formatted'),
        db.raw('to_char(cases.updated_at, \'YYYY-MM-DD HH24:MI:SS\') as updated_at_formatted')
      );

    // Apply global search across multiple fields
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query = query.where(function() {
        this.where('cases.name', 'ilike', searchTerm)
          .orWhere('cases.ci', 'ilike', searchTerm)
          .orWhere('cases.phone', 'ilike', searchTerm)
          .orWhere('cases.email', 'ilike', searchTerm)
          .orWhere('cases.address', 'ilike', searchTerm)
          .orWhere('cases.type_of_prosthesis', 'ilike', searchTerm)
          .orWhere('cases.tooth_color', 'ilike', searchTerm)
          .orWhere('cases.observation', 'ilike', searchTerm)
          .orWhere('cases.statute', 'ilike', searchTerm);
      });
    }

    // Apply column-specific filters
    if (filters && Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([field, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          // Handle enum filters (exact match)
          if (['origin', 'sex', 'type_of_prosthesis', 'statute'].includes(field)) {
            query = query.where(`cases.${field}`, value);
          } 
          // Handle numeric filters by exact value
          else if (field === 'id') {
            const parsedValue = Number(value);
            if (!Number.isNaN(parsedValue)) {
              query = query.where('cases.id', parsedValue);
            }
          } else if (['number_of_models', 'number_of_tdi'].includes(field)) {
            const parsedValue = Number(value);
            if (!Number.isNaN(parsedValue)) {
              query = query.where(`cases.${field}`, parsedValue);
            }
          }
          // Handle boolean filters
          else if (['is_tdi_completed', 'model_only', 'model_rodete', 'is_rdm_completed', 'is_threaded_completed', 'is_polished_completed'].includes(field)) {
            query = query.where(`cases.${field}`, value === 'true' || value === true);
          }
          // Handle date range filters
          else if (field === 'creation_date' && Array.isArray(value)) {
            const [startDate, endDate] = value;
            if (startDate && endDate) {
              query = query.whereBetween('cases.creation_date', [startDate, endDate]);
            } else if (startDate) {
              query = query.where('cases.creation_date', '>=', startDate);
            } else if (endDate) {
              query = query.where('cases.creation_date', '<=', endDate);
            }
          } else if (field === 'birth_date' && Array.isArray(value)) {
            const [startDate, endDate] = value;
            if (startDate && endDate) {
              query = query.whereBetween('cases.birth_date', [startDate, endDate]);
            } else if (startDate) {
              query = query.where('cases.birth_date', '>=', startDate);
            } else if (endDate) {
              query = query.where('cases.birth_date', '<=', endDate);
            }
          } else if (field === 'creation_date_from') {
            query = query.where('cases.creation_date', '>=', value);
          } else if (field === 'creation_date_to') {
            query = query.where('cases.creation_date', '<=', value);
          }
          // For other fields, use ILIKE for partial matching
          else {
            query = query.where(`cases.${field}`, 'ilike', `%${value}%`);
          }
        }
      });
    }

    // Get total count before pagination
    const totalCountQuery = query.clone().clearSelect().clearOrder().count('cases.id as count').first();

    // Field mapping for sorting
    const fieldMapping = {
      id: 'cases.id',
      name: 'cases.name',
      ci: 'cases.ci',
      origin: 'cases.origin',
      sex: 'cases.sex',
      age: 'cases.age',
      phone: 'cases.phone',
      email: 'cases.email',
      type_of_prosthesis: 'cases.type_of_prosthesis',
      tooth_color: 'cases.tooth_color',
      creation_date: 'cases.creation_date',
      number_of_models: 'cases.number_of_models',
      is_tdi_completed: 'cases.is_tdi_completed',
      tdi_date: 'cases.tdi_date',
      number_of_tdi: 'cases.number_of_tdi',
      model_only: 'cases.model_only',
      model_rodete: 'cases.model_rodete',
      is_rdm_completed: 'cases.is_rdm_completed',
      rdm_date: 'cases.rdm_date',
      is_threaded_completed: 'cases.is_threaded_completed',
      threaded_date: 'cases.threaded_date',
      is_polished_completed: 'cases.is_polished_completed',
      polished_date: 'cases.polished_date',
      statute: 'cases.statute',
      created_at: 'cases.created_at',
      updated_at: 'cases.updated_at',
    };

    // Apply sorting
    const actualSortField = fieldMapping[sortField] || 'cases.created_at';
    query = query.orderBy(actualSortField, sortOrder);

    // Apply pagination
    query = query.limit(parseInt(limit)).offset(offset);

    // Execute queries
    const [cases, totalResult] = await Promise.all([
      query,
      totalCountQuery
    ]);

    const total = parseInt(totalResult.count);

    return {
      data: cases.map(c => new Case(c)),
      total
    };
  }

  /**
   * Get a single case by ID
   * @param {number} id - Case ID
   * @returns {Promise<Case|null>}
   */
  static async getById(id) {
    const query = db('cases')
      .select(
        'cases.*',
        db.raw('to_char(cases.creation_date, \'YYYY-MM-DD\') as creation_date_formatted'),
        db.raw('to_char(cases.tdi_date, \'YYYY-MM-DD\') as tdi_date_formatted'),
        db.raw('to_char(cases.rdm_date, \'YYYY-MM-DD\') as rdm_date_formatted'),
        db.raw('to_char(cases.threaded_date, \'YYYY-MM-DD\') as threaded_date_formatted'),
        db.raw('to_char(cases.polished_date, \'YYYY-MM-DD\') as polished_date_formatted'),
        db.raw('to_char(cases.birth_date, \'YYYY-MM-DD\') as birth_date_formatted'),
        db.raw('to_char(cases.created_at, \'YYYY-MM-DD HH24:MI:SS\') as created_at_formatted'),
        db.raw('to_char(cases.updated_at, \'YYYY-MM-DD HH24:MI:SS\') as updated_at_formatted')
      )
      .where('cases.id', id);

    const caseData = await query.first();
    return caseData ? new Case(caseData) : null;
  }

  /**
   * Create a new case
   * @param {Object} caseData - Case data
   * @returns {Promise<Case>}
   */
  static async create(caseData) {
    const [newCase] = await db("cases")
      .insert({
        ...caseData,
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      })
      .returning("*");

    return new Case(newCase);
  }

  /**
   * Update an existing case
   * @param {number} id - Case ID
   * @param {Object} caseData - Updated case data
   * @returns {Promise<Case|null>}
   */
  static async update(id, caseData) {
    const [updated] = await db("cases")
      .where("id", id)
      .update({
        ...caseData,
        updated_at: db.fn.now()
      })
      .returning("*");

    return updated ? new Case(updated) : null;
  }

  /**
   * Delete a case
   * @param {number} id - Case ID
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const deleted = await db("cases")
      .where("id", id)
      .del();

    return deleted > 0;
  }

  /**
   * Get all unique origin values
   * @returns {Promise<string[]>}
   */
  static async getOrigins() {
    const results = await db('cases')
      .distinct('origin')
      .whereNotNull('origin')
      .orderBy('origin');
    return results.map(r => r.origin);
  }

  /**
   * Get all unique type_of_prosthesis values
   * @returns {Promise<string[]>}
   */
  static async getProsthesisTypes() {
    const results = await db('cases')
      .distinct('type_of_prosthesis')
      .whereNotNull('type_of_prosthesis')
      .orderBy('type_of_prosthesis');
    return results.map(r => r.type_of_prosthesis);
  }

  /**
   * Get statistics for dashboard
   * @returns {Promise<Object>}
   */
  static async getStats() {
    const stats = await db('cases')
      .select(
        db.raw('COUNT(*) as total'),
        db.raw(`COUNT(*) FILTER (WHERE statute = 'En proceso') as in_process`),
        db.raw(`COUNT(*) FILTER (WHERE statute = 'Pulido/Terminado') as completed`),
        db.raw(`COUNT(*) FILTER (WHERE statute = 'Entregado') as delivered`)
      )
      .first();

    // Get counts by type of prosthesis
    const prosthesisStats = await db('cases')
      .select('type_of_prosthesis')
      .count('* as count')
      .groupBy('type_of_prosthesis');

    return {
      ...stats,
      by_prosthesis_type: prosthesisStats
    };
  }
}

export default Case;