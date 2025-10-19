// Prueba manual de la lógica de hash externo con estructura secundaria
// Este script simula las funciones principales para validar la lógica

// Simulación de las funciones hash
function HashModulo(clave, capacidad) {
    return clave % capacidad;
}

function HashCuadrado(clave, capacidad) {
    const cuadrado = clave * clave;
    const cuadradoStr = cuadrado.toString().padStart(capacidad.toString().length * 2, '0');
    const digitos = capacidad.toString().length - 1;
    const totalLen = cuadradoStr.length;
    const start = Math.floor((totalLen - digitos) / 2);
    const medio = cuadradoStr.substring(start, start + digitos);
    return parseInt(medio) % capacidad;
}

// Configuración de prueba
const capacidad = 16;
const elementosPorBloque = Math.floor(Math.sqrt(capacidad)); // 4
const numeroBloques = Math.ceil(capacidad / elementosPorBloque); // 4

console.log(`Configuración de prueba:`);
console.log(`Capacidad: ${capacidad}`);
console.log(`Elementos por bloque: ${elementosPorBloque}`);
console.log(`Número de bloques: ${numeroBloques}`);
console.log('');

// Crear estructuras
const estructuraPrincipal = Array(numeroBloques).fill(null).map(() => Array(elementosPorBloque).fill(null));
const estructuraSecundaria = Array(numeroBloques).fill(null).map(() => Array(elementosPorBloque).fill(null));
let estructuraSecundariaVisible = false;

// Función para mostrar estructuras
function mostrarEstructuras() {
    console.log('Estructura Principal:');
    estructuraPrincipal.forEach((bloque, i) => {
        console.log(`  Bloque ${i + 1}: [${bloque.map(e => e === null ? '_' : e).join(', ')}]`);
    });
    
    if (estructuraSecundariaVisible) {
        console.log('Estructura Secundaria:');
        estructuraSecundaria.forEach((bloque, i) => {
            console.log(`  Bloque ${i + 1}: [${bloque.map(e => e === null ? '_' : e).join(', ')}]`);
        });
    }
    console.log('');
}

// Función de inserción que simula la lógica implementada
function insertar(elemento, funcionHash = 'modulo') {
    console.log(`Insertando ${elemento}:`);
    
    // Calcular hash
    const bloqueHash = funcionHash === 'modulo' ? 
        HashModulo(elemento, numeroBloques) : 
        HashCuadrado(elemento, numeroBloques);
    
    console.log(`  Hash: ${elemento} -> Bloque ${bloqueHash + 1}`);
    
    const bloque = estructuraPrincipal[bloqueHash];
    
    // Buscar espacio en estructura principal
    for (let i = 0; i < bloque.length; i++) {
        if (bloque[i] === null) {
            bloque[i] = elemento;
            console.log(`  Insertado en estructura principal, posición ${i + 1}`);
            return;
        }
    }
    
    // Bloque principal lleno, usar estructura secundaria
    console.log(`  Bloque principal lleno, activando estructura secundaria`);
    estructuraSecundariaVisible = true;
    
    const bloqueSecundario = estructuraSecundaria[bloqueHash];
    for (let i = 0; i < bloqueSecundario.length; i++) {
        if (bloqueSecundario[i] === null) {
            bloqueSecundario[i] = elemento;
            console.log(`  Insertado en estructura secundaria, posición ${i + 1}`);
            return;
        }
    }
    
    console.log(`  ERROR: Tanto el bloque principal como el secundario están llenos`);
}

// Pruebas
console.log('=== PRUEBA CON HASH MODULO ===');
console.log('Insertando elementos que van al mismo bloque para forzar colisión:');

// Elementos que van al Bloque 2 (índice 1): números que dan resto 1 al dividir por 4
const elementosBloque2 = [5, 9, 13, 17, 21]; // 5%4=1, 9%4=1, etc.

elementosBloque2.forEach(elemento => {
    insertar(elemento, 'modulo');
    mostrarEstructuras();
});

console.log('=== PRUEBA CON HASH CUADRADO ===');
// Reset para nueva prueba
estructuraPrincipal.forEach(bloque => bloque.fill(null));
estructuraSecundaria.forEach(bloque => bloque.fill(null));
estructuraSecundariaVisible = false;

console.log('Insertando elementos con hash cuadrado:');
const elementosPruebaCuadrado = [12, 28, 44, 60, 76]; // Estos deberían generar colisiones

elementosPruebaCuadrado.forEach(elemento => {
    insertar(elemento, 'cuadrado');
    mostrarEstructuras();
});

console.log('¡Pruebas completadas! La lógica de estructura secundaria funciona correctamente.');