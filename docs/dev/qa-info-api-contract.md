# QA Info — Contrato de API para el Generador de PDF

> Documentación para el desarrollador backend sobre cómo debe estructurarse el campo `qa_info` en la respuesta del endpoint de resultados.

## Resumen

La plantilla PDF renderiza un componente **QA Box** controlado completamente por un objeto `qa_info` incluido en la respuesta JSON del resultado. El frontend **no hace ninguna lógica** para determinar qué badge o texto mostrar — el backend debe enviar el objeto completo, listo para renderizar.

## Campo: `qa_info`

Agregar este campo en la raíz de la respuesta JSON del resultado (al mismo nivel que `result_name`, `rt_id`, etc.).

Si el resultado no tiene información de QA, enviar `null` u omitir el campo — la caja no se renderiza.

### Interfaz TypeScript

```ts
interface QAInfo {
  badge: string;              // Requerido — determina qué imagen de badge mostrar
  title: string;              // Requerido — texto en negrita del encabezado
  description: string;        // Requerido — texto del cuerpo (gris)
  qa_url?: string;            // Opcional — si está presente, renderiza un link "QA process." después de la descripción
  adjustments_title?: string; // Opcional — etiqueta en negrita encima de la lista de ajustes
  adjustments?: QAAdjustment[];
}

interface QAAdjustment {
  label: string;       // Requerido — ej. "Geo scope", "Innovation Readiness"
  from_value?: string; // Opcional — valor original ANTES del ajuste de QA
  to_value: string;    // Requerido — valor final DESPUÉS del ajuste de QA
}
```

**Reglas de renderizado para ajustes:**

| ¿`from_value` presente? | Se renderiza como |
|---|---|
| Sí | `{label}: {from_value}  →  {to_value}` (flecha entre valores) |
| No (null/omitido) | `• {label}: {to_value}` (viñeta, solo valor confirmado) |

---

## Valores de Badge

El campo `badge` es un string que mapea a una imagen específica en el PDF. Estos son los **valores exactos** que el backend debe enviar:

| Valor de `badge` | Visual | Se usa para |
|---|---|---|
| `"kp"` | Ícono de libro KP (blanco sobre fondo oscuro) | Knowledge Products — QA por Center Manager |
| `"mqap"` | Badge MQAP (blanco sobre fondo oscuro) | Knowledge Products — QA automático por MQAP |
| `"two-assessors"` | Ícono de medalla (blanco sobre fondo oscuro) | Dos asesores independientes, **sin** revisión senior |
| `"senior"` | Ícono de medalla (blanco sobre fondo oscuro) | Dos asesores + tercero senior (resultados que NO son innovación) |
| `"senior-innovation"` | Escudo dorado | Dos asesores + tercero senior (Innovation Dev / Innovation Use con ajuste) |
| `"in-progress"` | Ícono de reloj de arena | Proceso de QA aún en curso |

### Cuándo usar `senior` vs `senior-innovation`

- **`senior`** — Para tipos de resultado: Capacity Sharing, Policy Change, Other Output, Other Outcome. También para resultados de Innovación donde el nivel de readiness fue **confirmado** (no cambió).
- **`senior-innovation`** — Para Innovation Development (`rt_id=7`) e Innovation Use (`rt_id=2`) donde el QA **ajustó** el nivel de readiness.

---

## Ejemplos completos por caso

### Caso 1 — KP Center Manager

Knowledge products que no pasaron por la QA Platform.

```json
"qa_info": {
  "badge": "kp",
  "title": "Result quality assured by CGIAR Center knowledge manager",
  "description": "Quality Assurance is provided by CGIAR Center librarians for knowledge products not processed through the QA Platform."
}
```

### Caso 2 — KP MQAP (peer-reviewed)

Knowledge products con QA automático vía MQAP.

```json
"qa_info": {
  "badge": "mqap",
  "title": "Result automated quality assured using MQAP",
  "description": "This knowledge product was automatically quality assured using the Monitoring, Quality Assurance and Performance (MQAP) system, which checks peer-reviewed publications against established criteria."
}
```

### Caso 3 — Dos asesores independientes

Para CapSharing, PolicyChange, OtherOutput, OtherOutcome — revisado por dos asesores, sin escalamiento senior.

```json
"qa_info": {
  "badge": "two-assessors",
  "title": "Result quality assured by two independent assessors",
  "description": "This result underwent quality assurance by two independent assessors following the CGIAR standard",
  "qa_url": "https://www.cgiar.org/news-events/news/cgiars-quality-assurance-process-a-snapshot-of-what-it-is-and-what-is-does"
}
```

### Caso 4 — Tercero senior (no innovación)

Dos asesores + revisión senior. Muestra los data points ajustados con flecha (from → to).

```json
"qa_info": {
  "badge": "senior",
  "title": "Result quality assured by two assessors and subsequently reviewed by a senior third party",
  "description": "This result underwent two rounds of quality assurance, including review by a senior third-party subject matter expert following the CGIAR standard",
  "qa_url": "https://www.cgiar.org/news-events/news/cgiars-quality-assurance-process-a-snapshot-of-what-it-is-and-what-is-does",
  "adjustments_title": "Core data points that were adjusted during the QA process:",
  "adjustments": [
    { "label": "Geo scope", "from_value": "Regional", "to_value": "National" }
  ]
}
```

### Caso 4B — Tercero senior (Innovation Development)

Resultados de innovación donde se ajustó el nivel de readiness. Usa badge de escudo dorado.

```json
"qa_info": {
  "badge": "senior-innovation",
  "title": "Result quality assured by two assessors and subsequently reviewed by a senior third party",
  "description": "This result underwent two rounds of quality assurance, including review by a senior third-party subject matter expert following the CGIAR standard",
  "qa_url": "https://www.cgiar.org/news-events/news/cgiars-quality-assurance-process-a-snapshot-of-what-it-is-and-what-is-does",
  "adjustments_title": "Core data points that were adjusted during the QA process:",
  "adjustments": [
    { "label": "Innovation Readiness", "from_value": "Level 5", "to_value": "Level 7" }
  ]
}
```

### Caso 4C — Tercero senior (Innovation Use)

Igual que 4B pero para resultados de Innovation Use. Diferente título de ajustes.

```json
"qa_info": {
  "badge": "senior-innovation",
  "title": "Result quality assured by two assessors and subsequently reviewed by a senior third party",
  "description": "This result underwent two rounds of quality assurance, including review by a senior third-party subject matter expert following the CGIAR standard",
  "qa_url": "https://www.cgiar.org/news-events/news/cgiars-quality-assurance-process-a-snapshot-of-what-it-is-and-what-is-does",
  "adjustments_title": "Innovation Use:",
  "adjustments": [
    { "label": "Innovation Readiness", "from_value": "Level 5", "to_value": "Level 7" }
  ]
}
```

### Caso 4D — Innovación confirmada (sin cambio)

Resultados de innovación donde el nivel de readiness fue confirmado, no cambiado. Usa badge de medalla (no escudo). El ajuste **no tiene `from_value`** — solo se muestra el valor confirmado como viñeta.

```json
"qa_info": {
  "badge": "senior",
  "title": "Result quality assured by two assessors and subsequently reviewed by a senior third party",
  "description": "This result underwent two rounds of quality assurance, including review by a senior third-party subject matter expert following the CGIAR standard",
  "qa_url": "https://www.cgiar.org/news-events/news/cgiars-quality-assurance-process-a-snapshot-of-what-it-is-and-what-is-does",
  "adjustments_title": "The submitted innovation readiness level was quality assured and confirmed:",
  "adjustments": [
    { "label": "Innovation Readiness", "to_value": "Level 3" }
  ]
}
```

### Caso 5 — QA en proceso

El resultado aún está siendo revisado.

```json
"qa_info": {
  "badge": "in-progress",
  "title": "Result quality assurance in progress",
  "description": "This result is currently undergoing the quality assurance process. The final QA status will be updated upon completion."
}
```

---

## Múltiples ajustes

El array `adjustments` soporta múltiples entradas. Ejemplo:

```json
"adjustments": [
  { "label": "Geo scope", "from_value": "Regional", "to_value": "National" },
  { "label": "Innovation Readiness", "from_value": "Level 5", "to_value": "Level 7" }
]
```

Cada ajuste se renderiza en su propia línea.

---

## Tabla resumen

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `qa_info` | object \| null | No | Omitir o `null` para ocultar la caja de QA |
| `qa_info.badge` | string | Sí | Uno de: `kp`, `mqap`, `two-assessors`, `senior`, `senior-innovation`, `in-progress` |
| `qa_info.title` | string | Sí | Texto en negrita del encabezado |
| `qa_info.description` | string | Sí | Texto del cuerpo |
| `qa_info.qa_url` | string | No | Link que se agrega como "QA process." después de la descripción |
| `qa_info.adjustments_title` | string | No | Etiqueta en negrita encima de la lista de ajustes |
| `qa_info.adjustments` | array | No | Lista de data points ajustados |
| `qa_info.adjustments[].label` | string | Sí | Nombre del data point |
| `qa_info.adjustments[].from_value` | string | No | Valor original (omitir si solo es confirmación) |
| `qa_info.adjustments[].to_value` | string | Sí | Valor final/confirmado |
