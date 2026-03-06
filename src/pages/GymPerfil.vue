<template>
  <div class="bg-light min-vh-100">
    <GymNavbar />
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="h3 mb-0">Editar Mis Datos</h1>
          </div>

          <!-- Modal de editar datos -->
          <div class="card">
            <div class="card-body">
              <form @submit.prevent="guardarDatos">
                <div class="mb-3">
                  <label class="form-label">Usuario *</label>
                  <input v-model="formUsuario.username" type="text" class="form-control" required :disabled="loading">
                </div>

                <div class="mb-3">
                  <label class="form-label">Nombre Completo *</label>
                  <input v-model="formUsuario.nombre_completo" type="text" class="form-control" required
                    :disabled="loading">
                </div>

                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input v-model="formUsuario.email" type="email" class="form-control" :disabled="loading">
                </div>

                <div class="mb-3">
                  <label class="form-label">Teléfono</label>
                  <input v-model="formUsuario.telefono" type="text" class="form-control" :disabled="loading">
                </div>

                <div class="mb-3">
                  <label class="form-label">Nueva Contraseña</label>
                  <input v-model="formUsuario.password" type="password" class="form-control"
                    placeholder="Dejar vacío para no cambiar" :disabled="loading">
                  <small class="text-muted">Deja este campo vacío si no deseas cambiar tu contraseña</small>
                </div>

                <div v-if="errorMessage" class="alert alert-danger">
                  {{ errorMessage }}
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <router-link to="/gym/dashboard" class="btn btn-secondary" :disabled="loading">
                    Cancelar
                  </router-link>
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { updateEmpleado } from '@/services/gymApi';
import Swal from 'sweetalert2';
import GymNavbar from '@/components/GymNavbar.vue';

const router = useRouter();
const { currentUser, refreshUser } = useAuth();

const loading = ref(false);
const errorMessage = ref('');

const formUsuario = ref({
  username: '',
  nombre_completo: '',
  email: '',
  telefono: '',
  password: ''
});

onMounted(() => {
  if (currentUser.value) {
    formUsuario.value = {
      username: currentUser.value.username,
      nombre_completo: currentUser.value.nombre_completo,
      email: currentUser.value.email || '',
      telefono: currentUser.value.telefono || '',
      password: ''
    };
  } else {
    router.push('/gym/login');
  }
});

const guardarDatos = async () => {
  if (!currentUser.value) {
    errorMessage.value = 'Usuario no autenticado';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const payload: any = {
      username: formUsuario.value.username,
      nombre_completo: formUsuario.value.nombre_completo,
      email: formUsuario.value.email || null,
      telefono: formUsuario.value.telefono || null
    };

    // Solo incluir password si se proporcionó uno nuevo
    if (formUsuario.value.password) {
      payload.password = formUsuario.value.password;
    }

    const result = await updateEmpleado(currentUser.value.id, payload);

    if (result.error) {
      errorMessage.value = result.error.message;
      loading.value = false;
      return;
    }

    // Actualizar la sesión del usuario
    if (result.data) {
      await refreshUser();
    }

    Swal.fire('Éxito', 'Datos actualizados correctamente', 'success');
    router.push('/gym/dashboard');
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al actualizar los datos';
  } finally {
    loading.value = false;
  }
};
</script>
