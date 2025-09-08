import { ref } from "vue";
import { busquedaLineal, validarDigitosClave } from "../utils/funciones";

export type Config = {
  capacidad: number;
  digitosClave: number;
};

export type Strategy = {
  insert: (
    estructura: (number | null)[],
    num: number,
    cfg: Config
  ) => { ok: boolean; message?: string };
  search: (
    estructura: (number | null)[],
    num: number,
    cfg: Config
  ) => number; // -1 si no
  remove: (
    estructura: (number | null)[],
    num: number,
    cfg: Config
  ) => { ok: boolean; message?: string };
};

export const linearStrategy: Strategy = {
  insert: (estructura, num, _cfg) => {
    // No duplicados
    if (busquedaLineal(estructura as (number | null)[], num) !== -1) {
      return { ok: false, message: "El elemento ya existe en la estructura." };
    }
    const idx = busquedaLineal(estructura as (number | null)[], null);
    if (idx === -1) {
      return { ok: false, message: "Se alcanzó la capacidad máxima de la estructura." };
    }
    estructura[idx] = num;
    return { ok: true };
  },
  search: (estructura, num, _cfg) => {
    return busquedaLineal(estructura as (number | null)[], num);
  },
  remove: (estructura, num, _cfg) => {
    const idx = busquedaLineal(estructura as (number | null)[], num);
    if (idx === -1) return { ok: false, message: "Elemento no encontrado" };
    estructura[idx] = null;
    return { ok: true };
  },
};

export function useStructure(strategy: Strategy = linearStrategy) {
  const valor = ref("");
  const estructura = ref<(number | null)[]>([]);
  const resultado = ref<null | boolean>(null);
  const indexBuscado = ref(-1);
  const errorMessage = ref("");
  const estructuraCreada = ref(false);
  const capacidad = ref<number | null>(null);
  const digitosClave = ref<number | null>(null);

  function crearEstructura(cap: number | null, dig: number | null) {
    errorMessage.value = "";
    if (cap === null || dig === null) {
      errorMessage.value = "Por favor completa la capacidad y la cantidad de dígitos.";
      return false;
    }
    if (cap <= 0) {
      errorMessage.value = "La capacidad debe ser un entero positivo.";
      return false;
    }
    if (dig <= 0) {
      errorMessage.value = "La cantidad de dígitos debe ser un entero positivo.";
      return false;
    }
    capacidad.value = cap;
    digitosClave.value = dig;
    estructura.value = Array(cap).fill(null);
    estructuraCreada.value = true;
    return true;
  }

  function validarValorNumerico(): number | null {
    if (valor.value === "") {
      errorMessage.value = "Ingresa un número";
      return null;
    }
    const num = parseInt(valor.value);
    if (isNaN(num)) {
      errorMessage.value = "Ingresa un número válido.";
      return null;
    }
    if (!validarDigitosClave(num, digitosClave.value)) {
      errorMessage.value = `La clave debe tener exactamente ${digitosClave.value} dígitos.`;
      return null;
    }
    return num;
  }

  function insertar() {
    resultado.value = null;
    const num = validarValorNumerico();
    if (num === null) return;
    if (!estructuraCreada.value) {
      errorMessage.value = "Primero debes crear la estructura.";
      return;
    }
    const res = strategy.insert(estructura.value, num, {
      capacidad: capacidad.value!,
      digitosClave: digitosClave.value!,
    });
    errorMessage.value = res.ok ? "" : res.message || "Error en inserción";
    if (res.ok) valor.value = "";
  }

  function buscar() {
    const num = validarValorNumerico();
    if (num === null) return;
    if (!estructuraCreada.value) {
      errorMessage.value = "Primero debes crear la estructura.";
      return;
    }
    const idx = strategy.search(estructura.value, num, {
      capacidad: capacidad.value!,
      digitosClave: digitosClave.value!,
    });
    if (idx !== -1) {
      indexBuscado.value = idx + 1;
      resultado.value = true;
      errorMessage.value = "";
    } else {
      resultado.value = false;
      errorMessage.value = "clave no encontrada";
    }
  }

  function eliminar() {
    const num = validarValorNumerico();
    if (num === null) return;
    if (!estructuraCreada.value) {
      errorMessage.value = "Primero debes crear la estructura.";
      return;
    }
    const res = strategy.remove(estructura.value, num, {
      capacidad: capacidad.value!,
      digitosClave: digitosClave.value!,
    });
    if (res.ok) {
      resultado.value = null;
      errorMessage.value = "";
      valor.value = "";
    } else {
      resultado.value = false;
      errorMessage.value = res.message || "No se pudo eliminar";
    }
  }

  function validateInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    const validChars = /^\d*$/;
    if (!validChars.test(value)) {
      target.value = value.slice(0, -1);
      errorMessage.value = "Solo se permiten números enteros positivos";
    } else {
      errorMessage.value = "";
    }
  }

  return {
    // state
    valor,
    estructura,
    resultado,
    indexBuscado,
    errorMessage,
    estructuraCreada,
    capacidad,
    digitosClave,
    // actions
    crearEstructura,
    insertar,
    buscar,
    eliminar,
    validateInput,
  };
}
