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
  // Plegamiento: separa la clave en grupos de 'digitos' y suma los grupos
  const digitos = capacidad.toString().length;
  const claveStr = clave.toString().padStart(Math.ceil(clave.toString().length / digitos) * digitos, '0');
  let suma = 0;
  for (let i = 0; i < claveStr.length; i += digitos) {
    suma += parseInt(claveStr.substring(i, i + digitos));
  }
  return suma % capacidad;
}

export function HashTruncamiento(clave: number, capacidad: number): number {
  // Truncamiento: toma los dígitos pares de la clave según la cantidad de dígitos de la capacidad
  const digitos = capacidad.toString().length;
  const claveStr = clave.toString();
  let resultado = '';
  let count = 0;
  for (let i = 0; i < claveStr.length && count < digitos; i++) {
    if ((i + 1) % 2 === 0) { // dígitos en posiciones pares (1-based)
      resultado += claveStr[i];
      count++;
    }
  }
  // Si no hay suficientes dígitos pares, rellena con ceros a la izquierda
  resultado = resultado.padStart(digitos, '0');
  return parseInt(resultado) % capacidad;
}