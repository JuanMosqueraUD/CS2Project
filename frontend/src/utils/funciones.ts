export function busquedaLineal<T>(lista: T[], elemento: T): number {

    for (let i = 0; i < lista.length; i++) {
        if (lista[i] === elemento) {
            return i;
        }
    }
    return -1; // No encontrado
}
export function validarDigitosClave(num: number, digitosClave: number | null): boolean {
  if (digitosClave == null) {
    return false;
  } else {
        const min = Math.pow(10, digitosClave - 1);
        const max = Math.pow(10, digitosClave) - 1;
        // Si digitosClave == 1, min = 1 (aceptamos 0? asumimos que no); ajustable según preferencia
        if (num < min || num > max) {
          return false;
    }
  }
  return true;
}

export function validarDigitosClaveConCeros(claveStr: string, digitosClave: number | null): boolean {
  if (digitosClave == null) {
    return false;
  }
  
  // Verificar que la clave tenga exactamente digitosClave caracteres
  if (claveStr.length !== digitosClave) {
    return false;
  }
  
  // Verificar que todos los caracteres sean dígitos
  if (!/^\d+$/.test(claveStr)) {
    return false;
  }
  
  return true;
}

export function busquedaBinaria<T>(lista: (T | null)[], elemento: T): number {
  let izquierda = 0;
  let derecha = lista.length - 1;

  while (izquierda <= derecha) {
    const medio = Math.floor((izquierda + derecha) / 2);

    if (lista[medio] === null) {
      // Si hay null en el medio, busca por la izquierda
      derecha = medio - 1;
    } else if (lista[medio] === elemento) {
      return medio;
    } else if (lista[medio]! < elemento) {
      izquierda = medio + 1;
    } else {
      derecha = medio - 1;
    }
  }
  return -1; // No encontrado
}

export function validarInput(valor: number | null, digitosClave: number | null): { msg: string; isError: boolean } {

  if (valor === null || isNaN(valor)) {
    return { msg: "Ingresa un número.", isError: true };
  }
  if (valor < 0) {
    return { msg: "El número no puede ser negativo.", isError: true };
  }

  if (isNaN(valor)) {
    return { msg: "Ingresa un número válido.", isError: true };
  }
  if (!validarDigitosClave(valor, digitosClave)) {
    return { msg: `La clave debe tener exactamente ${digitosClave} dígitos.`, isError: true };
  }
  return { msg: "", isError: false };
}

export function validarInputConCeros(claveStr: string, digitosClave: number | null): { msg: string; isError: boolean } {
  if (!claveStr || claveStr.trim() === "") {
    return { msg: "Ingresa una clave.", isError: true };
  }

  // Verificar que digitosClave esté definido
  if (digitosClave === null || digitosClave === undefined) {
    return { msg: "Primero debes configurar la cantidad de dígitos por clave.", isError: true };
  }

  if (!validarDigitosClaveConCeros(claveStr, digitosClave)) {
    return { msg: `La clave debe tener exactamente ${digitosClave} dígitos.`, isError: true };
  }

  return { msg: "", isError: false };
}


export function ordenarLista(lista: (number | null)[]): Array<number | null> {
  lista.sort((a, b) => {
    if (a === null && b === null) return 0;
    if (a === null) return 1;       // nulls al final
    if (b === null) return -1;
    return a - b;                   // números ascendente
  });
  return lista;
}


export function HashModulo(clave: number, capacidad: number): number {
  return (clave % capacidad);
}

export function HashCuadrado(clave: number, capacidad: number): number {
  const cuadrado = clave * clave;
  const cuadradoStr = cuadrado.toString().padStart(capacidad.toString().length * 2, '0');
  const digitos = Math.max(1, capacidad.toString().length - 1); // cantidad de ceros, mínimo 1
  const totalLen = cuadradoStr.length;
  const start = Math.floor((totalLen - digitos) / 2);
  const medio = cuadradoStr.substring(start, start + digitos);
  
  // Verificar que el medio no esté vacío y sea un número válido
  if (!medio || medio.length === 0) {
    // Usar los últimos dígitos como fallback
    const fallback = cuadradoStr.slice(-digitos);
    const valor = parseInt(fallback) || 0;
    return valor % capacidad;
  }
  
  const valor = parseInt(medio);
  if (isNaN(valor)) {
    // Usar hash módulo como último recurso
    return clave % capacidad;
  }
  
  return valor % capacidad;
}

export function HashPlegamiento(clave: number, capacidad: number): number {
  if (capacidad <= 0) return 0;
  
  // Determinar el tamaño de grupo basado en la capacidad
  // Para capacidad < 10: usar 1 dígito
  // Para capacidad 10-99: usar 1 dígito  
  // Para capacidad 100-999: usar 2 dígitos
  // Para capacidad 1000-9999: usar 3 dígitos, etc.
  const digitosGrupo = Math.max(1, Math.floor(Math.log10(capacidad)));
  const claveStr = Math.abs(clave).toString();

  // Separar la clave en grupos de 'digitosGrupo' dígitos de izquierda a derecha.
  // El último grupo puede ser más corto (sobrante permitido)
  let suma = 0;
  for (let i = 0; i < claveStr.length; i += digitosGrupo) {
    const grupo = claveStr.substring(i, i + digitosGrupo);
    suma += parseInt(grupo, 10);
  }

  // Aplicar módulo directamente sobre la suma para obtener el índice del bloque
  // Esto asegura que el resultado esté siempre en el rango [0, capacidad-1]
  return suma % capacidad;
}

export function HashTruncamiento(clave: number, capacidad: number): number {
  if (capacidad <= 0) return 0;
  
  const claveStr = Math.abs(clave).toString();
  
  // Tomar dígitos en posiciones pares (contadas 1-based): 2,4,6,...
  // En índice 0-based corresponde a 1,3,5,...
  // No limitamos la cantidad de dígitos seleccionados, tomamos todos los pares disponibles
  let seleccion = "";
  for (let i = 1; i < claveStr.length; i += 2) {
    seleccion += claveStr[i];
  }

  // Si no hay dígitos seleccionados, usar 0
  if (seleccion.length === 0) {
    return 0;
  }

  const valor = parseInt(seleccion, 10);
  if (!Number.isFinite(valor)) return 0;
  
  // Aplicar módulo para asegurar que el resultado esté en el rango [0, capacidad-1]
  return valor % capacidad;
}

/**
 * Función Hash Cambio de Base
 * Convierte una clave numérica a una base dada (1-9) y extrae dígitos según capacidad
 * 
 * @param clave - Número entero a hashear
 * @param capacidad - Número de bloques (determina cuántos dígitos extraer)
 * @param base - Base numérica para conversión (1-9)
 * @returns Índice del bloque (0 a capacidad-1)
 * 
 * Ejemplo: clave=1234, base=9
 * - 1 * 9^3 = 1 * 729 = 729
 * - 2 * 9^2 = 2 * 81 = 162
 * - 3 * 9^1 = 3 * 9 = 27
 * - 4 * 9^0 = 4 * 1 = 4
 * - Suma: 729 + 162 + 27 + 4 = 922
 * - Si capacidad=10 (1 dígito): tomar último dígito = 2
 * - Si capacidad=100 (2 dígitos): tomar últimos 2 dígitos = 22
 */
export function HashCambioBase(clave: number, capacidad: number, base: number): number {
  // Validaciones
  if (capacidad <= 0) return 0;
  if (base < 1 || base > 9) return 0; // Base debe estar entre 1 y 9
  
  const claveStr = Math.abs(clave).toString();
  const digitos = claveStr.split('').map(d => parseInt(d, 10));
  
  // Calcular el valor en la nueva base
  // Para cada dígito, multiplicar por base^posición (de derecha a izquierda)
  let suma = 0;
  const n = digitos.length;
  
  for (let i = 0; i < n; i++) {
    const exponente = n - 1 - i; // Posición desde la derecha (más significativo = mayor exponente)
    const valor = digitos[i] * Math.pow(base, exponente);
    suma += valor;
  }
  
  // Determinar cuántos dígitos tomar según la capacidad
  // Similar a HashPlegamiento: usar log10 de la capacidad
  const digitosNecesarios = Math.max(1, Math.floor(Math.log10(capacidad)));
  
  // Extraer los dígitos menos significativos (últimos N dígitos)
  const sumaStr = suma.toString();
  const digitosExtraidos = sumaStr.length >= digitosNecesarios 
    ? sumaStr.slice(-digitosNecesarios) 
    : sumaStr;
  
  const resultado = parseInt(digitosExtraidos, 10);
  
  // Aplicar módulo para asegurar que esté en rango [0, capacidad-1]
  return resultado % capacidad;
}