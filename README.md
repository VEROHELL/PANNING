# DropCheck — Escáner de Éxito y Masterización Musical

Analizador profesional de pistas de audio para viralidad en TikTok y YouTube, balance de mezcla, fuerza del gancho y ecualización de estudio.

## Características Principales

- **Análisis de Viralidad**: Evalúa el potencial de una pista para volverse viral en TikTok y YouTube
- **Balance de Mezcla**: Analiza el equilibrio frecuencial y espacial de tu producción
- **Fuerza del Gancho**: Identifica y mide el impacto de los hooks musicales
- **Ecualización de Estudio**: Recomendaciones profesionales de EQ basadas en IA
- **Generación de Reportes PDF**: Exporta análisis detallados en formato PDF
- **Interfaz Moderna**: UI construida con React, TailwindCSS y Framer Motion

## Requisitos Previos

- [Bun](https://bun.sh/) o Node.js (v18+)
- API Key de Google Gemini

## Instalación

1. Clona este repositorio:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Instala las dependencias:
```bash
bun install
# o
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

Edita `.env` y agrega tu API key de Gemini:
```
GEMINI_API_KEY=tu_api_key_aqui
APP_URL=http://localhost:5173
```

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Inicia el servidor de desarrollo con hot-reload |
| `bun run build` | Compila el proyecto para producción |
| `bun run start` | Ejecuta la versión de producción |
| `bun run preview` | Vista previa de la build de producción |
| `bun run clean` | Limpia archivos generados (dist, server.js) |
| `bun run lint` | Ejecuta TypeScript sin emitir archivos |

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
bun run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que configure Vite).

## Build de Producción

```bash
bun run build
bun run start
```

Esto generará los archivos optimizados en el directorio `dist/`.

## Estructura del Proyecto

```
├── src/
│   ├── App.tsx          # Componente principal
│   ├── components/      # Componentes reutilizables
│   ├── data/           # Datos estáticos y configuraciones
│   ├── utils/          # Funciones utilitarias
│   ├── types.ts        # Definiciones de tipos TypeScript
│   └── index.css       # Estilos globales con TailwindCSS
├── server.ts           # Servidor Express con integración Gemini AI
├── index.html          # HTML base
├── package.json        # Dependencias y scripts
├── tsconfig.json       # Configuración de TypeScript
├── vite.config.ts      # Configuración de Vite
└── bun.lock            # Lock file de Bun
```

## Tecnologías Utilizadas

- **Frontend**:
  - React 19
  - TypeScript
  - Vite 6
  - TailwindCSS 4
  - Framer Motion
  - Lucide React (iconos)
  - canvas-confetti
  - html2canvas & jsPDF (generación de PDFs)

- **Backend**:
  - Express.js
  - Google Generative AI (@google/genai)
  - ESBuild (bundling)

## Configuración de la API de Gemini

Este proyecto utiliza la API de Google Gemini para análisis de audio mediante IA. Para obtener una API key:

1. Visita [Google AI Studio](https://aistudio.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Genera una API key en la sección de configuración
4. Agrega la key a tu archivo `.env`

## Licencia

Privado - Todos los derechos reservados

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir cambios significativos.

---

**Nota**: Este proyecto requiere una conexión a internet para funcionar correctamente debido a la integración con la API de Gemini.
