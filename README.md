# facebank.pr — sitio estático en Astro 7

Migración del sitio WordPress (tema Avada) de facebank.pr a un sitio **estático** generado con
Astro 7.4. No hay servidor de aplicación, base de datos, panel de administración ni plugins:
el resultado de la compilación son archivos HTML, CSS, JS, imágenes y PDF.

## Requisitos

- Node.js ≥ 22.22 (en esta máquina, vía nvm de VSCodium).

## Comandos

```sh
npm install        # instala dependencias
npm run dev        # servidor de desarrollo en http://localhost:4321
npm run build      # genera el sitio en dist/
npm run preview    # sirve dist/ para revisarlo
```

## Estructura

```
src/
  pages/                 Una página .astro por URL, idéntica a la del sitio original.
    index.astro          Portada en español (ruta /)
    en/...               Versión en inglés (ruta /en/...)
    404.astro            Página de error (bilingüe según la URL)
  layouts/Page.astro     <head> (SEO, hreflang, Open Graph, schema), GTM, chat, accesibilidad.
  components/
    Header.astro         Logo, mega menú, menú móvil, idioma, búsqueda.
    Footer.astro         Pie (el contenido de cada idioma está en generated/Footer*.astro).
    PhoneSelector.astro  Selector de país → teléfono de atención.
    LeaveNotice.astro    Aviso al salir a sitios externos.
  data/
    menu.json            Menú principal en ES y EN.
    phones.ts            Teléfonos por país.
  styles/                CSS propio (tokens, maquetación, elementos, componentes).
  scripts/site.ts        Interacciones (menús, modales, pestañas, acordeones, búsqueda…).
  icons/                 Iconos SVG (Font Awesome Free, CC BY 4.0).
public/
  wp-content/uploads/... Imágenes y PDF con las MISMAS rutas que tenían en WordPress.
  Tarifario_ES.pdf, Tarifario_EN.pdf
  search-es.json, search-en.json   Índice de la búsqueda del menú.
```

## Cómo editar contenido

Cada página está en `src/pages/<ruta>/index.astro` y contiene HTML legible. El bloque del
principio (`const page = {...}`) guarda el título, la descripción y los metadatos SEO.

- Texto: editar directamente el HTML de la página (versión ES y versión EN por separado).
- Teléfonos: `src/data/phones.ts`.
- Menú: `src/data/menu.json`.
- Pie de página: `src/components/generated/FooterEs.astro` y `FooterEn.astro`.
- PDF nuevos: copiarlos en `public/` y enlazarlos con su ruta.

Las clases del HTML (`sec`, `row`, `col`, `ttl`, `txt`, `btn`…) y sus variables (`--pt`, `--w`, …)
controlan el diseño; están documentadas en `src/styles/`.

## Publicación

Cualquier hosting de archivos estáticos sirve. Recomendado: **Cloudflare Pages**, porque el
dominio ya está en Cloudflare (comando de build `npm run build`, carpeta `dist`).

### Redirecciones a configurar en el servidor

Astro genera páginas de redirección para las rutas antiguas (`/securlock/`, `/about-us/`, …).
Las URL de WordPress con parámetros no se pueden resolver con archivos estáticos y deben
configurarse en el hosting o en Cloudflare (Reglas de redirección):

| Origen | Destino |
|---|---|
| `/?page_id=2559` | `/servicios/` |
| `/en/?page_id=2559` | `/en/servicios/` |
| `/?page_id=2351` | `/secur-lock/` |
| `/en/?page_id=2351` | `/en/secur-lock/` |
| `/?p=<id>` | página correspondiente (enlaces cortos de WordPress; opcional) |
| `/feed/`, `/wp-json/*`, `/wp-admin/*`, `/wp-login.php`, `/xmlrpc.php` | 410 o portada |

## Integraciones conservadas

- Google Tag Manager `GTM-WDMNF34` (con el mismo `dataLayer` de página).
- Chat de agentbot.
- Widget de accesibilidad accessiBe (misma configuración).
- Aviso de salida a sitios externos (excepto la Banca Online `secureib.facebank.pr`).
