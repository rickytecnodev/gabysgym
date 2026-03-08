<template>
  <form id="formPago" @submit.prevent="$emit('submit')">
    <div v-if="membresia" class="mb-3">
      <div v-if="membresia.estado === 'vencida'" class="alert alert-warning mb-3">
        <i class="fa-solid fa-exclamation-triangle me-2"></i>
        <strong>Membresía Vencida:</strong> Al registrar el pago, la membresía se reactivará automáticamente
        y se extenderá la fecha de vencimiento.
      </div>
      <div v-if="membresia.estado === 'cancelada'" class="alert alert-info mb-3">
        <i class="fa-solid fa-info-circle me-2"></i>
        <strong>Membresía Cancelada:</strong> Al registrar el pago, la membresía se reactivará
        automáticamente y se extenderá la fecha de vencimiento desde hoy.
      </div>
      <p><strong>Cliente:</strong> {{ membresia.cliente?.nombre_completo }}</p>
      <p><strong>Tipo:</strong> {{ membresia.tipo_membresia?.nombre }}</p>
      <p><strong>Fecha Vencimiento Actual:</strong>
        <span
          :class="membresia.estado === 'vencida' || membresia.estado === 'cancelada' ? 'text-danger fw-bold' : ''">
          {{ formatFecha(membresia.fecha_vencimiento) }}
        </span>
      </p>
      <p><strong>Estado:</strong>
        <span :class="getEstadoBadgeClass(membresia.estado)">{{ membresia.estado }}</span>
      </p>
    </div>
    <div class="mb-3">
      <label class="form-label">Fecha de Pago *</label>
      <input v-model="form.fecha_pago" type="date" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Mes Pagado *</label>
      <input v-model="form.mes_pagado" type="month" class="form-control" required>
      <small class="text-muted">Formato: YYYY-MM (ej: 2026-07)</small>
    </div>
    <div class="mb-3">
      <label class="form-label">Monto *</label>
      <input v-model.number="form.monto" type="number" step="0.01" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Método de Pago</label>
      <select v-model="form.metodo_pago" class="form-select">
        <option value="">Selecciona un método</option>
        <option value="efectivo">Efectivo</option>
        <option value="tarjeta">Tarjeta</option>
        <option value="transferencia">Transferencia</option>
      </select>
    </div>
    <div class="mb-3">
      <label class="form-label">Notas</label>
      <textarea v-model="form.notas" class="form-control" rows="2"></textarea>
    </div>
    <div class="mb-3">
      <div class="form-check">
        <input :checked="extenderVencimiento" class="form-check-input" type="checkbox" id="extenderVencimiento"
          :disabled="membresia?.estado === 'vencida' || membresia?.estado === 'cancelada'"
          @change="$emit('update:extenderVencimiento', ($event.target as HTMLInputElement).checked)">
        <label class="form-check-label" for="extenderVencimiento">
          <span v-if="membresia?.estado === 'vencida' || membresia?.estado === 'cancelada'">
            <strong>Reactivar y extender fecha de vencimiento</strong> (obligatorio para membresías vencidas
            o canceladas)
          </span>
          <span v-else>
            Extender fecha de vencimiento automáticamente
          </span>
        </label>
      </div>
    </div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
  </form>
</template>

<script setup lang="ts">
import type { Membresia } from '@/types/gym';
import { formatFecha } from '@/utils/dateFormatter';

defineProps<{
  form: {
    membresia_id: number;
    fecha_pago: string;
    mes_pagado: string;
    monto: number;
    metodo_pago: string;
    notas: string;
  };
  membresia: Membresia | null;
  extenderVencimiento: boolean;
  errorMessage: string;
}>();

defineEmits<{
  submit: [];
  'update:extenderVencimiento': [value: boolean];
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
