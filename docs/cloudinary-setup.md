# Cloudinary Setup Guide

This guide will help you properly configure Cloudinary for image uploads in the admin panel.

## 1. Create an Upload Preset

1. Log in to your [Cloudinary Console](https://console.cloudinary.com/)
2. Navigate to Settings > Upload
3. Scroll down to "Upload presets"
4. Click "Add upload preset"
5. Choose a name for your preset (e.g., "ragiji-foundation")
6. Set "Signing Mode" to "Unsigned" (for client-side uploads)
7. Configure other settings as needed:
   - Folder: "ragiji-foundation"
   - Allowed formats: jpg, png, gif, webp
   - Enable the "Use filename or externally defined Public ID" option
8. Save the preset

## 2. Update Environment Variables

Make sure your `.env.local` file contains these variables:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dhyetvc2r
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name_here
```

Replace `your_preset_name_here` with the preset name you created in step 1.

## 3. Testing Your Configuration

1. Go to the `/test-cloudinary` page in your admin panel
2. Upload an image to verify your configuration works
3. If you encounter errors:
   - Check the browser console for detailed error messages
   - Verify your cloud name and preset name are correct
   - Ensure the preset is set to "Unsigned"

## 4. Troubleshooting

If you see "Upload preset not found" error:
- Verify the preset name in your code matches exactly what's in your Cloudinary dashboard
- Check that the preset is created with "Unsigned" signing mode
- Try using "ml_default" (Cloudinary's default preset) if you can't create a custom preset

For security issues:
- Only allow uploads from your domain by setting allowed origins in your Cloudinary settings
- Set file size limits and allowed formats in your preset

## 5. Advanced Configuration

For more advanced configuration, consider:
- Setting up server-side authenticated uploads for better security
- Configuring image transformations (resizing, cropping, etc.)
- Setting up webhook notifications for upload events
