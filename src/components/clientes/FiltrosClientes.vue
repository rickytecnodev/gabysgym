<template>
  <div class="p-3 rounded-3 border mb-2 bg-white">
    <div class="row gy-2">
      <div class="col-md-4" v-if="isSuperadmin">
        <label class="form-label">Sucursal</label>
        <select :value="filtroSucursal === null ? '' : filtroSucursal"
          @change="$emit('update:filtroSucursal', ($event.target as HTMLSelectElement).value === '' ? null : Number(($event.target as HTMLSelectElement).value))"
          class="form-select">
          <option value="">Todas</option>
          <option v-for="sucursal in sucursales" :key="sucursal.id" :value="sucursal.id">
            {{ sucursal.nombre }}
          </option>
        </select>
      </div>
      <div class="col-md-4">
        <label class="form-label">Buscar</label>
        <input :value="busqueda" @input="$emit('update:busqueda', ($event.target as HTMLInputElement).value)"
          type="text" class="form-control" placeholder="Nombre, teléfono o email...">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Sucursal } from '@/types/gym';

defineProps<{
  filtroSucursal: number | null;
  busqueda: string;
  sucursales: Sucursal[];
  isSuperadmin: boolean;
}>();

defineEmits<{
  'update:filtroSucursal': [value: number | null];
  'update:busqueda': [value: string];
}>();
</script>
