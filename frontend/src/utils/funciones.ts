export function busquedaLineal<T>(lista: T[], elemento: T): number {

    for (let i = 0; i < lista.length; i++) {
        if (lista[i] === elemento) {
            return i;
        }
    }
    return -1; // No encontrado
}

