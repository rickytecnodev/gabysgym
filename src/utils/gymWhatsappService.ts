/** Utilidades para notificaciones por WhatsApp para System Gym */

import type { Membresia } from '@/types/gym';

/**
 * Genera el texto del recordatorio de membresía para WhatsApp
 */
function formatRecordatorioMembresia(membresia: Membresia): string {
  const cliente = membresia.cliente;
  if (!cliente) return '';

  const fechaVencimiento = new Date(membresia.fecha_vencimiento).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = new Date(membresia.fecha_vencimiento);
  vencimiento.setHours(0, 0, 0, 0);
  const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  let msg = `👋 ¡Hola ${cliente.nombre_completo}!\n\n`;
  msg += `Te escribimos de parte de *${membresia.sucursal?.nombre || 'nuestro gimnasio'}*.\n\n`;
  
  if (diasRestantes < 0) {
    msg += `⚠️ Tu membresía *${membresia.tipo_membresia?.nombre || ''}* ha vencido el ${fechaVencimiento}.\n\n`;
    msg += `Para continuar disfrutando de nuestros servicios, te invitamos a renovar tu membresía.\n\n`;
  } else if (diasRestantes === 0) {
    msg += `⏰ Tu membresía *${membresia.tipo_membresia?.nombre || ''}* vence *hoy* (${fechaVencimiento}).\n\n`;
    msg += `Para continuar sin interrupciones, te invitamos a renovar tu membresía.\n\n`;
  } else if (diasRestantes <= 7) {
    msg += `⏰ Tu membresía *${membresia.tipo_membresia?.nombre || ''}* vence en *${diasRestantes} día${diasRestantes > 1 ? 's' : ''}* (${fechaVencimiento}).\n\n`;
    msg += `Para continuar disfrutando de nuestros servicios sin interrupciones, te invitamos a renovar tu membresía.\n\n`;
  } else {
    msg += `📅 Tu membresía *${membresia.tipo_membresia?.nombre || ''}* vence el ${fechaVencimiento}.\n\n`;
    msg += `Te recordamos que puedes renovar tu membresía en cualquier momento.\n\n`;
  }

  msg += `💰 Precio mensual: $${membresia.precio_mensual.toFixed(2)}\n\n`;
  msg += `📍 Puedes realizar el pago en nuestra sucursal:\n`;
  msg += `${membresia.sucursal?.nombre || ''}\n`;
  if (membresia.sucursal?.direccion) {
    msg += `${membresia.sucursal.direccion}\n`;
  }
  if (membresia.sucursal?.telefono) {
    msg += `Tel: ${membresia.sucursal.telefono}\n`;
  }
  
  msg += `\n🙏 ¡Esperamos verte pronto!\n\n`;
  msg += `_Equipo de ${membresia.sucursal?.nombre || 'Gimnasio'}_`;

  return msg;
}

/**
 * Formatea teléfono para wa.me: solo dígitos, código país México 52 si falta.
 */
function formatPhoneForWhatsApp(telefono: string): string {
  const digits = (telefono || '').replace(/\D/g, '');
  if (digits.length === 10) return '52' + digits;
  if (digits.length === 12 && digits.startsWith('52')) return digits;
  return digits || '';
}

/**
 * Genera el enlace de WhatsApp para enviar recordatorio de membresía.
 */
export function getWhatsAppRecordatorioUrl(membresia: Membresia): string | null {
  const cliente = membresia.cliente;
  if (!cliente?.whatsapp) return null;

  const telefono = formatPhoneForWhatsApp(cliente.whatsapp);
  if (!telefono) return null;

  const msg = formatRecordatorioMembresia(membresia);
  if (!msg) return null;

  return `https://wa.me/${telefono}?text=${encodeURIComponent(msg)}`;
}
