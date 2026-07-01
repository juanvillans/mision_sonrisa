import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Script para probar la lectura de archivos Excel con caracteres especiales
 */
async function testExcelEncoding() {
  try {
    console.log('🧪 Testing Excel Encoding...\n');

    // Ruta al archivo de prueba (ajusta según tu archivo)
    const testFilePath = path.join(__dirname, '../../uploads/test.xlsx');
    
    console.log(`📁 Leyendo archivo: ${testFilePath}\n`);

    // Leer con configuración UTF-8
    const workbook = xlsx.readFile(testFilePath, {
      type: 'file',
      codepage: 65001, // UTF-8 encoding
      cellDates: true,
      cellNF: false,
      cellText: false
    });

    const sheetName = workbook.SheetNames[0];
    console.log(`📄 Hoja: ${sheetName}\n`);

    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: '',
      blankrows: false
    });

    console.log(`📊 Total de filas: ${data.length}\n`);

    // Mostrar las primeras 3 filas para verificar encoding
    console.log('🔍 Primeras 3 filas:\n');
    data.slice(0, 3).forEach((row, index) => {
      console.log(`--- Fila ${index + 1} ---`);
      Object.entries(row).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
      console.log('');
    });

    // Buscar campos con caracteres especiales
    console.log('🔤 Buscando caracteres especiales (á, é, í, ó, ú, ñ, Ñ)...\n');
    
    const specialCharsRegex = /[áéíóúñÑÁÉÍÓÚ]/;
    let foundSpecialChars = false;

    data.forEach((row, rowIndex) => {
      Object.entries(row).forEach(([key, value]) => {
        if (typeof value === 'string' && specialCharsRegex.test(value)) {
          console.log(`✓ Fila ${rowIndex + 2}: ${key} = "${value}"`);
          foundSpecialChars = true;
        }
      });
    });

    if (!foundSpecialChars) {
      console.log('⚠️  No se encontraron caracteres especiales en el archivo');
    }

    console.log('\n✅ Test completado!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testExcelEncoding();
}

export default testExcelEncoding;

