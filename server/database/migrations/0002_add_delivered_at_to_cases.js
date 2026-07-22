export async function up(knex){
  await knex.schema.table("cases", (table) => {
    table.timestamp("delivered_at").nullable();
  });
};

export async function down(knex)  {
  await knex.schema.table("cases", (table) => {
    table.dropColumn("delivered_at");
  });
};