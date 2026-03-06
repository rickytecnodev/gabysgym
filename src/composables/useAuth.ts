import { ref, computed } from 'vue';
import type { Empleado, Sucursal } from '@/types/gym';

interface User extends Empleado {
  sucursal?: Sucursal | null;
}

const SESSION_KEY = 'gym_session';
const SESSION_EXPIRY_DAYS = 7; // La sesión expira en 7 días

const currentUser = ref<User | null>(null);
const isAuthenticated = computed(() => currentUser.value !== null);
const isSuperadmin = computed(() => currentUser.value?.rol === 'superadmin');
const currentSucursalId = computed(() => currentUser.value?.sucursal_id ?? null);

// Cargar sesión desde localStorage al iniciar
const loadSession = () => {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (sessionData) {
      const { user, expiry } = JSON.parse(sessionData);
      // Verificar si la sesión no ha expirado
      if (new Date().getTime() < expiry) {
        currentUser.value = user;
        return true;
      } else {
        // Sesión expirada, limpiar
        clearSession();
      }
    }
  } catch (error) {
    console.error('Error al cargar sesión:', error);
    clearSession();
  }
  return false;
};

// Guardar sesión en localStorage
const saveSession = (user: User) => {
  try {
    // Limpiar password si existe
    const userToSave = { ...user };
    delete (userToSave as any).password;
    
    const expiry = new Date().getTime() + (SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    const sessionData = {
      user: userToSave,
      expiry
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    currentUser.value = userToSave;
    console.log('Sesión guardada:', userToSave);
  } catch (error) {
    console.error('Error al guardar sesión:', error);
    throw error;
  }
};

// Limpiar sesión
const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  currentUser.value = null;
};

// Actualizar datos del usuario actual
const refreshUser = async () => {
  if (!currentUser.value) return;
  
  try {
    const { fetchEmpleados } = await import('@/services/gymApi');
    const { data } = await fetchEmpleados();
    if (data) {
      const updatedUser = data.find(u => u.id === currentUser.value?.id);
      if (updatedUser) {
        saveSession(updatedUser as User);
      }
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
  }
};

// Inicializar al cargar el módulo
loadSession();

export const useAuth = () => {
  return {
    currentUser,
    isAuthenticated,
    isSuperadmin,
    currentSucursalId,
    saveSession,
    clearSession,
    loadSession,
    refreshUser
  };
};
