# Paleta de colores — MyPayTracker

## 1. Concepto: calma con intención

**Marfil suave + grafito + verde petróleo.** Una base cálida evita la frialdad del blanco puro; el grafito hace que los importes destaquen; el verde petróleo aporta identidad sin convertir todo el dashboard en un semáforo.

El acento representa acciones e identidad. Un saldo negativo, un gasto y un error tienen significados diferentes: no deben compartir automáticamente el mismo tratamiento.

## 2. Base y acento

| Token CSS | Color | Uso |
| --- | --- | --- |
| `--color-bg` | `#F7F8F5` | Fondo general marfil |
| `--color-surface` | `#FFFFFF` | Tarjetas, formularios y diálogos |
| `--color-surface-muted` | `#EFF2EE` | Secciones secundarias, hover de filas y controles deshabilitados |
| `--color-border` | `#DEE4DD` | Separadores decorativos y bordes de tarjetas |
| `--color-border-control` | `#7C8880` | Contorno identificable de campos y controles |
| `--color-text` | `#202824` | Importes, títulos y contenido principal |
| `--color-text-secondary` | `#59635D` | Etiquetas, fechas y descripciones |
| `--color-text-muted` | `#66716A` | Ayudas y metadatos de menor prioridad |
| `--color-primary` | `#176B5B` | Acción principal, enlaces, selección y foco |
| `--color-primary-hover` | `#125448` | Hover y pulsación de la acción principal |
| `--color-primary-soft` | `#E7F1ED` | Fondo de selección y énfasis discreto |
| `--color-on-primary` | `#FFFFFF` | Texto e iconos sobre el acento sólido |

Distribución orientativa: **80 % neutros claros, 15 % estructura y texto, 5 % acento y estados**. Es una guía de percepción, no una proporción rígida que deba medirse por píxeles.

## 3. Colores semánticos

| Rol | Texto/icono | Fondo suave | Aplicación |
| --- | --- | --- | --- |
| Éxito | `#247044` | `#EAF4EC` | Operación guardada o ingreso identificado |
| Advertencia | `#855000` | `#FFF4DE` | Revisión pendiente o información incompleta |
| Error | `#B23838` | `#FCEEEE` | Error de validación, fallo o saldo negativo |
| Información | `#365F96` | `#EDF3FB` | Estado informativo de sincronización bancaria |

- Acompañar cada estado con texto y, cuando aporte claridad, un icono.
- Mostrar gastos ordinarios en grafito con signo `−` y etiqueta «Gasto». Gastar no es un error.
- Mostrar ingresos con signo `+` y etiqueta «Ingreso»; el verde puede reforzarlos.
- Usar botones destructivos de contorno o fondo suave con texto de error. No colocar texto blanco sobre los fondos semánticos suaves.
- En gráficos simples, usar petróleo para ingresos y grafito para gastos, con etiquetas o patrones además del color. Evitar gráficos con muchas categorías coloreadas sin necesidad.

## 4. Aplicación en la app

| Elemento | Tratamiento |
| --- | --- |
| Saldo disponible | Importe grande en grafito; negativo en color de error con signo y explicación |
| Resumen principal | Superficie blanca; el tamaño del importe crea el énfasis |
| «Registrar movimiento» | Botón petróleo con texto blanco |
| «¿Puedo comprar esto?» | Campo sobre blanco; resultado explícito con importe restante o faltante |
| Compra posible | «Sí, te quedarían ₡…» con tratamiento de éxito discreto |
| Compra que supera el saldo | «Te faltan ₡…» con icono y tratamiento de advertencia |
| Navegación activa | Fondo petróleo suave, texto petróleo e indicador de selección |
| Movimientos | Filas limpias; descripción a la izquierda, importe alineado a la derecha |
| Sincronización fallida | Mensaje de error localizado junto a una acción para reintentar |

Los ejemplos usan `₡` solo como ilustración; la interfaz debe emplear la moneda configurada para el usuario.

## 5. Tokens listos para implementar

```css
:root {
  color-scheme: light;

  --color-bg: #F7F8F5;
  --color-surface: #FFFFFF;
  --color-surface-muted: #EFF2EE;
  --color-border: #DEE4DD;
  --color-border-control: #7C8880;

  --color-text: #202824;
  --color-text-secondary: #59635D;
  --color-text-muted: #66716A;

  --color-primary: #176B5B;
  --color-primary-hover: #125448;
  --color-primary-soft: #E7F1ED;
  --color-on-primary: #FFFFFF;

  --color-success: #247044;
  --color-success-soft: #EAF4EC;
  --color-warning: #855000;
  --color-warning-soft: #FFF4DE;
  --color-danger: #B23838;
  --color-danger-soft: #FCEEEE;
  --color-info: #365F96;
  --color-info-soft: #EDF3FB;

  --focus-ring: 0 0 0 2px var(--color-surface),
                0 0 0 4px var(--color-primary);
}
```

Usar los tokens por su función, sin repetir códigos hexadecimales en cada componente. Aplicar `--focus-ring` en `:focus-visible`, conservarlo visible y evitar que los contenedores lo recorten.

## 6. Contraste verificado

Ratios calculados con luminancia relativa sRGB según WCAG. Objetivo AA: al menos **4.5:1 para texto normal** y **3:1 para límites necesarios de controles e indicadores visuales**.

| Combinación | Ratio aproximado |
| --- | --- |
| Texto principal / fondo general | 14.17:1 |
| Texto secundario / blanco | 6.24:1 |
| Texto secundario / fondo general | 5.85:1 |
| Texto tenue / fondo general | 4.76:1 |
| Blanco / botón principal | 6.38:1 |
| Blanco / botón en hover | 8.80:1 |
| Petróleo / fondo petróleo suave | 5.53:1 |
| Éxito / fondo de éxito | 5.37:1 |
| Advertencia / fondo de advertencia | 6.12:1 |
| Error / fondo de error | 5.29:1 |
| Información / fondo de información | 5.82:1 |
| Borde de control / blanco | 3.69:1 |
| Borde de control / fondo general | 3.46:1 |

El borde decorativo `--color-border` no sirve como único indicador de un campo. No reducir la opacidad de texto activo: cambiaría los contrastes verificados. Revisar nuevas combinaciones, gráficos y estados cuando se implementen; esta tabla valida los pares indicados, no la accesibilidad de toda la aplicación.

## 7. Límites visuales

- Un único color de marca; los colores semánticos aparecen solo cuando comunican un estado.
- No usar degradados, brillos ni grandes superficies saturadas en el dashboard.
- No teñir cada tarjeta de un color distinto.
- No usar gris claro para texto necesario ni placeholders como sustituto de etiquetas.
- Esta primera paleta define el tema claro. Un futuro tema oscuro necesita tokens y contrastes propios.
