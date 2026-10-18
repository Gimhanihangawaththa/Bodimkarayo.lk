# Bodimkarayo.lk
Bodimkarayo.lk

## Run With Docker

### 1) Create Docker environment file

```bash
cp .env.docker.example .env
```

Update values in `.env` if needed (especially `JWT_SECRET`).

### 2) Build and start all services

```bash
docker compose up --build -d
```

### 3) Access the app

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- MariaDB: localhost:3307
- Elasticsearch: http://localhost:9200

### 4) View logs

```bash
docker compose logs -f
```

### 5) Stop services

```bash
docker compose down
```

To also remove the database volume:

```bash
docker compose down -v
```
