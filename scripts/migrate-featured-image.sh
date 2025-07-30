#!/bin/bash

# Migration script to add featuredImage field to Blog model
# Run this when database connection is stable

echo "🚀 Starting migration to add featuredImage field to Blog model..."

# Step 1: Apply the migration
echo "📁 Applying database migration..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "❌ Migration failed. Trying alternative approach..."
    echo "🔧 Running manual SQL migration..."
    
    # Try to apply the SQL manually
    npx prisma db execute --file prisma/migrations/add_featured_image_to_blog/migration.sql
    
    if [ $? -ne 0 ]; then
        echo "❌ Manual migration also failed. Please check your database connection."
        echo "Make sure your DATABASE_URL is correct in .env file"
        exit 1
    fi
fi

# Step 2: Generate Prisma Client
echo "🔧 Generating Prisma Client with new schema..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma client generation failed."
    exit 1
fi

# Step 3: Update API route
echo "📝 Updating API route to enable featuredImage field..."

# Update the select clause to include featuredImage
sed -i '' 's/ogDescriptionHi: true,/ogDescriptionHi: true,\n        featuredImage: true,/' src/app/api/blogs/route.ts

# Update the response to use the actual field
sed -i '' 's/featuredImage: undefined, \/\/ TODO: Enable after migration: blog.featuredImage || undefined,/featuredImage: blog.featuredImage || undefined,/' src/app/api/blogs/route.ts

# Update the create data to include featuredImage
sed -i '' 's/\/\/ featuredImage: data.featuredImage || null, \/\/ Will be enabled after database migration/featuredImage: data.featuredImage || null,/' src/app/api/blogs/route.ts

echo "✅ Migration completed successfully!"
echo ""
echo "🎉 Featured image functionality is now enabled in the blog creation form!"
echo ""
echo "Next steps:"
echo "  - Restart your development server: npm run dev"
echo "  - Test the image upload functionality in /blogs/create"
echo "  - The MediaUpload component is already integrated and ready to use"
