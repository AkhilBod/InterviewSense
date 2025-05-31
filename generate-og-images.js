const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generateOGImages() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        
        // Load the HTML template
        const templatePath = path.join(__dirname, 'og-image-template.html');
        const templateUrl = `file://${templatePath}`;
        
        await page.goto(templateUrl, { waitUntil: 'networkidle0' });
        
        // Generate standard OG image (1200x630)
        console.log('Generating standard OG image (1200x630)...');
        const standardElement = await page.$('#og-standard');
        if (standardElement) {
            await standardElement.screenshot({
                path: path.join(__dirname, 'public', 'og-image.png'),
                omitBackground: false
            });
            console.log('✅ Standard OG image saved to public/og-image.png');
        }
        
        // Generate square OG image (1200x1200)
        console.log('Generating square OG image (1200x1200)...');
        const squareElement = await page.$('#og-square');
        if (squareElement) {
            await squareElement.screenshot({
                path: path.join(__dirname, 'public', 'og-image-square.png'),
                omitBackground: false
            });
            console.log('✅ Square OG image saved to public/og-image-square.png');
        }
        
    } catch (error) {
        console.error('Error generating OG images:', error);
    } finally {
        await browser.close();
    }
}

// Check if Puppeteer is installed
async function checkDependencies() {
    try {
        require('puppeteer');
        return true;
    } catch (error) {
        console.log('Puppeteer not found. Installing...');
        return false;
    }
}

async function main() {
    const hasDepencies = await checkDependencies();
    
    if (!hasDepencies) {
        console.log('Please install Puppeteer first:');
        console.log('npm install puppeteer');
        console.log('Then run: node generate-og-images.js');
        return;
    }
    
    // Ensure public directory exists
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }
    
    await generateOGImages();
    console.log('🎉 OG images generated successfully!');
}

main().catch(console.error);
