<template>
  <form id="formVenta" @submit.prevent="$emit('submit')">
    <div class="mb-3" v-if="isSuperadmin">
      <label class="form-label">Sucursal *</label>
      <select :value="sucursalId" class="form-select" required
        @change="$emit('update:sucursalId', ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null)">
        <option value="">Selecciona una sucursal</option>
        <option v-for="sucursal in sucursales" :key="sucursal.id" :value="sucursal.id">
          {{ sucursal.nombre }}
        </option>
      </select>
    </div>
    <div class="mb-3">
      <label class="form-label">Cliente (opcional)</label>
      <select v-model="form.cliente_id" class="form-select">
        <option :value="null">Cliente general</option>
        <option v-for="cliente in clientesFiltrados" :key="cliente.id" :value="cliente.id">
          {{ cliente.nombre_completo }} - {{ cliente.telefono }}
        </option>
      </select>
    </div>
    <div class="mb-3">
      <label class="form-label">Productos</label>
      <div class="d-flex gap-2 mb-2">
        <select :value="productoId" class="form-select flex-grow-1"
          @change="$emit('update:productoId', ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null)">
          <option value="">Selecciona un producto</option>
          <option v-for="producto in productosDisponibles" :key="producto.id" :value="producto.id">
            {{ producto.nombre }} - ${{ producto.precio.toFixed(2) }} (Stock: {{ producto.stock }})
          </option>
        </select>
        <input :value="cantidad" type="number" min="1" class="form-control" style="width: 100px;" placeholder="Cant."
          @input="$emit('update:cantidad', Number(($event.target as HTMLInputElement).value) || 0)">
        <button type="button" class="btn btn-primary" :disabled="!productoId || !cantidad" @click="$emit('agregar-producto')">
          Agregar
        </button>
      </div>
      <div v-if="productosVenta.length > 0" class="table-responsive">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in productosVenta" :key="index">
              <td>{{ item.nombre }}</td>
              <td>{{ item.cantidad }}</td>
              <td>${{ item.precio.toFixed(2) }}</td>
              <td>${{ (item.precio * item.cantidad).toFixed(2) }}</td>
              <td>
                <button type="button" class="btn btn-sm btn-outline-danger" @click="$emit('quitar-producto', index)">
                  <i class="fa-solid fa-times"></i>
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th colspan="3">Total:</th>
              <th>${{ totalVenta.toFixed(2) }}</th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    <div class="mb-3">
      <label class="form-label">Estado de Pago *</label>
      <select v-model="form.estado_pago" class="form-select" required>
        <option value="pagado">Pagado</option>
        <option value="pendiente">Pendiente</option>
      </select>
    </div>
    <div class="mb-3">
      <label class="form-label">Notas</label>
      <textarea v-model="form.notas" class="form-control" rows="2"></textarea>
    </div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
  </form>
</template>

<script setup lang="ts">
import type { VentaForm } from '@/types/gym';
import type { Sucursal, Cliente, Producto } from '@/types/gym';

defineProps<{
  form: VentaForm;
  sucursales: Sucursal[];
  clientesFiltrados: Cliente[];
  productosDisponibles: Producto[];
  sucursalId: number | null;
  productoId: number | null;
  cantidad: number;
  productosVenta: Array<{ producto_id: number; cantidad: number; precio: number; nombre: string }>;
  totalVenta: number;
  isSuperadmin: boolean;
  errorMessage: string;
}>();

defineEmits<{
  submit: [];
  'update:sucursalId': [v: number | null];
  'update:productoId': [v: number | null];
  'update:cantidad': [v: number];
  'agregar-producto': [];
  'quitar-producto': [index: number];
}>();
</script>
