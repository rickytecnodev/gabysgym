<template>
  <div class="bg-light min-vh-100">
    <div class="container-fluid py-2">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h3 mb-0">Usuarios</h1>
        <button @click="abrirModalNuevo" class="btn btn-primary">
          <i class="fa-solid fa-plus me-1"></i>
          Nuevo Usuario
        </button>
      </div>

      <!-- Tabla de usuarios (Desktop) -->
      <div class="d-none d-md-block mb-2">
        <TablaUsuarios :usuarios="usuarios" :loading="loadingData" @editar="editarUsuario"
          @eliminar="eliminarUsuario" />
      </div>

      <!-- Vista móvil de usuarios (Mobile) -->
      <div class="d-block d-md-none mb-2">
        <TablaUsuariosMobile :usuarios="usuarios" :loading="loadingData" @editar="editarUsuario"
          @eliminar="eliminarUsuario" />
      </div>

      <!-- Modal de usuario (editar/crear) -->
      <GymModal v-model:show="showModal" :title="(usuarioEditando ? 'Editar' : 'Nuevo') + ' Usuario'">
        <ModalFormUsuario :form="formUsuario" :sucursales="sucursales" :usuario-editando="usuarioEditando"
          :error-message="errorMessage" @submit="guardarUsuario" />
        <template #footer>
          <button type="button" class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
          <button type="submit" form="formUsuario" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            Guardar
          </button>
        </template>
      </GymModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchEmpleados, createEmpleado, updateEmpleado, deleteEmpleado, fetchSucursales } from '@/services/gymApi';
import type { Empleado, Sucursal } from '@/types/gym';
import GymModal from '@/components/GymModal.vue';
import TablaUsuarios from '@/components/usuarios/TablaUsuarios.vue';
import TablaUsuariosMobile from '@/components/usuarios/TablaUsuariosMobile.vue';
import ModalFormUsuario from '@/components/usuarios/modals/FormUsuario.vue';
import Swal from 'sweetalert2';

const usuarios = ref<Empleado[]>([]);
const sucursales = ref<Sucursal[]>([]);
const showModal = ref(false);
const usuarioEditando = ref<Empleado | null>(null);
const loading = ref(false);
const loadingData = ref(true);
const errorMessage = ref('');

const formUsuario = ref({
  username: '',
  password: '',
  email: '',
  nombre_completo: '',
  telefono: '',
  rol: 'empleado' as 'superadmin' | 'empleado',
  sucursal_id: null as number | null,
  activo: true
});

onMounted(async () => {
  await loadSucursales();
  await loadUsuarios();
});

const loadSucursales = async () => {
  const { data } = await fetchSucursales();
  if (data) {
    sucursales.value = data;
  }
};

const loadUsuarios = async () => {
  loadingData.value = true;
  const { data, error } = await fetchEmpleados();
  if (error) {
    Swal.fire('Error', error.message, 'error');
  } else if (data) {
    usuarios.value = data;
  }
  loadingData.value = false;
};

const abrirModalNuevo = () => {
  usuarioEditando.value = null;
  formUsuario.value = {
    username: '',
    password: '',
    email: '',
    nombre_completo: '',
    telefono: '',
    rol: 'empleado',
    sucursal_id: null,
    activo: true
  };
  errorMessage.value = '';
  showModal.value = true;
};

const editarUsuario = (usuario: Empleado) => {
  usuarioEditando.value = usuario;
  formUsuario.value = {
    username: usuario.username,
    password: '', // No mostrar la contraseña
    email: usuario.email || '',
    nombre_completo: usuario.nombre_completo,
    telefono: usuario.telefono || '',
    rol: usuario.rol,
    sucursal_id: usuario.sucursal_id || null,
    activo: usuario.activo
  };
  errorMessage.value = '';
  showModal.value = true;
};

const cerrarModal = () => {
  showModal.value = false;
  usuarioEditando.value = null;
  formUsuario.value = {
    username: '',
    password: '',
    email: '',
    nombre_completo: '',
    telefono: '',
    rol: 'empleado',
    sucursal_id: null,
    activo: true
  };
  errorMessage.value = '';
};

const guardarUsuario = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    let result;

    if (usuarioEditando.value) {
      // Actualizar usuario
      const payload: any = {
        username: formUsuario.value.username,
        email: formUsuario.value.email || null,
        nombre_completo: formUsuario.value.nombre_completo,
        telefono: formUsuario.value.telefono || null,
        rol: formUsuario.value.rol,
        sucursal_id: formUsuario.value.rol === 'empleado' ? (formUsuario.value.sucursal_id || null) : null,
        activo: formUsuario.value.activo
      };

      // Solo incluir password si se proporcionó uno nuevo
      if (formUsuario.value.password) {
        payload.password = formUsuario.value.password;
      }

      result = await updateEmpleado(usuarioEditando.value.id, payload);
    } else {
      // Crear usuario
      if (!formUsuario.value.password) {
        errorMessage.value = 'Debes ingresar una contraseña';
        loading.value = false;
        return;
      }

      result = await createEmpleado({
        username: formUsuario.value.username,
        password: formUsuario.value.password,
        email: formUsuario.value.email || null,
        nombre_completo: formUsuario.value.nombre_completo,
        telefono: formUsuario.value.telefono || null,
        rol: formUsuario.value.rol,
        sucursal_id: formUsuario.value.rol === 'empleado' ? (formUsuario.value.sucursal_id || null) : null,
        activo: formUsuario.value.activo
      });
    }

    if (result.error) {
      errorMessage.value = result.error.message;
      loading.value = false;
      return;
    }

    Swal.fire('Éxito', `Usuario ${usuarioEditando.value ? 'actualizado' : 'creado'} correctamente`, 'success');
    cerrarModal();
    await loadUsuarios();
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al guardar usuario';
  } finally {
    loading.value = false;
  }
};

const eliminarUsuario = async (usuario: Empleado) => {
  const result = await Swal.fire({
    title: '¿Eliminar usuario?',
    text: `¿Estás seguro de eliminar a ${usuario.nombre_completo}? Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc3545'
  });

  if (result.isConfirmed) {
    const { error } = await deleteEmpleado(usuario.id);
    if (error) {
      Swal.fire('Error', error.message, 'error');
    } else {
      Swal.fire('Éxito', 'Usuario eliminado correctamente', 'success');
      await loadUsuarios();
    }
  }
};
</script>
