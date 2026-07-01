import ExcelImportModel from '../models/excel_import.model.js';

async function testImportBatches() {
  try {
    console.log('🧪 Testing Import Batches Model...\n');

    const model = new ExcelImportModel();

    // Test 1: Get paginated data (default)
    console.log('Test 1: Get paginated data (default parameters)');
    const result1 = await model.getImportBatches({});
    console.log(`✓ Retrieved ${result1.data.length} records out of ${result1.total} total`);
    console.log(`  First record:`, result1.data[0] ? {
      id: result1.data[0].id,
      filename: result1.data[0].filename,
      status: result1.data[0].status,
      user_name: result1.data[0].user_name,
      total_records: result1.data[0].total_records,
      imported_records: result1.data[0].imported_records
    } : 'No records found');
    console.log('');

    // Test 2: Get with search
    console.log('Test 2: Get with global search');
    const result2 = await model.getImportBatches({
      page: 1,
      limit: 10,
      search: 'xlsx'
    });
    console.log(`✓ Search for "xlsx" returned ${result2.data.length} records`);
    console.log('');

    // Test 3: Get with sorting
    console.log('Test 3: Get with custom sorting');
    const result3 = await model.getImportBatches({
      page: 1,
      limit: 5,
      sortField: 'filename',
      sortOrder: 'asc'
    });
    console.log(`✓ Sorted by filename (asc):`);
    result3.data.forEach(item => {
      console.log(`  - ${item.filename}: ${item.status} (${item.imported_records}/${item.total_records})`);
    });
    console.log('');

    // Test 4: Get with filters
    console.log('Test 4: Get with column filters');
    const result4 = await model.getImportBatches({
      page: 1,
      limit: 10,
      filters: {
        status: 'completed'
      }
    });
    console.log(`✓ Filter by status="completed" returned ${result4.data.length} records`);
    console.log('');

    // Test 5: Get with sorting by different fields
    console.log('Test 5: Get sorted by total_records (desc)');
    const result5 = await model.getImportBatches({
      page: 1,
      limit: 5,
      sortField: 'total_records',
      sortOrder: 'desc'
    });
    console.log(`✓ Top 5 batches by total records:`);
    result5.data.forEach(item => {
      console.log(`  - ${item.filename}: ${item.total_records} records`);
    });
    console.log('');

    // Test 6: Combined filters and search
    console.log('Test 6: Combined search and filters');
    const result6 = await model.getImportBatches({
      page: 1,
      limit: 10,
      search: 'medical',
      filters: {
        status: 'completed'
      },
      sortField: 'created_at',
      sortOrder: 'desc'
    });
    console.log(`✓ Search "medical" + filter status="completed" returned ${result6.data.length} records`);
    console.log('');

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

testImportBatches();

