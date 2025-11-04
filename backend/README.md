## Qsdhakti Chatbot Backend (Django)

Simple Django REST backend exposing endpoints the frontend chatbot needs. Wired for PostgreSQL via `DATABASE_URL` and CORS-enabled for local development.

### Database Connection

Your PostgreSQL database details (from DBeaver):
- **Database:** qshakti-db
- **Host:** 172.17.0.1
- **Port:** 5432
- **User:** i4admin
- **Password:** *(same password you use in DBeaver)*

### Quickstart

1. Create a virtual env (recommended)
```bash
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell: .venv\Scripts\Activate.ps1
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Configure environment

**Create a `.env` file in the `backend/` directory:**

Copy the example file and add your password:
```bash
# On Windows PowerShell:
Copy-Item .env.example .env
```

Then edit `.env` and replace `YOUR_PASSWORD_HERE` with your actual PostgreSQL password (the same one you use in DBeaver):

```env
DATABASE_URL=postgresql://i4admin:YOUR_PASSWORD_HERE@172.17.0.1:5432/qshakti-db

# Optional: If connection fails, try these alternatives:
# Option 1: If database is accessible via localhost (Docker port forwarding):
# DATABASE_URL=postgresql://i4admin:YOUR_PASSWORD_HERE@localhost:5432/qshakti-db

# Option 2: Disable SSL if required:
# DB_SSL_MODE=disable

# Option 3: Require SSL:
# DB_SSL_MODE=require
```

**Important:** 
- Use the **same password** you use to connect in DBeaver
- If your password contains special characters like `@`, `#`, `$`, etc., you need to URL-encode them:
  - `@` becomes `%40`
  - `#` becomes `%23`
  - `$` becomes `%24`
  - `&` becomes `%26`
  - Space becomes `%20`

**Example:** If your password is `mypass@123`, the DATABASE_URL would be:
```
DATABASE_URL=postgresql://i4admin:mypass%40123@172.17.0.1:5432/qshakti-db
```

**Alternative (PowerShell - temporary for current session only):**
```powershell
$env:DATABASE_URL = "postgresql://i4admin:YOUR_PASSWORD@172.17.0.1:5432/qshakti-db"
```

4. Test database connection (optional)
```bash
python manage.py inspectdb --database default
```

5. Run migrations (no models yet, but keeps Django happy)
```bash
python manage.py migrate
```

6. Start server
```bash
python manage.py runserver 0.0.0.0:8000
```

API root: `http://localhost:8000/api/`

### Inspecting Database Tables

To see what tables are available in your database:
```bash
python manage.py inspectdb
```

Or use the helper script:
```bash
python scripts/inspect_db.py
```

This will show you all tables, columns, and their types - helpful for mapping to the chatbot's data needs.

### Endpoints

- `GET /api/initial-data/`
- `GET /api/factories/{factory_id}/sections/`
- `GET /api/purchase-orders/{po_id}/status/`
- `POST /api/inspections/filter/`
- `GET /api/parameters/series-and-stats/?factoryId=&itemCode=&operation=&parameter=&days=`
- `GET /api/parameters/lsl-usl-distribution/?factoryId=&itemCode=&operation=&parameter=&days=`
- `GET /api/parameters/distribution/?context=&factoryId=&section=&itemCode=`

Responses are placeholders matching the frontend shapes. You can replace internals with real SQL/ORM queries once table names and schemas are provided.

### CORS

Development defaults to `CORS_ALLOW_ALL=true`. For stricter setup, set `CORS_ALLOW_ALL=false` and `FRONTEND_ORIGIN` to your UI origin.


