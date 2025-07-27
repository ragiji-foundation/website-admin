# RAGIJI Admin Panel

This is a [Next.js](https://nextjs.org) admin panel for managing RAGIJI content with MinIO for file storage.

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- MinIO server for file storage

## MinIO Setup

This application uses MinIO for file storage instead of cloud providers like Cloudinary or AWS S3.

### Option 1: Docker (Recommended)

```bash
# Run MinIO with Docker
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -v ~/minio/data:/data \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  quay.io/minio/minio server /data --console-address ":9001"
```

### Option 2: Local Installation

1. Download MinIO from [https://min.io/download](https://min.io/download)
2. Run MinIO server:

```bash
# macOS/Linux
export MINIO_ROOT_USER=minioadmin
export MINIO_ROOT_PASSWORD=minioadmin
minio server ~/minio --console-address ":9001"
```

### MinIO Configuration

1. Access MinIO Console at `http://localhost:9001`
2. Login with credentials (minioadmin/minioadmin)
3. Create buckets: `ragiji-images`, `ragiji-videos`, `ragiji-documents`
4. Set bucket policies to public read for web access

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Key variables:
- `MINIO_ENDPOINT`: MinIO server endpoint (localhost for development)
- `MINIO_ACCESS_KEY`: MinIO access key
- `MINIO_SECRET_KEY`: MinIO secret key
- `DATABASE_URL`: PostgreSQL connection string

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up the database:

```bash
npm run db:seed
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the admin panel.

## Features

- ✅ **File Management**: Complete MinIO integration for images, videos, and documents
- ✅ **Gallery Management**: Photo library with bulk upload, watermarking, and crop/resize
- ✅ **Blog Management**: Rich text editor with image uploads and Hindi support
- ✅ **Content Management**: Success stories, features, testimonials, and news articles
- ✅ **Internationalization**: Hindi and English language support
- ✅ **User Management**: Authentication and role-based access
- ✅ **Analytics Dashboard**: Google Analytics integration

## Storage Migration

This application has been migrated from Cloudinary to MinIO for better control and cost efficiency:

- **Removed**: Cloudinary, AWS S3, Vercel Blob dependencies
- **Added**: MinIO client with full bucket management
- **Benefits**: Self-hosted storage, no vendor lock-in, unlimited storage

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
