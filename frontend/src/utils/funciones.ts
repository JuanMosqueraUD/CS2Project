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
  const digitos = capacidad.toString().length - 1; // cantidad de ceros
  const totalLen = cuadradoStr.length;
  const start = Math.floor((totalLen - digitos) / 2);
  const medio = cuadradoStr.substring(start, start + digitos);
  return parseInt(medio) % capacidad;
}

export function HashPlegamiento(clave: number, capacidad: number): number {
  // Cantidad de ceros de la capacidad decide el tamaño de grupo y cuántos dígitos devolver
  // 10 -> 1, 100 -> 2, 1000 -> 3
  const ceros = Math.max(1, capacidad.toString().length - 1);
  const claveStr = Math.abs(clave).toString();

  // Separar la clave en grupos de 'ceros' dígitos de izquierda a derecha.
  // El último grupo puede ser más corto (sobrante permitido)
  let suma = 0;
  for (let i = 0; i < claveStr.length; i += ceros) {
    const grupo = claveStr.substring(i, i + ceros);
    suma += parseInt(grupo, 10);
  }

  // Tomar los 'ceros' dígitos menos significativos del resultado de la suma
  const sumaStr = suma.toString();
  const ultimos = sumaStr.slice(-ceros); // si ceros > len, devuelve todo (está bien)
  const valor = parseInt(ultimos, 10);

  // Asegurar índice válido
  return capacidad > 0 ? (valor % capacidad) : 0;
}

export function HashTruncamiento(clave: number, capacidad: number): number {
  // cantidad de ceros en la capacidad (10->1, 100->2, 1000->3, ...)
  const ceros = Math.max(1, capacidad.toString().length - 1);
  const claveStr = Math.abs(clave).toString();

  // Tomar dígitos en posiciones pares (contadas 1-based): 2,4,6,...
  // En índice 0-based corresponde a 1,3,5,...
  let seleccion = "";
  for (let i = 1; i < claveStr.length && seleccion.length < ceros; i += 2) {
    seleccion += claveStr[i];
  }

  // Si no alcanzan los dígitos, completa con ceros a la izquierda
  if (seleccion.length === 0) seleccion = "0";
  if (seleccion.length < ceros) seleccion = seleccion.padStart(ceros, "0");
  if (seleccion.length > ceros) seleccion = seleccion.slice(0, ceros);

  const valor = parseInt(seleccion, 10);
  if (!Number.isFinite(valor)) return 0;
  return valor % capacidad;
}