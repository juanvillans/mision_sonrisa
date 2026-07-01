import { db } from "../database/postgre.js";

class Exams {
  constructor(data) {
    this.id = data.id || null;
    this.tests_values = data.tests_values;
    this.examination_type_id = data.examination_type_id;
    this.validated = data.validated;
    this.method = data.method;
    this.observation = data.observation;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
  static async createWithTransaction(trx, examData) {
    try {
      const [exam] = await trx("exams")
        .insert({
          examination_type_id: examData.testTypeId,
          validated: examData.validated,
          method: examData.method,
          observation: examData.observation,
          tests_values: JSON.stringify(examData.tests_values),
          // Remove created_at and updated_at - let database handle defaults
        })
        .returning("*");
        
      return new Exams({ ...exam });
    } catch (error) {
      if (error.code === "23505") {
        throw new Error("Exam with this CI already exists");
      } else if (error.code === "23503") {
        throw new Error("Invalid examination type ID");
      }
      throw error;
    }
  }

  static async getAll() {
    const exams = await db("exams")
      .join(
        "examination_types",
        "exams.examination_type_id",
        "examination_types.id"
      )
      .select(
        "exams.*",
        "examination_types.name as examination_type_name",
        db.raw("to_char(exams.date_birth, 'YYYY-MM-DD') as date_birth")
      );

    return exams.map((exam) => new Exams(exam));
  }

  static async getDetailedCountByPeriod(period, start_date, end_date) {
    let query = db("exams");
    const today = new Date();

    switch (period) {
      case "today":
        query.where("created_at", ">=", new Date(today.setHours(0, 0, 0, 0)));
        break;
      case "this_week":
        const lastSunday = new Date(
          today.setDate(today.getDate() - today.getDay())
        );
        lastSunday.setHours(0, 0, 0, 0); // Start of the day
        query.where("created_at", ">=", lastSunday);
        break;
      case "this_month":
        const firstDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );
        firstDayOfMonth.setHours(0, 0, 0, 0);
        query.where("created_at", ">=", firstDayOfMonth);
        break;
      case "this_year":
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        firstDayOfYear.setHours(0, 0, 0, 0);
        query.where("created_at", ">=", firstDayOfYear);
        break;
      case "range":
        query.whereBetween("created_at", [start_date, end_date]);
        break;
      default:
        throw new Error("Invalid period specified");
    }

    const result = await query
      .select(
        db.raw("COUNT(*) as total"),
        db.raw("COUNT(CASE WHEN validated = true THEN 1 END) as validated"),
        db.raw("COUNT(CASE WHEN validated = false THEN 1 END) as not_validated"),
      )
      .first();

    return {
      total: parseInt(result.total),
      validated: parseInt(result.validated),
      not_validated: parseInt(result.not_validated),
    };
  }

  static async getTotalPerExaminationTypeByPeriod(period,  start_date, end_date) {
    let query = db("exams")
      .join(
        "examination_types",
        "exams.examination_type_id",
        "examination_types.id"
      )
     

    const today = new Date();

    switch (period) {
      case "today":
        query.where("exams.created_at", ">=", new Date(today.setHours(0, 0, 0, 0)));
        break;
      case "this_week":
        const startOfWeek = new Date(
          today.setDate(today.getDate() - today.getDay())
        );
        startOfWeek.setHours(0, 0, 0, 0);
        query.where("exams.created_at", ">=", startOfWeek);
        break;
      case "this_month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        query.where("exams.created_at", ">=", startOfMonth);
        break;
      case "this_year":
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        startOfYear.setHours(0, 0, 0, 0);
        query.where("exams.created_at", ">=", startOfYear);
        break;
      case "range":
        query.whereBetween("exams.created_at", [start_date, end_date]);
        break;
      default:
        throw new Error("Invalid period specified");
    }
    query.select(
      db.raw("examination_types.name as id"), // Utiliza 'name' como 'id'
      db.raw("examination_types.name as label"), // Renombra 'name' a 'label'
      db.raw("COUNT(*) as value"), // Renombra 'total' a 'value' //get the test_value json
      db.raw("exams.tests_values as tests_values")
  )
   .groupBy("examination_types.name", "exams.tests_values");
     
    return query;
  }


  static async findById(id) {
    const exam = await db("exams").where("id", id).first();

    return exam ? new Exams(exam) : null;
  }

  static async delete(id) {
    try {
      await db("exams").where("id", id).del();
      return true;
    } catch (error) {
      throw new Error("Failed to delete exam");
    }
  }

  static async deleteMultipleWithTransaction(trx, examIds) {
    try {
      if (examIds.length > 0) {
        await trx("exams").whereIn("id", examIds).del();
      }
      return true;
    } catch (error) {
      throw new Error("Failed to delete exams");
    }
  }

  static async deleteMultiple(examIds) {
    try {
      if (examIds.length > 0) {
        await db("exams").whereIn("id", examIds).del();
      }
      return true;
    } catch (error) {
      throw new Error("Failed to delete exams");
    }
  }
}

export default Exams;
