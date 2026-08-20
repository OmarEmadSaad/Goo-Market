/**
 * Next handles plain CSS side-effect imports at build time, but only declares
 * `*.module.css` in its own types, so `import "./globals.css"` needs this.
 */
declare module "*.css";
