export async function up(knex) {
  // ... trigger function ...

  // 1. Tabla users (sin cambios)
  const usersTableExists = await knex.schema.hasTable("users");
  if (!usersTableExists) {
    await knex.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.string("full_name").notNullable();
      table.string("email").notNullable().unique();
      table.string("password");
      table.string("status").notNullable();
      table.boolean("is_admin").notNullable().defaultTo(false);
      table
        .timestamp("created_at")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
      table
        .timestamp("updated_at")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    });
  }

  // 3. Tabla cases (sin statutes)
  const casesTableExists = await knex.schema.hasTable("cases");
  if (!casesTableExists) {
    await knex.schema.createTable("cases", (table) => {
      table.increments("id").primary();

      // Campos del Excel
      table.string("code").notNullable().unique();
      table.string("name").notNullable();
      table.string("ci");

      table.enu("Origin", ["Misión sonrisa", "1x10"], {
        useNative: true,
        enumName: "origin_enum",
      });

      table.enu("sex", ["M", "F"], {
        useNative: true,
        enumName: "sex_enum",
      });

      table.date("birth_date");
      table.integer("age");
      table.string("phone");
      table.string("email");
      table.text("address");
      table
        .enu(
          "type_of_prosthesis",
          [
            "Total",
            "Total Bimaxilar",
            "Total Superior",
            "Total Inferior",
            "Parcial",
            "Parcial Bimaxilar",
            "Parcial Superior",
            "Parcial Inferior",
          ],
          {
            useNative: true,
            enumName: "prosthesis_type_enum",
          },
        )
        .notNullable();

      table.string("tooth_color");

        
      table.date("creation_date");
      table.integer("number_of_models");

      table.boolean("is_tdi_completed").defaultTo(false);
      table.date("tdi_date"); 
      table.integer("number_of_tdi");

      table.boolean("model_only").defaultTo(false);
      table.boolean("model_rodete").defaultTo(false);

      table.boolean("is_rdm_completed").defaultTo(false);
      table.date("rdm_date"); 

      table.boolean("is_threaded_completed").defaultTo(false);
      table.date("threaded_date"); 

      table.boolean("is_polished_completed").defaultTo(false);
      table.date("polished_date"); 

      table
        .enu("statute", ["En proceso", "Terminado", "Entregado"], {
          useNative: true,
          enumName: "statute_enum",
        })
        .notNullable();

      // Timestamps
      table
        .timestamp("created_at")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
      table
        .timestamp("updated_at")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
      table.text("observation");

      // Índices
      table.unique("code");
      table.index("ci");
      table.index("name");
      table.index("statute"); // Índice para el ENUM
    });
  }

  // Triggers
  await knex.raw(`
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);

  await knex.raw(`
    CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex) {
  // Eliminar triggers
  await knex.raw("DROP TRIGGER IF EXISTS update_users_updated_at ON users");
  await knex.raw("DROP TRIGGER IF EXISTS update_cases_updated_at ON cases");

  // Eliminar función
  await knex.raw("DROP FUNCTION IF EXISTS update_updated_at_column()");

  // Eliminar tablas (orden correcto)
  await knex.schema.dropTableIfExists("cases");

  // Eliminar ENUMs (PostgreSQL)

  await knex.raw("DROP TYPE IF EXISTS sex_enum");
  await knex.raw("DROP TYPE IF EXISTS origin_enum");
  await knex.raw("DROP TYPE IF EXISTS statute_enum");
}
