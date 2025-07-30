# Database Seeding Documentation

## Overview

This project uses a **consolidated seed system** that replaces multiple fragmented seed files with a single, comprehensive seeding strategy. The seed data is designed to be compatible with **TipTap rich text editor** and follows the **database schema** exactly.

## Key Improvements

### ✅ Issues Fixed
- **Eliminated Duplication**: Removed 8 duplicate seed files with conflicting data
- **Schema Compliance**: All seed data now matches the Prisma schema exactly
- **TipTap Compatibility**: Content fields use proper HTML format for TipTap editor
- **Consistent Structure**: Standardized data format across all models
- **Performance**: Optimized with parallel execution and transactions
- **Maintainability**: Single source of truth for all seed data

### 🗂️ File Structure
```
prisma/
├── seed-consolidated.ts     # ✅ Main seed file (USE THIS)
├── schema.prisma           # Database schema
├── legacy-seeds/           # 📁 Old files (archived)
│   ├── seed.mjs
│   ├── seed.ts
│   ├── scripts/
│   └── seed/
└── tsconfig.json
```

## Usage

### 🚀 Primary Command (Recommended)
```bash
# Run the consolidated seed
npm run seed:consolidated
```

### 🔄 Alternative Commands
```bash
# Using Prisma's default seed command
npm run db:seed

# Legacy manual seed (deprecated)
npm run seed:legacy
```

## Seed Data Structure

### 📊 Content Models
- **Success Stories**: Rich HTML content with bilingual support
- **Initiatives**: Program descriptions with images
- **Centers**: Learning center information
- **Careers**: Job postings with detailed requirements
- **Awards**: Recognition and achievements
- **Statistics**: Key metrics and numbers
- **Gallery**: Image collections with categories

### 🌐 Bilingual Support
All text content includes both English and Hindi (Hi) versions:
```typescript
{
  title: "English Title",
  titleHi: "हिंदी शीर्षक",
  content: "<p>English HTML content</p>",
  contentHi: "<p>हिंदी HTML सामग्री</p>"
}
```

### 🎨 TipTap Content Format
Content fields use HTML format compatible with TipTap editor:
```html
<!-- ✅ Correct Format -->
<h2>Heading</h2>
<p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
<ul>
  <li>List item 1</li>
  <li>List item 2</li>
</ul>
<blockquote>Quote text</blockquote>

<!-- ❌ Avoid JSON Format -->
{
  "type": "doc",
  "content": [...]
}
```

## Schema Compliance

### ✅ Validated Fields
- All required fields populated
- Proper data types (String, Int, Boolean, DateTime, Json)
- Foreign key relationships maintained
- Unique constraints respected
- Default values applied where appropriate

### 🔗 Relationships
- **Blogs**: Link to User (author) and Category
- **Blog Tags**: Many-to-many relationship
- **Feature Sections**: Referenced by Features
- **Image URLs**: Use consistent `/api/image-proxy/` prefix

## Data Categories

### 👤 Users & Authentication
```typescript
adminUser: {
  email: 'admin@ragijifoundation.com',
  username: 'admin',
  password: 'admin123', // Automatically hashed
  role: 'admin'
}
```

### 📈 Statistics & Metrics
```typescript
stats: [
  {
    label: 'Children Educated',
    labelHi: 'शिक्षित बच्चे',
    value: '5000+',
    icon: 'school',
    order: 1
  }
]
```

### 🎯 Programs & Initiatives
- Digital Literacy Program
- Women Entrepreneurship
- Rural Education Centers
- Healthcare Awareness
- Skill Development

### 🏢 Centers & Locations
- Delhi Learning Center
- Mumbai Skills Hub
- Bangalore Tech Center

### 💼 Career Opportunities
- Education Program Manager
- Social Media Coordinator

## Advanced Features

### 🔄 Transaction Safety
Uses Prisma transactions to ensure data consistency:
```typescript
await prisma.$transaction(async (tx) => {
  // All operations succeed or fail together
});
```

### ⚡ Parallel Execution
Non-dependent operations run in parallel for better performance:
```typescript
await Promise.all([
  createSuccessStories(),
  createInitiatives(),
  createCenters()
]);
```

### 🧹 Data Cleanup
Automatically clears existing data before seeding:
```typescript
// Clears in correct order to handle foreign keys
await tx.blog.deleteMany();
await tx.category.deleteMany();
await tx.user.deleteMany();
```

## Troubleshooting

### Common Issues

1. **Foreign Key Errors**
   ```bash
   # Solution: Ensure related records are created first
   # Order: Users → Categories → Tags → Blogs
   ```

2. **Unique Constraint Violations**
   ```bash
   # Solution: Clear database before seeding
   npm run seed:consolidated
   ```

3. **Content Format Issues**
   ```bash
   # Solution: Use HTML, not JSON for content fields
   content: "<p>HTML content</p>"  # ✅ Correct
   content: { type: "doc" }        # ❌ Wrong
   ```

## Migration from Legacy Seeds

### 🗄️ Legacy Files Location
Old seed files have been moved to `prisma/legacy-seeds/` for reference:
- `legacy-seeds/seed.mjs` - Old JavaScript seed
- `legacy-seeds/seed.ts` - Old TypeScript seed
- `legacy-seeds/scripts/` - Manual seed scripts
- `legacy-seeds/seed/` - Data files

### 🔄 Migration Steps
1. **Stop using legacy commands**:
   ```bash
   # ❌ Don't use these anymore
   npm run seed:manual
   npm run seed:story
   ```

2. **Use consolidated seed**:
   ```bash
   # ✅ Use this instead
   npm run seed:consolidated
   ```

3. **Update any references** in deployment scripts or documentation

## Development Workflow

### 🆕 Adding New Seed Data
1. Edit `prisma/seed-consolidated.ts`
2. Add data to appropriate section in `seedData` object
3. Ensure HTML format for content fields
4. Include bilingual versions where applicable
5. Test with: `npm run seed:consolidated`

### 🔍 Content Guidelines
- **Rich Text**: Use semantic HTML tags (`<h2>`, `<p>`, `<strong>`, `<em>`)
- **Lists**: Use `<ul>`/`<ol>` with `<li>` items
- **Quotes**: Use `<blockquote>` for quoted content
- **Images**: Use `/api/image-proxy/ragiji-images/` prefix for URLs
- **Bilingual**: Always provide Hindi translations where fields exist

### 🧪 Testing
```bash
# Run seed and verify in development
npm run seed:consolidated
npm run dev

# Check admin panel for proper content rendering
# Verify TipTap editor loads content correctly
```

## Performance & Monitoring

### 📊 Seed Statistics
The seed process provides detailed logging:
```
🌱 Starting consolidated seed process...
✅ Database connected successfully
🧹 Clearing existing data...
✅ Existing data cleared
👤 Creating admin user...
✅ Admin user created: admin@ragijifoundation.com
📚 Creating categories...
✅ Created 4 categories
...
🎉 Consolidated seed completed successfully!
```

### ⏱️ Performance Metrics
- **Transaction Safety**: All operations are atomic
- **Parallel Execution**: Independent operations run concurrently
- **Memory Efficient**: Streams large datasets
- **Error Handling**: Graceful failure with detailed logging

---

## 🎯 Best Practices

1. **Always use the consolidated seed** (`npm run seed:consolidated`)
2. **Test locally** before deploying seed changes
3. **Keep content HTML-formatted** for TipTap compatibility
4. **Include bilingual content** where schema supports it
5. **Use consistent image URL patterns**
6. **Follow semantic HTML structure** in content fields
7. **Maintain data relationships** between models

For questions or issues, refer to the codebase or create an issue in the project repository.
