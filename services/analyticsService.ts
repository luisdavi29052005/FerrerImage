
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type AnalyticsEvent = 
  | 'page_view'
  | 'upload_started'
  | 'preview_generated'
  | 'preview_failed'
  | 'purchase_clicked'
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  | 'download_single'
  | 'download_album'
  | 'regenerate_image'
  | 'share_clicked'
  | 'affiliate_link_clicked';

interface AnalyticsEventData {
  event: AnalyticsEvent;
  properties?: Record<string, any>;
  timestamp?: number;
}

class AnalyticsService {
  private events: AnalyticsEventData[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.trackEvent('page_view');
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  trackEvent(event: AnalyticsEvent, properties?: Record<string, any>) {
    const eventData: AnalyticsEventData = {
      event,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        url: window.location.href,
      },
      timestamp: Date.now(),
    };

    this.events.push(eventData);
    
    // Log no console em desenvolvimento
    console.log('📊 Analytics Event:', eventData);

    // Aqui você pode integrar com serviços reais:
    // - Google Analytics: gtag('event', event, properties)
    // - Mixpanel: mixpanel.track(event, properties)
    // - Amplitude: amplitude.track(event, properties)
    // - PostHog: posthog.capture(event, properties)
    
    // Enviar para backend/Supabase para armazenamento
    this.sendToBackend(eventData);
  }

  private async sendToBackend(eventData: AnalyticsEventData) {
    try {
      // Enviar para Supabase em produção
      // Nota: Importe o cliente do Supabase quando estiver pronto
      // import { supabase } from './supabaseService';
      // 
      // const { error } = await supabase
      //   .from('analytics_events')
      //   .insert([{
      //     session_id: eventData.properties?.sessionId,
      //     event: eventData.event,
      //     properties: eventData.properties,
      //     user_agent: eventData.properties?.userAgent,
      //     referrer: eventData.properties?.referrer,
      //     url: eventData.properties?.url,
      //     timestamp: eventData.timestamp
      //   }]);
      // if (error) throw error;
      
      // Por enquanto, apenas log
      console.log('📤 Analytics event logged:', eventData.event);
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  getEvents(): AnalyticsEventData[] {
    return this.events;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  // Métodos helper para eventos específicos
  trackUploadStarted(fileSize: number, fileType: string) {
    this.trackEvent('upload_started', { fileSize, fileType });
  }

  trackPreviewGenerated(decade: string, generationTime: number) {
    this.trackEvent('preview_generated', { decade, generationTime });
  }

  trackPreviewFailed(error: string) {
    this.trackEvent('preview_failed', { error });
  }

  trackPurchaseClicked(source: 'preview' | 'album' | 'single', decade?: string) {
    this.trackEvent('purchase_clicked', { source, decade });
  }

  trackPaymentInitiated(amount: number, currency: string) {
    this.trackEvent('payment_initiated', { amount, currency });
  }

  trackPaymentCompleted(amount: number, currency: string, transactionId?: string) {
    this.trackEvent('payment_completed', { amount, currency, transactionId });
  }

  trackPaymentFailed(error: string) {
    this.trackEvent('payment_failed', { error });
  }

  trackDownload(type: 'single' | 'album', decade?: string) {
    this.trackEvent(type === 'single' ? 'download_single' : 'download_album', { decade });
  }

  trackRegenerateImage(decade: string) {
    this.trackEvent('regenerate_image', { decade });
  }
}

// Singleton instance
const analytics = new AnalyticsService();

export default analytics;
