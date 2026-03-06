<template>
  <div class="login-page bg-primary d-flex align-items-center" style="background: linear-gradient(135deg, #01153a 0%, #1b294d 50%, #224a9d 100%); min-height: 100vh; margin-top: -70px; padding-top: 70px;">
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-md-5 col-lg-4">
          <div class="card shadow-lg border-0 rounded-3">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <img :src="logoPath" alt="Gym System" width="60" height="60" class="mb-3">
                <h2 class="h3 fw-bold text-dark mb-2">Iniciar Sesión</h2>
                <p class="text-muted small">Ingresa tus credenciales para continuar</p>
              </div>

              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label for="username" class="form-label fw-semibold">Usuario</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="username" 
                    v-model="formData.username" 
                    placeholder="Usuario"
                    required 
                    autocomplete="username" 
                  />
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label fw-semibold">Contraseña</label>
                  <div class="position-relative">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control pe-5"
                      id="password"
                      v-model="formData.password"
                      placeholder="••••••••"
                      required
                      autocomplete="current-password"
                    />
                    <button
                      type="button"
                      class="btn btn-link position-absolute top-50 end-0 translate-middle-y text-secondary text-decoration-none p-2"
                      :aria-label="showPassword ? 'Ocultar contraseña' : 'Ver contraseña'"
                      @click="showPassword = !showPassword"
                    >
                      <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                    </button>
                  </div>
                </div>

                <div v-if="errorMessage" class="alert alert-danger" role="alert">
                  {{ errorMessage }}
                </div>

                <div v-if="successMessage" class="alert alert-success" role="alert">
                  {{ successMessage }}
                </div>

                <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold mb-3" style="background-color: #224a9d; border-color: #224a9d;" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <span v-if="!loading">Iniciar Sesión</span>
                  <span v-else>Iniciando sesión...</span>
                </button>
              </form>

              <div class="text-center mt-3">
                <small class="text-muted">
                  <strong>Superadmin:</strong> username='superadmin', password='admin123'<br>
                  <strong>Empleado:</strong> username='empleado1/2/3', password='empleado123'
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { loginEmpleado } from '@/services/gymApi';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { saveSession } = useAuth();
const logoPath = `${import.meta.env.BASE_URL}img/logo.png`;

const formData = reactive({
  username: '',
  password: ''
});

const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const showPassword = ref(false);

const handleLogin = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  try {
    // El login automáticamente detecta la sucursal del empleado
    // El superadmin no tiene sucursal y puede acceder a todo
    const { data, error } = await loginEmpleado(
      formData.username.trim(),
      formData.password
    );

    if (error) {
      errorMessage.value = error.message || 'Error al iniciar sesión';
      return;
    }

    if (data) {
      // Guardar sesión (sin incluir la contraseña)
      const userData = {
        ...data,
        password: undefined
      };
      
      try {
        saveSession(userData);
        
        // Redirigir según el tipo de usuario
        const { isSuperadmin } = useAuth();
        if (isSuperadmin.value) {
          await router.push('/gym/dashboard');
        } else {
          await router.push('/gym/ventas');
        }
      } catch (saveError) {
        console.error('Error al guardar sesión:', saveError);
        errorMessage.value = 'Error al guardar sesión. Por favor, intenta nuevamente.';
      }
    } else {
      errorMessage.value = 'Usuario o contraseña incorrectos';
    }
  } catch (error: any) {
    errorMessage.value = 'Error de conexión. Por favor, intenta nuevamente.';
    console.error('Login error:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  margin-top: -70px;
  padding-top: 70px;
}
</style>
