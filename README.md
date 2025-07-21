# 🎨✨ Magical GIF Maker

> Turn your ideas into stunning animated doodles with the power of AI

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Made with Gemini AI](https://img.shields.io/badge/Made%20with-Gemini%20AI-4285F4)](https://ai.google.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Modern-1572B6.svg)](https://developer.mozilla.org/en-US/docs/Web/CSS)

## 🌟 Features

### 🎨 **Creative Controls**
- **6 Art Styles**: Doodle, Watercolor, Sketch, Pixel Art, Cartoon, Minimalist
- **4 Color Themes**: Pastel, Vibrant, Monochrome, Neon
- **3 Animation Speeds**: Slow, Normal, Fast
- **3 Frame Counts**: 5, 10, or 15 frames
- **3 Output Sizes**: 512px, 1024px, 2048px

### 🚀 **User Experience**
- **💡 Smart Suggestions**: 60+ curated prompt ideas with "Surprise Me!" button
- **📝 Recent History**: Auto-saves your last 8 prompts with localStorage
- **🎬 Live Preview**: Real-time animation preview with play/pause controls
- **📊 Progress Tracking**: Beautiful 3-stage progress visualization
- **📱 Social Sharing**: Direct sharing to X, Facebook, Reddit, Discord + copy link

### ⚡ **Technical Excellence**
- **Real-time Generation**: Watch your animation come to life frame by frame
- **Mobile Responsive**: Perfect experience on all devices
- **Modern UI/UX**: Purple-themed design with smooth animations
- **Performance Optimized**: Efficient canvas rendering and memory management
- **Error Handling**: Robust error handling with user-friendly feedback

## 🎯 Demo

![Magical GIF Maker Demo](demo.gif)

*Create magical animations in seconds with just a text prompt!*

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Google Gemini API key ([Get one here](https://ai.google.dev/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/magical-gif-maker.git
   cd magical-gif-maker
   ```

2. **Set up your API key**
   ```javascript
   // In index.js, replace the API key:
   const API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
   ```

3. **Serve the files**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🎨 Usage

1. **Enter your prompt**: Describe the animation you want to create
2. **Customize settings**: Choose style, colors, speed, frames, and size
3. **Generate**: Click "Generate Magic" and watch the preview
4. **Share**: Download or share your creation on social media

### Example Prompts
- `a cat wearing sunglasses dancing`
- `a wizard casting a spell`
- `a coffee cup steaming`
- `rain drops falling gently`
- `a paper airplane soaring`

## 🛠️ Developer Guide

### Architecture

```
magical-gif-maker/
├── index.html          # Main HTML structure
├── index.css           # Styling and animations
├── index.js            # Core application logic
├── metadata.json       # Project metadata
└── README.md          # Documentation
```

### Key Technologies

- **Frontend**: Vanilla JavaScript (ES6+), CSS3, HTML5
- **AI Integration**: Google Gemini 2.0 Flash API
- **GIF Generation**: gifenc library
- **Icons**: Font Awesome 6.4.0
- **Module System**: ES6 imports with importmap

### Core Components

#### 1. **AI Integration** (`index.js`)
```javascript
// Gemini AI setup
const ai = new GoogleGenAI({apiKey: API_KEY});

// Streaming image generation
const response = await ai.models.generateContentStream({
  model: 'gemini-2.0-flash-preview-image-generation',
  contents: prompt,
  config: {
    temperature: 1,
    responseModalities: [Modality.IMAGE, Modality.TEXT],
  },
});
```

#### 2. **GIF Creation** (`index.js`)
```javascript
// Convert frames to GIF
async function createGifFromPngs(imageUrls, targetWidth, targetHeight) {
  const gif = GIFEncoder();
  // Process each frame...
  gif.finish();
  return gifBlob;
}
```

#### 3. **Preview System** (`index.js`)
```javascript
// Real-time canvas preview
function drawPreviewFrame(frameIndex) {
  const ctx = previewCanvas.getContext('2d');
  ctx.drawImage(previewFrames[frameIndex], 0, 0);
}
```

#### 4. **State Management** (`index.js`)
```javascript
// Global state variables
let selectedStyle = 'doodle';
let selectedSpeed = 'normal';
let selectedFrameCount = 10;
let selectedColorTheme = 'vibrant';
let selectedSize = 1024;
```

### Styling Architecture

#### CSS Custom Properties
```css
:root {
  --primary-color: light-dark(#8a2be2, #a960ff);
  --primary-light: light-dark(#b088e2, #c8a1ff);
  --text-color: light-dark(#333, #f0f0f0);
  --background-color: light-dark(#f8f9fc, #121212);
  --card-color: light-dark(#ffffff, #1e1e1e);
}
```

#### Component Structure
- **Modular CSS**: Each feature has its own CSS section
- **Responsive Design**: Mobile-first approach with breakpoints
- **Animation System**: Smooth transitions and micro-interactions
- **Theme Support**: Light/dark mode ready with CSS custom properties

### API Integration

#### Gemini AI Configuration
```javascript
const styleDescriptions = {
  doodle: 'Simple, vibrant, varied-colored doodle/hand-drawn sketch',
  watercolor: 'Soft watercolor painting with flowing colors',
  // ... more styles
};

const colorThemeDescriptions = {
  pastel: 'soft pastel colors with gentle, muted tones',
  vibrant: 'bright, bold, and saturated colors',
  // ... more themes
};
```

#### Error Handling
```javascript
function parseError(error) {
  const regex = /{"error":(.*)}/gm;
  const m = regex.exec(error);
  try {
    const e = m[1];
    const err = JSON.parse(e);
    return err.message;
  } catch (e) {
    return error;
  }
}
```

### Performance Optimizations

1. **Efficient Canvas Rendering**: Only redraw when necessary
2. **Memory Management**: Proper cleanup of intervals and event listeners
3. **Lazy Loading**: Components load only when needed
4. **Optimized GIF Encoding**: Uses efficient quantization algorithms
5. **Responsive Images**: Dynamic sizing based on user selection

### Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| ES6 Modules | ✅ | ✅ | ✅ | ✅ |
| Canvas API | ✅ | ✅ | ✅ | ✅ |
| Clipboard API | ✅ | ✅ | ✅ | ✅ |
| CSS Grid | ✅ | ✅ | ✅ | ✅ |
| CSS Custom Properties | ✅ | ✅ | ✅ | ✅ |

### Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

#### Development Setup
```bash
# Clone your fork
git clone https://github.com/yourusername/magical-gif-maker.git

# Create development branch
git checkout -b feature/your-feature

# Make changes and test
# Commit and push
git add .
git commit -m "Your feature description"
git push origin feature/your-feature
```

#### Code Style Guidelines
- Use ES6+ features
- Follow semantic HTML structure
- Use CSS custom properties for theming
- Add comments for complex logic
- Maintain responsive design principles

### Deployment

#### Static Hosting (Recommended)
- **Netlify**: Drag and drop deployment
- **Vercel**: Git-based deployment
- **GitHub Pages**: Free hosting for public repos
- **Firebase Hosting**: Google's hosting solution

#### Environment Variables
```javascript
// For production, use environment variables
const API_KEY = process.env.GEMINI_API_KEY || 'fallback-key';
```

### Troubleshooting

#### Common Issues

1. **API Key Not Working**
   - Verify your Gemini API key is valid
   - Check API quotas and billing
   - Ensure proper CORS settings

2. **GIF Generation Fails**
   - Check browser console for errors
   - Verify all frames loaded successfully
   - Try reducing frame count or size

3. **Preview Not Working**
   - Ensure canvas is properly initialized
   - Check for JavaScript errors
   - Verify image loading

#### Debug Mode
```javascript
// Enable debug logging
const DEBUG = true;
if (DEBUG) console.log('Debug info:', data);
```

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful image generation
- **gifenc** library for efficient GIF encoding
- **Font Awesome** for beautiful icons
- **CSS Grid** and **Flexbox** for responsive layouts

## 🔗 Links

- [Live Demo](https://callous-veil.surge.sh/)
- [API Documentation](https://ai.google.dev/docs)
- [Report Issues](https://github.com/yourusername/magical-gif-maker/issues)
- [Feature Requests](https://github.com/yourusername/magical-gif-maker/discussions)

---

<div align="center">

**Made with ❤️ and ✨ magic**

[⭐ Star this repo](https://github.com/yourusername/magical-gif-maker) • [🐛 Report Bug](https://github.com/yourusername/magical-gif-maker/issues) • [💡 Request Feature](https://github.com/yourusername/magical-gif-maker/discussions)

</div>