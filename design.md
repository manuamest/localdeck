# Design System Manuel Amestoy

Guia de diseno basada en la UI de `Portfolio/`, `diff-checker/` y la extraccion inicial de colores del portfolio.

## 1. Direccion Visual

La identidad combina una estetica tecnica, premium y cercana: fondos oscuros azulados, acentos electricos, glassmorphism sutil, tarjetas redondeadas y mucho aire entre bloques.

El portfolio aporta la marca personal: Poppins, gradientes azul oscuro a azul brillante, tarjetas tipo glass, secciones amplias y elementos redondeados. `diff-checker` aporta el lenguaje de producto: barra flotante compacta, controles densos, editor full-screen, microinteracciones rapidas y estados claros.

Principios clave:

- Oscuro por defecto; claro solo como modo alternativo.
- Azul `#4f85e5` como acento principal de marca.
- Cyan/azul claro para estados activos, iconos y brillos.
- Superficies translucidas con blur y bordes de baja opacidad.
- Bordes redondeados constantes, sin esquinas agresivas.
- Movimiento corto: elevacion, desplazamiento vertical leve y cambios de brillo.
- Interfaces funcionales: los elementos decorativos no deben competir con el contenido.

## 2. Paleta Canonica

### Fondos

| Token | Valor | Uso |
|---|---:|---|
| `--color-bg-deep` | `#020812` | Fondo base oscuro, secciones profundas |
| `--color-bg-mid` | `#061325` | Gradientes y paneles |
| `--color-bg-raised` | `#0a1929` | Botones secundarios, tags, superficies elevadas |
| `--color-bg-tool-top` | `#121720` | Fondo superior de herramientas tipo diff-checker |
| `--color-bg-tool-bottom` | `#0f131a` | Fondo inferior de herramientas tipo diff-checker |
| `--color-bg-light` | `#ffffff` | Modo claro, canvas alternativo |
| `--color-bg-light-soft` | `#f5f7fa` | Modo claro, fondos secundarios |

### Texto

| Token | Valor | Uso |
|---|---:|---|
| `--color-text` | `#e9f0f9` | Texto principal en modo oscuro |
| `--color-text-soft` | `#c4ddff` | Subtitulos, texto destacado suave |
| `--color-text-muted` | `#8b96a8` | Captions, metadatos, ayudas |
| `--color-text-dark` | `#0a2545` | Texto principal en modo claro |
| `--color-text-neutral` | `#333333` | Texto neutro en superficies claras |

### Marca y Estados

| Token | Valor | Uso |
|---|---:|---|
| `--color-accent` | `#4f85e5` | CTA principal, highlights, links activos |
| `--color-accent-soft` | `#78a9f7` | Iconos, hover, detalles secundarios |
| `--color-cyan` | `#61afef` | Controles tecnicos, focus, marca de herramientas |
| `--color-cyan-bright` | `#00f2fe` | Gradientes puntuales, no como color plano dominante |
| `--color-danger` | `#e06c75` | Acciones destructivas en modo oscuro |
| `--color-danger-light` | `#d70015` | Acciones destructivas en modo claro |

### Bordes y Transparencias

| Token | Valor | Uso |
|---|---:|---|
| `--color-border-accent` | `rgba(79, 133, 229, 0.3)` | Bordes de botones, tarjetas activas, tags |
| `--color-border-card` | `rgba(79, 133, 229, 0.2)` | Tarjetas glass del portfolio |
| `--color-border-glass` | `rgba(255, 255, 255, 0.13)` | Command decks y overlays |
| `--color-surface-glass` | `rgba(6, 19, 37, 0.5)` | Tarjetas oscuras translucidas |
| `--color-surface-action` | `rgba(255, 255, 255, 0.045)` | Grupos de botones en herramientas |

## 3. Gradientes

Usar gradientes como parte de la identidad. No sustituirlos por colores planos salvo en componentes pequenos.

```css
:root {
  --gradient-bg: linear-gradient(135deg, #010408, #061325, #0a2545);
  --gradient-accent: linear-gradient(45deg, #0a2545, #4f85e5);
  --gradient-card: linear-gradient(145deg, rgba(6, 19, 37, 0.5), rgba(2, 8, 18, 0.7));
  --gradient-tool-bg: linear-gradient(180deg, #121720 0%, #0f131a 100%);
  --gradient-tool-primary: linear-gradient(135deg, rgba(97, 175, 239, 0.26), rgba(0, 242, 254, 0.14));
  --gradient-brand-text: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
}
```

Reglas:

- Fondo de pagina: `--gradient-bg` para marca personal, `--gradient-tool-bg` para herramientas.
- Texto destacado: usar clipping con `--gradient-accent` o `--gradient-brand-text`.
- Tarjetas: usar `--gradient-card` con blur y borde sutil.
- No abusar de `#00f2fe`; debe aparecer como chispa dentro de gradientes o focus, no como color principal.

## 4. Tipografia

### Portfolio y marketing

Fuente principal: `Poppins`, sans-serif.

| Rol | Tamano | Peso | Line-height | Uso |
|---|---:|---:|---:|---|
| Display | `3.5rem` / `56px` | 700 | `1.2` | Hero principal |
| Section title | `2.5rem` / `40px` | 600-700 | `1.2` | Titulos de seccion |
| Category | `1.8rem` / `28.8px` | 600 | `1.35` | Categorias de proyectos |
| Card title | `1.5rem` / `24px` | 700 | `1.4` | Tarjetas, timeline |
| Subtitle | `1.5rem` / `24px` | 500 | `1.6` | Bajadas principales |
| Body | `1.1rem` / `17.6px` | 400 | `1.6` | Texto corrido |
| Small | `0.9rem` / `14.4px` | 400-600 | `1.5` | Fechas, links, captions |

### Herramientas y apps tecnicas

Fuente principal: `IBM Plex Sans`, sans-serif.

| Rol | Tamano | Peso | Uso |
|---|---:|---:|---|
| Tool title | `1rem` | 700 | Marca compacta en toolbar |
| Button | `0.78rem` | 700 | Controles densos |
| Eyebrow | `0.68rem` | 600 | Subtitulo uppercase |
| Editor code | `13px-14px` | 400 | Monaco/editor, fuente monoespaciada nativa |

Reglas:

- Usar Poppins para sitios personales, landing pages y contenido narrativo.
- Usar IBM Plex Sans para herramientas tecnicas con controles densos.
- Mantener pesos 600-700 en titulos; evitar headings livianos.
- No usar negro puro para texto sobre oscuro; usar `#e9f0f9` o `#c4ddff`.

## 5. Layout y Espaciado

Base: `5px`. Los valores principales pueden mapearse a multiplos practicos.

| Token | Valor | Uso |
|---|---:|---|
| `--space-1` | `5px` | Ajustes finos |
| `--space-2` | `10px` | Gaps pequenos, padding compacto |
| `--space-3` | `15px` | Gaps entre botones, icono-texto amplio |
| `--space-4` | `20px` | Padding de contenedor, margenes medios |
| `--space-5` | `25px` | Padding de tarjeta |
| `--space-6` | `30px` | Separacion de bloques pequenos |
| `--space-8` | `40px` | Separacion de columnas hero |
| `--space-12` | `60px` | Separacion entre header de seccion y contenido |
| `--space-20` | `100px` | Padding vertical de seccion |

Contenedores:

- Portfolio: `width: 90%`, `max-width: 1200px`, centrado.
- Tool/fullscreen app: `100vw` x `100vh`, con toolbar flotante encima.
- Toolbar flotante: `width: min(1320px, calc(100vw - 32px))`.
- Secciones marketing: `padding: 100px 0`.
- Hero: `padding: 150px 0 100px` en desktop.

## 6. Radio, Bordes y Superficies

| Token | Valor | Uso |
|---|---:|---|
| `--radius-xs` | `4px` | Lineas decorativas, indicadores |
| `--radius-sm` | `8px` | Logos pequenos, chips compactos |
| `--radius-md` | `10px` | Botones tecnicos, tarjetas base |
| `--radius-lg` | `14px` | Grupos de controles |
| `--radius-xl` | `18px` | Command deck, overlays |
| `--radius-2xl` | `40px` | Tarjetas grandes expresivas |
| `--radius-pill` | `50px` | CTAs, badges, chips |
| `--radius-circle` | `999px` | Avatares, iconos circulares |

Reglas:

- CTAs y badges usan `50px`.
- Tarjetas del portfolio pueden usar `10px` si son densas o `16px-40px` si son protagonistas.
- Toolbars flotantes usan `18px` con blur.
- Iconos de seccion usan circulos de `60px`.

## 7. Elevacion y Glassmorphism

Sombras canonicas:

```css
:root {
  --shadow-card: 0 10px 30px rgba(0, 0, 0, 0.2);
  --shadow-header: 0 5px 15px rgba(0, 0, 0, 0.1);
  --shadow-accent: 0 0 10px rgba(79, 133, 229, 0.8);
  --shadow-accent-strong: 0 0 30px #4f85e5, 0 0 60px rgba(79, 133, 229, 0.4);
  --shadow-tool: 0 18px 50px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  --shadow-tool-primary: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 8px 22px rgba(42, 122, 186, 0.14);
}
```

Reglas:

- Las sombras de marca pueden ser cromaticas y azuladas.
- Las sombras de estructura deben ser negras con baja opacidad.
- Usar `backdrop-filter: blur(10px)` en header y tarjetas del portfolio.
- Usar `backdrop-filter: blur(18px) saturate(150%)` en toolbars flotantes.
- Evitar sombras grises genericas sin relacion con la paleta.

## 8. Componentes

### Header Portfolio

Patron:

- Fixed top, ancho completo.
- Fondo transluctido: `rgba(2, 8, 18, 0.8)`.
- Blur de `10px`.
- Borde inferior `rgba(79, 133, 229, 0.2)`.
- Al hacer scroll: menos padding, fondo mas opaco y sombra suave.

```css
.site-header {
  position: fixed;
  top: 0;
  width: 100%;
  padding: 20px 0;
  background: rgba(2, 8, 18, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(79, 133, 229, 0.2);
  z-index: 1000;
}
```

### Command Deck

Patron para apps tipo `diff-checker`:

```css
.command-deck {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: min(1320px, calc(100vw - 32px));
  display: grid;
  grid-template-columns: minmax(220px, 1fr) auto minmax(220px, 1fr);
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  background:
    linear-gradient(135deg, rgba(34, 39, 52, 0.86), rgba(15, 17, 24, 0.76)),
    radial-gradient(circle at 20% 0%, rgba(97, 175, 239, 0.18), transparent 38%);
  backdrop-filter: blur(18px) saturate(150%);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
```

### Botones

#### CTA Personal

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 25px;
  border: none;
  border-radius: 50px;
  background: #4f85e5;
  color: #ffffff;
  font-family: inherit;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-3px);
  background: #030f1d;
  box-shadow: 0 10px 20px rgba(10, 25, 41, 0.4);
}
```

#### Boton Tool Primary

```css
.tool-btn-primary {
  min-height: 34px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(97, 175, 239, 0.28);
  background: linear-gradient(135deg, rgba(97, 175, 239, 0.26), rgba(0, 242, 254, 0.14));
  color: #61afef;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 8px 22px rgba(42, 122, 186, 0.14);
}
```

#### Boton Secundario

```css
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 25px;
  border-radius: 50px;
  background: rgba(10, 25, 41, 0.5);
  color: #e9f0f9;
  border: 1px solid rgba(79, 133, 229, 0.3);
}
```

#### Boton Destructivo

```css
.btn-danger {
  background: rgba(224, 108, 117, 0.11);
  border: 1px solid rgba(224, 108, 117, 0.18);
  color: #e06c75;
}

.btn-danger:hover {
  background: rgba(224, 108, 117, 0.2);
  border-color: rgba(224, 108, 117, 0.4);
  box-shadow: 0 4px 15px rgba(224, 108, 117, 0.2);
}
```

### Tarjetas

```css
.card {
  background: linear-gradient(145deg, rgba(6, 19, 37, 0.5), rgba(2, 8, 18, 0.7));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(79, 133, 229, 0.2);
  border-radius: 10px;
  padding: 25px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
```

### Tags y Badges

```css
.tag,
.badge {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 8px 15px;
  border-radius: 50px;
  background: rgba(10, 25, 41, 0.35);
  border: 1px solid rgba(79, 133, 229, 0.3);
  color: #4f85e5;
  font-size: 0.8rem;
  font-weight: 500;
}
```

### Iconos de Seccion

```css
.section-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(10, 25, 41, 0.7);
  color: #78a9f7;
}
```

## 9. Interacciones

Estados:

- Hover de links: cambiar a `#4f85e5` y expandir underline de `0` a `100%`.
- Hover de CTAs: `translateY(-3px)`.
- Hover de tarjetas: `translateY(-5px)` y sombra.
- Active en botones de herramienta: `translateY(1px)` y quitar sombra.
- Focus visible: `outline: 2px solid rgba(97, 175, 239, 0.9); outline-offset: 2px`.
- Boton seleccionado: fondo hover, borde primary y texto primary.

Duraciones:

- Microinteracciones de tool: `0.16s ease`.
- Transiciones de portfolio: `0.3s ease`.
- Cambios de tema/fondo: `0.25s-0.5s ease`.

## 10. Modo Claro

El modo claro existe, pero no es la identidad por defecto.

```css
.light-theme {
  --color-bg: #ffffff;
  --color-bg-soft: #f5f7fa;
  --color-text: #0a2545;
  --color-text-soft: #13395e;
  --color-card: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  --color-border: rgba(10, 25, 41, 0.15);
  --color-accent: #4f85e5;
}
```

Reglas:

- Mantener acento azul.
- Usar fondos suaves, no blanco plano en todas las superficies.
- Reducir opacidad de brillos y sombras cromaticas.
- Texto principal en `#0a2545`, no en negro puro.

## 11. Responsive

Breakpoints:

| Breakpoint | Ancho | Comportamiento |
|---|---:|---|
| Mobile | `< 640px` | Una columna, botones apilados o scroll horizontal en toolbars |
| Tablet | `640px-1040px` | Dos columnas donde tenga sentido; command deck pasa a 2 filas |
| Desktop | `1040px-1440px` | Layout completo |
| Wide | `> 1440px` | Contenedor centrado con max-width |

Reglas especificas:

- Touch targets minimos: `44px` en mobile.
- Hero pasa de dos columnas a una columna en pantallas pequenas.
- Command deck a `< 1040px`: grid `1fr auto` y acciones en fila completa.
- Command deck a `< 680px`: una columna, ancho `calc(100vw - 20px)`, grupos con scroll horizontal ocultando scrollbar.
- Reducir display headings alrededor de 80% en mobile.
- Mantener el sistema de espaciado de `5px`, escalando multiplicadores.

## 12. Do's and Don'ts

### Do

- Usar modo oscuro como default.
- Usar `#4f85e5` como acento dominante.
- Usar Poppins en portfolio/marketing e IBM Plex Sans en herramientas.
- Usar gradientes y transparencias con moderacion.
- Mantener superficies redondeadas y amigables.
- Usar sombras cromaticas azules para elementos de marca.
- Priorizar legibilidad en editores y herramientas.

### Don't

- No convertir toda la UI a fondo blanco por la extraccion automatica; el codigo real es dark-first.
- No usar colores fuera de la paleta sin razon de producto.
- No usar negro puro como texto ni superficies grandes sin gradiente.
- No agregar ornamentos nuevos si no ayudan: ribbons, badges llamativos o banners ajenos al sistema.
- No usar esquinas afiladas en CTAs, chips o toolbars.
- No mezclar demasiadas fuentes.
- No usar animaciones largas o invasivas en herramientas productivas.

## 13. Tokens CSS Recomendados

```css
:root {
  color-scheme: dark;

  --font-brand: 'Poppins', sans-serif;
  --font-tool: 'IBM Plex Sans', sans-serif;

  --color-bg-deep: #020812;
  --color-bg-mid: #061325;
  --color-bg-raised: #0a1929;
  --color-bg-light: #ffffff;

  --color-text: #e9f0f9;
  --color-text-soft: #c4ddff;
  --color-text-muted: #8b96a8;
  --color-text-dark: #0a2545;

  --color-accent: #4f85e5;
  --color-accent-soft: #78a9f7;
  --color-cyan: #61afef;
  --color-cyan-bright: #00f2fe;
  --color-danger: #e06c75;

  --gradient-bg: linear-gradient(135deg, #010408, #061325, #0a2545);
  --gradient-accent: linear-gradient(45deg, #0a2545, #4f85e5);
  --gradient-card: linear-gradient(145deg, rgba(6, 19, 37, 0.5), rgba(2, 8, 18, 0.7));
  --gradient-tool-bg: linear-gradient(180deg, #121720 0%, #0f131a 100%);
  --gradient-tool-primary: linear-gradient(135deg, rgba(97, 175, 239, 0.26), rgba(0, 242, 254, 0.14));

  --border-card: rgba(79, 133, 229, 0.2);
  --border-accent: rgba(79, 133, 229, 0.3);
  --border-glass: rgba(255, 255, 255, 0.13);

  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-pill: 50px;
  --radius-circle: 999px;

  --space-1: 5px;
  --space-2: 10px;
  --space-3: 15px;
  --space-4: 20px;
  --space-5: 25px;
  --space-8: 40px;
  --space-12: 60px;
  --space-20: 100px;

  --shadow-card: 0 10px 30px rgba(0, 0, 0, 0.2);
  --shadow-accent: 0 0 10px rgba(79, 133, 229, 0.8);
  --shadow-tool: 0 18px 50px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
```

## 14. Prompt Rapido Para Agentes

Usa esta descripcion cuando se pida una UI nueva alineada con Manuel Amestoy:

```text
Crea una UI dark-first inspirada en Manuel Amestoy: fondo con gradiente azul oscuro (#010408, #061325, #0a2545), texto #e9f0f9, acento principal #4f85e5, detalles #78a9f7/#61afef, tarjetas glass con blur y borde rgba(79,133,229,.2), CTAs pill de 50px, sombras cromaticas azules y espaciado basado en 5px. Usa Poppins para portfolio/landing y IBM Plex Sans para herramientas productivas. Mantiene esquinas redondeadas, hover con translateY leve, focus visible cyan y responsive mobile-first.
```
