
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const REF_COOKIE_NAME = 'affiliate_ref';
const REF_COOKIE_DAYS = 30;

export function captureReferralFromURL(): string | null {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');
  
  if (ref) {
    // Salvar em cookie
    setCookie(REF_COOKIE_NAME, ref, REF_COOKIE_DAYS);
    
    // Salvar em sessionStorage
    sessionStorage.setItem(REF_COOKIE_NAME, ref);
    
    return ref;
  }
  
  return null;
}

export function getStoredRef(): string | null {
  // Tentar sessionStorage primeiro
  const sessionRef = sessionStorage.getItem(REF_COOKIE_NAME);
  if (sessionRef) return sessionRef;
  
  // Depois tentar cookie
  return getCookie(REF_COOKIE_NAME);
}

export function calculateDiscount(basePrice: number): { discountedPrice: number; discountPercent: number; hasDiscount: boolean } {
  const ref = getStoredRef();
  
  if (ref) {
    const discountPercent = 20;
    const discountedPrice = basePrice * (1 - discountPercent / 100);
    return { discountedPrice, discountPercent, hasDiscount: true };
  }
  
  return { discountedPrice: basePrice, discountPercent: 0, hasDiscount: false };
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function getRefGroupName(): string | null {
  const ref = getStoredRef();
  if (!ref) return null;
  
  // Extrair nome do grupo do código de referência
  // Exemplo: GRUPO123 -> "Grupo 123"
  return ref.replace(/([A-Z]+)(\d+)/, '$1 $2');
}
