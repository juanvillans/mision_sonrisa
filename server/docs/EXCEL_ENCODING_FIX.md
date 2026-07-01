# Solución para Caracteres Especiales en Excel

## 🔍 Problema
Los caracteres especiales (acentos, ñ, etc.) no se estaban leyendo correctamente al importar archivos Excel, mostrando caracteres extraños o símbolos en lugar de:
- Acentos: á, é, í, ó, ú, Á, É, Í, Ó, Ú
- Letra ñ: ñ, Ñ
- Otros caracteres especiales del español

## ✅ Soluciones Implementadas

### 1. Configuración de Lectura de Excel (xlsx)

**Archivo:** `server/models/excel_import.model.js`

Se agregó configuración UTF-8 al leer archivos Excel:

```javascript
const workbook = xlsx.readFile(filePath, {
  type: 'file',
  codepage: 65001, // UTF-8 encoding para soportar acentos y ñ
  cellDates: true,
  cellNF: false,
  cellText: false
});

const data = xlsx.utils.sheet_to_json(worksheet, {
  raw: false, // Convertir valores a strings para preservar formato
  defval: '', // Valor por defecto para celdas vacías
  blankrows: false // Ignorar filas vacías
});
```

**Parámetros importantes:**
- `codepage: 65001` - Especifica UTF-8 encoding
- `raw: false` - Convierte valores a strings preservando el formato original
- `cellDates: true` - Maneja fechas correctamente

### 2. Configuración de Base de Datos PostgreSQL

**Archivo:** `server/config/knexfile.js`

Se agregó configuración para asegurar que PostgreSQL use UTF-8:

```javascript
connection: {
  // ... otras configuraciones
  charset: 'utf8'
},
pool: {
  min: 2,
  max: 10,
  afterCreate: (conn, done) => {
    // Asegurar que la conexión use UTF-8 para PostgreSQL
    conn.query('SET CLIENT_ENCODING TO UTF8;', (err) => {
      done(err, conn);
    });
  }
}
```

## 🧪 Cómo Probar

### Opción 1: Script de Prueba

Ejecuta el script de prueba con un archivo Excel:

```bash
node server/scripts/test-excel-encoding.js
```

Este script:
- Lee un archivo Excel de prueba
- Muestra las primeras 3 filas
- Busca y resalta caracteres especiales
- Verifica que se lean correctamente

### Opción 2: Importación Real

1. Prepara un archivo Excel con datos que contengan:
   - Descripción: "Atención médica en el área de pediatría"
   - Municipio: "Maracaibo"
   - Parroquia: "Bolívar"
   - Denunciante: "José Pérez"

2. Importa el archivo a través de la interfaz

3. Verifica en la base de datos que los caracteres se guardaron correctamente

## 🔍 Verificación en Base de Datos

Ejecuta esta query en PostgreSQL para verificar el encoding:

```sql
-- Ver encoding de la base de datos
SHOW SERVER_ENCODING;
SHOW CLIENT_ENCODING;

-- Ver datos con caracteres especiales
SELECT id, code, description, name 
FROM medical_requests 
WHERE description LIKE '%ó%' 
   OR description LIKE '%á%'
   OR description LIKE '%ñ%'
LIMIT 10;
```

## 📋 Checklist de Verificación

- [ ] El archivo Excel se lee con `codepage: 65001`
- [ ] La base de datos usa `UTF8` encoding
- [ ] Las conexiones de PostgreSQL usan `CLIENT_ENCODING = UTF8`
- [ ] Los datos se insertan correctamente con acentos
- [ ] Los datos se recuperan correctamente con acentos
- [ ] El frontend muestra correctamente los caracteres especiales

## 🚨 Problemas Comunes

### Problema 1: Caracteres siguen mostrándose mal

**Solución:**
1. Verifica que el archivo Excel esté guardado en formato UTF-8
2. Abre el Excel, guárdalo como "Excel Workbook (.xlsx)" nuevamente
3. Asegúrate de que no sea un archivo .xls antiguo

### Problema 2: Algunos caracteres se ven bien, otros no

**Solución:**
1. Verifica que todas las celdas del Excel tengan el mismo formato
2. Evita copiar/pegar desde otras fuentes que puedan tener encoding diferente
3. Escribe directamente en Excel

### Problema 3: En la BD se ven bien, pero en el frontend no

**Solución:**
1. Verifica que el frontend tenga `<meta charset="UTF-8">` en el HTML
2. Asegúrate de que las respuestas del API tengan header `Content-Type: application/json; charset=utf-8`
3. Verifica que no haya transformaciones de texto en el frontend

## 📝 Notas Adicionales

### Codepage 65001
- Es el código de página para UTF-8 en Windows
- Soporta todos los caracteres Unicode
- Es el estándar recomendado para aplicaciones modernas

### PostgreSQL y UTF-8
- PostgreSQL usa UTF-8 por defecto en la mayoría de instalaciones
- `CLIENT_ENCODING` controla cómo se envían/reciben datos
- `SERVER_ENCODING` es el encoding de la base de datos (generalmente UTF8)

### Alternativas si el problema persiste

Si después de estos cambios aún hay problemas:

1. **Verificar encoding del archivo Excel:**
   ```javascript
   // Agregar logging para debug
   console.log('Workbook codepage:', workbook.Custprops?.codepage);
   console.log('First row:', data[0]);
   ```

2. **Forzar conversión de caracteres:**
   ```javascript
   // En el mapeo de datos
   description: (row.DESCRIP || '').normalize('NFC')
   ```

3. **Verificar encoding de la base de datos:**
   ```sql
   SELECT datname, pg_encoding_to_char(encoding) 
   FROM pg_database 
   WHERE datname = 'tu_base_de_datos';
   ```

## ✅ Resultado Esperado

Después de implementar estos cambios:

**Antes:**
- Descripción: "Atenci�n m�dica en el �rea de pediatr�a"
- Denunciante: "Jos� P�rez"

**Después:**
- Descripción: "Atención médica en el área de pediatría"
- Denunciante: "José Pérez"

¡Los caracteres especiales deben mostrarse correctamente! 🎉

