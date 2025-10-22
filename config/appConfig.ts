/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Application configuration
 * Set USE_MOCK_GENERATION to true to use mock images instead of real API calls
 */
export const APP_CONFIG = {
  // Toggle this to switch between mock and real API calls
  USE_MOCK_GENERATION: false, // Set to false to use real Gemini API

  // Mock generation delay (in milliseconds) to simulate API call
  MOCK_GENERATION_DELAY: 2000,
};
