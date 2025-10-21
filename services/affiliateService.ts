
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { createClient } from '@supabase/supabase-js';
import { getStoredRef } from '../lib/affiliateUtils';

const supabaseUrl = "https://lqidbjoxzweinrcywlxf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxaWRiam94endlaW5yY3l3bHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjk5NjcsImV4cCI6MjA3NDc0NTk2N30.oAHJ-trf0V5wANBH1MGtPy2DYgn2tp9tSayZ9BHgi5k";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CreateOrderParams {
  leadId: string;
  totalGross: number;
  discountPercent: number;
  totalNet: number;
  paymentIntent?: string;
}

export async function createOrder(params: CreateOrderParams) {
  const refCode = getStoredRef();
  let refLinkId = null;

  // Buscar ref_link_id se houver código de referência
  if (refCode) {
    const { data: refLink } = await supabase
      .from('ref_links')
      .select('id')
      .eq('code', refCode)
      .eq('is_active', true)
      .single();
    
    refLinkId = refLink?.id || null;
  }

  const { data, error } = await supabase
    .from('orders')
    .insert([{
      lead_id: params.leadId,
      total_gross: params.totalGross,
      discount_percent: params.discountPercent,
      total_net: params.totalNet,
      currency: 'BRL',
      status: 'pending',
      stripe_payment_intent: params.paymentIntent,
      ref_link_id: refLinkId
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }

  return data;
}

export async function createCommission(orderId: string, orderTotal: number) {
  // Buscar ref_link do pedido
  const { data: order } = await supabase
    .from('orders')
    .select('ref_link_id')
    .eq('id', orderId)
    .single();

  if (!order?.ref_link_id) {
    return null; // Sem referência, sem comissão
  }

  // Buscar afiliado
  const { data: refLink } = await supabase
    .from('ref_links')
    .select('affiliate_id, affiliates(tier_percent)')
    .eq('id', order.ref_link_id)
    .single();

  if (!refLink) {
    return null;
  }

  const affiliateId = refLink.affiliate_id;
  const tierPercent = (refLink.affiliates as any)?.tier_percent || 30;
  const commissionValue = orderTotal * (tierPercent / 100);

  const { data, error } = await supabase
    .from('commissions')
    .insert([{
      affiliate_id: affiliateId,
      order_id: orderId,
      base_amount: orderTotal,
      percent: tierPercent,
      value: commissionValue,
      status: 'pending'
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating commission:', error);
    throw error;
  }

  return data;
}

export async function lockCommissionsAfter7Days() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('commissions')
    .update({ status: 'locked', locked_at: new Date().toISOString() })
    .eq('status', 'pending')
    .lt('created_at', sevenDaysAgo.toISOString())
    .select();

  if (error) {
    console.error('Error locking commissions:', error);
    throw error;
  }

  return data;
}

export async function getAffiliateStats(affiliateId: string) {
  // Buscar ref_links do afiliado
  const { data: refLinks } = await supabase
    .from('ref_links')
    .select('id')
    .eq('affiliate_id', affiliateId);

  if (!refLinks || refLinks.length === 0) {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      pendingCommission: 0,
      lockedCommission: 0,
      paidCommission: 0
    };
  }

  const refLinkIds = refLinks.map(link => link.id);

  // Buscar pedidos
  const { data: orders } = await supabase
    .from('orders')
    .select('total_net, status')
    .in('ref_link_id', refLinkIds)
    .eq('status', 'completed');

  // Buscar comissões
  const { data: commissions } = await supabase
    .from('commissions')
    .select('value, status')
    .eq('affiliate_id', affiliateId);

  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_net.toString()), 0) || 0;
  
  const pendingCommission = commissions?.filter(c => c.status === 'pending').reduce((sum, c) => sum + parseFloat(c.value.toString()), 0) || 0;
  const lockedCommission = commissions?.filter(c => c.status === 'locked').reduce((sum, c) => sum + parseFloat(c.value.toString()), 0) || 0;
  const paidCommission = commissions?.filter(c => c.status === 'paid').reduce((sum, c) => sum + parseFloat(c.value.toString()), 0) || 0;

  return {
    totalOrders,
    totalRevenue,
    pendingCommission,
    lockedCommission,
    paidCommission
  };
}
