# Medical Requests API Documentation

## Overview
API endpoints for managing medical requests (casos) with advanced features including pagination, sorting, filtering, and global search.

## Base URL
```
/api/medical-requests
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Get All Medical Requests (Paginated)
**GET** `/api/medical-requests`

Retrieve a paginated list of medical requests with optional filtering, sorting, and search.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-based) |
| `limit` | number | 25 | Records per page |
| `sortField` | string | 'created_at' | Field to sort by |
| `sortOrder` | string | 'desc' | Sort order: 'asc' or 'desc' |
| `search` | string | '' | Global search term (searches across multiple fields) |
| `filters` | JSON string | {} | Column-specific filters |

#### Sortable Fields
- `id`, `code`, `identification_number`, `complainant`, `phone`
- `state`, `municipality`, `parish`, `health_center`
- `subcategory`, `extended_category`, `statute_name`, `statute_id`
- `creation_date`, `status_date`, `created_at`, `updated_at`

#### Searchable Fields (Global Search)
The global search searches across:
- code, identification_number, complainant, phone
- state, municipality, parish, health_center
- description, subcategory, extended_category
- statute_name

#### Example Request
```javascript
GET /api/medical-requests?page=1&limit=25&sortField=code&sortOrder=asc&search=zulia&filters={"state":"Zulia"}
```

#### Example Response
```json
{
  "status": "success",
  "cases": {
    "data": [
      {
        "id": 1,
        "code": "CASO-001",
        "identification_number": "12345678",
        "complainant": "Juan Pérez",
        "phone": "0414-1234567",
        "state": "Zulia",
        "municipality": "Maracaibo",
        "parish": "Bolívar",
        "health_center": "Hospital Central",
        "description": "Descripción del caso",
        "subcategory": "Urgente",
        "extended_category": "Categoría extendida",
        "request": "Solicitud específica",
        "requirement": "Requerimiento",
        "creation_date": "2024-01-15T00:00:00.000Z",
        "status_date": "2024-01-20T00:00:00.000Z",
        "statute_id": 1,
        "statute_name": "Pendiente",
        "statute_color": "#FFA500",
        "import_batch_id": null,
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-20T15:45:00.000Z"
      }
    ],
    "total": 150,
    "currentPage": 1,
    "pageSize": 25,
    "totalPages": 6
  }
}
```

---

### 2. Get Medical Request by ID
**GET** `/api/medical-requests/:id`

Retrieve a single medical request by its ID.

#### Example Response
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "code": "CASO-001",
    // ... all fields
  }
}
```

---

### 3. Create Medical Request
**POST** `/api/medical-requests`

Create a new medical request.

#### Request Body
```json
{
  "code": "CASO-002",
  "identification_number": "87654321",
  "complainant": "María González",
  "phone": "0424-9876543",
  "state": "Miranda",
  "municipality": "Chacao",
  "parish": "El Rosal",
  "health_center": "Clínica El Ávila",
  "description": "Descripción del nuevo caso",
  "subcategory": "Normal",
  "extended_category": "Cat A",
  "request": "Solicitud",
  "requirement": "Requerimiento",
  "statute_id": 1
}
```

---

### 4. Update Medical Request
**PUT** `/api/medical-requests/:id`

Update an existing medical request.

---

### 5. Delete Medical Request
**DELETE** `/api/medical-requests/:id`

Delete a medical request.

---

## Column Filters Example

To filter by specific columns, pass a JSON string in the `filters` parameter:

```javascript
const filters = {
  state: "Zulia",
  municipality: "Maracaibo",
  statute_name: "Pendiente"
};

const queryString = `?filters=${JSON.stringify(filters)}`;
```

## Frontend Integration Example

```javascript
import { casesAPI } from '../services/api';

const fetchCases = async () => {
  const response = await casesAPI.getCases({
    page: 1,
    limit: 25,
    sortField: 'created_at',
    sortOrder: 'desc',
    search: 'search term',
    filters: JSON.stringify({ state: 'Zulia' })
  });
  
  console.log(response.cases.data); // Array of cases
  console.log(response.cases.total); // Total count
};
```

