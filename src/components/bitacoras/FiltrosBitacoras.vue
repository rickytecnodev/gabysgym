<template>
  <div class="p-3 rounded-3 border mb-2 bg-white">
    <div class="row gy-2">
      <div class="col-md-6">
        <label class="form-label">Fecha Desde</label>
        <input
          :value="filtroFechaDesde"
          @input="$emit('update:filtroFechaDesde', ($event.target as HTMLInputElement).value)"
          type="date"
          class="form-control"
        >
      </div>
      <div class="col-md-6">
        <label class="form-label">Fecha Hasta</label>
        <input
          :value="filtroFechaHasta"
          @input="$emit('update:filtroFechaHasta', ($event.target as HTMLInputElement).value)"
          type="date"
          class="form-control"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  filtroFechaDesde: string;
  filtroFechaHasta: string;
}>();

defineEmits<{
  'update:filtroFechaDesde': [value: string];
  'update:filtroFechaHasta': [value: string];
}>();
</script>
