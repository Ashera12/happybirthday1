export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 30px 80px rgba(139, 92, 246, 0.18)',
      },
      colors: {
        brand: {
          50: '#fff5f8',
          100: '#ffe7f1',
          200: '#ffcee3',
          500: '#d946ef',
          700: '#9333ea'
        }
      }
    }
  },
  plugins: [],
};
