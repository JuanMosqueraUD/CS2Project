// Prueba de HashCuadrado con configuración problemática
console.log("=== PRUEBA DE HASH CUADRADO CORREGIDO ===");

function HashCuadrado(clave, capacidad) {
  const cuadrado = clave * clave;
  const cuadradoStr = cuadrado.toString().padStart(capacidad.toString().length * 2, '0');
  const digitos = Math.max(1, capacidad.toString().length - 1); // cantidad de ceros, mínimo 1
  const totalLen = cuadradoStr.length;
  const start = Math.floor((totalLen - digitos) / 2);
  const medio = cuadradoStr.substring(start, start + digitos);
  
  console.log(`Clave: ${clave}, Cuadrado: ${cuadrado}, CuadradoStr: "${cuadradoStr}", Dígitos: ${digitos}, Start: ${start}, Medio: "${medio}"`);
  
  // Verificar que el medio no esté vacío y sea un número válido
  if (!medio || medio.length === 0) {
    // Usar los últimos dígitos como fallback
    const fallback = cuadradoStr.slice(-digitos);
    const valor = parseInt(fallback) || 0;
    console.log(`  Fallback usado: "${fallback}" -> ${valor % capacidad}`);
    return valor % capacidad;
  }
  
  const valor = parseInt(medio);
  if (isNaN(valor)) {
    // Usar hash módulo como último recurso
    console.log(`  Hash módulo usado: ${clave % capacidad}`);
    return clave % capacidad;
  }
  
  console.log(`  Resultado: ${valor % capacidad}`);
  return valor % capacidad;
}

// Configuración problemática: capacidad 10 -> 4 bloques
const capacidad = 10;
const elementosPorBloque = Math.floor(Math.sqrt(capacidad)); // 3
const numeroBloques = Math.ceil(capacidad / elementosPorBloque); // 4

console.log(`Capacidad: ${capacidad}, Elementos por bloque: ${elementosPorBloque}, Número de bloques: ${numeroBloques}`);
console.log("");

// Probar con claves de 4 dígitos (como indica el problema)
const clavesPrueba = [1000, 1234, 5678, 9999, 2500, 3600];

clavesPrueba.forEach(clave => {
  const hash = HashCuadrado(clave, numeroBloques);
  console.log(`HashCuadrado(${clave}, ${numeroBloques}) = ${hash}`);
});

console.log("\n¡Prueba completada sin errores!");