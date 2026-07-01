export async function up(knex) {
  // Create trigger function for updated_at
  await knex.raw(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

  // Check if table exists before creating

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

  {
    /**
  const examTypesExists = await knex.schema.hasTable("examination_types");
  if (!examTypesExists) {
    await knex.schema.createTable("examination_types", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable().unique();
      table.jsonb("tests").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
  }
  
  */
  }

  const statutesTableExists = await knex.schema.hasTable("statutes");
  if (!statutesTableExists) {
    await knex.schema.createTable("statutes", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable().unique();
      table.string("color").notNullable();
    });
  }

  const medicalRequestsTableExists = await knex.schema.hasTable(
    "medical_requests"
  );
  if (!medicalRequestsTableExists) {
    await knex.schema.createTable("medical_requests", (table) => {
      table.increments("id").primary();

      // Campos del Excel traducidos
      table.string("code").notNullable(); // CODIGO
      table.string("identification_number"); // CEDULA
      table.string("complainant").notNullable(); // DENUNCIANTE
      table.string("phone"); // TELEFONO
      table.string("state").notNullable(); // ESTADO
      table.string("municipality").notNullable(); // MUNICIPIO
      table.string("parish"); // PARROQ
      table.string("health_center"); // CENTRO DE SALUD
      table.text("description"); // DESCRIP
      table.string("subcategory"); // SUBCATEG
      table.string("extended_category"); // EXTCATEG
      table.text("request"); // SOLICITUD
      table.text("requirement"); // REQUERIMIENTO
      table.timestamp("creation_date"); // FECHA CREACION
      table.timestamp("status_date"); // FECHA STATUS
      table.integer("statute_id").references("id").inTable("statutes");

      // Campos de control
      table.integer("import_batch_id");
      table
        .timestamp("created_at")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));
      table
        .timestamp("updated_at")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP"));

      // Índices
      table.index("code");
      table.index("identification_number");
      table.index("statute_id");
    });
  }

  // Crear tabla para lotes de importación (opcional pero recomendado)
  const importBatchesTableExists = await knex.schema.hasTable("import_batches");
  if (!importBatchesTableExists) {
    await knex.schema.createTable("import_batches", (table) => {
      table.increments("id").primary();
      table.string("filename").notNullable();
      table.integer("total_records");
      table.integer("imported_records");
      table.integer("failed_records");
      table.jsonb("errors");
      table.string("status");
      table.timestamp("completed_at"); // Campo para marcar la fecha de finalización del lote de importación (opcional)
      table.integer("user_id").references("id").inTable("users").notNullable();
      
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

  

  // Apply trigger to other tables
  await knex.raw(`
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
}

export async function down(knex) {
  // Eliminar triggers primero
  await knex.raw("DROP TRIGGER IF EXISTS update_users_updated_at ON users");

  // Eliminar función
  await knex.raw("DROP FUNCTION IF EXISTS update_updated_at_column()");

  // Eliminar tablas en orden correcto (por dependencias)
  await knex.schema.dropTableIfExists("medical_requests");
  await knex.schema.dropTableIfExists("import_batches");
  await knex.schema.dropTableIfExists("statutes");

}
