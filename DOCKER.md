# Docker Build and Deployment Guide - Angular SSR

## Build the Docker Image

```bash
# Navigate to web directory
cd web

# Build the image
docker build -t catalog-web:latest .

# Build with specific tag
docker build -t catalog-web:1.0.0 .
```

## Run the Container Locally

### Basic Run

```bash
docker run -d \
  --name catalog-web \
  -p 4000:4000 \
  catalog-web:latest
```

### Run with Environment Variables

```bash
# Run with API URL
docker run -d \
  --name catalog-web \
  -p 4000:4000 \
  -e API_URL=http://localhost:3000 \
  -e PORT=4000 \
  catalog-web:latest

# Run with .env file
docker run -d \
  --name catalog-web \
  -p 4000:4000 \
  --env-file .env.production \
  catalog-web:latest
```

## Access the Application

```bash
# Open in browser
http://localhost:4000
```

## Check Container Logs

```bash
docker logs -f catalog-web
```

## Stop and Remove Container

```bash
docker stop catalog-web
docker rm catalog-web
```

## Image Size Optimization

The multi-stage build ensures:
- **Stage 1 (Builder)**: ~800MB (includes Angular build tools)
- **Stage 2 (Runner)**: ~200-250MB (production SSR runtime only)

## Environment Variables

The following environment variables can be passed at runtime:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `API_URL` | Backend API URL | `http://localhost:3000` |
| `NODE_ENV` | Environment | `production` |

Example:
```bash
docker run -d -p 4000:4000 \
  -e API_URL=https://api.yourdomain.com \
  -e PORT=4000 \
  catalog-web:latest
```

## Production Deployment

### Docker Compose (Full Stack)

Create `docker-compose.prod.yml` in the root project directory:

```yaml
version: '3.8'

services:
  # Angular SSR Frontend
  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - API_URL=http://api:3000
      - NODE_ENV=production
    depends_on:
      - api
    restart: unless-stopped

  # NestJS API Backend
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_HOST=postgres
      - DATABASE_PORT=5432
    env_file:
      - ./api/.env.production
    depends_on:
      - postgres
    restart: unless-stopped

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=${DATABASE_USER}
      - POSTGRES_PASSWORD=${DATABASE_PASSWORD}
      - POSTGRES_DB=${DATABASE_NAME}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres-data:
```

Run full stack:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Nginx Reverse Proxy (Optional)

If deploying with Nginx:

```nginx
# /etc/nginx/sites-available/catalog

server {
    listen 80;
    server_name yourdomain.com;

    # Frontend (Angular SSR)
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Security Features

✅ Non-root user (node)  
✅ Alpine Linux (minimal)  
✅ Only production dependencies  
✅ Health check included  
✅ Signal handling with dumb-init  
✅ Runtime environment variables supported  

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy Web

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker Image
        working-directory: ./web
        run: docker build -t catalog-web:${{ github.sha }} .
      
      - name: Tag Latest
        run: docker tag catalog-web:${{ github.sha }} catalog-web:latest
      
      - name: Push to Registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push catalog-web:latest
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs catalog-web

# Check if port is already in use
netstat -ano | findstr :4000  # Windows
lsof -i :4000                 # Linux/Mac
```

### Environment variables not working

```bash
# Verify environment inside container
docker exec catalog-web env

# Check if variables are being passed
docker inspect catalog-web | grep -A 10 Env
```

### SSR not rendering

```bash
# Enter container
docker exec -it catalog-web sh

# Check dist structure
ls -la dist/web/

# Verify server file exists
ls -la dist/web/server/server.mjs
```

### Performance Issues

```bash
# Monitor resource usage
docker stats catalog-web

# Increase memory limit if needed
docker run -d -p 4000:4000 -m 1g catalog-web:latest
```

## Production Checklist

Before deploying to production:

- [ ] Set correct `API_URL` environment variable
- [ ] Configure CORS on backend API
- [ ] Set up SSL/TLS certificates
- [ ] Configure health checks
- [ ] Set up monitoring and logging
- [ ] Test SSR rendering is working
- [ ] Verify SEO meta tags are rendering
- [ ] Test all routes and navigation
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline
