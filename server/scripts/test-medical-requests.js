import MedicalRequest from '../models/medicalRequest.model.js';

async function testMedicalRequests() {
  try {
    console.log('🧪 Testing Medical Requests Model...\n');

    // Test 1: Get paginated data (default)
    console.log('Test 1: Get paginated data (default parameters)');
    const result1 = await MedicalRequest.getPaginated({});
    console.log(`✓ Retrieved ${result1.data.length} records out of ${result1.total} total`);
    console.log(`  First record:`, result1.data[0] ? {
      id: result1.data[0].id,
      code: result1.data[0].code,
      name: result1.data[0].name,
      statute_name: result1.data[0].statute_name
    } : 'No records found');
    console.log('');

    // Test 2: Get with search
    console.log('Test 2: Get with global search');
    const result2 = await MedicalRequest.getPaginated({
      page: 1,
      limit: 10,
      search: 'test'
    });
    console.log(`✓ Search for "test" returned ${result2.data.length} records`);
    console.log('');

    // Test 3: Get with sorting
    console.log('Test 3: Get with custom sorting');
    const result3 = await MedicalRequest.getPaginated({
      page: 1,
      limit: 5,
      sortField: 'code',
      sortOrder: 'asc'
    });
    console.log(`✓ Sorted by code (asc):`);
    result3.data.forEach(item => {
      console.log(`  - ${item.code}: ${item.name}`);
    });
    console.log('');

    // Test 4: Get with filters
    console.log('Test 4: Get with column filters');
    const result4 = await MedicalRequest.getPaginated({
      page: 1,
      limit: 10,
      filters: {
        state: 'Zulia'
      }
    });
    console.log(`✓ Filter by state="Zulia" returned ${result4.data.length} records`);
    console.log('');

    // Test 5: Get by ID
    if (result1.data.length > 0) {
      console.log('Test 5: Get by ID');
      const firstId = result1.data[0].id;
      const singleRecord = await MedicalRequest.getById(firstId);
      console.log(`✓ Retrieved record with ID ${firstId}:`, {
        code: singleRecord.code,
        name: singleRecord.name,
        statute_name: singleRecord.statute_name
      });
      console.log('');
    }

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

testMedicalRequests();

