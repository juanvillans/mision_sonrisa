import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Script para probar la lectura de números de teléfono desde Excel
 */
async function testPhoneNumbers() {
  try {
    console.log('🧪 Testing Phone Number Reading from Excel...\n');

    // Ruta al archivo de prueba (ajusta según tu archivo)
    const testFilePath = path.join(__dirname, '../../uploads/test.xlsx');
    
    console.log(`📁 Leyendo archivo: ${testFilePath}\n`);

    // Leer con raw: true para mantener números como números
    const workbook = xlsx.readFile(testFilePath, {
      cellText: false,
      cellDates: true,
      cellNF: false
    });

    const sheetName = workbook.SheetNames[0];
    console.log(`📄 Hoja: ${sheetName}\n`);

    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, {
      raw: true,
      defval: '',
      blankrows: false
    });

    console.log(`📊 Total de filas: ${data.length}\n`);

    // Helper para convertir números a string sin notación científica
    const toString = (value) => {
      if (value === null || value === undefined) return '';
      
      if (typeof value === 'number') {
        // Para números grandes (como teléfonos), evitar notación científica
        if (value > 999999999) {
          return Math.floor(value).toString();
        }
        return value.toString();
      }
      
      return String(value).trim();
    };

    // Mostrar las primeras 5 filas con enfoque en teléfonos
    console.log('🔍 Primeras 5 filas (enfoque en teléfonos):\n');
    data.slice(0, 5).forEach((row, index) => {
      console.log(`--- Fila ${index + 1} ---`);
      
      // Buscar campos de teléfono
      const phoneFields = ['TELEFONO', 'Teléfono', 'telefono', 'PHONE', 'Phone'];
      let phoneValue = null;
      let phoneKey = null;
      
      for (const field of phoneFields) {
        if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
          phoneValue = row[field];
          phoneKey = field;
          break;
        }
      }
      
      if (phoneValue !== null) {
        console.log(`  Campo: ${phoneKey}`);
        console.log(`  Valor original: ${phoneValue}`);
        console.log(`  Tipo: ${typeof phoneValue}`);
        console.log(`  Convertido: ${toString(phoneValue)}`);
        
        // Verificar si tiene notación científica
        if (typeof phoneValue === 'number' && phoneValue.toString().includes('e')) {
          console.log(`  ⚠️  NOTACIÓN CIENTÍFICA DETECTADA: ${phoneValue.toString()}`);
          console.log(`  ✅ Corregido a: ${toString(phoneValue)}`);
        }
      } else {
        console.log(`  ⚠️  No se encontró campo de teléfono`);
      }
      
      console.log('');
    });

    // Estadísticas de teléfonos
    console.log('📈 Estadísticas de Teléfonos:\n');
    
    let totalPhones = 0;
    let scientificNotation = 0;
    let validPhones = 0;
    
    data.forEach(row => {
      const phoneFields = ['TELEFONO', 'Teléfono', 'telefono', 'PHONE', 'Phone'];
      let phoneValue = null;
      
      for (const field of phoneFields) {
        if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
          phoneValue = row[field];
          break;
        }
      }
      
      if (phoneValue !== null) {
        totalPhones++;
        
        if (typeof phoneValue === 'number') {
          if (phoneValue.toString().includes('e')) {
            scientificNotation++;
          }
          
          const converted = toString(phoneValue);
          if (converted.length >= 10 && converted.length <= 15) {
            validPhones++;
          }
        }
      }
    });
    
    console.log(`  Total de teléfonos encontrados: ${totalPhones}`);
    console.log(`  Con notación científica: ${scientificNotation}`);
    console.log(`  Teléfonos válidos (10-15 dígitos): ${validPhones}`);
    
    console.log('\n✅ Test completado!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testPhoneNumbers();
}

export default testPhoneNumbers;

