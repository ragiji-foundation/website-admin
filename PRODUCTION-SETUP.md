# Environment Configuration for Production

## MinIO HTTPS Configuration

For production deployment where your admin panel is served over HTTPS, you need to configure MinIO to serve content over HTTPS as well to avoid mixed content errors.

### Option 1: Using a Reverse Proxy (Recommended)

Set up a reverse proxy (nginx, Cloudflare, etc.) in front of your MinIO server:

```bash
# Example nginx configuration
server {
    listen 443 ssl;
    server_name your-minio-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://147.93.153.51:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option 2: Direct MinIO HTTPS Configuration

Configure MinIO to serve HTTPS directly:

```bash
# Set environment variables
export MINIO_SERVER_URL="https://your-minio-domain.com"
export MINIO_BROWSER_REDIRECT_URL="https://your-minio-domain.com/minio"

# Run with SSL certificates
minio server /data \
  --certs-dir /path/to/certs \
  --console-address ":9001"
```

### Environment Variables for Production

Update your `.env.production` or deployment environment:

```bash
# Production MinIO Configuration
MINIO_ENDPOINT=your-minio-domain.com
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key

# Optional: Custom public URL for CDN/proxy
MINIO_PUBLIC_URL=https://cdn.your-domain.com

# Force production mode
NODE_ENV=production
```

### Quick Fix for Current Deployment

If you can't immediately set up HTTPS for MinIO, you can temporarily serve images through your Next.js app:

1. Create an image proxy endpoint at `/api/image-proxy/[...path].ts`
2. Update the MinIO URL generation to use the proxy
3. This will serve images through your HTTPS domain

## Troubleshooting

### Mixed Content Errors
- Ensure all MinIO URLs use HTTPS in production
- Check that MINIO_USE_SSL is set to 'true'
- Verify SSL certificates are valid

### File Upload Issues
- Check CORS configuration on MinIO
- Verify bucket policies allow public read access
- Ensure upload API endpoints are accessible

### 404 Errors
- Verify static files are properly deployed
- Check Next.js public folder configuration
- Ensure fallback images exist in public directory
