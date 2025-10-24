# ClientIQ Frontend

A React-based CRM frontend for managing clients, orders, and products.

## API Configuration

The application automatically configures API endpoints based on the environment:

### Development

- Uses `http://localhost:5037/api` for local development
- Configure via `.env.development` if needed

### Production

- Uses relative paths `/api` for NGINX proxy
- Configure via `.env.production` if needed

### NGINX Configuration Required for Production

Add this to your NGINX config:

```nginx
location /api/ {
    proxy_pass http://localhost:5037/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection keep-alive;
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Development Setup

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Make sure your backend API is running on port 5037

## Production Build

1. Build the application: `npm run build`
2. Deploy the `dist` folder to your web server
3. Ensure NGINX is configured to proxy `/api` requests to your backend

## Environment Variables

- `VITE_API_BASE_URL`: Override the default API base URL
