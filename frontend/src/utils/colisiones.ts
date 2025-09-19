/**
 * Estrategia de resolución de colisiones: sondeo lineal.
 * Dada una posición original, retorna la siguiente posición linealmente (pos + 1).
 * Nota: Quien la use debe aplicar el módulo con la capacidad de la tabla para envolver.
 */
export function sondeoLineal(posicion: number): number {
	return posicion + 1;
}

/**
 * Estrategia de resolución de colisiones: sondeo por cuadrados en base 2.
 * Parámetro `veces` es 1-based: 1 => 2^0, 2 => 2^1, 3 => 2^2, ...
 * Por compatibilidad, si se pasa 0 también se interpreta como la primera vez (2^0).
 * Retorna la posición desplazada por 2^(veces-1).
 * Ejemplos: 1ra vez -> +1, 2da vez -> +2, 3ra vez -> +4, 4ta vez -> +8, ...
 * Nota: Quien la use debe aplicar el módulo con la capacidad de la tabla para envolver.
 */
export function sondeoPorCuadrados(posicion: number, veces: number): number {
	const exp = Math.max(0, Math.floor(veces) - 1); // Asegura 1-based; si <=0, usa 0
	const incremento = 2 ** exp;
	return posicion + incremento;
}

/**
 * Estrategia de resolución de colisiones: doble hash (simplificada).
 * Independientemente de la función hash original, el paso es constante (+2).
 * Nota: Quien la use debe aplicar el módulo con la capacidad de la tabla para envolver.
 */
export function sondeoDobleHash(posicion: number): number {
  return posicion + 2;
}

