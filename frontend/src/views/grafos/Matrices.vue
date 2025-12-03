<template>
	<div>
		<button @click="$router.back()" class="btn-back">← Volver</button>
    
		<h1>Operaciones en un Grafo</h1>

		<!-- Botón Importar Grafo (siempre visible) -->
		<div class="import-section">
			<button @click="triggerFileInput" class="btn-import">📥 Importar Grafo</button>
			<input 
				ref="fileInput" 
				type="file" 
				accept=".json" 
				style="display: none" 
				@change="importarGrafo"
			/>
		</div>

		<!-- Crear grafo -->
		<div v-if="!grafoCreado" class="create-structure">
			<h3>Crear Grafo</h3>
      
			<div class="config-row">
				<div>
					<label>Cantidad de Nodos:</label>
					<input 
						type="number" 
						v-model.number="config.cantidadNodos" 
						min="1"
						placeholder="Ej: 5"
					/>
				</div>
        
				<div>
					<label>Tipo de Grafo:</label>
					<select v-model="config.esDirigido">
						<option :value="false">No Dirigido</option>
						<option :value="true">Dirigido</option>
					</select>
				</div>
        
				<div>
					<label>¿Es Ponderado?</label>
					<select v-model="config.esPonderado">
						<option :value="false">No</option>
						<option :value="true">Sí</option>
					</select>
				</div>
			</div>

			<!-- Control dinámico de tamaño de matrices -->
			<div class="matrix-controls">
				<label for="matrix-size-range">Tamaño matrices:</label>
				<input id="matrix-size-range" type="range" min="200" max="900" step="10" v-model.number="matrixMaxHeight" />
				<span class="matrix-size-value">{{ matrixMaxHeight }}px</span>
			</div>

			<div class="info-preview" v-if="config.cantidadNodos > 0">
				<p><strong>Nodos:</strong> {{ config.cantidadNodos }} (numerados del 1 al {{ config.cantidadNodos }})</p>
				<p><strong>Tipo:</strong> {{ config.esDirigido ? 'Dirigido' : 'No Dirigido' }}</p>
				<p><strong>Ponderado:</strong> {{ config.esPonderado ? 'Sí' : 'No' }}</p>
			</div>

			<button @click="crearGrafo">Crear Grafo</button>
		</div>

		<!-- Grafo creado -->
		<div v-else>
			<!-- Info del grafo -->
			<div class="structure-info">
				<div class="info-grid">
					<div class="info-item">
						<strong>Nodos:</strong> {{ grafo.nodos.length }}
					</div>
					<div class="info-item">
						<strong>Aristas:</strong> {{ contarAristas() }}
					</div>
					<div class="info-item">
						<strong>Tipo:</strong> {{ config.esDirigido ? 'Dirigido' : 'No Dirigido' }}
					</div>
					<div class="info-item">
						<strong>Ponderado:</strong> {{ config.esPonderado ? 'Sí' : 'No' }}
					</div>
				</div>
			</div>

			<!-- Gestión de Aristas -->
			<div class="edge-management">
				<h3>Gestión de Aristas</h3>
				<div class="edge-controls">
					<input 
						type="text" 
						v-model="aristaInput" 
						placeholder="Ej: 12 para conectar nodo 1 y 2"
						maxlength="10"
						@keyup.enter="agregarArista"
					/>
					<input 
						v-if="config.esPonderado"
						type="number" 
						v-model.number="pesoArista" 
						placeholder="Peso"
						step="0.1"
					/>
					<button @click="agregarArista">Agregar Arista</button>
				</div>
				<p class="help-text">
					{{ config.esDirigido ? 
						'Formato: "12" crea arista 1→2' : 
						'Formato: "12" crea arista bidireccional 1↔2' 
					}}
				</p>
			</div>

			<!-- Operaciones -->
			<div class="operations">
				<h3>Operaciones del Grafo</h3>
				<div class="operations-grid">
					<!-- Insertar Nodo -->
					<div class="operation-card">
						<h4>Insertar Nodo</h4>
						<button @click="insertarNodo">Agregar Nodo</button>
					</div>

					<!-- Eliminar Nodo -->
					<div class="operation-card">
						<h4>Eliminar Nodo</h4>
						<input 
							type="number" 
							v-model.number="nodoEliminar" 
							placeholder="Número de nodo"
							min="1"
						/>
						<button @click="eliminarNodo">Eliminar</button>
					</div>

					<!-- Borrar Arista -->
					<div class="operation-card">
						<h4>Borrar Arista</h4>
						<input 
							type="text" 
							v-model="aristaBorrar" 
							placeholder="Ej: 12"
							maxlength="10"
						/>
						<button @click="borrarArista">Borrar</button>
					</div>
				</div>
			</div>

			<!-- Mensaje -->
			<p v-if="mensaje" class="message" :class="{ error: esError }">{{ mensaje }}</p>

			<!-- (Operaciones avanzadas eliminadas) -->

			<!-- Visualización del Grafo -->
			<div class="graph-visualization">
				<h3>Visualización del Grafo</h3>
				<div id="graph-container" ref="graphContainer"></div>
			</div>

			<!-- Panel de notación del grafo original -->
			<div class="set-notation">
				<h4>Representación en Teoría de Conjuntos:</h4>
				<div class="notation-content">
					<p><strong>V =</strong> {{ formatearConjuntoNodos() }}</p>
					<p><strong>A =</strong> {{ formatearConjuntoAristas() }}</p>
				</div>
			</div>

			<!-- Matrices dinámicas: Adyacencia nodos, Adyacencia aristas, Incidencia -->
			<div class="matrices-panels">
				<div class="matrices-row">
					<!-- Adyacencia: Nodos -->
					<div class="matrix-panel adjacency">
						<h4>Matriz de Adyacencia de Nodos</h4>
						<div class="matrix-scroll" :style="{ maxHeight: matrixMaxHeight + 'px' }">
							<table class="matrix-table">
								<thead>
									<tr>
										<th></th>
										<th v-for="(nid, j) in nodeIds" :key="`hn-${j}`">{{ nid }}</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="(row, i) in adjacencyMatrixNodes" :key="`r-${i}`">
										<th class="row-head">{{ nodeIds[i] }}</th>
										<td v-for="(cell, j) in row" :key="`c-${i}-${j}`">{{ cell }}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<!-- Adyacencia: Aristas -->
					<div class="matrix-panel adjacency">
						<h4>Adyacencia de Aristas</h4>
						<div class="matrix-scroll" :style="{ maxHeight: matrixMaxHeight + 'px' }">
							<table class="matrix-table">
								<thead>
									<tr>
										<th></th>
										<th v-for="(eid, j) in edgeIds" :key="`he-${j}`">{{ eid }}</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="(row, i) in adjacencyMatrixEdges" :key="`er-${i}`">
										<th class="row-head">{{ edgeIds[i] }}</th>
										<td v-for="(cell, j) in row" :key="`ec-${i}-${j}`">{{ cell }}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<!-- Incidencia: debajo ocupando todo el ancho -->
				<div class="matrix-incidence matrix-panel">
					<h4>Matriz de Incidencia</h4>
						<div class="matrix-scroll" :style="{ maxHeight: matrixMaxHeight + 'px' }">
						<table class="matrix-table">
							<thead>
								<tr>
									<th></th>
									<th v-for="(eid, j) in edgeIds" :key="`hi-${j}`">{{ eid }}</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(row, i) in incidenceMatrix" :key="`ir-${i}`">
									<th class="row-head">{{ nodeIds[i] }}</th>
									<td v-for="(cell, j) in row" :key="`ic-${i}-${j}`">{{ cell }}</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>

			<!-- Complemento y grafo-línea eliminados -->

			<!-- Botón de reseteo y guardado -->
			<div class="reset-section">
				<button @click="resetearGrafo" class="btn-danger">Resetear Grafo</button>
				<button @click="guardarGrafo" class="btn-save">💾 Guardar Grafo</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue';
import { DataSet, Network } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';

interface Config {
	cantidadNodos: number;
	esDirigido: boolean;
	esPonderado: boolean;
}

interface Nodo {
	id: number | string;
	label: string;
}

interface Arista {
	from: number | string;
	to: number | string;
	peso?: number;
}

interface Grafo {
	nodos: Nodo[];
	aristas: Arista[];
}

const config = ref<Config>({
	cantidadNodos: 5,
	esDirigido: false,
	esPonderado: false
});

const grafoCreado = ref(false);
const grafo = ref<Grafo>({
	nodos: [],
	aristas: []
});

const aristaInput = ref('');
const pesoArista = ref<number>(1);
const nodoEliminar = ref<number | null>(null);
const aristaBorrar = ref('');
const mensaje = ref('');
const esError = ref(false);

const graphContainer = ref<HTMLElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

let nodesDataSet: DataSet<any> | null = null;
let edgesDataSet: DataSet<any> | null = null;

function crearGrafo() {
	if (config.value.cantidadNodos <= 0) {
		mostrarMensaje('Por favor ingrese una cantidad válida de nodos', true);
		return;
	}

	// Crear nodos numerados del 1 al n
	grafo.value.nodos = [];
	for (let i = 1; i <= config.value.cantidadNodos; i++) {
		grafo.value.nodos.push({
			id: i,
			label: `${i}`
		});
	}

	grafo.value.aristas = [];
	grafoCreado.value = true;
	mostrarMensaje('Grafo creado correctamente', false);

	// Inicializar visualización
	nextTick(() => {
		inicializarVisualizacion();
	});
}

function inicializarVisualizacion() {
	if (!graphContainer.value) return;

	// Preparar datos para vis-network
	nodesDataSet = new DataSet(
		grafo.value.nodos.map(nodo => ({
			id: nodo.id,
			label: nodo.label,
			color: {
				background: '#1f2937',
				border: '#374151',
				highlight: {
					background: '#f59e0b',
					border: '#d97706'
				}
			},
			font: {
				color: '#e5e7eb',
				size: 16
			}
		}))
	);

	edgesDataSet = new DataSet(
		grafo.value.aristas.map((arista, index) => ({
			id: index,
			from: arista.from,
			to: arista.to,
			label: config.value.esPonderado && arista.peso !== undefined ? `${arista.peso}` : '',
			arrows: config.value.esDirigido ? 'to' : undefined,
			color: {
				color: '#94a3b8',
				highlight: '#f59e0b'
			},
			font: {
				color: '#e5e7eb',
				size: 14,
				background: '#111827'
			}
		}))
	);

	const data = {
		nodes: nodesDataSet,
		edges: edgesDataSet
	};

	const options = {
		nodes: {
			shape: 'circle',
			size: 25,
			borderWidth: 2
		},
		edges: {
			width: 2,
			smooth: {
				enabled: true,
				type: 'continuous',
				roundness: 0.5
			}
		},
		physics: {
			enabled: true,
			barnesHut: {
				gravitationalConstant: -2000,
				centralGravity: 0.3,
				springLength: 150,
				springConstant: 0.04
			},
			stabilization: {
				iterations: 100 
			}
		},
		interaction: {
			hover: true,
			dragNodes: true,
			dragView: true,
			zoomView: true
		}
	};

	// Debug logs para asegurar que el contenedor y los datos existen
	console.log('Inicializando visualización:', { container: graphContainer.value, nodes: grafo.value.nodos.length, edges: grafo.value.aristas.length });
	if (!graphContainer.value) {
		console.error('Graph container no disponible - abortando inicialización de vis-network');
		return;
	}

	try {
		network = new Network(graphContainer.value, data, options);
	} catch (e) {
		console.error('Error al inicializar vis-network:', e);
	}
}

function actualizarVisualizacion() {
	if (!nodesDataSet || !edgesDataSet) return;

	// Actualizar nodos
	const nodosActuales = nodesDataSet.get();
	const nodosNuevos = grafo.value.nodos.map(nodo => nodo.id);
  
	// Eliminar nodos que ya no existen
	nodosActuales.forEach(nodo => {
		if (!nodosNuevos.includes(nodo.id)) {
			nodesDataSet!.remove(nodo.id);
		}
	});

	// Agregar nodos nuevos
	grafo.value.nodos.forEach(nodo => {
		const existe = nodesDataSet!.get(nodo.id);
		if (!existe) {
			nodesDataSet!.add({
				id: nodo.id,
				label: nodo.label,
				color: {
					background: '#1f2937',
					border: '#374151',
					highlight: {
						background: '#f59e0b',
						border: '#d97706'
					}
				},
				font: {
					color: '#e5e7eb',
					size: 16
				}
			});
		}
	});

	// Actualizar aristas
	edgesDataSet.clear();
	grafo.value.aristas.forEach((arista, index) => {
		edgesDataSet!.add({
			id: index,
			from: arista.from,
			to: arista.to,
			label: config.value.esPonderado && arista.peso !== undefined ? `${arista.peso}` : '',
			arrows: config.value.esDirigido ? 'to' : undefined,
			color: {
				color: '#94a3b8',
				highlight: '#f59e0b'
			},
			font: {
				color: '#e5e7eb',
				size: 14,
				background: '#111827'
			}
		});
	});
}

function agregarArista() {
	if (!aristaInput.value || aristaInput.value.length < 2) {
		mostrarMensaje('Por favor ingrese una arista válida (ej: 12)', true);
		return;
	}

	const nodos = extraerNodos(aristaInput.value);
	if (!nodos) return;

	const [nodo1, nodo2] = nodos;

	// Validar que los nodos existen
	if (!existeNodo(nodo1) || !existeNodo(nodo2)) {
		mostrarMensaje('Uno o ambos nodos no existen en el grafo', true);
		return;
	}

	// Validar que no se está conectando un nodo consigo mismo
	if (nodo1 === nodo2) {
		mostrarMensaje('No se puede crear una arista de un nodo a sí mismo', true);
		return;
	}

	// Verificar si la arista ya existe
	if (existeArista(nodo1, nodo2)) {
		mostrarMensaje('Esta arista ya existe', true);
		return;
	}

	const peso = config.value.esPonderado ? pesoArista.value : undefined;

	grafo.value.aristas.push({
		from: nodo1,
		to: nodo2,
		peso: peso
	});

	actualizarVisualizacion();
	mostrarMensaje(
		`Arista agregada: ${nodo1}${config.value.esDirigido ? '→' : '↔'}${nodo2}${peso !== undefined ? ` (peso: ${peso})` : ''}`,
		false
	);
  
	aristaInput.value = '';
	if (config.value.esPonderado) pesoArista.value = 1;
}

function insertarNodo() {
	// Calcular el nuevo id a partir de los ids numéricos actuales
	const numericIds = grafo.value.nodos.map(n => Number(n.id)).filter(x => !isNaN(x));
	const nuevoId = numericIds.length ? Math.max(...numericIds) + 1 : 1;
	grafo.value.nodos.push({ id: nuevoId, label: `${nuevoId}` });

	actualizarVisualizacion();
	mostrarMensaje(`Nodo ${nuevoId} insertado`, false);
}

function eliminarNodo() {
	if (!nodoEliminar.value) {
		mostrarMensaje('Por favor ingrese un número de nodo', true);
		return;
	}

	const id = nodoEliminar.value;
  
	if (!existeNodo(id)) {
		mostrarMensaje(`El nodo ${id} no existe`, true);
		return;
	}

	// Eliminar el nodo
	grafo.value.nodos = grafo.value.nodos.filter(n => n.id !== id);

	// Eliminar todas las aristas conectadas a este nodo
	grafo.value.aristas = grafo.value.aristas.filter(
		arista => arista.from !== id && arista.to !== id
	);

	actualizarVisualizacion();
	mostrarMensaje(`Nodo ${id} eliminado junto con sus aristas`, false);
	nodoEliminar.value = null;
}

function borrarArista() {
	if (!aristaBorrar.value || aristaBorrar.value.length < 2) {
		mostrarMensaje('Por favor ingrese una arista válida (ej: 12)', true);
		return;
	}

	const nodos = extraerNodos(aristaBorrar.value);
	if (!nodos) return;

	const [nodo1, nodo2] = nodos;

	const aristaIndex = grafo.value.aristas.findIndex(
		arista =>
			(String(arista.from) === String(nodo1) && String(arista.to) === String(nodo2)) ||
			(!config.value.esDirigido && String(arista.from) === String(nodo2) && String(arista.to) === String(nodo1))
	);

	if (aristaIndex === -1) {
		mostrarMensaje('La arista no existe', true);
		return;
	}

	grafo.value.aristas.splice(aristaIndex, 1);
	actualizarVisualizacion();
	mostrarMensaje(`Arista ${nodo1}-${nodo2} eliminada`, false);
	aristaBorrar.value = '';
}

function resetearGrafo() {
	if (confirm('¿Estás seguro de que deseas resetear el grafo?')) {
		grafoCreado.value = false;
		grafo.value = { nodos: [], aristas: [] };
		network = null;
		nodesDataSet = null;
		edgesDataSet = null;
		mostrarMensaje('Grafo reseteado', false);
	}
}

function contarAristas(): number {
	return grafo.value.aristas.length;
}

function formatearConjuntoNodos(): string {
	if (grafo.value.nodos.length === 0) return '∅';
	return `{${grafo.value.nodos.map(n => n.id).join(', ')}}`;
}

function formatearConjuntoAristas(): string {
	if (grafo.value.aristas.length === 0) return '∅';
	// Deduplicar aristas antes de formatear (considerar grafos no dirigidos)
	const aristasUnicas = new Map<string, Arista>();
	grafo.value.aristas.forEach(arista => {
		const key = config.value.esDirigido
			? `${String(arista.from)}-${String(arista.to)}`
			: [String(arista.from), String(arista.to)].sort().join('-');
		if (!aristasUnicas.has(key)) aristasUnicas.set(key, arista);
	});

	const aristasFormateadas = Array.from(aristasUnicas.values()).map(arista => {
		const peso = config.value.esPonderado && arista.peso !== undefined ? `, ${arista.peso}` : '';
		return `(${arista.from}, ${arista.to}${peso})`;
	});

	return `{${aristasFormateadas.join(', ')}}`;
}

function existeNodo(id: number): boolean {
	return grafo.value.nodos.some(n => String(n.id) === String(id));
}

function existeArista(from: number, to: number): boolean {
	return grafo.value.aristas.some(
		arista =>
			(String(arista.from) === String(from) && String(arista.to) === String(to)) ||
			(!config.value.esDirigido && String(arista.from) === String(to) && String(arista.to) === String(from))
	);
}

function extraerNodos(input: string): [number, number] | null {
	// Limpiar la entrada (eliminar espacios y caracteres no numéricos)
	const cleanedInput = input.replace(/\D/g, ''); // Solo conservar números
  
	// Asegurarse de que haya al menos dos números
	if (cleanedInput.length < 2) {
		mostrarMensaje('Formato inválido. Use formato: 12 (para nodos 1 y 2)', true);
		return null;
	}

	const nodo1 = parseInt(cleanedInput[0]);
	const nodo2 = parseInt(cleanedInput[1]);

	return [nodo1, nodo2];
}

// --- Matrices dinámicas ---
const nodeIds = computed(() => grafo.value.nodos.map(n => String(n.id)));
const edgeIds = computed(() => grafo.value.aristas.map(a => `${a.from}-${a.to}`));

const adjacencyMatrixNodes = computed(() => {
	const ids = nodeIds.value;
	const n = ids.length;
	const mat: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			if (i === j) { // diagonal siempre 0
				mat[i][j] = 0;
				continue;
			}
			const from = ids[i];
			const to = ids[j];
			const exists = grafo.value.aristas.some(a =>
				(String(a.from) === from && String(a.to) === to) ||
				(!config.value.esDirigido && String(a.from) === to && String(a.to) === from)
			);
			mat[i][j] = exists ? 1 : 0;
		}
	}
	return mat;
});

const adjacencyMatrixEdges = computed(() => {
	const edges = grafo.value.aristas;
	const m = edges.length;
	const mat: number[][] = Array.from({ length: m }, () => Array(m).fill(0));
	for (let i = 0; i < m; i++) {
		for (let j = 0; j < m; j++) {
			if (i === j) { // diagonal siempre 0
				mat[i][j] = 0;
				continue;
			}
			const a = edges[i];
			const b = edges[j];
			const adjacent = String(a.from) === String(b.from) || String(a.from) === String(b.to) || String(a.to) === String(b.from) || String(a.to) === String(b.to);
			mat[i][j] = adjacent ? 1 : 0;
		}
	}
	return mat;
});

// Normaliza ids para comparaciones consistentes
function normalizeId(x: number | string) {
	return String(x).trim();
}

const incidenceMatrix = computed(() => {
	const ids = nodeIds.value.map(id => normalizeId(id));
	const edges = grafo.value.aristas;
	const n = ids.length;
	const m = edges.length;
	const mat: number[][] = Array.from({ length: n }, () => Array(m).fill(0));
	for (let i = 0; i < n; i++) {
		const node = ids[i];
		for (let j = 0; j < m; j++) {
			const edge = edges[j];
			const from = normalizeId(edge.from);
			const to = normalizeId(edge.to);
			if (!config.value.esDirigido) {
				mat[i][j] = (from === node || to === node) ? 1 : 0;
			} else {
				// dirigido: si la arista va desde 'from' hacia 'to'
				// según requerimiento: signo negativo si la dirección va hacia el nodo (es destino)
				if (from === node) mat[i][j] = 1;
				else if (to === node) mat[i][j] = -1;
				else mat[i][j] = 0;
			}
		}
	}
	return mat;
});

// Control dinámico: altura máxima (px) para el área con scroll de las matrices
const matrixMaxHeight = ref<number>(360);


function mostrarMensaje(msg: string, error: boolean) {
	mensaje.value = msg;
	esError.value = error;
	setTimeout(() => {
		mensaje.value = '';
		esError.value = false;
	}, 3000);
}

// ============ GUARDAR E IMPORTAR GRAFOS ============
function triggerFileInput() {
	if (fileInput.value) {
		fileInput.value.click();
	}
}

interface GrafoJSON {
	version: string;
	config: {
		cantidadNodos: number;
		esDirigido: boolean;
		esPonderado: boolean;
	};
	grafo: {
		nodos: Array<{ id: number | string; label: string }>;
		aristas: Array<{ from: number | string; to: number | string; peso?: number }>;
	};
}

function validarFormatoJSON(obj: any): obj is GrafoJSON {
	return (
		obj &&
		typeof obj === 'object' &&
		obj.version === '1.0' &&
		obj.config &&
		typeof obj.config.cantidadNodos === 'number' &&
		typeof obj.config.esDirigido === 'boolean' &&
		typeof obj.config.esPonderado === 'boolean' &&
		obj.grafo &&
		Array.isArray(obj.grafo.nodos) &&
		Array.isArray(obj.grafo.aristas) &&
		obj.grafo.nodos.every((n: any) => n && (typeof n.id === 'number' || typeof n.id === 'string') && typeof n.label === 'string') &&
		obj.grafo.aristas.every((a: any) => a && (typeof a.from === 'number' || typeof a.from === 'string') && (typeof a.to === 'number' || typeof a.to === 'string') && (a.peso === undefined || typeof a.peso === 'number'))
	);
}

function importarGrafo(event: Event) {
	const target = event.target as HTMLInputElement;
	const files = target.files;

	if (!files || files.length === 0) {
		mostrarMensaje('Por favor selecciona un archivo JSON', true);
		return;
	}

	const file = files[0];
	const reader = new FileReader();

	reader.onload = (e) => {
		try {
			const contenido = e.target?.result as string;
			const datosJSON = JSON.parse(contenido);

			if (!validarFormatoJSON(datosJSON)) {
				mostrarMensaje('Archivo JSON inválido. Por favor selecciona un archivo de grafo válido generado por este módulo.', true);
				if (fileInput.value) fileInput.value.value = '';
				return;
			}

			// Cargar configuración y grafo
			config.value = { ...datosJSON.config };
			grafo.value = {
				nodos: datosJSON.grafo.nodos.map(n => ({ ...n })),
				aristas: datosJSON.grafo.aristas.map(a => ({ ...a }))
			};

			grafoCreado.value = true;

			// Limpiar input
			if (fileInput.value) fileInput.value.value = '';

			nextTick(() => {
				inicializarVisualizacion();
			});

			mostrarMensaje('Grafo importado correctamente', false);
		} catch (error) {
			mostrarMensaje('Error al procesar el archivo. Asegúrate de que es un JSON válido.', true);
			if (fileInput.value) fileInput.value.value = '';
		}
	};

	reader.onerror = () => {
		mostrarMensaje('Error al leer el archivo', true);
		if (fileInput.value) fileInput.value.value = '';
	};

	reader.readAsText(file);
}

function guardarGrafo() {
	const datosGuardar: GrafoJSON = {
		version: '1.0',
		config: {
			cantidadNodos: config.value.cantidadNodos,
			esDirigido: config.value.esDirigido,
			esPonderado: config.value.esPonderado
		},
		grafo: {
			nodos: grafo.value.nodos.map(n => ({ ...n })),
			aristas: grafo.value.aristas.map(a => ({ ...a }))
		}
	};

	const json = JSON.stringify(datosGuardar, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `grafo_${new Date().getTime()}.json`;
	link.click();
	URL.revokeObjectURL(url);

	mostrarMensaje('Grafo guardado exitosamente', false);
}
</script>

<style scoped>
.btn-back {
	margin-bottom: 1rem;
}

h1 {
	text-align: center;
	margin: 2rem 0;
}

.import-section {
	max-width: 600px;
	margin: 1rem auto;
	text-align: center;
	padding: 1rem;
}

.btn-import {
	background: #10b981;
	border: 1px solid #10b981;
	color: #fff;
	padding: 0.7rem 1.5rem;
	border-radius: 0.5rem;
	cursor: pointer;
	font-weight: 600;
	font-size: 1rem;
}

.btn-import:hover {
	background: #059669;
	border-color: #059669;
}

.create-structure {
	max-width: 600px;
	margin: 2rem auto;
	padding: 2rem;
	border: 1px solid var(--primary);
	border-radius: 0.5rem;
	background: var(--card-background-color);
}

.config-row {
	display: flex;
	gap: 1rem;
	margin-bottom: 1rem;
	flex-wrap: wrap;
}

.config-row > div {
	flex: 1;
	min-width: 150px;
}

.config-row label {
	display: block;
	margin-bottom: 0.5rem;
	font-weight: 600;
}

.config-row input,
.config-row select {
	width: 100%;
	max-width: 100%;
	margin: 0;
}

.info-preview {
	margin: 1rem 0;
	padding: 1rem;
	background: var(--code-background-color);
	border-radius: 0.25rem;
}

.info-preview p {
	margin: 0.5rem 0;
	font-family: monospace;
}

.structure-info {
	max-width: 1000px;
	margin: 1rem auto;
	padding: 1rem;
	border: 1px solid var(--muted-border-color);
	border-radius: 0.5rem;
	background: var(--card-background-color);
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	gap: 1rem;
}

.info-item {
	text-align: center;
	padding: 0.5rem;
}

.set-notation {
	max-width: 1000px;
	margin: 1.5rem auto;
	padding: 1.5rem;
	border: 2px solid var(--primary);
	border-radius: 0.5rem;
	background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}

.set-notation h4 {
	margin-top: 0;
	margin-bottom: 1rem;
	text-align: center;
	color: var(--primary);
}

.notation-content {
	font-family: 'Courier New', monospace;
	font-size: 1.1rem;
	line-height: 2;
}

.notation-content p {
	margin: 0.5rem 0;
	padding: 0.5rem;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 0.25rem;
}

.notation-content strong {
	color: #f59e0b;
	margin-right: 0.5rem;
}

.edge-management {
	max-width: 800px;
	margin: 2rem auto;
	padding: 1.5rem;
	border: 1px solid var(--muted-border-color);
	border-radius: 0.5rem;
	background: var(--card-background-color);
}

.edge-management h3 {
	margin-top: 0;
	margin-bottom: 1rem;
	text-align: center;
}

.edge-controls {
	display: flex;
	gap: 0.5rem;
	justify-content: center;
	flex-wrap: wrap;
	margin-bottom: 0.5rem;
}

.edge-controls input {
	max-width: 200px;
}

.help-text {
	text-align: center;
	font-size: 0.85rem;
	color: #94a3b8;
	margin: 0.5rem 0;
}

.operations {
	max-width: 1200px;
	margin: 2rem auto;
	padding: 1.5rem;
	border: 1px solid var(--muted-border-color);
	border-radius: 0.5rem;
	background: var(--card-background-color);
}

.operations h3 {
	margin-top: 0;
	margin-bottom: 1.5rem;
	text-align: center;
}

.operations-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 1rem;
}

.operation-card {
	padding: 1rem;
	border: 1px solid #374151;
	border-radius: 0.5rem;
	background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
	text-align: center;
}

.operation-card h4 {
	margin-top: 0;
	margin-bottom: 1rem;
	color: var(--primary);
	font-size: 0.95rem;
}

.operation-card input {
	width: 100%;
	margin-bottom: 0.5rem;
}

.operation-card button {
	width: 100%;
}

.message {
	margin: 1rem auto;
	padding: 1rem;
	max-width: 800px;
	text-align: center;
	border-radius: 0.5rem;
	background: var(--code-background-color);
}

.message.error {
	color: #ef4444;
	border: 1px solid #ef4444;
}

.graph-visualization {
	max-width: 1200px;
	margin: 2rem auto;
	padding: 1.5rem;
	border: 1px solid var(--muted-border-color);
	border-radius: 0.5rem;
	background: var(--card-background-color);
}

.graph-visualization h3 {
	margin-top: 0;
	margin-bottom: 1rem;
	text-align: center;
}

#graph-container {
	width: 100%;
	height: 500px;
	border: 2px solid #374151;
	border-radius: 0.5rem;
	background: #0f172a;
}

.reset-section {
	max-width: 600px;
	margin: 2rem auto;
	text-align: center;
	display: flex;
	gap: 1rem;
	justify-content: center;
	flex-wrap: wrap;
}

.btn-save {
	background: #8b5cf6;
	border: 1px solid #8b5cf6;
	color: #fff;
	padding: 0.7rem 1.5rem;
	border-radius: 0.5rem;
	cursor: pointer;
	font-weight: 600;
	font-size: 1rem;
}

.btn-save:hover {
	background: #7c3aed;
	border-color: #7c3aed;
}

.revert-section {
	max-width: 600px;
	margin: 1rem auto;
	text-align: center;
	padding: 1rem;
}

.btn-revert {
	background: #3b82f6;
	border: 1px solid #3b82f6;
	color: #fff;
	padding: 0.5rem 1rem;
	border-radius: 0.5rem;
	cursor: pointer;
	font-weight: 600;
	margin: 0.5rem;
}

.btn-revert:hover {
	background: #2563eb;
	border-color: #2563eb;
}

.btn-danger {
	background: #dc2626;
	border-color: #dc2626;
}

.btn-danger:hover {
	background: #b91c1c;
	border-color: #b91c1c;
}

.complemento-notation {
	border-color: #f97316;
	background: linear-gradient(135deg, #7c2d12 0%, #5a1f0f 100%);
}

.complemento-notation h4 {
	color: #f97316;
}

/* Estilos para las matrices: compactas, números centrados y pantalla responsiva */

.matrices-panels {
	max-width: 1000px;
	margin: 1rem auto;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.matrices-row {
	display: flex;
	flex-direction: column;
	gap: 0.6rem;
	justify-content: center;
}

.matrix-panel {
	background: var(--card-background-color);
	border: 1px solid var(--muted-border-color);
	border-radius: 0.5rem;
	padding: 0.75rem;
	box-sizing: border-box;
	width: 100%;
}

.matrix-panel h4 {
	margin: 0 0 0.4rem 0;
	font-size: 0.95rem;
	text-align: center;
	color: var(--primary);
}

.matrix-scroll {
	overflow: auto;
	max-height: 360px;
	display: flex;
	justify-content: center;
}

.matrix-table {
	border-collapse: collapse;
	width: auto;
	font-family: 'Courier New', monospace;
	font-size: 0.85rem;
	table-layout: fixed;
}

.matrix-table th,
.matrix-table td {
	border: 1px solid rgba(255,255,255,0.06);
	padding: 6px 8px;
	text-align: center;
	vertical-align: middle;
}

.matrix-table th:first-child,
.matrix-table .row-head {
	background: rgba(255,255,255,0.03);
	font-weight: 600;
	min-width: 36px;
}

.matrix-table td {
	min-width: 32px;
}

.matrix-panel.adjacency { width: 100%; }
.matrix-panel.adjacency table { margin: 0 auto; }

.matrix-incidence { width: 100%; }
.matrix-incidence .matrix-scroll { justify-content: center; }

.matrix-controls {
	max-width: 1000px;
	margin: 0.5rem auto 1rem auto;
	display: flex;
	gap: 0.6rem;
	align-items: center;
	justify-content: center;
}

.matrix-controls label { font-weight: 600; margin-right: 0.5rem; }
.matrix-controls input[type="range"] { width: 320px; }
.matrix-size-value { font-family: monospace; color: #cbd5e1; }

@media (max-width: 768px) {
 	.matrices-panels { flex-direction: column; }
 	.matrix-panel { min-width: 100%; }
 	.matrix-table td, .matrix-table th { padding: 6px 4px; font-size: 0.82rem; }
}

@media (max-width: 768px) {
	.config-row {
		flex-direction: column;
	}
  
	.operations-grid {
		grid-template-columns: 1fr;
	}
  
	.edge-controls {
		flex-direction: column;
	}
  
	.edge-controls input {
		max-width: 100%;
	}

	#graph-container {
		height: 400px;
	}
}
</style>

