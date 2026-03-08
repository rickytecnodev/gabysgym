<template>
  <form id="formVentaEdit" @submit.prevent="$emit('submit')">
    <div class="mb-3">
      <label class="form-label">Agregar Producto</label>
      <div class="row g-2 mb-2">
        <div class="col-md-4">
          <select :value="productoId" class="form-select"
            @change="$emit('update:productoId', ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null)">
            <option :value="null">Selecciona un producto</option>
            <option v-for="producto in productosDisponibles" :key="producto.id" :value="producto.id">
              {{ producto.nombre }} - ${{ producto.precio.toFixed(2) }}
            </option>
          </select>
        </div>
        <div class="col-md-2">
          <input :value="cantidad" type="number" min="1" class="form-control" placeholder="Cantidad"
            @input="$emit('update:cantidad', Number(($event.target as HTMLInputElement).value) || 0)">
        </div>
        <div class="col-md-3">
          <input :value="precio" type="number" step="0.01" min="0" class="form-control" placeholder="Precio (opcional)"
            @input="$emit('update:precio', Number(($event.target as HTMLInputElement).value) || 0)">
          <small class="text-muted">Dejar en 0 para usar precio del producto</small>
        </div>
        <div class="col-md-3">
          <button type="button" class="btn btn-primary w-100" @click="$emit('agregar-producto')">
            <i class="fa-solid fa-plus me-1"></i>
            Agregar
          </button>
        </div>
      </div>
    </div>
    <div v-if="productosVentaEdit.length > 0" class="mb-3">
      <label class="form-label">Productos en la Venta</label>
      <div class="table-responsive">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in productosVentaEdit" :key="index">
              <td>{{ item.nombre }}</td>
              <td>
                <input v-model.number="item.cantidad" type="number" min="1" class="form-control form-control-sm"
                  @change="item.subtotal = item.cantidad * item.precio_unitario">
              </td>
              <td>
                <input v-model.number="item.precio_unitario" type="number" step="0.01" min="0"
                  class="form-control form-control-sm" @change="item.subtotal = item.cantidad * item.precio_unitario">
              </td>
              <td>${{ item.subtotal.toFixed(2) }}</td>
              <td>
                <button type="button" class="btn btn-sm btn-outline-danger" @click="$emit('eliminar-producto', index)">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th colspan="3" class="text-end">Total:</th>
              <th>${{ totalEdit.toFixed(2) }}</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    <div class="mb-3">
      <label class="form-label">Estado de Pago *</label>
      <select :value="estadoPago" class="form-select" required
        @change="$emit('update:estadoPago', ($event.target as HTMLSelectElement).value as 'pagado' | 'pendiente' | 'cancelado')">
        <option value="pagado">Pagado</option>
        <option value="pendiente">Pendiente</option>
        <option value="cancelado">Cancelado</option>
      </select>
    </div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
  </form>
</template>

<script setup lang="ts">
import type { Producto } from '@/types/gym';

defineProps<{
  productosDisponibles: Producto[];
  productoId: number | null;
  cantidad: number;
  precio: number;
  productosVentaEdit: Array<{ producto_id: number; cantidad: number; precio_unitario: number; subtotal: number; nombre: string }>;
  totalEdit: number;
  estadoPago: 'pagado' | 'pendiente' | 'cancelado';
  errorMessage: string;
}>();

defineEmits<{
  submit: [];
  'update:productoId': [v: number | null];
  'update:cantidad': [v: number];
  'update:precio': [v: number];
  'update:estadoPago': [v: 'pagado' | 'pendiente' | 'cancelado'];
  'agregar-producto': [];
  'eliminar-producto': [index: number];
}>();
</script>
