// Aquí tienes los códigos hexadecimales sugeridos para cada estatus:
// 📊 Paleta de Colores para Gestión de Casos
// | Estatus | Color Sugerido | Hex Code | Por qué este tono |
// |---|---|---|---|
// | Llamada 1 (Rojo) | Rojo Suave | #E53935 | Alerta inicial, pero legible. |
// | Llamada 2 (Amarillo) | Ámbar | #FFB300 | Un amarillo más oscuro para que no se pierda con el texto blanco o negro. |
// | Llamada 3 (Verde) | Verde Esmeralda | #43A047 | Indica progreso positivo en el contacto. |
// | Desconoce/Fuera (Morado) | Púrpura Profundo | #8E24AA | Un color neutro para casos que no entran en el flujo estándar. |
// | Solucionó solo (Celeste) | Azul Cielo | #039BE5 | Transmite tranquilidad; un caso menos de qué preocuparse. |
// | Fallecido (Anaranjado) | Naranja Quemado | #F4511E | Un tono serio y distintivo para evitar errores de gestión. |
// | En proceso (Azul Marino) | Azul Eléctrico Oscuro | #1A237E | Transmite seriedad y trabajo activo. |
// | Resuelto (Marrón) | Café Suave | #6D4C41 | Color de "tierra", indica algo finalizado y sólido. |

const statutesSeed = [
    { name: "Por solucionar", color: "#ffffff" },
    { name: "Llamada 1", color: "#a10300" },
    { name: "Llamada 2", color: "#FFB300" },
    { name: "Llamada 3", color: "#43A047" },
    { name: "Desconoce/Fuera", color: "#8E24AA" },
    { name: "Solucionó solo", color: "#039BE5" },
    { name: "Fallecido", color: "#ff7738" },
    { name: "En proceso", color: "#1A237E" },
    { name: "Resuelto", color: "#6D4C41" },
  ];
  
  export async function seed(knex) {
    // Verifica si ya hay registros
    const count = await knex("statutes").count("id");
    if (parseInt(count[0].count) > 0) {
      console.log("Reseteando tabla statutes...");
      await knex.raw("ALTER SEQUENCE statutes_id_seq RESTART WITH 1");
      await knex("statutes").del();
    }
  
    // Inserta los nuevos registros
    await knex("statutes").insert(statutesSeed);
    console.log("✅ Seed de statutes completado correctamente.");
  }
  