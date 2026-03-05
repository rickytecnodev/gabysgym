import { ref, Ref } from 'vue';

interface FilterState {
  periodo?: string;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  clienteId?: number;
}

const filterState: Ref<FilterState | null> = ref(null);

export function useGymFilters() {
  const setFilters = (filters: FilterState) => {
    filterState.value = filters;
  };

  const getFilters = (): FilterState | null => {
    return filterState.value;
  };

  const clearFilters = () => {
    filterState.value = null;
  };

  return {
    setFilters,
    getFilters,
    clearFilters
  };
}
