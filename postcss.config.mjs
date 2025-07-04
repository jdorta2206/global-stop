/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    'tailwindcss/nesting': {}, // Añade soporte para nesting
    tailwindcss: {},
    autoprefixer: {}, // Añade prefijos automáticos
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}) // Minifica en producción
  }
};

export default config;