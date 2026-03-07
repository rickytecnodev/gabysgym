<template>
  <Teleport to="body">
    <div v-if="show" class="gym-modal" role="dialog" aria-modal="true" aria-labelledby="gym-modal-title"
      @click.self="cerrar">
      <div :class="['gym-modal__box', size ? `gym-modal__box--${size}` : '']">
        <header class="gym-modal__header">
          <button type="button" class="btn btn-secondary-outline" aria-label="Cerrar" @click="cerrar">
            <i class="fa-solid fa-left-long" @click="cerrar"></i>
          </button>
          
          <h2 id="gym-modal-title" class="gym-modal__title">{{ title }}</h2>
          <button type="button" class="btn btn-secondary-outline" aria-label="Cerrar" @click="cerrar">
            <i class="fa-solid fa-xmark" @click="cerrar"></i>
          </button>
        </header>
        <div class="gym-modal__body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="gym-modal__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  title: string;
  size?: 'sm' | 'lg' | 'xl';
}>();

const emit = defineEmits<{
  'update:show': [value: boolean];
}>();

const cerrar = () => {
  emit('update:show', false);
};
</script>

<style scoped>
.gym-modal {
  position: fixed;
  inset: 0;
  z-index: 1055;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.5);
  overflow-y: auto;
}

.gym-modal__box {
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  background-color: var(--bs-body-bg, #fff);
  border-radius: var(--bs-border-radius-lg, 0.5rem);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  margin: auto;
}

.gym-modal__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid var(--bs-border-color, #dee2e6);
  background-color: var(--bs-body-bg, #fff);
  border-radius: var(--bs-border-radius-lg, 0.5rem) var(--bs-border-radius-lg, 0.5rem) 0 0;
}

.gym-modal__back {
  display: none;
  /* En escritorio no se muestra */
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  margin: -0.25rem 0 -0.25rem -0.5rem;
  border: none;
  background: none;
  color: var(--bs-primary, #0d6efd);
  cursor: pointer;
  border-radius: 0.25rem;
}

.gym-modal__back:hover {
  background-color: rgba(13, 110, 253, 0.1);
}


/* Tamaño del título: cambia --gym-modal-title-size o font-size aquí */
.gym-modal__title {
  flex: 1;
  margin: 0;
  font-size: var(--gym-modal-title-size, 1.25rem);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gym-modal__back:not([hidden])~.gym-modal__title {
  text-align: left;
}

.gym-modal__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  background: none;
  color: #6c757d;
  cursor: pointer;
  border-radius: 0.25rem;
}

.gym-modal__close:hover {
  color: #000;
  background-color: rgba(0, 0, 0, 0.06);
}

.gym-modal__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 1rem;
  -webkit-overflow-scrolling: touch;
}

.gym-modal__footer {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--bs-border-color, #dee2e6);
  background-color: var(--bs-body-bg, #fff);
  border-radius: 0 0 var(--bs-border-radius-lg, 0.5rem) var(--bs-border-radius-lg, 0.5rem);
}

/* Tamaños en escritorio */
.gym-modal__box.gym-modal__box--sm {
  max-width: 400px;
}

.gym-modal__box.gym-modal__box--lg {
  max-width: 800px;
}

.gym-modal__box.gym-modal__box--xl {
  max-width: 1140px;
}

/* ========== Móvil: pantalla completa, footer siempre visible ========== */
@media (max-width: 767.98px) {
  .gym-modal {
    padding: 0;
    align-items: stretch;
    justify-content: flex-start;
    overflow: hidden;
    height: 100vh;
    height: 100dvh; /* Altura visible real (evita que el footer quede oculto) */
    min-height: 0;
  }

  .gym-modal__box {
    max-width: none;
    width: 100%;
    height: 100%;
    min-height: 0; /* Necesario para que el flex body haga scroll */
    max-height: 100%;
    border-radius: 0;
    box-shadow: none;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .gym-modal__body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .gym-modal__back {
    display: flex;
  }

  .gym-modal__title {
    text-align: left;
  }

  /* Mismo estilo que el nav: mismo color para que no se note en móvil */
  .gym-modal__header {
    border-radius: 0;
    flex-shrink: 0;
    background-color: var(--gym-primary);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .gym-modal__header .gym-modal__title {
    color: #fff;
  }

  .gym-modal__header .btn {
    color: rgba(255, 255, 255, 0.9);
    border-color: rgba(255, 255, 255, 0.5);
    background: transparent;
  }

  .gym-modal__header .btn:hover {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.8);
    background-color: rgba(255, 255, 255, 0.15);
  }

  .gym-modal__footer {
    border-radius: 0;
    flex-shrink: 0;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
  }
}
</style>
