# Import Batches API Documentation

## Overview
API endpoints for managing Excel import batches with advanced features including pagination, sorting, filtering, and global search.

## Base URL
```
/api/excel-import
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Get Import History (Paginated)
**GET** `/api/excel-import/history`

Retrieve a paginated list of import batches with optional filtering, sorting, and search.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-based) |
| `limit` | number | 20 | Records per page |
| `sortField` | string | 'created_at' | Field to sort by |
| `sortOrder` | string | 'desc' | Sort order: 'asc' or 'desc' |
| `search` | string | '' | Global search term (searches across multiple fields) |
| `filters` | JSON string | {} | Column-specific filters |

#### Sortable Fields
- `id`, `filename`, `total_records`, `imported_records`, `failed_records`
- `status`, `user_name`, `created_at`, `completed_at`

#### Searchable Fields (Global Search)
The global search searches across:
- filename
- user_name (full name of the user who imported)
- status

#### Example Request
```javascript
GET /api/excel-import/history?page=1&limit=20&sortField=created_at&sortOrder=desc&search=medical&filters={"status":"completed"}
```

#### Example Response
```json
{
  "status": "success",
  "data": {
    "batches": [
      {
        "id": 1,
        "filename": "medical_requests_2024.xlsx",
        "total_records": 150,
        "imported_records": 145,
        "failed_records": 5,
        "status": "partial",
        "user_id": 1,
        "user_name": "Juan Pérez",
        "errors": [
          {
            "row": 10,
            "error": "Campo requerido faltante: code",
            "raw_data": {...}
          }
        ],
        "created_at": "2024-01-15T10:30:00.000Z",
        "completed_at": "2024-01-15T10:35:00.000Z",
        "created_at_formatted": "2024-01-15 10:30:00",
        "completed_at_formatted": "2024-01-15 10:35:00"
      }
    ],
    "total": 50,
    "currentPage": 1,
    "pageSize": 20,
    "totalPages": 3
  },
  "debug": {
    "searchTerm": "medical",
    "appliedFilters": {"status": "completed"},
    "sortField": "created_at",
    "sortOrder": "desc",
    "recordsOnPage": 20
  }
}
```

---

### 2. Upload Excel File
**POST** `/api/excel-import/upload`

Upload and import an Excel file with medical requests.

#### Request
- Content-Type: `multipart/form-data`
- Field name: `file`
- Accepted formats: `.xlsx`, `.xls`

#### Example Response
```json
{
  "success": true,
  "message": "Importación completada",
  "data": {
    "batch_id": 1,
    "total": 150,
    "imported": 145,
    "failed": 5,
    "errors": [...],
    "status": "partial"
  }
}
```

---

### 3. Get Batch Details
**GET** `/api/excel-import/batch/:batchId`

Get detailed information about a specific import batch including all imported records.

#### Example Response
```json
{
  "success": true,
  "data": {
    "batch": {
      "id": 1,
      "filename": "medical_requests_2024.xlsx",
      "total_records": 150,
      "imported_records": 145,
      "failed_records": 5,
      "status": "partial",
      "errors": [...]
    },
    "records": [...],
    "total_records": 145
  }
}
```

---

### 4. Delete Batch
**DELETE** `/api/excel-import/batch/:batchId`

Delete an import batch and all its associated medical request records.

---

### 5. Get Statistics
**GET** `/api/excel-import/statistics`

Get overall import statistics.

---

### 6. Download Template
**GET** `/api/excel-import/template`

Download the Excel template for importing medical requests.

---

## Column Filters Example

To filter by specific columns, pass a JSON string in the `filters` parameter:

```javascript
const filters = {
  status: "completed",
  user_name: "Juan"
};

const queryString = `?filters=${JSON.stringify(filters)}`;
```

## Frontend Integration Example

```javascript
import { excelImportAPI } from '../services/api';

const fetchBatches = async () => {
  const response = await excelImportAPI.getImportHistory({
    page: 1,
    limit: 20,
    sortField: 'created_at',
    sortOrder: 'desc',
    search: 'medical',
    filters: JSON.stringify({ status: 'completed' })
  });
  
  console.log(response.data.batches); // Array of batches
  console.log(response.data.total); // Total count
};
```

