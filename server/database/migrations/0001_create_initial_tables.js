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
      table.timestamp("created_at").notNullable().defaultTo(knex.raw("CURRENT_TIMESTAMP"));
      table.timestamp("updated_at").notNullable().defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    });
  }

  // 2. Tabla type_of_prosthesis (se mantiene)
  const type_of_prosthesisTableExists = await knex.schema.hasTable("type_of_prosthesis");
  if (!type_of_prosthesisTableExists) {
    await knex.schema.createTable("type_of_prosthesis", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable().unique();
      table.string("color").notNullable();
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
      
      // ✅ ENUM para sexo
      table.enu('sex', ['M', 'F'], {
        useNative: true,
        enumName: 'sex_enum'
      });
      
      table.integer("age");
      table.string("phone");
      table.string("gmail");
      table.string("address");
      table.text("observation");
      table.timestamp("creation_date");
      
      // ✅ ENUM para estatuto (en lugar de FK)
      table.enu('statute', ['En proceso', 'Terminado', 'Entregado'], {
        useNative: true,
        enumName: 'statute_enum'
      }).notNullable();
      
      // FK a type_of_prosthesis
      table.integer("type_of_prosthesis_id")
        .references("id")
        .inTable("type_of_prosthesis");

      // Timestamps
      table.timestamp("created_at")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
      table.timestamp("updated_at")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

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
  await knex.schema.dropTableIfExists("type_of_prosthesis");
  
  // Eliminar ENUMs (PostgreSQL)
  await knex.raw("DROP TYPE IF EXISTS sex_enum");
  await knex.raw("DROP TYPE IF EXISTS statute_enum");
}