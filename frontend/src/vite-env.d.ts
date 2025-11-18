/// <reference types="vite/client" />

// Permite importar archivos .vue en TypeScript
declare module "*.vue" {
	import { DefineComponent } from "vue";
	const component: DefineComponent<{}, {}, any>;
	export default component;
}
