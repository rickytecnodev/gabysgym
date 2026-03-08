<template>
  <div v-if="membresia">
    <div class="row mb-3">
      <div class="col-md-6">
        <p><strong>Cliente:</strong> {{ membresia.cliente?.nombre_completo }}</p>
        <p><strong>Teléfono:</strong> {{ membresia.cliente?.telefono }}</p>
        <p><strong>WhatsApp:</strong> {{ membresia.cliente?.whatsapp || 'N/A' }}</p>
      </div>
      <div class="col-md-6">
        <p><strong>Tipo:</strong> {{ membresia.tipo_membresia?.nombre }}</p>
        <p><strong>Fecha Inicio:</strong> {{ formatFecha(membresia.fecha_inicio) }}</p>
        <p><strong>Fecha Vencimiento:</strong> {{ formatFecha(membresia.fecha_vencimiento) }}</p>
        <p><strong>Estado:</strong>
          <span :class="getEstadoBadgeClass(membresia.estado)">{{ membresia.estado }}</span>
        </p>
      </div>
    </div>
    <hr>
    <h6>Historial de Pagos</h6>
    <div v-if="pagos.length > 0" class="table-responsive">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Mes Pagado</th>
            <th>Monto</th>
            <th>Método</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pago in pagos" :key="pago.id">
            <td>{{ formatFecha(pago.fecha_pago) }}</td>
            <td>{{ formatMesPagado(pago.mes_pagado) }}</td>
            <td>${{ pago.monto.toFixed(2) }}</td>
            <td>{{ pago.metodo_pago || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="text-muted">No hay pagos registrados</p>
    <div class="mt-3 w-100">
      <div class="row g-1">
        <div class="col-6">
          <button type="button" class="btn btn-sm btn-outline-success w-100"
            :disabled="membresia?.estado === 'cancelada'"
            :title="membresia?.estado === 'cancelada' ? 'No se puede pagar una membresía cancelada' : 'Registrar pago'"
            @click="$emit('registrar-pago', membresia)">
            <i class="fa-solid fa-money-bill-wave me-1"></i>
            Pagar
          </button>
        </div>
        <div class="col-6">
          <button type="button" class="btn btn-sm btn-outline-success w-100"
            :disabled="(membresia?.estado !== 'activa' && membresia?.estado !== 'vencida') || !membresia?.cliente?.whatsapp"
            :title="(membresia?.estado !== 'activa' && membresia?.estado !== 'vencida') ? 'Solo disponible para membresías activas o vencidas' : !membresia?.cliente?.whatsapp ? 'El cliente no tiene WhatsApp' : 'Enviar recordatorio por WhatsApp'"
            @click="$emit('enviar-whatsapp', membresia)">
            <i class="fa-brands fa-whatsapp me-1"></i>
            Enviar WhatsApp
          </button>
        </div>
        <div class="col-6">
          <button v-if="membresia?.estado === 'activa' || membresia?.estado === 'vencida'"
            type="button" class="btn btn-sm btn-outline-danger w-100" title="Cancelar membresía"
            @click="$emit('cancelar', membresia.id)">
            <i class="fa-solid fa-ban me-1"></i>
            Cancelar
          </button>
          <button v-else-if="membresia?.estado === 'cancelada'" type="button"
            class="btn btn-sm btn-outline-success w-100" title="Reactivar membresía"
            @click="$emit('reactivar', membresia)">
            <i class="fa-solid fa-check-circle me-1"></i>
            Reactivar
          </button>
        </div>
        <div class="col-6">
          <button type="button" class="btn btn-sm btn-outline-primary w-100"
            title="Editar fechas de membresía" @click="$emit('editar-fechas', membresia)">
            <i class="fa-solid fa-calendar-days me-1"></i>
            Editar Fechas
          </button>
        </div>
        <div v-if="isSuperadmin" class="col-12">
          <button type="button" class="btn btn-sm btn-outline-danger w-100" title="Eliminar membresía"
            @click="$emit('eliminar', membresia)">
            <i class="fa-solid fa-trash me-1"></i>
            Eliminar Membresía
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Membresia, PagoMembresia } from '@/types/gym';
import { formatFecha, formatMesPagado } from '@/utils/dateFormatter';

defineProps<{
  membresia: Membresia | null;
  pagos: PagoMembresia[];
  isSuperadmin: boolean;
}>();

defineEmits<{
  'registrar-pago': [m: Membresia];
  'enviar-whatsapp': [m: Membresia];
  'cancelar': [id: number];
  'reactivar': [m: Membresia];
  'editar-fechas': [m: Membresia];
  'eliminar': [m: Membresia];
}>();

function getEstadoBadgeClass(estado: string) {
  const clases: Record<string, string> = {
    activa: 'badge bg-success',
    vencida: 'badge bg-danger',
    cancelada: 'badge bg-secondary'
  };
  return clases[estado] || 'badge bg-secondary';
}
</script>
