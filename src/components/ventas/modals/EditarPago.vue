<template>
  <form id="formPagoEdit" @submit.prevent="$emit('submit')">
    <div class="mb-3">
      <label class="form-label">Fecha de Pago *</label>
      <input v-model="form.fecha_pago" type="date" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Monto *</label>
      <input v-model.number="form.monto" type="number" step="0.01" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Mes Pagado *</label>
      <input v-model="form.mes_pagado" type="month" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Método de Pago</label>
      <select v-model="form.metodo_pago" class="form-select">
        <option value="">Selecciona...</option>
        <option value="efectivo">Efectivo</option>
        <option value="tarjeta">Tarjeta</option>
        <option value="transferencia">Transferencia</option>
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
defineProps<{
  form: {
    fecha_pago: string;
    monto: number;
    mes_pagado: string;
    metodo_pago: string;
    notas: string;
  };
  errorMessage: string;
}>();

defineEmits<{
  submit: [];
}>();
</script>
