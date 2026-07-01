import bcrypt from "bcryptjs";

const usersSeed = [
    {
      full_name: "Admin Juan",
      email: "juanvillans16@gmail.com",
      password: "123456",
      status: "activo",
      is_admin: true,
    },
 
  ];

  export async function seed(knex) {
    const count = await knex('users').count('id');
    if (parseInt(count[0].count) > 0) {
      console.log("users already exist. Seeding skipped.");
      return;
    }
  
    for (const user of usersSeed) {
      const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(user.password, salt);
      await knex('users').insert({
        full_name: user.full_name,
        email: user.email,
        password: hashedPassword,
        status: user.status,
        is_admin: user.is_admin,
      });
    }
  }
  
