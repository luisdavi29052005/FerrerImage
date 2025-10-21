
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { APP_CONFIG } from '../config/appConfig';

/**
 * Generates a mock image with decade-specific styling using Canvas API
 * @param imageDataUrl The original image data URL
 * @param decade The decade for styling
 * @returns A promise that resolves to a mock image data URL
 */
export async function generateMockDecadeImage(
  imageDataUrl: string,
  decade: string
): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, APP_CONFIG.MOCK_GENERATION_DELAY));

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Apply decade-specific filters/effects
      const decadeEffects: Record<string, { filter: string; overlay: string }> = {
        '1950s': { filter: 'sepia(0.8) contrast(1.1)', overlay: '#8B4513' },
        '1960s': { filter: 'saturate(1.3) contrast(1.1)', overlay: '#FF6347' },
        '1970s': { filter: 'sepia(0.4) saturate(1.5)', overlay: '#DAA520' },
        '1980s': { filter: 'saturate(1.6) contrast(1.2)', overlay: '#FF1493' },
        '1990s': { filter: 'contrast(1.1) brightness(1.05)', overlay: '#00CED1' },
        '2000s': { filter: 'saturate(1.2) brightness(1.1)', overlay: '#9370DB' },
      };

      const effect = decadeEffects[decade] || decadeEffects['1970s'];
      
      // Apply filter
      ctx.filter = effect.filter;
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';

      // Add colored overlay
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = effect.overlay;
      ctx.globalAlpha = 0.15;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      // Add decade text watermark
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${decade} MOCK`, canvas.width / 2, canvas.height / 2);

      // Add border effect
      ctx.strokeStyle = effect.overlay;
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for mock generation'));
    };

    img.src = imageDataUrl;
  });
}
