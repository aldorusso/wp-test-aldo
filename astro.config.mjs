// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { copyFile } from 'node:fs/promises';

// Rutas antiguas de WordPress que deben seguir funcionando (en hosting estático se generan
// páginas de redirección; ver README para las equivalentes a nivel de servidor).
const legacyRedirects = {
  '/securlock/': '/secur-lock/',
  '/en/securlock/': '/en/secur-lock/',
  '/about-us/': '/nosotros/',
  '/en/about-us/': '/en/nosotros/',
  // Archivo de portfolio: en el original estaba roto (shortcode sin procesar y texto demo del tema).
  '/portfolio-items/': '/',
  '/en/portfolio-items/': '/en/',
  '/portfolio_category/productos-bancarios/': '/',
  '/en/portfolio_category/productos-bancarios/': '/en/',
  // Taxonomías internas del maquetador (el original ya las redirigía a la portada).
  '/fusion_tb_category/content/': '/', '/fusion_tb_category/footer/': '/', '/fusion_tb_category/header/': '/',
  '/fusion_tb_category/page_title_bar/': '/', '/element_category/columns/': '/', '/element_category/elements/': '/',
  '/element_category/sections/': '/',
  // Archivo de autor: se elimina para no exponer el usuario administrador.
  '/author/admin/': '/', '/en/author/admin/': '/en/',
};

// Copia el sitemap con el nombre que tenía en Yoast, ya registrado en buscadores.
const sitemapAlias = {
  name: 'sitemap-alias',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      await copyFile(new URL('sitemap-index.xml', dir), new URL('sitemap_index.xml', dir));
    },
  },
};

// Sitio estático (sin servidor ni base de datos): nada que atacar como en WordPress.
export default defineConfig({
  site: 'https://facebank.pr',
  trailingSlash: 'always',
  build: { format: 'directory' },
  redirects: legacyRedirects,
  fonts: [
    {
      // Fuentes servidas desde el propio dominio (sin peticiones a Google). Licencia SIL OFL.
      provider: fontProviders.local(),
      name: 'Manrope',
      cssVariable: '--font-manrope',
      fallbacks: ['Arial', 'Helvetica', 'sans-serif'],
      options: {
        variants: [
          { src: ['./node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2'], weight: '200 800', style: 'normal' },
          { src: ['./node_modules/@fontsource-variable/manrope/files/manrope-latin-ext-wght-normal.woff2'], weight: '200 800', style: 'normal' },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Open Sans',
      cssVariable: '--font-open-sans',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [{ src: ['./node_modules/@fontsource/open-sans/files/open-sans-latin-400-normal.woff2'], weight: '400', style: 'normal' }],
      },
    },
  ],
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es-ES', en: 'en-US' } },
      filter: (page) => !page.includes('/banner-nuevo/') && !page.includes('/404'),
    }),
    sitemapAlias,
  ],
});
