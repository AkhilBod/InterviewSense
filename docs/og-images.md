# InterviewSense Open Graph Images

This project includes automated Open Graph (OG) image generation for better social media link previews.

## Generated Images

- `public/og-image.png` - Standard OG image

## Files

- `og-image-template.html` - HTML template with InterviewSense branding
- `generate-og-images.js` - Puppeteer script to generate PNG images from the template

## Usage

To regenerate the OG image (e.g., after updating branding or content):

```bash
npm run generate-og
```

## Template Features

- InterviewSense branding with brain icon
- Gradient background with subtle patterns  
- Modern typography (Inter font)
- Key feature highlights
- Professional color scheme matching the app

## Meta Tags

The Open Graph and Twitter Card meta tags are configured in `src/app/layout.tsx` and reference:
- `https://interviewsense.org/og-image.png`

## Dependencies

- `puppeteer` - For automated screenshot generation
- Installed as a dev dependency

## Customization

To update the OG image:
1. Edit `og-image-template.html` with new design/content
2. Run `npm run generate-og` to regenerate the PNG file
3. Commit the updated image to your repository

The image will automatically be served from the `public` folder when deployed.
