// Skin type definitions
export interface Skin {
  id: number;
  name: string;
  category: SkinCategory;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  pattern?: SkinPattern;
  emoji?: string; // Optional emoji to display on the cube
  price?: number; // Custom price in coins (default: 200)
}

export type SkinCategory = 
  | 'default'
  | 'flags'
  | 'games'
  | 'animals'
  | 'cars'
  | 'food'
  | 'space'
  | 'nature'
  | 'sports'
  | 'special';

export type SkinPattern = 
  | 'solid'
  | 'stripes-h'
  | 'stripes-v'
  | 'diagonal'
  | 'checkerboard'
  | 'gradient'
  | 'dots'
  | 'stars';

// 100 Creative Skins
export const SKINS: Skin[] = [
  // DEFAULT (1-6)
  { id: 1, name: 'Original', category: 'default', colors: { primary: '#00ff88', secondary: '#00cc66', accent: '#009944', glow: '#00ff88' }, pattern: 'solid' },
  { id: 2, name: 'Classic Green', category: 'default', colors: { primary: '#00ff88', secondary: '#00cc66', accent: '#009944', glow: '#00ff88' }, pattern: 'solid', emoji: '🟩' },
  { id: 3, name: 'Neon Blue', category: 'default', colors: { primary: '#00aaff', secondary: '#0088cc', accent: '#006699', glow: '#00aaff' }, pattern: 'solid' },
  { id: 4, name: 'Hot Pink', category: 'default', colors: { primary: '#ff00aa', secondary: '#cc0088', accent: '#990066', glow: '#ff00aa' }, pattern: 'solid' },
  { id: 5, name: 'Electric Purple', category: 'default', colors: { primary: '#aa00ff', secondary: '#8800cc', accent: '#660099', glow: '#aa00ff' }, pattern: 'solid' },
  { id: 6, name: 'Sunset Orange', category: 'default', colors: { primary: '#ff6600', secondary: '#cc5500', accent: '#994400', glow: '#ff6600' }, pattern: 'solid' },
  
  // FLAGS (7-27)
  { id: 7, name: 'USA', category: 'flags', colors: { primary: '#bf0a30', secondary: '#002868', accent: '#ffffff', glow: '#bf0a30' }, pattern: 'stripes-h', emoji: '🇺🇸' },
  { id: 8, name: 'UK', category: 'flags', colors: { primary: '#012169', secondary: '#c8102e', accent: '#ffffff', glow: '#c8102e' }, pattern: 'diagonal', emoji: '🇬🇧' },
  { id: 9, name: 'France', category: 'flags', colors: { primary: '#0055a4', secondary: '#ffffff', accent: '#ef4135', glow: '#0055a4' }, pattern: 'stripes-v', emoji: '🇫🇷' },
  { id: 10, name: 'Germany', category: 'flags', colors: { primary: '#000000', secondary: '#dd0000', accent: '#ffcc00', glow: '#ffcc00' }, pattern: 'stripes-h', emoji: '🇩🇪' },
  { id: 11, name: 'Italy', category: 'flags', colors: { primary: '#009246', secondary: '#ffffff', accent: '#ce2b37', glow: '#009246' }, pattern: 'stripes-v', emoji: '🇮🇹' },
  { id: 12, name: 'Spain', category: 'flags', colors: { primary: '#aa151b', secondary: '#f1bf00', accent: '#aa151b', glow: '#f1bf00' }, pattern: 'stripes-h', emoji: '🇪🇸' },
  { id: 13, name: 'Brazil', category: 'flags', colors: { primary: '#009c3b', secondary: '#ffdf00', accent: '#002776', glow: '#009c3b' }, pattern: 'diagonal', emoji: '🇧🇷' },
  { id: 14, name: 'Japan', category: 'flags', colors: { primary: '#ffffff', secondary: '#bc002d', accent: '#bc002d', glow: '#bc002d' }, pattern: 'dots', emoji: '🇯🇵' },
  { id: 15, name: 'Canada', category: 'flags', colors: { primary: '#ff0000', secondary: '#ffffff', accent: '#ff0000', glow: '#ff0000' }, pattern: 'stripes-v', emoji: '🇨🇦' },
  { id: 16, name: 'Australia', category: 'flags', colors: { primary: '#00008b', secondary: '#ffffff', accent: '#ff0000', glow: '#00008b' }, pattern: 'stars', emoji: '🇦🇺' },
  { id: 17, name: 'Mexico', category: 'flags', colors: { primary: '#006847', secondary: '#ffffff', accent: '#ce1126', glow: '#006847' }, pattern: 'stripes-v', emoji: '🇲🇽' },
  { id: 18, name: 'Argentina', category: 'flags', colors: { primary: '#74acdf', secondary: '#ffffff', accent: '#f6b40e', glow: '#74acdf' }, pattern: 'stripes-h', emoji: '🇦🇷' },
  { id: 19, name: 'South Korea', category: 'flags', colors: { primary: '#ffffff', secondary: '#c60c30', accent: '#003478', glow: '#c60c30' }, pattern: 'diagonal', emoji: '🇰🇷' },
  { id: 20, name: 'Netherlands', category: 'flags', colors: { primary: '#ae1c28', secondary: '#ffffff', accent: '#21468b', glow: '#ae1c28' }, pattern: 'stripes-h', emoji: '🇳🇱' },
  { id: 21, name: 'Sweden', category: 'flags', colors: { primary: '#006aa7', secondary: '#fecc00', accent: '#fecc00', glow: '#fecc00' }, pattern: 'diagonal', emoji: '🇸🇪' },
  { id: 22, name: 'India', category: 'flags', colors: { primary: '#ff9933', secondary: '#ffffff', accent: '#138808', glow: '#ff9933' }, pattern: 'stripes-h', emoji: '🇮🇳' },
  { id: 23, name: 'China', category: 'flags', colors: { primary: '#de2910', secondary: '#ffde00', accent: '#de2910', glow: '#de2910' }, pattern: 'stars', emoji: '🇨🇳' },
  { id: 24, name: 'Russia', category: 'flags', colors: { primary: '#ffffff', secondary: '#0039a6', accent: '#d52b1e', glow: '#d52b1e' }, pattern: 'stripes-h', emoji: '🇷🇺' },
  { id: 25, name: 'Ukraine', category: 'flags', colors: { primary: '#005bbb', secondary: '#ffd500', accent: '#ffd500', glow: '#ffd500' }, pattern: 'stripes-h', emoji: '🇺🇦' },
  { id: 26, name: 'Ireland', category: 'flags', colors: { primary: '#169b62', secondary: '#ffffff', accent: '#ff883e', glow: '#169b62' }, pattern: 'stripes-v', emoji: '🇮🇪' },
  { id: 27, name: 'Israel', category: 'flags', colors: { primary: '#ffffff', secondary: '#0038b8', accent: '#0038b8', glow: '#0038b8' }, pattern: 'stripes-h', emoji: '🇮🇱' },
  
  // GAMES (28-47)
  { id: 28, name: 'Minecraft Grass', category: 'games', colors: { primary: '#567d46', secondary: '#8b5a2b', accent: '#3d5c2f', glow: '#567d46' }, pattern: 'stripes-h', emoji: '⛏️' },
  { id: 29, name: 'Minecraft Diamond', category: 'games', colors: { primary: '#4aedd9', secondary: '#2cb9a8', accent: '#1d8f82', glow: '#4aedd9' }, pattern: 'solid', emoji: '💎' },
  { id: 30, name: 'Minecraft Lava', category: 'games', colors: { primary: '#ff4500', secondary: '#ff6600', accent: '#cc3300', glow: '#ff4500' }, pattern: 'gradient', emoji: '🔥' },
  { id: 31, name: 'Minecraft Creeper', category: 'games', colors: { primary: '#4caf50', secondary: '#2e7d32', accent: '#1b5e20', glow: '#4caf50' }, pattern: 'solid', emoji: '💣' },
  { id: 32, name: 'Roblox Classic', category: 'games', colors: { primary: '#ff0000', secondary: '#cc0000', accent: '#990000', glow: '#ff0000' }, pattern: 'solid', emoji: '🎮' },
  { id: 33, name: 'Roblox Noob', category: 'games', colors: { primary: '#f3d250', secondary: '#00a2ff', accent: '#00a2ff', glow: '#f3d250' }, pattern: 'stripes-h', emoji: '😊' },
  { id: 34, name: 'Among Us Red', category: 'games', colors: { primary: '#c51111', secondary: '#7a0a0a', accent: '#ffffff', glow: '#c51111' }, pattern: 'solid', emoji: '📮' },
  { id: 35, name: 'Among Us Blue', category: 'games', colors: { primary: '#132ed1', secondary: '#0a1a7a', accent: '#ffffff', glow: '#132ed1' }, pattern: 'solid', emoji: '📮' },
  { id: 36, name: 'Among Us Green', category: 'games', colors: { primary: '#117f2d', secondary: '#0a4d1a', accent: '#ffffff', glow: '#117f2d' }, pattern: 'solid', emoji: '📮' },
  { id: 37, name: 'Among Us Yellow', category: 'games', colors: { primary: '#f5f557', secondary: '#c4c421', accent: '#ffffff', glow: '#f5f557' }, pattern: 'solid', emoji: '📮' },
  { id: 38, name: 'Pac-Man', category: 'games', colors: { primary: '#ffff00', secondary: '#ffcc00', accent: '#ff9900', glow: '#ffff00' }, pattern: 'solid', emoji: '👾' },
  { id: 39, name: 'Ghost Blue', category: 'games', colors: { primary: '#00ffff', secondary: '#00cccc', accent: '#009999', glow: '#00ffff' }, pattern: 'solid', emoji: '👻' },
  { id: 40, name: 'Mario Red', category: 'games', colors: { primary: '#e60012', secondary: '#0058a0', accent: '#ffffff', glow: '#e60012' }, pattern: 'solid', emoji: '🍄' },
  { id: 41, name: 'Luigi Green', category: 'games', colors: { primary: '#00a651', secondary: '#0058a0', accent: '#ffffff', glow: '#00a651' }, pattern: 'solid', emoji: '🍄' },
  { id: 42, name: 'Sonic Blue', category: 'games', colors: { primary: '#0066cc', secondary: '#ffcc00', accent: '#ffffff', glow: '#0066cc' }, pattern: 'solid', emoji: '⚡' },
  { id: 43, name: 'Pikachu', category: 'games', colors: { primary: '#f5da2d', secondary: '#3b3939', accent: '#ed1c24', glow: '#f5da2d' }, pattern: 'solid', emoji: '⚡' },
  { id: 44, name: 'Pokeball', category: 'games', colors: { primary: '#ee1515', secondary: '#ffffff', accent: '#222224', glow: '#ee1515' }, pattern: 'stripes-h', emoji: '⚪' },
  { id: 45, name: 'Tetris Blue', category: 'games', colors: { primary: '#1e90ff', secondary: '#0066cc', accent: '#003399', glow: '#1e90ff' }, pattern: 'solid', emoji: '🟦' },
  { id: 46, name: 'Tetris Orange', category: 'games', colors: { primary: '#ff8c00', secondary: '#cc7000', accent: '#995400', glow: '#ff8c00' }, pattern: 'solid', emoji: '🟧' },
  { id: 47, name: 'Fortnite Purple', category: 'games', colors: { primary: '#9d4dbb', secondary: '#7030a0', accent: '#4a1f6e', glow: '#9d4dbb' }, pattern: 'gradient', emoji: '🎯' },
  
  // ANIMALS (48-67)
  { id: 48, name: 'Goldfish', category: 'animals', colors: { primary: '#ff9900', secondary: '#ff6600', accent: '#ffcc00', glow: '#ff9900' }, pattern: 'gradient', emoji: '🐟' },
  { id: 49, name: 'Blue Fish', category: 'animals', colors: { primary: '#1e90ff', secondary: '#4169e1', accent: '#87ceeb', glow: '#1e90ff' }, pattern: 'gradient', emoji: '🐠' },
  { id: 50, name: 'Shark', category: 'animals', colors: { primary: '#708090', secondary: '#2f4f4f', accent: '#ffffff', glow: '#708090' }, pattern: 'solid', emoji: '🦈' },
  { id: 51, name: 'Clownfish', category: 'animals', colors: { primary: '#ff6600', secondary: '#ffffff', accent: '#000000', glow: '#ff6600' }, pattern: 'stripes-v', emoji: '🐟' },
  { id: 52, name: 'Frog', category: 'animals', colors: { primary: '#32cd32', secondary: '#228b22', accent: '#ffff00', glow: '#32cd32' }, pattern: 'solid', emoji: '🐸' },
  { id: 53, name: 'Panda', category: 'animals', colors: { primary: '#ffffff', secondary: '#000000', accent: '#000000', glow: '#ffffff' }, pattern: 'dots', emoji: '🐼' },
  { id: 54, name: 'Tiger', category: 'animals', colors: { primary: '#ff8c00', secondary: '#000000', accent: '#ffffff', glow: '#ff8c00' }, pattern: 'stripes-v', emoji: '🐯' },
  { id: 55, name: 'Zebra', category: 'animals', colors: { primary: '#ffffff', secondary: '#000000', accent: '#000000', glow: '#ffffff' }, pattern: 'stripes-v', emoji: '🦓' },
  { id: 56, name: 'Cow', category: 'animals', colors: { primary: '#ffffff', secondary: '#000000', accent: '#ffc0cb', glow: '#ffffff' }, pattern: 'dots', emoji: '🐄' },
  { id: 57, name: 'Bee', category: 'animals', colors: { primary: '#ffd700', secondary: '#000000', accent: '#ffd700', glow: '#ffd700' }, pattern: 'stripes-h', emoji: '🐝' },
  { id: 58, name: 'Ladybug', category: 'animals', colors: { primary: '#ff0000', secondary: '#000000', accent: '#000000', glow: '#ff0000' }, pattern: 'dots', emoji: '🐞' },
  { id: 59, name: 'Flamingo', category: 'animals', colors: { primary: '#ff69b4', secondary: '#ff1493', accent: '#ffffff', glow: '#ff69b4' }, pattern: 'solid', emoji: '🦩' },
  { id: 60, name: 'Penguin', category: 'animals', colors: { primary: '#000000', secondary: '#ffffff', accent: '#ff8c00', glow: '#ffffff' }, pattern: 'stripes-v', emoji: '🐧' },
  { id: 61, name: 'Fox', category: 'animals', colors: { primary: '#ff6600', secondary: '#ffffff', accent: '#000000', glow: '#ff6600' }, pattern: 'solid', emoji: '🦊' },
  { id: 62, name: 'Unicorn', category: 'animals', colors: { primary: '#ff99cc', secondary: '#99ccff', accent: '#ffff99', glow: '#ff99cc' }, pattern: 'gradient', emoji: '🦄' },
  { id: 63, name: 'Dragon', category: 'animals', colors: { primary: '#8b0000', secondary: '#ff4500', accent: '#ffd700', glow: '#ff4500' }, pattern: 'gradient', emoji: '🐉' },
  { id: 64, name: 'Butterfly', category: 'animals', colors: { primary: '#ff00ff', secondary: '#00ffff', accent: '#ffff00', glow: '#ff00ff' }, pattern: 'gradient', emoji: '🦋' },
  { id: 65, name: 'Cat Orange', category: 'animals', colors: { primary: '#ff8c00', secondary: '#ffa500', accent: '#ffffff', glow: '#ff8c00' }, pattern: 'stripes-h', emoji: '🐱' },
  { id: 66, name: 'Dog Brown', category: 'animals', colors: { primary: '#8b4513', secondary: '#d2691e', accent: '#000000', glow: '#8b4513' }, pattern: 'solid', emoji: '🐕' },
  { id: 67, name: 'Dolphin', category: 'animals', colors: { primary: '#4682b4', secondary: '#87ceeb', accent: '#ffffff', glow: '#4682b4' }, pattern: 'gradient', emoji: '🐬' },
  
  // CARS (68-82)
  { id: 68, name: 'Ferrari Red', category: 'cars', colors: { primary: '#ff2800', secondary: '#cc2000', accent: '#000000', glow: '#ff2800' }, pattern: 'solid', emoji: '🏎️' },
  { id: 69, name: 'Lamborghini Yellow', category: 'cars', colors: { primary: '#ffd700', secondary: '#ccac00', accent: '#000000', glow: '#ffd700' }, pattern: 'solid', emoji: '🏎️' },
  { id: 70, name: 'BMW Blue', category: 'cars', colors: { primary: '#0066b1', secondary: '#004d8c', accent: '#ffffff', glow: '#0066b1' }, pattern: 'solid', emoji: '🚗' },
  { id: 71, name: 'Mercedes Silver', category: 'cars', colors: { primary: '#c0c0c0', secondary: '#a0a0a0', accent: '#000000', glow: '#c0c0c0' }, pattern: 'gradient', emoji: '🚗' },
  { id: 72, name: 'Porsche White', category: 'cars', colors: { primary: '#ffffff', secondary: '#e0e0e0', accent: '#000000', glow: '#ffffff' }, pattern: 'solid', emoji: '🚗' },
  { id: 73, name: 'Mustang Blue', category: 'cars', colors: { primary: '#003399', secondary: '#ffffff', accent: '#cc0000', glow: '#003399' }, pattern: 'stripes-h', emoji: '🚙' },
  { id: 74, name: 'Camaro Yellow', category: 'cars', colors: { primary: '#ffc107', secondary: '#000000', accent: '#000000', glow: '#ffc107' }, pattern: 'stripes-h', emoji: '🚙' },
  { id: 75, name: 'Tesla White', category: 'cars', colors: { primary: '#ffffff', secondary: '#cc0000', accent: '#000000', glow: '#ffffff' }, pattern: 'solid', emoji: '⚡' },
  { id: 76, name: 'Jeep Green', category: 'cars', colors: { primary: '#556b2f', secondary: '#3d4d24', accent: '#000000', glow: '#556b2f' }, pattern: 'solid', emoji: '🚙' },
  { id: 77, name: 'Monster Truck', category: 'cars', colors: { primary: '#ff4500', secondary: '#8b0000', accent: '#000000', glow: '#ff4500' }, pattern: 'solid', emoji: '🚚' },
  { id: 78, name: 'Police Car', category: 'cars', colors: { primary: '#000080', secondary: '#ffffff', accent: '#ff0000', glow: '#0000ff' }, pattern: 'stripes-h', emoji: '🚔' },
  { id: 79, name: 'Fire Truck', category: 'cars', colors: { primary: '#ff0000', secondary: '#ffcc00', accent: '#ffffff', glow: '#ff0000' }, pattern: 'solid', emoji: '🚒' },
  { id: 80, name: 'Taxi Yellow', category: 'cars', colors: { primary: '#ffd700', secondary: '#000000', accent: '#ffffff', glow: '#ffd700' }, pattern: 'checkerboard', emoji: '🚕' },
  { id: 81, name: 'Racing Green', category: 'cars', colors: { primary: '#004225', secondary: '#006400', accent: '#ffffff', glow: '#00ff00' }, pattern: 'stripes-h', emoji: '🏁' },
  { id: 82, name: 'Pink Cadillac', category: 'cars', colors: { primary: '#ff69b4', secondary: '#ff1493', accent: '#ffffff', glow: '#ff69b4' }, pattern: 'solid', emoji: '🚗' },
  
  // FOOD (83-92)
  { id: 83, name: 'Watermelon', category: 'food', colors: { primary: '#ff6b6b', secondary: '#2d5a27', accent: '#000000', glow: '#ff6b6b' }, pattern: 'stripes-h', emoji: '🍉' },
  { id: 84, name: 'Orange', category: 'food', colors: { primary: '#ffa500', secondary: '#ff8c00', accent: '#228b22', glow: '#ffa500' }, pattern: 'solid', emoji: '🍊' },
  { id: 85, name: 'Strawberry', category: 'food', colors: { primary: '#ff3366', secondary: '#cc2952', accent: '#00ff00', glow: '#ff3366' }, pattern: 'dots', emoji: '🍓' },
  { id: 86, name: 'Grape', category: 'food', colors: { primary: '#6b2d5c', secondary: '#8b3a62', accent: '#228b22', glow: '#6b2d5c' }, pattern: 'solid', emoji: '🍇' },
  { id: 87, name: 'Lemon', category: 'food', colors: { primary: '#fff44f', secondary: '#ffef00', accent: '#228b22', glow: '#fff44f' }, pattern: 'solid', emoji: '🍋' },
  { id: 88, name: 'Avocado', category: 'food', colors: { primary: '#568203', secondary: '#87a96b', accent: '#4a3c2a', glow: '#568203' }, pattern: 'solid', emoji: '🥑' },
  { id: 89, name: 'Pizza', category: 'food', colors: { primary: '#ffa500', secondary: '#ff6347', accent: '#8b4513', glow: '#ffa500' }, pattern: 'dots', emoji: '🍕' },
  { id: 90, name: 'Ice Cream', category: 'food', colors: { primary: '#ffe4e1', secondary: '#8b4513', accent: '#ff69b4', glow: '#ffe4e1' }, pattern: 'stripes-h', emoji: '🍦' },
  { id: 91, name: 'Donut', category: 'food', colors: { primary: '#ff69b4', secondary: '#8b4513', accent: '#ffffff', glow: '#ff69b4' }, pattern: 'dots', emoji: '🍩' },
  { id: 92, name: 'Sushi', category: 'food', colors: { primary: '#ffffff', secondary: '#ff6347', accent: '#000000', glow: '#ff6347' }, pattern: 'stripes-h', emoji: '🍣' },
  
  // SPACE & SPECIAL (93-102)
  { id: 93, name: 'Galaxy', category: 'space', colors: { primary: '#4b0082', secondary: '#9400d3', accent: '#00ffff', glow: '#9400d3' }, pattern: 'gradient', emoji: '🌌' },
  { id: 94, name: 'Nebula', category: 'space', colors: { primary: '#ff1493', secondary: '#4b0082', accent: '#00ffff', glow: '#ff1493' }, pattern: 'gradient', emoji: '✨' },
  { id: 95, name: 'Mars', category: 'space', colors: { primary: '#cd5c5c', secondary: '#8b0000', accent: '#d2691e', glow: '#cd5c5c' }, pattern: 'solid', emoji: '🔴' },
  { id: 96, name: 'Moon', category: 'space', colors: { primary: '#c0c0c0', secondary: '#808080', accent: '#ffffff', glow: '#ffffff' }, pattern: 'dots', emoji: '🌙' },
  { id: 97, name: 'Sun', category: 'space', colors: { primary: '#ffd700', secondary: '#ff8c00', accent: '#ff4500', glow: '#ffd700' }, pattern: 'gradient', emoji: '☀️' },
  { id: 98, name: 'Rainbow', category: 'special', colors: { primary: '#ff0000', secondary: '#00ff00', accent: '#0000ff', glow: '#ff00ff' }, pattern: 'gradient', emoji: '🌈', price: 500 },
  { id: 99, name: 'Disco', category: 'special', colors: { primary: '#ff00ff', secondary: '#00ffff', accent: '#ffff00', glow: '#ff00ff' }, pattern: 'checkerboard', emoji: '🪩' },
  { id: 100, name: 'Matrix', category: 'special', colors: { primary: '#00ff00', secondary: '#003300', accent: '#00ff00', glow: '#00ff00' }, pattern: 'stripes-v', emoji: '💻' },
  { id: 101, name: 'Void', category: 'special', colors: { primary: '#1a1a1a', secondary: '#000000', accent: '#4b0082', glow: '#4b0082' }, pattern: 'solid', emoji: '🕳️' },
  { id: 102, name: 'Diamond', category: 'special', colors: { primary: '#b9f2ff', secondary: '#87ceeb', accent: '#ffffff', glow: '#b9f2ff' }, pattern: 'gradient', emoji: '💎' },
];

// Get skin by ID
export const getSkinById = (id: number): Skin => {
  return SKINS.find(skin => skin.id === id) || SKINS[0];
};

// Get skins by category
export const getSkinsByCategory = (category: SkinCategory): Skin[] => {
  return SKINS.filter(skin => skin.category === category);
};

// Get all categories
export const SKIN_CATEGORIES: { id: SkinCategory; name: string; emoji: string }[] = [
  { id: 'default', name: 'Default', emoji: '🎨' },
  { id: 'flags', name: 'Flags', emoji: '🏳️' },
  { id: 'games', name: 'Games', emoji: '🎮' },
  { id: 'animals', name: 'Animals', emoji: '🐾' },
  { id: 'cars', name: 'Cars', emoji: '🚗' },
  { id: 'food', name: 'Food', emoji: '🍕' },
  { id: 'space', name: 'Space', emoji: '🚀' },
  { id: 'special', name: 'Special', emoji: '✨' },
];
