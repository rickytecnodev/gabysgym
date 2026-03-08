<template>
  <form id="formUsuario" @submit.prevent="$emit('submit')">
    <div class="mb-3">
      <label class="form-label">Usuario *</label>
      <input v-model="form.username" type="text" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">{{ usuarioEditando ? 'Nueva ' : '' }}Contraseña {{ usuarioEditando ? '(dejar vacío para no cambiar)' : '*' }}</label>
      <input v-model="form.password" type="password" class="form-control" :required="!usuarioEditando">
    </div>
    <div class="mb-3">
      <label class="form-label">Nombre Completo *</label>
      <input v-model="form.nombre_completo" type="text" class="form-control" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Email</label>
      <input v-model="form.email" type="email" class="form-control">
    </div>
    <div class="mb-3">
      <label class="form-label">Teléfono</label>
      <input v-model="form.telefono" type="text" class="form-control">
    </div>
    <div class="mb-3">
      <label class="form-label">Rol *</label>
      <select v-model="form.rol" class="form-select" required>
        <option value="empleado">Empleado</option>
        <option value="superadmin">Superadmin</option>
      </select>
    </div>
    <div class="mb-3" v-if="form.rol === 'empleado'">
      <label class="form-label">Sucursal</label>
      <select v-model.number="form.sucursal_id" class="form-select">
        <option :value="null">Sin sucursal</option>
        <option v-for="sucursal in sucursales" :key="sucursal.id" :value="sucursal.id">
          {{ sucursal.nombre }}
        </option>
      </select>
    </div>
    <div class="mb-3" v-else>
      <input v-model="form.sucursal_id" type="hidden">
    </div>
    <div class="mb-3">
      <label class="form-label">Estado *</label>
      <select v-model="form.activo" class="form-select" required>
        <option :value="true">Activo</option>
        <option :value="false">Inactivo</option>
      </select>
    </div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
  </form>
</template>

<script setup lang="ts">
import type { Sucursal } from '@/types/gym';

defineProps<{
  form: {
    username: string;
    password: string;
    nombre_completo: string;
    email: string;
    telefono: string;
    rol: string;
    sucursal_id: number | null;
    activo: boolean;
  };
  sucursales: Sucursal[];
  usuarioEditando: { id: number } | null;
  errorMessage: string;
}>();

defineEmits<{
  submit: [];
}>();
</script>
