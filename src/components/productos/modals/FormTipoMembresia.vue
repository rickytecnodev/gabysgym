<template>
  <form id="formTipoMembresia" @submit.prevent="$emit('submit')">
    <div class="mb-3">
      <label class="form-label">Nombre *</label>
      <input v-model="form.nombre" type="text" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Descripción</label>
      <textarea v-model="form.descripcion" class="form-control" rows="2"></textarea>
    </div>
    <div class="row">
      <div class="col-md-6 mb-3">
        <label class="form-label">Precio Mensual *</label>
        <input v-model.number="form.precio_mensual" type="number" step="0.01" class="form-control" required>
      </div>
      <div class="col-md-6 mb-3">
        <label class="form-label">Duración (días) *</label>
        <input v-model.number="form.duracion_dias" type="number" class="form-control" required>
      </div>
    </div>
    <div class="mb-3">
      <label class="form-label">Estado *</label>
      <select v-model="form.activa" class="form-select" required>
        <option :value="true">Activa</option>
        <option :value="false">Inactiva</option>
      </select>
    </div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
  </form>
</template>

<script setup lang="ts">
defineProps<{
  form: {
    nombre: string;
    descripcion: string;
    precio_mensual: number;
    duracion_dias: number;
    activa: boolean;
  };
  errorMessage: string;
}>();

defineEmits<{
  submit: [];
}>();
</script>
