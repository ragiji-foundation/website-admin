# API Testing Dashboard

A comprehensive API testing interface for testing all CRUD functionality with the list of available APIs and their status.

## Features

### 🧪 API Tester
- **Interactive Testing Interface**: Test any API endpoint with custom parameters
- **Multiple HTTP Methods**: Support for GET, POST, PUT, PATCH, DELETE
- **Sample Data Generation**: Auto-populate request bodies with realistic sample data
- **Custom Headers**: Configure custom headers for requests
- **Query Parameters**: Add query parameters with easy formatting
- **Real-time Response Display**: View formatted JSON responses with syntax highlighting
- **Status Indicators**: Color-coded status badges and response times

### 📋 Request History
- **Persistent History**: Track all API requests made during the session
- **Quick Replay**: Load previous requests with a single click
- **Performance Metrics**: View response times and status codes
- **History Management**: Clear history when needed

### 📚 API Overview
- **Categorized Endpoints**: All APIs organized by functionality
- **Method Documentation**: See all available HTTP methods per endpoint
- **Quick Access**: Jump directly to testing any endpoint
- **Comprehensive Coverage**: All 80+ API endpoints included

## API Categories

### Core Management
- Dashboard Analytics
- Settings Management
- Profile Management
- File Upload

### Blog Management
- Blog CRUD operations
- Author management
- Categories and Tags
- Image uploads

### Content Management
- Banner management
- Carousel controls
- Features management
- Stats tracking
- Testimonials

### Media Management
- Gallery operations
- Awards management
- News coverage
- Electronic media
- Photo library

### Organization
- Centers management
- Initiatives tracking
- Success stories
- Our story content
- The Need content

### Communication
- Contact forms
- Contact information
- Enquiries
- Join applications

### Careers
- Job postings
- Application management
- Career content

### Utility APIs
- Search functionality
- Content library
- Analytics tracking
- Database testing
- Link management

### Authentication
- Login/logout
- Password management

## How to Use

### 1. **Basic API Testing**
1. Navigate to the "API Tester" tab
2. Select an API category from the dropdown
3. Choose a specific endpoint
4. Select the HTTP method
5. Configure headers and parameters as needed
6. Click "Send Request" to execute

### 2. **Custom Testing**
1. Use the "Custom URL" field to test any endpoint
2. Manually configure all request parameters
3. Perfect for testing edge cases or new endpoints

### 3. **Sample Data Usage**
- Toggle "Use Sample Data" to auto-populate request bodies
- Sample data includes realistic values for all major endpoints
- Supports both English and Hindi content where applicable

### 4. **Reading API Documentation**
- Use the "API Overview" tab for complete endpoint documentation
- Each endpoint shows method type, parameters, and authentication requirements
- Sample payloads are provided for POST/PUT operations

## Sample Payloads

The system includes pre-configured sample payloads for major endpoints:

### Blog Creation
```json
{
  "title": "Sample Blog Post",
  "titleHi": "नमूना ब्लॉग पोस्ट",
  "content": "Rich text content in JSON format",
  "status": "published",
  "authorName": "Admin User",
  "metaDescription": "SEO description",
  "categoryId": 1
}
```

### Career Posting
```json
{
  "title": "Software Developer",
  "titleHi": "सॉफ्टवेयर डेवलपर",
  "location": "Remote",
  "type": "Full-time",
  "description": "Job description in rich text",
  "requirements": "Job requirements in rich text",
  "isActive": true
}
```

### News Article
```json
{
  "title": "Sample News Article",
  "titleHi": "नमूना समाचार लेख",
  "source": "News Source",
  "date": "2025-07-27T00:00:00.000Z",
  "description": "Article description",
  "imageUrl": "https://example.com/image.jpg",
  "link": "https://example.com/article"
}
```

## Response Handling

### Status Code Colors
- 🟢 **Green (2xx)**: Success responses
- 🔵 **Blue (3xx)**: Redirect responses  
- 🟠 **Orange (4xx)**: Client error responses
- 🔴 **Red (5xx)**: Server error responses

### Response Display
- **Headers**: Complete response headers with CORS information
- **Body**: Formatted JSON or text response
- **Timing**: Request duration in milliseconds
- **Status**: HTTP status code and message

## Path Parameters

The system automatically handles path parameters:
- `[id]` → Replaced with `1` for testing
- `[slug]` → Replaced with `sample-slug` for testing
- Custom values can be set in the Custom URL field

## Query Parameters

Format query parameters as: `key=value&key2=value2`

Common examples:
- `locale=en` - Set language
- `page=1&limit=10` - Pagination
- `search=keyword` - Search functionality

## Headers Configuration

Default headers include:
```json
{
  "Content-Type": "application/json"
}
```

Add custom headers as needed for authentication or special requirements.

## Best Practices

### 1. **Testing Flow**
1. Start with GET requests to understand data structure
2. Test POST requests with sample data
3. Use returned IDs for PUT/DELETE operations
4. Verify responses match expected schemas

### 2. **Error Testing**
- Test with invalid IDs (404 errors)
- Test with malformed JSON (400 errors)
- Test with missing required fields
- Test with invalid authentication

### 3. **Performance Testing**
- Monitor response times in the history
- Test with large payloads
- Test concurrent requests

### 4. **Debugging**
- Use request history to replay failed requests
- Check response headers for CORS issues
- Verify request payloads match API expectations

## Troubleshooting

### Common Issues

**CORS Errors**
- Ensure proper origins are configured
- Check that OPTIONS requests are handled

**Authentication Errors**  
- Verify login status for protected endpoints
- Check authentication headers

**Validation Errors**
- Review required fields in sample payloads
- Ensure data types match API expectations

**Network Errors**
- Check server status
- Verify URL formatting
- Test with simpler requests first

## Integration with Development

This API testing dashboard is designed to:
- **Validate API Changes**: Test endpoints after modifications
- **Debug Issues**: Reproduce and analyze API problems  
- **Document APIs**: Provide living documentation of available endpoints
- **Support Development**: Enable rapid prototyping and testing

The dashboard includes all current API endpoints and is automatically updated as new endpoints are added to the system.

### 🚀 **Complete API Coverage**
- **77 API Endpoints** organized by category
- Full CRUD operations (Create, Read, Update, Delete)
- Real-time API status monitoring
- Comprehensive endpoint documentation

### 📊 **Three Main Views**

#### 1. **API Testing Tab**
- Interactive API endpoint selection
- Dynamic request configuration
- Real-time response display
- JSON request body editor
- Parameter handling for dynamic routes
- Response time tracking
- Status code visualization

#### 2. **API Overview Tab**
- Complete list of all available endpoints
- Organized by categories (Auth, Blogs, News, etc.)
- Method types and descriptions
- Authentication requirements
- Parameter information

#### 3. **Status Monitoring Tab**
- Real-time API health checks
- Visual status indicators (Online/Offline/Checking)
- Bulk API status checking
- Category-wise monitoring

## API Categories

### 🔐 **Authentication & Profile**
- `/api/login` - Admin authentication
- `/api/logout` - Session termination  
- `/api/profile` - User profile management

### 📊 **Dashboard & Analytics**
- `/api/dashboard` - System statistics
- `/api/analytics/event` - Event tracking
- `/api/analytics/track` - User action tracking

### 📝 **Content Management**
- `/api/blogs` - Blog posts CRUD
- `/api/blogs/{slug}` - Individual blog operations
- `/api/blogs/upload-image` - Blog image uploads

### 📰 **News & Media**
- `/api/news-coverage` - News articles management
- `/api/news-coverage/{id}` - Individual news operations
- `/api/electronic-media` - Media content management

### 🏆 **Success Stories**
- `/api/success-stories` - Success story CRUD
- `/api/success-stories/{id}` - Individual story operations

### 💼 **Careers**
- `/api/careers` - Job listings management
- `/api/careers/{id}` - Individual career operations

### 🏢 **Centers**
- `/api/centers` - Center locations CRUD
- `/api/centers/{id}` - Individual center operations

### 💬 **Testimonials**
- `/api/testimonials` - Testimonial management
- `/api/testimonials/{id}` - Individual testimonial operations

### 🖼️ **Gallery & Media**
- `/api/gallery` - Gallery items CRUD
- `/api/gallery/{id}` - Individual gallery operations
- `/api/upload` - File upload handling

### ⚙️ **Features & Settings**
- `/api/features` - Feature management
- `/api/settings` - Application configuration
- `/api/banner` - Banner management

### 🔧 **Utilities**
- `/api/search` - Content search
- `/api/contact` - Contact form submissions
- `/api/enquiries` - Enquiry management

## How to Use

### 1. **Accessing the API Testing Page**
Navigate to `/api-testing` in your admin panel or click "API Testing" in the sidebar navigation.

### 2. **Testing an API Endpoint**
1. **Select Category**: Choose from the accordion menu on the left
2. **Pick Endpoint**: Click on the desired API endpoint
3. **Configure Request**: 
   - Fill in any required parameters
   - Edit the JSON request body if needed
4. **Execute**: Click "Execute Request" button
5. **View Response**: See real-time results with status codes and response times

### 3. **Monitoring API Health**
1. Go to "Status Monitoring" tab
2. Click "Check All APIs" for bulk health check
3. Individual endpoints can be checked using the refresh icon
4. Visual indicators show: Online (green), Offline (red), Checking (yellow)

### 4. **Reading API Documentation**
- Use the "API Overview" tab for complete endpoint documentation
- Each endpoint shows method type, parameters, and authentication requirements
- Sample payloads are provided for POST/PUT operations

## Sample Requests

### Creating a Blog Post
```json
{
  "title": "Sample Blog",
  "content": "Blog content here...",
  "slug": "sample-blog",
  "isPublished": true
}
```

### Creating a Success Story
```json
{
  "title": "Success Story",
  "content": "Story content...",
  "personName": "John Doe",
  "location": "Mumbai",
  "featured": true
}
```

### Creating a News Article
```json
{
  "title": "News Title",
  "source": "News Source",
  "date": "2024-01-01T00:00:00.000Z",
  "description": "Article description",
  "link": "https://example.com"
}
```

## Response Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request (validation errors)
- **401**: Unauthorized (authentication required)
- **404**: Not found
- **500**: Server error

## Features & Benefits

### ✅ **Developer Benefits**
- Rapid API testing without external tools
- Real-time validation of API changes
- Comprehensive endpoint documentation
- Easy debugging and troubleshooting

### ✅ **Admin Benefits**
- Monitor system health
- Test data operations safely
- Validate API connectivity
- Quick access to all system functions

### ✅ **Maintenance Benefits**
- Proactive system monitoring
- Quick issue identification
- Comprehensive testing coverage
- Performance monitoring

## Security Notes

- 🔒 Authentication required for protected endpoints
- 🚫 DELETE operations should be used carefully
- ✅ All operations respect the same security model as the main application
- 📝 All API calls are logged for auditing

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Ensure you're logged in to the admin panel
   - Check if the endpoint requires authentication

2. **404 Not Found**
   - Verify the endpoint URL is correct
   - Check if required parameters are provided

3. **500 Server Error**
   - Check server logs for detailed error information
   - Verify database connectivity

4. **Timeout Issues**
   - Check network connectivity
   - Monitor server performance

## Navigation

The API Testing page is accessible via:
- **Sidebar Navigation**: Click "API Testing" 
- **Direct URL**: `/api-testing`
- **Icon**: 🔌 API icon in the navigation

---

*This tool provides comprehensive testing capabilities for the Ragiji Foundation admin system, enabling efficient development, maintenance, and monitoring of all API endpoints.*
