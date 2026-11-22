/// <reference types="vite/client" />
import themeScript from "../scripts/site-theme.js?raw";

// Inline the preference before styles and content paint. Both the Astro layout
// and the standalone experience documents share this head fragment.
export const themeHead = `<meta name="color-scheme" content="light dark">
<style>
  :root { color-scheme: light; }
  @supports (color: light-dark(white, black)) {
    :root { color-scheme: light dark; }
    :root[data-theme="light"] { color-scheme: light; }
    :root[data-theme="dark"] { color-scheme: dark; }
  }
</style>
<script>${themeScript}</script>`;
