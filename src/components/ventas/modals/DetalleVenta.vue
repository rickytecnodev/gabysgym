<template>
  <div v-if="venta">
    <p><strong>Fecha:</strong> {{ formatFecha(venta.fecha_venta) }}</p>
    <p><strong>Cliente:</strong> {{ venta.cliente?.nombre_completo || 'Cliente general' }}</p>
    <p><strong>Empleado:</strong> {{ venta.empleado?.nombre_completo }}</p>
    <p><strong>Estado:</strong>
      <span
        :class="venta.estado_pago === 'pagado' ? 'badge bg-success' : venta.estado_pago === 'pendiente' ? 'badge bg-warning' : 'badge bg-danger'">
        {{ venta.estado_pago }}
      </span>
    </p>
    <hr>
    <h6>Productos:</h6>
    <table class="table table-sm">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio Unit.</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="detalle in venta.detalles" :key="detalle.id">
          <td>{{ detalle.producto?.nombre }}</td>
          <td>{{ detalle.cantidad }}</td>
          <td>${{ detalle.precio_unitario.toFixed(2) }}</td>
          <td>${{ detalle.subtotal.toFixed(2) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th colspan="3">Total:</th>
          <th>${{ venta.total.toFixed(2) }}</th>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Venta } from '@/types/gym';
import { formatFecha } from '@/utils/dateFormatter';

defineProps<{
  venta: Venta | null;
}>();
</script>
