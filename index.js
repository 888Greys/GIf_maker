/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {GoogleGenAI, Modality} from '@google/genai';
import {applyPalette, GIFEncoder, quantize} from 'gifenc';

// You'll need to replace this with your actual Gemini API key
const API_KEY = 'AIzaSyB_7HsTE0gw0WEQfAJ3kliicRNUMn51JA8';
const ai = new GoogleGenAI({apiKey: API_KEY});
const fps = 4;

// Style presets
let selectedStyle = 'doodle';
const styleDescriptions = {
  doodle: 'Simple, vibrant, varied-colored doodle/hand-drawn sketch',
  watercolor: 'Soft watercolor painting with flowing colors and gentle brushstrokes',
  sketch: 'Pencil sketch with clean lines and shading',
  pixel: '8-bit pixel art style with blocky, retro video game aesthetics',
  cartoon: 'Bold cartoon style with bright colors and exaggerated features',
  minimalist: 'Clean minimalist design with simple shapes and limited colors'
};

// Animation speed control
let selectedSpeed = 'normal';
const speedSettings = {
  slow: { fps: 2, delay: 500 },
  normal: { fps: 4, delay: 250 },
  fast: { fps: 8, delay: 125 }
};

// Frame count control
let selectedFrameCount = 10;
const frameCountOptions = [5, 10, 15];

// Color theme control
let selectedColorTheme = 'vibrant';
const colorThemeDescriptions = {
  pastel: 'soft pastel colors with gentle, muted tones',
  vibrant: 'bright, bold, and saturated colors',
  monochrome: 'black and white with grayscale tones',
  neon: 'electric neon colors with glowing, fluorescent effects'
};

// Size control
let selectedSize = 1024;
const sizeOptions = [512, 1024, 2048];
const sizeDescriptions = {
  512: { label: 'Small', description: 'Fast generation, smaller file size' },
  1024: { label: 'Medium', description: 'Balanced quality and speed' },
  2048: { label: 'Large', description: 'High quality, larger file size' }
};

// Recent prompts history
let recentPrompts = [];
const MAX_RECENT_PROMPTS = 8;

// Progress tracking
let progressStartTime = 0;
let progressTimer = null;

// Preview functionality
let previewFrames = [];
let previewTimer = null;
let currentPreviewFrame = 0;
let isPreviewPlaying = false;

// Share functionality
let currentGifUrl = null;
let currentPrompt = '';

// Prompt suggestions
const promptSuggestions = [
  // Animals
  'a cat wearing sunglasses dancing',
  'a penguin sliding on ice',
  'a butterfly landing on a flower',
  'a dog chasing its tail',
  'a rabbit hopping through grass',
  'a fish swimming in circles',
  'a bird singing on a branch',
  'a squirrel collecting nuts',
  
  // Fantasy & Magic
  'a wizard casting a spell',
  'a dragon breathing fire',
  'a unicorn galloping through clouds',
  'a fairy sprinkling magic dust',
  'a crystal ball glowing',
  'a magic wand sparkling',
  'a phoenix rising from flames',
  'a mermaid swimming gracefully',
  
  // Food & Objects
  'a cupcake with candles flickering',
  'a coffee cup steaming',
  'a pizza slice melting cheese',
  'a balloon floating upward',
  'a clock ticking',
  'a flower blooming',
  'a candle flame dancing',
  'a rainbow appearing',
  
  // Characters & People
  'a chef flipping pancakes',
  'a musician playing guitar',
  'a dancer spinning gracefully',
  'a artist painting on canvas',
  'a gardener watering plants',
  'a baker kneading dough',
  'a scientist mixing potions',
  'a astronaut floating in space',
  
  // Weather & Nature
  'rain drops falling gently',
  'snowflakes swirling down',
  'leaves falling in autumn',
  'waves crashing on shore',
  'clouds drifting across sky',
  'lightning flashing dramatically',
  'sun rays breaking through clouds',
  'stars twinkling at night',
  
  // Vehicles & Movement
  'a paper airplane soaring',
  'a hot air balloon rising',
  'a bicycle wheel spinning',
  'a sailboat on gentle waves',
  'a train chugging along',
  'a rocket launching upward',
  'a skateboard rolling smoothly',
  'a swing swaying back and forth'
];

// DOM elements
const promptInput = document.getElementById('prompt-input');
const generateButton = document.getElementById('generate-button');
const framesContainer = document.getElementById('frames-container');
const resultContainer = document.getElementById('result-container');
const statusDisplay = document.getElementById('status-display');
const generationContainer = document.querySelector('.generation-container');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const surpriseButton = document.getElementById('surprise-btn');
const suggestionChips = document.getElementById('suggestion-chips');
const recentPromptsSection = document.getElementById('recent-prompts-section');
const recentChips = document.getElementById('recent-chips');
const clearHistoryButton = document.getElementById('clear-history-btn');

// Progress elements
const progressSection = document.getElementById('progress-section');
const progressTitle = document.getElementById('progress-title');
const progressDetails = document.getElementById('progress-details');
const progressFrameCount = document.getElementById('progress-frame-count');
const progressTime = document.getElementById('progress-time');
const progressFill = document.getElementById('progress-fill');
const progressPercentage = document.getElementById('progress-percentage');
const stagePrompt = document.getElementById('stage-prompt');
const stageFrames = document.getElementById('stage-frames');
const stageGif = document.getElementById('stage-gif');

// Preview elements
const previewSection = document.getElementById('preview-section');
const previewCanvas = document.getElementById('preview-canvas');
const previewOverlay = document.getElementById('preview-overlay');
const previewPlayBtn = document.getElementById('preview-play-btn');
const previewPauseBtn = document.getElementById('preview-pause-btn');
const previewInfo = document.getElementById('preview-info');

// Share elements
const shareSection = document.getElementById('share-section');
const shareX = document.getElementById('share-x');
const shareFacebook = document.getElementById('share-facebook');
const shareReddit = document.getElementById('share-reddit');
const shareDiscord = document.getElementById('share-discord');
const copyLink = document.getElementById('copy-link');
const downloadGif = document.getElementById('download-gif');
const statStyle = document.getElementById('stat-style');
const statFrames = document.getElementById('stat-frames');
const statSpeed = document.getElementById('stat-speed');
const statSize = document.getElementById('stat-size');

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

// Share management
function showShare() {
  shareSection.style.display = 'block';
  shareSection.classList.add('slide-in');
  
  // Update stats
  updateShareStats();
  
  setTimeout(() => {
    shareSection.classList.remove('slide-in');
  }, 500);
}

function hideShare() {
  shareSection.style.display = 'none';
}

function updateShareStats() {
  if (statStyle) statStyle.textContent = selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1);
  if (statFrames) statFrames.textContent = selectedFrameCount;
  if (statSpeed) statSpeed.textContent = selectedSpeed.charAt(0).toUpperCase() + selectedSpeed.slice(1);
  if (statSize) statSize.textContent = `${selectedSize}px`;
}

function generateShareText() {
  return `Check out this magical ${selectedStyle} animation I created! 🎨✨ Made with ${selectedFrameCount} frames at ${selectedSpeed} speed. #MagicalGIFMaker #Animation #AI`;
}

function generateShareUrl() {
  // In a real app, you'd upload the GIF and return a shareable URL
  // For now, we'll use the current page URL
  return window.location.href;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
}

function showCopyFeedback(button) {
  button.classList.add('copied');
  setTimeout(() => {
    button.classList.remove('copied');
  }, 2000);
}

// Preview management
function showPreview() {
  previewSection.style.display = 'block';
  previewSection.classList.add('slide-in');
  previewFrames = [];
  currentPreviewFrame = 0;
  isPreviewPlaying = false;
  
  // Reset preview state
  previewOverlay.classList.remove('hidden');
  previewPlayBtn.style.display = 'inline-flex';
  previewPauseBtn.style.display = 'none';
  previewInfo.textContent = 'Ready to preview';
  
  setTimeout(() => {
    previewSection.classList.remove('slide-in');
  }, 500);
}

function hidePreview() {
  previewSection.style.display = 'none';
  stopPreview();
  previewFrames = [];
}

function addFrameToPreview(imageSrc) {
  const img = new Image();
  img.onload = () => {
    previewFrames.push(img);
    
    // Hide overlay when first frame is added
    if (previewFrames.length === 1) {
      previewOverlay.classList.add('hidden');
      drawPreviewFrame(0);
      previewInfo.textContent = `${previewFrames.length} frame${previewFrames.length > 1 ? 's' : ''} ready`;
    } else {
      previewInfo.textContent = `${previewFrames.length} frame${previewFrames.length > 1 ? 's' : ''} ready`;
    }
    
    // Auto-start preview when we have multiple frames
    if (previewFrames.length >= 2 && !isPreviewPlaying) {
      startPreview();
    }
  };
  img.src = imageSrc;
}

function drawPreviewFrame(frameIndex) {
  if (!previewFrames[frameIndex] || !previewCanvas) return;
  
  const ctx = previewCanvas.getContext('2d');
  const img = previewFrames[frameIndex];
  
  // Set canvas size to match the image
  previewCanvas.width = img.width;
  previewCanvas.height = img.height;
  
  // Clear and draw the frame
  ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  ctx.drawImage(img, 0, 0);
}

function startPreview() {
  if (previewFrames.length < 2) return;
  
  isPreviewPlaying = true;
  previewPlayBtn.style.display = 'none';
  previewPauseBtn.style.display = 'inline-flex';
  
  const currentSpeed = speedSettings[selectedSpeed] || speedSettings.normal;
  const delay = currentSpeed.delay;
  
  previewTimer = setInterval(() => {
    currentPreviewFrame = (currentPreviewFrame + 1) % previewFrames.length;
    drawPreviewFrame(currentPreviewFrame);
    previewInfo.textContent = `Playing frame ${currentPreviewFrame + 1}/${previewFrames.length}`;
  }, delay);
}

function stopPreview() {
  isPreviewPlaying = false;
  previewPlayBtn.style.display = 'inline-flex';
  previewPauseBtn.style.display = 'none';
  
  if (previewTimer) {
    clearInterval(previewTimer);
    previewTimer = null;
  }
  
  if (previewFrames.length > 0) {
    previewInfo.textContent = `${previewFrames.length} frame${previewFrames.length > 1 ? 's' : ''} ready`;
  }
}

// Progress management
function showProgress() {
  progressSection.style.display = 'block';
  progressSection.classList.add('slide-in');
  progressStartTime = Date.now();
  
  // Start timer
  progressTimer = setInterval(updateProgressTime, 100);
  
  // Reset progress
  updateProgress(0, 0, selectedFrameCount);
  setProgressStage('prompt');
  
  setTimeout(() => {
    progressSection.classList.remove('slide-in');
  }, 500);
}

function hideProgress() {
  progressSection.style.display = 'none';
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

function updateProgress(currentFrame, totalFrames, maxFrames) {
  const percentage = totalFrames > 0 ? Math.round((currentFrame / totalFrames) * 100) : 0;
  
  progressFill.style.width = `${percentage}%`;
  progressPercentage.textContent = `${percentage}%`;
  progressFrameCount.textContent = `${currentFrame}/${maxFrames}`;
}

function updateProgressTime() {
  if (progressStartTime) {
    const elapsed = Math.round((Date.now() - progressStartTime) / 1000);
    progressTime.textContent = `${elapsed}s`;
  }
}

function setProgressStage(stage) {
  // Reset all stages
  stagePrompt.classList.remove('active', 'completed');
  stageFrames.classList.remove('active', 'completed');
  stageGif.classList.remove('active', 'completed');
  
  switch (stage) {
    case 'prompt':
      stagePrompt.classList.add('active');
      progressTitle.textContent = 'Processing Prompt...';
      progressDetails.textContent = 'Understanding your creative vision';
      break;
    case 'frames':
      stagePrompt.classList.add('completed');
      stageFrames.classList.add('active');
      progressTitle.textContent = 'Generating Frames...';
      progressDetails.textContent = `Creating ${selectedSize}px animation frames`;
      break;
    case 'gif':
      stagePrompt.classList.add('completed');
      stageFrames.classList.add('completed');
      stageGif.classList.add('active');
      progressTitle.textContent = 'Creating GIF...';
      progressDetails.textContent = 'Assembling your animated masterpiece';
      break;
    case 'complete':
      stagePrompt.classList.add('completed');
      stageFrames.classList.add('completed');
      stageGif.classList.add('completed');
      progressTitle.textContent = 'Complete!';
      progressDetails.textContent = `Your ${selectedSize}px magical animation is ready`;
      break;
  }
}

// Recent prompts management
function loadRecentPrompts() {
  try {
    const stored = localStorage.getItem('magical-gif-recent-prompts');
    if (stored) {
      recentPrompts = JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load recent prompts:', error);
    recentPrompts = [];
  }
}

function saveRecentPrompts() {
  try {
    localStorage.setItem('magical-gif-recent-prompts', JSON.stringify(recentPrompts));
  } catch (error) {
    console.warn('Failed to save recent prompts:', error);
  }
}

function addToRecentPrompts(prompt) {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt || trimmedPrompt.length < 3) return;
  
  // Remove if already exists
  recentPrompts = recentPrompts.filter(p => p !== trimmedPrompt);
  
  // Add to beginning
  recentPrompts.unshift(trimmedPrompt);
  
  // Keep only the most recent ones
  if (recentPrompts.length > MAX_RECENT_PROMPTS) {
    recentPrompts = recentPrompts.slice(0, MAX_RECENT_PROMPTS);
  }
  
  saveRecentPrompts();
  displayRecentPrompts();
}

function displayRecentPrompts() {
  if (recentPrompts.length === 0) {
    recentPromptsSection.style.display = 'none';
    return;
  }
  
  recentPromptsSection.style.display = 'block';
  recentChips.innerHTML = '';
  
  recentPrompts.forEach((prompt, index) => {
    const chip = document.createElement('button');
    chip.className = 'recent-chip';
    chip.textContent = prompt;
    chip.title = prompt; // Show full text on hover
    chip.onclick = () => {
      promptInput.value = prompt;
      promptInput.focus();
      // Add a subtle animation to show the prompt was selected
      chip.style.transform = 'scale(0.95)';
      setTimeout(() => {
        chip.style.transform = '';
      }, 150);
    };
    
    recentChips.appendChild(chip);
    
    // Animate chips in with a slight delay
    setTimeout(() => {
      chip.classList.add('animate-in');
    }, index * 50);
  });
  
  // Animate the section in if it was just shown
  if (recentPrompts.length === 1) {
    recentPromptsSection.classList.add('slide-in');
    setTimeout(() => {
      recentPromptsSection.classList.remove('slide-in');
    }, 500);
  }
}

function clearRecentPrompts() {
  recentPrompts = [];
  saveRecentPrompts();
  recentPromptsSection.style.display = 'none';
  
  // Add a fun animation to the clear button
  clearHistoryButton.style.transform = 'rotate(360deg) scale(1.1)';
  setTimeout(() => {
    clearHistoryButton.style.transform = '';
  }, 500);
}

function getRandomSuggestions(count = 6) {
  const shuffled = [...promptSuggestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function displaySuggestions() {
  const suggestions = getRandomSuggestions();
  suggestionChips.innerHTML = '';
  
  suggestions.forEach((suggestion, index) => {
    const chip = document.createElement('button');
    chip.className = 'suggestion-chip';
    chip.textContent = suggestion;
    chip.onclick = () => {
      promptInput.value = suggestion;
      promptInput.focus();
      // Add a subtle animation to show the prompt was selected
      chip.style.transform = 'scale(0.95)';
      setTimeout(() => {
        chip.style.transform = '';
      }, 150);
    };
    
    suggestionChips.appendChild(chip);
    
    // Animate chips in with a slight delay
    setTimeout(() => {
      chip.classList.add('animate-in');
    }, index * 100);
  });
}

function surpriseMe() {
  const randomPrompt = promptSuggestions[Math.floor(Math.random() * promptSuggestions.length)];
  promptInput.value = randomPrompt;
  
  // Add a fun animation to the surprise button
  surpriseButton.style.transform = 'rotate(360deg) scale(1.1)';
  setTimeout(() => {
    surpriseButton.style.transform = '';
  }, 500);
  
  // Refresh suggestions to show new ones
  displaySuggestions();
  
  // Focus the input to show the new prompt
  promptInput.focus();
  promptInput.select();
}

async function createGifFromPngs(
  imageUrls,
  targetWidth = 1024,
  targetHeight = 1024,
) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }
  const gif = GIFEncoder();
  const currentSpeed = speedSettings[selectedSpeed] || speedSettings.normal;
  const delay = currentSpeed.delay;

  for (const url of imageUrls) {
    const img = new Image();
    img.src = url;
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.fillStyle = '#ffffff';
    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    const data = ctx.getImageData(0, 0, targetWidth, targetHeight).data;
    const format = 'rgb444';
    const palette = quantize(data, 256, {format});
    const index = applyPalette(data, palette, format);
    gif.writeFrame(index, targetWidth, targetHeight, {palette, delay});
  }

  gif.finish();
  const buffer = gif.bytesView();
  const blob = new Blob([buffer], {type: 'image/gif'});
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.src = url;
  return img;
}

function updateStatus(message, progress = 0) {
  if (statusDisplay) {
    statusDisplay.textContent = message;
  }
}

function switchTab(targetTab) {
  tabButtons.forEach((button) => {
    if (button.getAttribute('data-tab') === targetTab) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  tabContents.forEach((content) => {
    if (content.id === `${targetTab}-content`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
  if (targetTab === 'output' && resultContainer) {
    resultContainer.style.display = 'flex';
  }
}

function handleStylePreset(style) {
  selectedStyle = style;
  const presetButtons = document.querySelectorAll('.preset-btn');
  presetButtons.forEach(btn => {
    if (btn.getAttribute('data-style') === style) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function handleSpeedControl(speed) {
  selectedSpeed = speed;
  const speedButtons = document.querySelectorAll('.speed-btn');
  speedButtons.forEach(btn => {
    if (btn.getAttribute('data-speed') === speed) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update preview speed if playing
  if (isPreviewPlaying) {
    stopPreview();
    startPreview();
  }
}

function handleFrameCount(frameCount) {
  selectedFrameCount = parseInt(frameCount);
  const frameButtons = document.querySelectorAll('.frame-btn');
  frameButtons.forEach(btn => {
    if (btn.getAttribute('data-frames') === frameCount) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function handleColorTheme(colorTheme) {
  selectedColorTheme = colorTheme;
  const colorButtons = document.querySelectorAll('.color-btn');
  colorButtons.forEach(btn => {
    if (btn.getAttribute('data-color') === colorTheme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function handleSizeControl(size) {
  selectedSize = parseInt(size);
  const sizeButtons = document.querySelectorAll('.size-btn');
  sizeButtons.forEach(btn => {
    if (btn.getAttribute('data-size') === size) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

async function run(value) {
  if (API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    updateStatus('Please set your Gemini API key in index.js');
    return false;
  }

  // Store current prompt for sharing
  currentPrompt = value;

  // Add to recent prompts when generation starts
  addToRecentPrompts(value);

  // Show progress and preview
  showProgress();
  showPreview();

  if (framesContainer) framesContainer.textContent = '';
  if (resultContainer) resultContainer.textContent = '';
  resultContainer?.classList.remove('appear');
  hideShare();
  switchTab('frames');
  if (resultContainer) resultContainer.style.display = 'none';

  updateStatus(`Generating ${selectedFrameCount} ${selectedColorTheme} ${selectedSize}px frames...`);
  if (generateButton) {
    generateButton.disabled = true;
    generateButton.classList.add('loading');
  }

  try {
    // Stage 1: Processing prompt
    setProgressStage('prompt');
    updateProgress(0, 0, selectedFrameCount);

    const expandPromptResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: value,
      config: {
        temperature: 1,
        systemInstruction: `**Generate simple, animated ${selectedStyle} GIFs on white from user input, prioritizing key visual identifiers in an animated ${selectedStyle} style with ethical considerations.**
**Core GIF:** ${selectedStyle}/cartoonish (simple lines, stylized forms, no photorealism), subtle looping motion (primary subject(s) only: wiggle, shimmer, etc.), white background, lighthearted/positive tone (playful, avoids trivializing serious subjects), uses specified colors (unless monochrome/outline requested).
**Input Analysis:** Identify subject (type, specificity), prioritize visual attributes (hair C/T, skin tone neutrally if discernible/needed, clothes C/P, accessories C, facial hair type, other distinct features neutrally for people; breed, fur C/P for animals; key parts, colors for objects), extract text (content, style hints described, display as requested: speech bubble [format: 'Speech bubble says "[Text]" is persistent.'], caption/title [format: 'with the [title/caption] "[Text]" [position]'], or text-as-subject [format: 'the word "[Text]" in [style/color description]']), note style modifiers (e.g., "pencil sketch," "monochrome"), and action (usually "subtle motion"). If the subject or description is too vague, add specific characteristics to make it more unique and detailed.
**Prompt Template:** "[Style Descriptor(s)] [Subject Description with Specificity, Attributes, Colors, Skin Tone if applicable] [Text Component if applicable and NOT speech bubble]. [Speech Bubble Component if applicable]"
**Template Notes:** '[Style Descriptor(s)]' includes "${selectedStyle}" or "${selectedStyle} style" (especially for people) plus any user-requested modifiers. '[Subject Description...]' combines all relevant subject and attribute details. '[Text Component...]' is for captions, titles, or text-as-subject only. '[Speech Bubble Component...]' is for speech bubbles only (mutually exclusive with Text Component).
**Key Constraints:** No racial labels. Neutral skin tone descriptors when included. ${selectedStyle}/cartoonish style always implied, especially for people. One text display method only.`,
      },
    });

    // Stage 2: Generating frames
    setProgressStage('frames');
    
    const colorDescription = colorThemeDescriptions[selectedColorTheme] || colorThemeDescriptions.vibrant;
    const prompt = `A ${selectedStyle} animation on a white background of ${expandPromptResponse.text}. Subtle motion but nothing else moves. Use ${colorDescription}.`;
    const style = styleDescriptions[selectedStyle] || styleDescriptions.doodle;

    const response = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: `Generate exactly ${selectedFrameCount} square, white-background ${selectedStyle} animation frames with smooth, fluid motion depicting ${prompt}.

*Mandatory Requirements (Compacted):**

**Style:** ${style}.
**Colors:** ${colorDescription}.
**Size:** ${selectedSize}x${selectedSize} pixels.
**Background:** Plain solid white (no background colors/elements). Absolutely no black background.
**Content & Motion:** Clearly depict **{{prompt}}** action with colored, moving subject (no static images). If there's an action specified, it should be the main difference between frames.
**Frame Count:** Exactly ${selectedFrameCount} frames showing continuous progression.
**Format:** Square image (1:1 aspect ratio) at ${selectedSize}px resolution.
**Cropping:** Absolutely no black bars/letterboxing; colorful ${selectedStyle} fully visible against white.
**Output:** Actual image files for a smooth, colorful ${selectedStyle}-style GIF on a white background. Make sure every frame is different enough from the previous one.`,
      config: {
        temperature: 1,
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    const images = [];
    let frameCount = 0;

    for await (const chunk of response) {
      if (chunk.candidates && chunk.candidates[0].content?.parts) {
        for (const part of chunk.candidates[0].content.parts) {
          if (part.inlineData && framesContainer) {
            frameCount++;
            
            // Update progress
            updateProgress(frameCount, selectedFrameCount, selectedFrameCount);
            updateStatus(`Generated frame ${frameCount}/${selectedFrameCount}`);

            // Create a frame element for our UI
            const frameElement = document.createElement('div');
            frameElement.className = 'frame';

            // Create and add the frame number
            const frameNumber = document.createElement('div');
            frameNumber.className = 'frame-number';
            frameNumber.textContent = frameCount.toString();
            frameElement.appendChild(frameNumber);

            // Create the image as in the original
            const src = `data:image/png;base64,${part.inlineData.data}`;
            const img = document.createElement('img');
            img.width = selectedSize;
            img.height = selectedSize;
            img.src = src;

            // Add it to our frame element
            frameElement.appendChild(img);
            framesContainer.appendChild(frameElement);

            // Store URL for GIF creation
            images.push(src);

            // Add frame to preview
            addFrameToPreview(src);

            // Animate the frame appearance
            setTimeout(() => {
              frameElement.classList.add('appear');
            }, 50);
          }
        }
      }
    }

    if (frameCount < 2) {
      updateStatus('Failed to generate any frames. Try another prompt.');
      hideProgress();
      hidePreview();
      return false;
    }

    // Stage 3: Creating GIF
    setProgressStage('gif');
    updateProgress(selectedFrameCount, selectedFrameCount, selectedFrameCount);
    updateStatus('Creating GIF...');

    // Create the GIF with the selected size
    const img = await createGifFromPngs(images, selectedSize, selectedSize);
    img.className = 'result-image';
    
    // Store GIF URL for sharing
    currentGifUrl = img.src;

    // Clear and add to result container
    if (resultContainer) {
      resultContainer.appendChild(img);

      // Add download button
      const downloadButton = document.createElement('button');
      downloadButton.className = 'download-button';
      const icon = document.createElement('i');
      icon.className = 'fas fa-download';
      downloadButton.appendChild(icon);
      downloadButton.onclick = () => {
        const a = document.createElement('a');
        a.href = img.src;
        a.download = `magical-${selectedStyle}-${selectedSpeed}-${selectedFrameCount}f-${selectedColorTheme}-${selectedSize}px-animation.gif`;
        a.click();
      };
      resultContainer.appendChild(downloadButton);

      switchTab('output');
      setTimeout(() => {
        resultContainer.classList.add('appear');
        showShare();
        generationContainer.scrollIntoView({behavior: 'smooth'});
      }, 50);
    }

    // Complete
    setProgressStage('complete');
    updateStatus(`Done! Created ${selectedFrameCount}-frame ${selectedSpeed} ${selectedColorTheme} ${selectedStyle} animation at ${selectedSize}px.`);
    
    // Hide progress after a delay
    setTimeout(() => {
      hideProgress();
    }, 3000);

  } catch (error) {
    const msg = parseError(error);
    console.error('Error generating animation:', error);
    updateStatus(`Error generating animation: ${msg}`);
    hideProgress();
    hidePreview();
    return false;
  } finally {
    if (generateButton) {
      generateButton.disabled = false;
      generateButton.classList.remove('loading');
    }
  }
  return true;
}

// Initialize the app
function main() {
  // Initialize recent prompts and suggestions
  loadRecentPrompts();
  displayRecentPrompts();
  displaySuggestions();

  if (generateButton) {
    generateButton.addEventListener('click', async () => {
      if (promptInput) {
        const value = promptInput.value.trim();
        if (value) {
          const retries = 3;
          for (let i = 0; i < retries; i++) {
            if (await run(value)) {
              console.log('Done.');
              return;
            } else {
              console.log(`Retrying...`);
            }
          }
          console.log('Giving up :(');
        }
      }
    });
  }

  if (promptInput) {
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        generateButton?.click();
      }
    });
    promptInput.addEventListener('focus', (e) => {
      promptInput.select();
      e.preventDefault();
    });
  }

  // Surprise button handler
  if (surpriseButton) {
    surpriseButton.addEventListener('click', surpriseMe);
  }

  // Clear history button handler
  if (clearHistoryButton) {
    clearHistoryButton.addEventListener('click', clearRecentPrompts);
  }

  // Preview control handlers
  if (previewPlayBtn) {
    previewPlayBtn.addEventListener('click', startPreview);
  }

  if (previewPauseBtn) {
    previewPauseBtn.addEventListener('click', stopPreview);
  }

  // Share button handlers
  if (shareX) {
    shareX.addEventListener('click', () => {
      const text = generateShareText();
      const url = generateShareUrl();
      const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(xUrl, '_blank');
    });
  }

  if (shareFacebook) {
    shareFacebook.addEventListener('click', () => {
      const url = generateShareUrl();
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      window.open(facebookUrl, '_blank');
    });
  }

  if (shareReddit) {
    shareReddit.addEventListener('click', () => {
      const text = generateShareText();
      const url = generateShareUrl();
      const redditUrl = `https://reddit.com/submit?title=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(redditUrl, '_blank');
    });
  }

  if (shareDiscord) {
    shareDiscord.addEventListener('click', async () => {
      const text = `${generateShareText()}\n${generateShareUrl()}`;
      const success = await copyToClipboard(text);
      if (success) {
        showCopyFeedback(shareDiscord);
        // You could also show a message about opening Discord
      }
    });
  }

  if (copyLink) {
    copyLink.addEventListener('click', async () => {
      const url = generateShareUrl();
      const success = await copyToClipboard(url);
      if (success) {
        showCopyFeedback(copyLink);
      }
    });
  }

  if (downloadGif) {
    downloadGif.addEventListener('click', () => {
      if (currentGifUrl) {
        const a = document.createElement('a');
        a.href = currentGifUrl;
        a.download = `magical-${selectedStyle}-${selectedSpeed}-${selectedFrameCount}f-${selectedColorTheme}-${selectedSize}px-animation.gif`;
        a.click();
      }
    });
  }

  // Style preset handlers
  const presetButtons = document.querySelectorAll('.preset-btn');
  presetButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const style = button.getAttribute('data-style');
      if (style) {
        handleStylePreset(style);
      }
    });
  });

  // Speed control handlers
  const speedButtons = document.querySelectorAll('.speed-btn');
  speedButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const speed = button.getAttribute('data-speed');
      if (speed) {
        handleSpeedControl(speed);
      }
    });
  });

  // Frame count handlers
  const frameButtons = document.querySelectorAll('.frame-btn');
  frameButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const frames = button.getAttribute('data-frames');
      if (frames) {
        handleFrameCount(frames);
      }
    });
  });

  // Color theme handlers
  const colorButtons = document.querySelectorAll('.color-btn');
  colorButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const color = button.getAttribute('data-color');
      if (color) {
        handleColorTheme(color);
      }
    });
  });

  // Size control handlers
  const sizeButtons = document.querySelectorAll('.size-btn');
  sizeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const size = button.getAttribute('data-size');
      if (size) {
        handleSizeControl(size);
      }
    });
  });

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      if (targetTab) switchTab(targetTab);
    });
  });

  switchTab('frames');
}

main();