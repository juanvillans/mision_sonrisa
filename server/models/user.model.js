import { db } from "../database/postgre.js";


class User {
  constructor(userData) {
    this.id = userData.id;
    this.full_name = userData.full_name;
    this.email = userData.email;
    this.password = userData.password;
    this.status = userData.status;
    this.is_admin = userData.is_admin;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }



  
  
  

  // Create a new user (admin-created flow)
  static async create(userData) {
    try {
      const [user] = await db("users")
        .insert({
          full_name: userData.full_name.trim(),
          email: userData.email.toLowerCase().trim(),
          status: "pendiente", // Default status
          is_admin: userData.is_admin,
          created_at: db.fn.now(),
          updated_at: db.fn.now(),
        })
        .returning("*");

      return new User(user);
    } catch (error) {
      if (error.code === "23505") {
        // PostgreSQL unique violation error code
        throw new Error("User with this email already exists");
      }
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const user = await db("users")
      .where("email", email.toLowerCase().trim())
      .first();

    return user ? new User(user) : null;
  }

  // Find user by ID
  static async findById(id) {
    const user = await db("users").where("id", id).first();

    return user ? new User(user) : null;
  }

  static async findUsers(params) {
    // Default to page 1 if page is 0 or not provided
    const page = params.page <= 0 ? 1 : parseInt(params.page) || 1;
    const pageSize = parseInt(params.pageSize) || 10;
    // Default sort if not provided
    const sort = params.sort || "created_at:desc";
    const [sortField, sortDirection] = sort.split(":");

    // Use default sort field/direction if parsing failed
    const validSortField = sortField || "created_at";
    const validSortDirection = ["asc", "desc"].includes(
      sortDirection?.toLowerCase()
    )
      ? sortDirection.toLowerCase()
      : "desc";

    const baseQuery = db("users");

    if (params.filters) {
      try {
        const filters = JSON.parse(params.filters);

        const { field, operator, value } = filters;

        // Skip if any required property is missing
        if (!field || !operator || value === undefined) return;

        // Apply different operators
        switch (operator) {
          case "contains":
            baseQuery.whereILike(field, `%${value}%`);
            break;
          case "doesNotContain":
            baseQuery.whereNotILike(field, `%${value}%`);
            break;
          case "equals":
            baseQuery.where(field, value);
            break;
          case "startsWith":
            baseQuery.whereILike(field, `${value}%`);
            break;
          case "endsWith":
            baseQuery.whereILike(field, `%${value}`);
            break;
          // Add more operators as needed
        }
      } catch (e) {
        console.error("Invalid filters JSON:", e);
      }
    }

    try {
      const countQuery = baseQuery.clone().count("* as count").first();

      // Add pagination and sorting to the main query
      const usersQuery = baseQuery
        .select("*")
        .orderBy(sortField, sortDirection)
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      // Execute both queries in parallel
      const [users, countResult] = await Promise.all([usersQuery, countQuery]);

      return {
        users: users.map((user) => new User(user)),
        totalCount: parseInt(countResult.count),
      };
    } catch (error) {
      console.error("Error in findUsers:", error);
      throw error;
    }
  }

  static async getAllUsers() {
    const users = await db("users").select("*");
    return users.map((user) => new User(user));
  }

  // Static method to update user by ID
  static async updateById(id, updateData) {
    // Define updatable fields and their sanitizers
    const fieldSanitizers = {
      full_name: (val) => val.trim(),
      // email: (val) => val.toLowerCase().trim(), // Remove this line
      password: (val) => val, // Note: You should hash this before updating
      status: (val) => val,
      is_admin: (val) => val,
    };

    // Build safe updates
    const updates = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (fieldSanitizers[key] && value !== undefined) {
        updates[key] = fieldSanitizers[key](value);
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("Campos inválidos para actualizar");
    }

    updates.updated_at = db.fn.now();

    try {
      const [updatedUser] = await db("users")
        .where("id", id)
        .update(updates)
        .returning("*");

      return new User(updatedUser);
    } catch (error) {
      // Handle errors...
    }
  }

  // Helper function to convert various input types to boolean
  convertToBoolean(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const lowerValue = value.toLowerCase();
      return lowerValue === "true" || lowerValue === "1";
    }
    return Boolean(value);
  }

  // Delete user
  static async delete(id) {
    try {
      await db("users").where("id", id).del();
      return true;
    } catch (error) {
      throw new Error("Failed to delete user");
    }
  }

  // Convert to JSON (exclude password)
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

export default User;
