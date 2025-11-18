// Prueba rápida de validación
import { validateResidueSimpleImport } from '../src/utils/importExportUtils.ts';

const testData = {
  "type": "residuo-simple",
  "version": "1.0",
  "timestamp": "2025-09-28T15:00:00.000Z",
  "config": {
    "digitosClave": 1
  },
  "data": {
    "key": "B",
    "left": {
      "key": "A",
      "left": null,
      "right": null
    },
    "right": {
      "key": null,
      "left": {
        "key": "C",
        "left": null,
        "right": null
      },
      "right": null
    }
  }
};

console.log('Validación:', validateResidueSimpleImport(testData));