/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Simulates sending a single image to the user's email.
 * In a real application, this would use a backend service (e.g., SendGrid, Resend).
 * @param email The recipient's email address.
 * @param imageUrl The data URL of the image to send.
 * @param decade The name of the image/decade.
 */
export async function sendSingleImageByEmail(email: string, imageUrl: string, decade: string): Promise<void> {
  console.log(`
    --- SIMULATING EMAIL ---
    To: ${email}
    Subject: Your ${decade} Image from Image Ferrer!
    Body: Contains the attached image.
    Image Data Length: ${imageUrl.length}
    -----------------------
  `);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // The App component will show a more integrated confirmation message.
  return Promise.resolve();
}

/**
 * Simulates sending the full album to the user's email.
 * @param email The recipient's email address.
 * @param albumDataUrl The data URL of the album image.
 */
export async function sendAlbumByEmail(email: string, albumDataUrl: string): Promise<void> {
  console.log(`
    --- SIMULATING EMAIL ---
    To: ${email}
    Subject: Your Image Ferrer Album is Here!
    Body: Here is your generated photo album. Enjoy your trip through time!
    Album Data Length: ${albumDataUrl.length}
    -----------------------
  `);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2500));

  return Promise.resolve();
}
