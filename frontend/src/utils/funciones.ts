export function busquedaLineal<T>(lista: T[], elemento: T): number {

    for (let i = 0; i < lista.length; i++) {
        if (lista[i] === elemento) {
            return i;
        }
    }
    return -1; // No encontrado
}

//arreglar urgente

export function validarDigitosClave(num: number, digitosClave: number | null): boolean {
  if (digitosClave !== null) {
    const min = Math.pow(10, digitosClave - 1);
    const max = Math.pow(10, digitosClave) - 1;
    // Si digitosClave == 1, min = 1 (aceptamos 0? asumimos que no); ajustable según preferencia
    if (num < min || num > max) {
      return false;
    }
  }
  
  return true;
}