/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// Helper function to load an image and return it as an HTMLImageElement
function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(new Error(`Failed to load image: ${src.substring(0, 50)}...`));
        img.src = src;
    });
}

/**
 * Creates a single "photo album" page image from a collection of decade images.
 * @param imageData A record mapping decade strings to their image data URLs.
 * @returns A promise that resolves to a data URL of the generated album page (JPEG format).
 */
export async function createAlbumPage(imageData: Record<string, string>): Promise<string> {
    const canvas = document.createElement('canvas');
    const canvasWidth = 2480;
    const canvasHeight = 3508;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get 2D canvas context');
    }

    // 1. Draw the vintage paper background
    ctx.fillStyle = '#f4f1e9'; // vintage-paper color
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 2. Draw the title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6d5d4b'; // brand-brown
    ctx.font = `bold 120px 'Playfair Display', serif`;
    ctx.fillText('Image Ferrer', canvasWidth / 2, 180);

    // Subtitle
    ctx.fillStyle = '#5a7d9a'; // brand-blue
    ctx.font = `50px 'Lato', sans-serif`;
    ctx.fillText('A JOURNEY THROUGH TIME', canvasWidth / 2, 260);


    // 3. Load all the images concurrently
    const decades = Object.keys(imageData);
    const loadedImages = await Promise.all(
        Object.values(imageData).map(url => loadImage(url))
    );

    const imagesWithDecades = decades.map((decade, index) => ({
        decade,
        img: loadedImages[index],
    }));

    // 4. Define grid layout and draw each image
    const grid = { cols: 2, rows: 3, padding: 120 };
    const contentTopMargin = 350;
    const contentWidth = canvasWidth - grid.padding;
    const contentHeight = canvasHeight - contentTopMargin - grid.padding;
    
    const cellWidth = (contentWidth - grid.padding * grid.cols) / grid.cols;
    const cellHeight = (contentHeight - grid.padding * grid.rows) / grid.rows;

    const polaroidFramePadding = 40;
    const captionAreaHeight = 150;
    
    imagesWithDecades.forEach(({ decade, img }, index) => {
        const row = Math.floor(index / grid.cols);
        const col = index % grid.cols;

        const x = grid.padding + col * (cellWidth + grid.padding);
        const y = contentTopMargin + row * (cellHeight + grid.padding);
        
        ctx.save();
        
        // Polaroid dimensions
        const polaroidWidth = cellWidth * 0.9;
        const polaroidHeight = polaroidWidth + captionAreaHeight;
        const polaroidX = x + (cellWidth - polaroidWidth) / 2;
        const polaroidY = y + (cellHeight - polaroidHeight) / 2;
        
        // Draw polaroid background with shadow
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(polaroidX, polaroidY, polaroidWidth, polaroidHeight);
        ctx.shadowColor = 'transparent';

        // Image dimensions inside polaroid
        const imageContainerWidth = polaroidWidth - (polaroidFramePadding * 2);
        const imageContainerHeight = polaroidWidth - (polaroidFramePadding * 2);
        const imgX = polaroidX + polaroidFramePadding;
        const imgY = polaroidY + polaroidFramePadding;

        // Calculate image dimensions to fit while maintaining aspect ratio
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        let drawWidth = imageContainerWidth;
        let drawHeight = drawWidth / aspectRatio;

        if (drawHeight < imageContainerHeight) {
            drawHeight = imageContainerHeight;
            drawWidth = drawHeight * aspectRatio;
        }

        const clipX = imgX + (imageContainerWidth - drawWidth) / 2;
        const clipY = imgY + (imageContainerHeight - drawHeight) / 2;
        
        ctx.drawImage(img, clipX, clipY, drawWidth, drawHeight);

        // Draw the caption
        ctx.fillStyle = '#36454F'; // dark charcoal
        ctx.font = `60px 'Permanent Marker', cursive`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const captionX = polaroidX + polaroidWidth / 2;
        const captionY = polaroidY + imageContainerHeight + (polaroidFramePadding*2) + captionAreaHeight / 2;

        ctx.fillText(decade, captionX, captionY);
        
        ctx.restore();
    });

    return canvas.toDataURL('image/jpeg', 0.9);
}