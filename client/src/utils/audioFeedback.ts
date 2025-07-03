// A simple utility for providing audio feedback in your F-16 interface

// Audio files for various actions
const audioFiles = {
  click: '/sounds/click.mp3', 
  hover: '/sounds/hover.mp3',
  alert: '/sounds/alert.mp3',
  confirm: '/sounds/confirm.mp3',
  error: '/sounds/error.mp3',
  boot: '/sounds/boot.mp3',
  scan: '/sounds/scan.mp3',
  menu: '/sounds/menu.mp3',
};

// Cache for loaded audio elements
const audioCache: { [key: string]: HTMLAudioElement } = {};

// Preload all sounds
export const preloadSounds = () => {
  Object.entries(audioFiles).forEach(([key, src]) => {
    const audio = new Audio(src);
    audio.volume = 0.5;
    audioCache[key] = audio;
  });
};

// Play specific sound
export const playSound = (
  sound: keyof typeof audioFiles, 
  options?: { volume?: number; loop?: boolean }
) => {
  const { volume = 0.5, loop = false } = options || {};
  
  // Check if sound disabled in settings
  const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
  if (!soundEnabled) return;
  
  try {
    let audio = audioCache[sound];
    
    // If not cached, create a new audio element
    if (!audio) {
      audio = new Audio(audioFiles[sound]);
      audioCache[sound] = audio;
    }
    
    // Reset audio if it's already playing
    audio.pause();
    audio.currentTime = 0;
    
    // Apply options
    audio.volume = volume;
    audio.loop = loop;
    
    // Play the sound
    audio.play().catch(err => console.error('Failed to play sound:', err));
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

// Stop a looping sound
export const stopSound = (sound: keyof typeof audioFiles) => {
  const audio = audioCache[sound];
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
};

// Apply audio feedback to elements 
export const applyAudioFeedback = () => {
  // Add click sound to buttons
  document.querySelectorAll('button, .nav-btn, .control-btn').forEach(el => {
    el.addEventListener('click', () => playSound('click'));
    el.addEventListener('mouseenter', () => playSound('hover', { volume: 0.2 }));
  });
  
  // Add menu sound to navigation links
  document.querySelectorAll('a, .menu-item').forEach(el => {
    el.addEventListener('click', () => playSound('menu'));
  });
};

export default {
  preloadSounds,
  playSound,
  stopSound,
  applyAudioFeedback
};