<template>
  <div v-if="pago?.membresia">
    <div class="row mb-3">
      <div class="col-md-6">
        <h6>Información del Cliente</h6>
        <p><strong>Cliente:</strong> {{ pago.membresia.cliente?.nombre_completo }}</p>
        <p><strong>Teléfono:</strong> {{ pago.membresia.cliente?.telefono }}</p>
        <p><strong>WhatsApp:</strong> {{ pago.membresia.cliente?.whatsapp || 'N/A' }}</p>
      </div>
      <div class="col-md-6">
        <h6>Información de la Membresía</h6>
        <p><strong>Tipo:</strong> {{ pago.membresia.tipo_membresia?.nombre }}</p>
        <p><strong>Fecha Inicio:</strong> {{ formatFecha(pago.membresia.fecha_inicio) }}</p>
        <p><strong>Fecha Vencimiento:</strong> {{ formatFecha(pago.membresia.fecha_vencimiento) }}</p>
        <p><strong>Estado:</strong>
          <span
            :class="pago.membresia.estado === 'activa' ? 'badge bg-success' : pago.membresia.estado === 'vencida' ? 'badge bg-danger' : 'badge bg-secondary'">
            {{ pago.membresia.estado }}
          </span>
        </p>
      </div>
    </div>
    <hr>
    <h6>Información del Pago</h6>
    <div class="row mb-3">
      <div class="col-md-6">
        <p><strong>Fecha de Pago:</strong> {{ formatFecha(pago.fecha_pago) }}</p>
        <p><strong>Monto:</strong> ${{ pago.monto.toFixed(2) }}</p>
        <p><strong>Mes Pagado:</strong> {{ formatMesPagado(pago.mes_pagado) }}</p>
      </div>
      <div class="col-md-6">
        <p><strong>Método de Pago:</strong> {{ pago.metodo_pago || 'N/A' }}</p>
        <p><strong>Empleado:</strong> {{ pago.empleado?.nombre_completo }}</p>
        <p v-if="pago.notas"><strong>Notas:</strong> {{ pago.notas }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PagoMembresia } from '@/types/gym';
import { formatFecha, formatMesPagado } from '@/utils/dateFormatter';

defineProps<{
  pago: PagoMembresia | null;
}>();
</script>
