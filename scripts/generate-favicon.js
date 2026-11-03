/* eslint-disable no-undef */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const faviconSvg = path.join(publicDir, 'favicon.svg');
const faviconIco = path.join(publicDir, 'favicon.ico');

async function generateFavicons() {
    console.log('Generating favicons...');

    if (!fs.existsSync(faviconSvg)) {
        console.error('✗ favicon.svg not found');
        process.exit(1);
    }

    try {
        // Generate favicon.ico (32x32 standard size)
        await sharp(faviconSvg)
            .png()
            .resize(32, 32, {
                fit: 'contain',
                background: { r: 29, g: 158, b: 117, alpha: 1 },
            })
            .toFile(faviconIco);

        console.log('✓ Generated favicon.ico (32x32)');

        console.log('Favicon generation complete!');
    } catch (error) {
        console.error('✗ Failed to generate favicons:', error.message);
        process.exit(1);
    }
}

generateFavicons();
