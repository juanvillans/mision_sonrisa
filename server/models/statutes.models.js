
import { db } from "../database/postgre.js";

class Statutes {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.color = data.color;
  }

  static async getAll() {
    const statutes = await db("statutes").orderBy("id", "asc");
    return statutes.map((statute) => new Statutes(statute));
  }
}

export default Statutes;
