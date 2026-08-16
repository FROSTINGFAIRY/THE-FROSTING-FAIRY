import confetti from 'canvas-confetti';

/**
 * Subtle celebratory confetti animation styled for The Frosting Fairy bakery
 */
export function triggerOrderSuccessConfetti() {
  const brandColors = [
    '#e07a93', // signature blush pink
    '#f4a7bb', // soft rose
    '#e5b869', // bakery gold
    '#d8b4e2', // fairy lilac
    '#fbf4eb', // warm vanilla cream
    '#c26d83', // rose gold
    '#fcd34d', // warm honey
  ];

  // 1. Left cannon (gentle angle)
  confetti({
    particleCount: 45,
    angle: 60,
    spread: 55,
    origin: { x: 0.1, y: 0.7 },
    colors: brandColors,
    ticks: 240,
    gravity: 0.85,
    scalar: 0.95,
    shapes: ['circle', 'square'],
    disableForReducedMotion: true,
  });

  // 2. Right cannon (gentle angle)
  confetti({
    particleCount: 45,
    angle: 120,
    spread: 55,
    origin: { x: 0.9, y: 0.7 },
    colors: brandColors,
    ticks: 240,
    gravity: 0.85,
    scalar: 0.95,
    shapes: ['circle', 'square'],
    disableForReducedMotion: true,
  });

  // 3. Gentle top-center floating cascade after 200ms
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { x: 0.5, y: 0.3 },
      colors: brandColors,
      ticks: 260,
      gravity: 0.7,
      scalar: 0.9,
      drift: 0,
      shapes: ['circle', 'square'],
      disableForReducedMotion: true,
    });
  }, 220);
}
