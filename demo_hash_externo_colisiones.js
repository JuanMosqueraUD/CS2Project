// Demostración de ambos métodos de resolución de colisiones en Hash Externo
console.log("=== DEMOSTRACIÓN: RESOLUCIÓN DE COLISIONES EN HASH EXTERNO ===\n");

// Configuración de prueba
const capacidad = 10;
const elementosPorBloque = Math.floor(Math.sqrt(capacidad)); // 3
const numeroBloques = Math.ceil(capacidad / elementosPorBloque); // 4

console.log(`Configuración:`);
console.log(`- Capacidad total: ${capacidad} elementos`);
console.log(`- Elementos por bloque: ${elementosPorBloque}`);
console.log(`- Número de bloques: ${numeroBloques}`);
console.log(`- Función hash: Módulo\n`);

// Simulación de función hash módulo
function hashModulo(clave, bloques) {
    return clave % bloques;
}

// Simulación Método 1: Estructura Secundaria
console.log("=== MÉTODO 1: ESTRUCTURA SECUNDARIA ===");

const estructuraPrincipal = Array(numeroBloques).fill(null).map(() => Array(elementosPorBloque).fill(null));
const estructuraSecundaria = Array(numeroBloques).fill(null).map(() => Array(elementosPorBloque).fill(null));
let estructuraSecundariaVisible = false;
let elementosInsertados1 = 0;

function mostrarEstructuraSecundaria() {
    console.log("\nEstructura Principal:");
    estructuraPrincipal.forEach((bloque, i) => {
        const contenido = bloque.map(e => e === null ? '_' : e).join(', ');
        console.log(`  Bloque ${i + 1}: [${contenido}]`);
    });
    
    if (estructuraSecundariaVisible) {
        console.log("\nEstructura Secundaria:");
        estructuraSecundaria.forEach((bloque, i) => {
            const contenido = bloque.map(e => e === null ? '_' : e).join(', ');
            console.log(`  Bloque ${i + 1}: [${contenido}]`);
        });
    }
}

function insertarEstructuraSecundaria(elemento) {
    if (elementosInsertados1 >= capacidad) {
        console.log(`❌ Capacidad máxima alcanzada (${capacidad})`);
        return false;
    }

    const bloqueHash = hashModulo(elemento, numeroBloques);
    const bloque = estructuraPrincipal[bloqueHash];
    
    // Intentar insertar en estructura principal
    for (let i = 0; i < bloque.length; i++) {
        if (bloque[i] === null) {
            bloque[i] = elemento;
            elementosInsertados1++;
            console.log(`✅ Insertado ${elemento} en Bloque ${bloqueHash + 1} (principal) - ${elementosInsertados1}/${capacidad}`);
            return true;
        }
    }
    
    // Si está lleno, usar estructura secundaria
    if (!estructuraSecundariaVisible) {
        estructuraSecundariaVisible = true;
        console.log("🔄 Activando estructura secundaria...");
    }
    
    const bloqueSecundario = estructuraSecundaria[bloqueHash];
    for (let i = 0; i < bloqueSecundario.length; i++) {
        if (bloqueSecundario[i] === null) {
            bloqueSecundario[i] = elemento;
            elementosInsertados1++;
            console.log(`✅ Colisión! Insertado ${elemento} en Bloque ${bloqueHash + 1} (secundaria) - ${elementosInsertados1}/${capacidad}`);
            return true;
        }
    }
    
    console.log(`❌ Tanto el bloque principal como secundario están llenos`);
    return false;
}

// Elementos que van al Bloque 2 (hash % 4 = 1)
const elementosBloque2 = [5, 9, 13, 17, 21, 25];

console.log("\nInsertando elementos que van al Bloque 2:");
elementosBloque2.forEach(elemento => {
    insertarEstructuraSecundaria(elemento);
    mostrarEstructuraSecundaria();
    console.log("");
});

// Simulación Método 2: Área de Colisiones
console.log("\n=== MÉTODO 2: ÁREA DE COLISIONES ===");

const estructuraPrincipal2 = Array(numeroBloques).fill(null).map(() => Array(elementosPorBloque).fill(null));
const areaColisiones = Array(numeroBloques).fill(null).map(() => Array(elementosPorBloque).fill(null));
let elementosInsertados2 = 0;

function mostrarAreaColisiones() {
    console.log("");
    estructuraPrincipal2.forEach((bloque, i) => {
        const principal = bloque.map(e => e === null ? '_' : e).join(', ');
        const colisiones = areaColisiones[i].map(e => e === null ? '_' : e).join(', ');
        console.log(`Bloque ${i + 1}:`);
        console.log(`  Área Principal:   [${principal}]`);
        console.log(`  Área Colisiones:  [${colisiones}]`);
    });
}

function insertarAreaColisiones(elemento) {
    if (elementosInsertados2 >= capacidad) {
        console.log(`❌ Capacidad máxima alcanzada (${capacidad})`);
        return false;
    }

    const bloqueHash = hashModulo(elemento, numeroBloques);
    const bloque = estructuraPrincipal2[bloqueHash];
    
    // Intentar insertar en área principal
    for (let i = 0; i < bloque.length; i++) {
        if (bloque[i] === null) {
            bloque[i] = elemento;
            elementosInsertados2++;
            console.log(`✅ Insertado ${elemento} en Bloque ${bloqueHash + 1} (área principal) - ${elementosInsertados2}/${capacidad}`);
            return true;
        }
    }
    
    // Si está lleno, usar área de colisiones
    const areaColision = areaColisiones[bloqueHash];
    for (let i = 0; i < areaColision.length; i++) {
        if (areaColision[i] === null) {
            areaColision[i] = elemento;
            elementosInsertados2++;
            console.log(`✅ Colisión! Insertado ${elemento} en Bloque ${bloqueHash + 1} (área colisiones C${i + 1}) - ${elementosInsertados2}/${capacidad}`);
            return true;
        }
    }
    
    console.log(`❌ Tanto el área principal como el área de colisiones están llenas`);
    return false;
}

console.log("\nInsertando elementos que van al Bloque 2:");
elementosBloque2.forEach(elemento => {
    insertarAreaColisiones(elemento);
    mostrarAreaColisiones();
});

// Intentar insertar más elementos para probar límite de capacidad
console.log("\n=== PRUEBA DE LÍMITE DE CAPACIDAD ===");
console.log("\nIntentando insertar elementos adicionales (1, 2, 3, 4):");
[1, 2, 3, 4].forEach(elemento => {
    insertarAreaColisiones(elemento);
});

console.log("\n🎯 RESUMEN:");
console.log("✅ Estructura Secundaria: Aparece solo cuando es necesaria, lado a lado");
console.log("✅ Área de Colisiones: Siempre visible dentro de cada bloque");
console.log("✅ Control de Capacidad: Respeta el límite configurado estrictamente");
console.log("✅ Ambos métodos implementados y funcionando correctamente");

console.log("\n🚀 ¡Implementación completa lista para usar!");