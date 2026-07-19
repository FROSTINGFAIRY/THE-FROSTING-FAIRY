import { Recipe } from './types';

import imgCakeVanilla from './assets/images/classic_vanilla_cake_1784434668508.jpg';
import imgCakeChocolate from './assets/images/chocolate_cake_1784434686481.jpg';
import imgCakeStrawberry from './assets/images/strawberry_cake_1784434701070.jpg';
import imgCakePineapple from './assets/images/pineapple_swirl_cake_1784434715973.jpg';
import imgCakeButterscotch from './assets/images/butterscotch_cake_1784434731944.jpg';
import imgCakeCaramel from './assets/images/whipped_caramel_cake_1784434744053.jpg';
import imgCakeTruffle from './assets/images/choco_truffle_cake_1784434756904.jpg';
import imgCakeLemonCream from './assets/images/lemon_cream_cheese_cake_1784434770151.jpg';

import imgCupcakeVanilla from './assets/images/classic_vanilla_cupcakes_1784434789514.jpg';
import imgCupcakeStrawberry from './assets/images/strawberry_cupcakes_1784434803989.jpg';
import imgCupcakeLemon from './assets/images/lemon_cupcakes_1784434818689.jpg';
import imgCupcakeRedVelvet from './assets/images/red_velvet_cupcakes_1784434833154.jpg';
import imgCupcakeOreo from './assets/images/oreo_cupcakes_1784434847600.jpg';
import imgCupcakeNutella from './assets/images/choco_nutella_cupcakes_1784434862619.jpg';

import imgBrownieClassic from './assets/images/classic_brownie_1784434884868.jpg';
import imgBrownieOreo from './assets/images/oreo_brownie_1784434897494.jpg';
import imgBrownieNutella from './assets/images/nutella_brownie_1784434912033.jpg';
import imgBrownieKitkat from './assets/images/kitkat_brownie_1784434926370.jpg';
import imgBrownieTriple from './assets/images/triple_chocolate_brownie_1784434940621.jpg';
import imgBrownieBiscoff from './assets/images/biscoff_brownie_1784434954807.jpg';
import imgBrowniePistachio from './assets/images/pistachio_brownie_1784434968825.jpg';

import imgCookieChocoChip from './assets/images/classic_choco_chip_cookies_1784434986464.jpg';
import imgCookieDoubleChoco from './assets/images/double_chocolate_cookies_1784435001156.jpg';
import imgCookieDarkChunks from './assets/images/dark_chocolate_chunks_cookies_1784435017492.jpg';
import imgCookieMm from './assets/images/mm_cookies_1784435031411.jpg';
import imgCookieRedVelvet from './assets/images/red_velvet_white_choco_cookies_1784435046208.jpg';

import imgBomboloniVanilla from './assets/images/classic_vanilla_custard_bombolonies_1784435060933.jpg';
import imgBomboloniHazelnut from './assets/images/choco_hazelnut_bombolonies_1784435074139.jpg';
import imgBomboloniStrawberry from './assets/images/strawberry_burst_bombolonies_1784435088155.jpg';

import imgDonutGlazed from './assets/images/classic_glazed_donuts_1784435107615.jpg';

const makeSvgUrl = (svgContent: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;

const svgCaramelDonut = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="100%" height="100%" fill="#F7F5F0"/>
  <circle cx="100" cy="80" r="120" fill="#EBF1EB" opacity="0.6"/>
  <circle cx="320" cy="220" r="100" fill="#FCECEF" opacity="0.6"/>
  <ellipse cx="200" cy="210" rx="90" ry="25" fill="#E5D9C4" opacity="0.5"/>
  <path d="M200,80 A70,70 0 1,0 200,220 A70,70 0 1,0 200,80 M200,120 A30,30 0 1,1 200,180 A30,30 0 1,1 200,120" fill="#E8B878"/>
  <path d="M200,85 C240,85 265,110 265,150 C265,165 255,170 250,180 C240,200 220,215 200,215 C180,215 160,200 150,180 C145,170 135,165 135,150 C135,110 160,85 200,85 Z M200,125 A25,25 0 1,0 200,175 A25,25 0 1,0 200,125" fill="#C07A34"/>
  <path d="M160,110 Q180,100 200,110 T240,110" stroke="#FFF" stroke-width="3" fill="none" opacity="0.4" stroke-linecap="round"/>
  <circle cx="170" cy="115" r="3" fill="#FFF" opacity="0.6"/>
  <circle cx="230" cy="125" r="4" fill="#FFF" opacity="0.6"/>
  <text x="200" y="270" font-family="'Inter', sans-serif" font-weight="600" font-size="14" fill="#5C4738" text-anchor="middle">Caramel Glazed Donut</text>
  <text x="200" y="285" font-family="'Inter', sans-serif" font-size="10" fill="#8C7662" text-anchor="middle">Buttery Salted Caramel Glaze</text>
</svg>`;

const svgOreoDonut = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="100%" height="100%" fill="#F7F5F0"/>
  <circle cx="80" cy="220" r="100" fill="#EBF1EB" opacity="0.6"/>
  <circle cx="300" cy="70" r="110" fill="#FCECEF" opacity="0.6"/>
  <ellipse cx="200" cy="210" rx="90" ry="25" fill="#E5D9C4" opacity="0.5"/>
  <path d="M200,80 A70,70 0 1,0 200,220 A70,70 0 1,0 200,80 M200,120 A30,30 0 1,1 200,180 A30,30 0 1,1 200,120" fill="#E8B878"/>
  <path d="M200,85 C240,85 265,110 265,150 C265,165 255,170 250,180 C240,200 220,215 200,215 C180,215 160,200 150,180 C145,170 135,165 135,150 C135,110 160,85 200,85 Z M200,125 A25,25 0 1,0 200,175 A25,25 0 1,0 200,125" fill="#F9F6F0"/>
  <circle cx="155" cy="115" r="4" fill="#3D2B1F"/>
  <circle cx="165" cy="105" r="3" fill="#3D2B1F"/>
  <circle cx="230" cy="115" r="5" fill="#3D2B1F"/>
  <circle cx="240" cy="135" r="4" fill="#3D2B1F"/>
  <circle cx="145" cy="155" r="3" fill="#3D2B1F"/>
  <circle cx="155" cy="175" r="4" fill="#3D2B1F"/>
  <circle cx="225" cy="175" r="5" fill="#3D2B1F"/>
  <circle cx="180" cy="200" r="3" fill="#3D2B1F"/>
  <circle cx="210" cy="200" r="4" fill="#3D2B1F"/>
  <path d="M150,130 Q170,120 190,135 T240,125" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round"/>
  <text x="200" y="270" font-family="'Inter', sans-serif" font-weight="600" font-size="14" fill="#5C4738" text-anchor="middle">Cookies &amp; Cream Donut</text>
  <text x="200" y="285" font-family="'Inter', sans-serif" font-size="10" fill="#8C7662" text-anchor="middle">White Chocolate &amp; Oreo Crumbs</text>
</svg>`;

const svgSugarRoll = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="100%" height="100%" fill="#F7F5F0"/>
  <circle cx="310" cy="90" r="120" fill="#EBF1EB" opacity="0.6"/>
  <circle cx="90" cy="210" r="100" fill="#FCECEF" opacity="0.6"/>
  <ellipse cx="200" cy="215" rx="85" ry="22" fill="#E5D9C4" opacity="0.5"/>
  <path d="M200,70 C270,70 280,120 280,150 C280,210 250,220 200,220 C150,220 120,210 120,150 C120,120 130,70 200,70 Z" fill="#E5AC67"/>
  <path d="M200,85 Q250,85 255,125 T215,185 T155,165 T175,125 T200,135" stroke="#7A4F30" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M200,95 Q235,95 240,125 T205,170 T165,150 T185,125" stroke="#E5AC67" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M140,110 Q200,130 260,110" stroke="#FFF" stroke-width="5" fill="none" opacity="0.7" stroke-linecap="round"/>
  <path d="M130,150 Q200,170 270,140" stroke="#FFF" stroke-width="4" fill="none" opacity="0.7" stroke-linecap="round"/>
  <path d="M150,180 Q200,195 250,175" stroke="#FFF" stroke-width="6" fill="none" opacity="0.7" stroke-linecap="round"/>
  <text x="200" y="270" font-family="'Inter', sans-serif" font-weight="600" font-size="14" fill="#5C4738" text-anchor="middle">Classic Cinnamon Roll</text>
  <text x="200" y="285" font-family="'Inter', sans-serif" font-size="10" fill="#8C7662" text-anchor="middle">Cassia Cinnamon &amp; Sugar Glaze</text>
</svg>`;

const svgMilkRoll = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="100%" height="100%" fill="#F7F5F0"/>
  <circle cx="100" cy="90" r="110" fill="#EBF1EB" opacity="0.6"/>
  <circle cx="300" cy="210" r="110" fill="#FCECEF" opacity="0.6"/>
  <ellipse cx="200" cy="215" rx="85" ry="22" fill="#E5D9C4" opacity="0.5"/>
  <path d="M200,70 C270,70 280,120 280,150 C280,210 250,220 200,220 C150,220 120,210 120,150 C120,120 130,70 200,70 Z" fill="#E5AC67"/>
  <path d="M200,85 Q250,85 255,125 T215,185 T155,165 T175,125 T200,135" stroke="#7A4F30" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M140,100 C180,90 220,110 250,95 C265,115 270,140 260,165 C240,195 210,210 180,205 C150,200 135,170 135,140 C135,120 138,110 140,100 Z" fill="#F6F0DD" opacity="0.95"/>
  <path d="M175,125 T200,135" stroke="#7A4F30" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.3"/>
  <path d="M140,135 Q145,155 140,160 Q135,165 140,170" stroke="#F6F0DD" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M255,135 Q250,155 255,165" stroke="#F6F0DD" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M160,110 C180,105 210,115 230,110" stroke="#FFF" stroke-width="3" fill="none" stroke-linecap="round"/>
  <text x="200" y="270" font-family="'Inter', sans-serif" font-weight="600" font-size="14" fill="#5C4738" text-anchor="middle">Condensed Milk Cinnamon Roll</text>
  <text x="200" y="285" font-family="'Inter', sans-serif" font-size="10" fill="#8C7662" text-anchor="middle">Sweet Silk Condensed Milk Glaze</text>
</svg>`;

const svgCreamCheeseRoll = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="100%" height="100%" fill="#F7F5F0"/>
  <circle cx="200" cy="150" r="140" fill="#FCECEF" opacity="0.4"/>
  <circle cx="80" cy="80" r="90" fill="#EBF1EB" opacity="0.6"/>
  <ellipse cx="200" cy="215" rx="85" ry="22" fill="#E5D9C4" opacity="0.5"/>
  <path d="M200,70 C270,70 280,120 280,150 C280,210 250,220 200,220 C150,220 120,210 120,150 C120,120 130,70 200,70 Z" fill="#E5AC67"/>
  <path d="M200,85 Q250,85 255,125 T215,185 T155,165 T175,125 T200,135" stroke="#7A4F30" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M130,120 C130,90 270,90 270,120 C275,140 270,170 260,185 C240,205 160,205 140,185 C130,165 130,140 130,120 Z" fill="#FFFBF5"/>
  <path d="M150,120 Q200,105 250,120 Q230,150 200,140 T160,160" stroke="#EBE5D8" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M160,110 A40,30 0 0,1 240,110" stroke="#FFF" stroke-width="3" fill="none" stroke-linecap="round"/>
  <text x="200" y="270" font-family="'Inter', sans-serif" font-weight="600" font-size="14" fill="#5C4738" text-anchor="middle">Cream Cheese Cinnamon Roll</text>
  <text x="200" y="285" font-family="'Inter', sans-serif" font-size="10" fill="#8C7662" text-anchor="middle">Velvety Tangy Cream Cheese Frosting</text>
</svg>`;

export const INITIAL_RECIPES: Recipe[] = [
  // --- SIGNATURE CAKES (BY WEIGHT) ---
  {
    id: 'cake-vanilla',
    name: 'Classic Vanilla Cake',
    description: 'Freshly baked premium vanilla bean sponge, delicately layered with smooth whipped vanilla buttercream. Simple, elegant, and timeless.',
    image: imgCakeVanilla,
    prepTime: 20,
    cookTime: 35,
    difficulty: 'Easy',
    servings: 8,
    rating: 4.9,
    votes: 184,
    nutrients: { calories: 340, protein: '4g', carbs: '45g', fat: '16g' },
    tags: ['Vanilla', 'Fluffy', 'Classic', 'Signature'],
    category: 'Signature Cakes',
    priceOptions: [
      { label: '500g', price: 500 },
      { label: '1kg', price: 900 }
    ],
    details: [
      '100% Organic Vanilla Bean paste used',
      'Perfectly moist, layered with classic buttercream frosting',
      'Custom piping message available upon checkout'
    ],
    ingredients: [
      { name: 'Vanilla Sponge Flour', amount: 250, unit: 'g' },
      { name: 'Organic Butter', amount: 150, unit: 'g' },
      { name: 'Fine Caster Sugar', amount: 200, unit: 'g' },
      { name: 'Madagascar Vanilla Bean Paste', amount: 1, unit: 'tsp' },
      { name: 'Fresh Milk', amount: 120, unit: 'ml' }
    ],
    instructions: [
      { step: 1, text: 'Whisk room-temperature butter and caster sugar together until pale and highly aerated (about 4 minutes).', durationMs: 240000 },
      { step: 2, text: 'Add organic eggs one by one, folding in vanilla bean paste until completely integrated.', durationMs: 120000 },
      { step: 3, text: 'Bake layers at 170°C (340°F) for exactly 28-32 minutes until a cake tester comes out with light crumbs.', durationMs: 1800000 }
    ],
    isFavorite: false
  },
  {
    id: 'cake-chocolate',
    name: 'Chocolate Cake',
    description: 'Rich cocoa sponge paired with luxurious Belgian chocolate cream. A deep, heavenly experience for chocolate purists.',
    image: imgCakeChocolate,
    prepTime: 15,
    cookTime: 30,
    difficulty: 'Medium',
    servings: 8,
    rating: 4.8,
    votes: 215,
    nutrients: { calories: 420, protein: '5g', carbs: '48g', fat: '22g' },
    tags: ['Chocolate', 'Rich', 'Belgian Cocoa', 'Signature'],
    category: 'Signature Cakes',
    priceOptions: [
      { label: '500g', price: 550 },
      { label: '1kg', price: 950 }
    ],
    details: [
      'Crafted with premium Dutch-processed cocoa',
      'Layered with silky smooth Belgian chocolate frosting',
      'Best enjoyed at warm room temperature'
    ],
    ingredients: [
      { name: 'Dutch Cocoa Powder', amount: 80, unit: 'g' },
      { name: 'Belgian Chocolate Chips', amount: 150, unit: 'g' },
      { name: 'Baking Flour', amount: 200, unit: 'g' },
      { name: 'Brown Sugar', amount: 220, unit: 'g' },
      { name: 'Double Cream', amount: 100, unit: 'ml' }
    ],
    instructions: [
      { step: 1, text: 'Whisk dry ingredients including dark Dutch cocoa powder and brown sugar into a large bowl.', durationMs: 60000 },
      { step: 2, text: 'Melt Belgian chocolate with double cream on a gentle water bath (double boiler) to create the signature glaze.', durationMs: 300000 },
      { step: 3, text: 'Bake sponge layers in preheated oven at 180°C for 30 minutes. Let cool before applying chocolate cream.', durationMs: 1800000 }
    ],
    isFavorite: false
  },
  {
    id: 'cake-strawberry',
    name: 'Strawberry Cake',
    description: 'Fresh strawberry cream paired with light, moist sponge layers. Filled with real, house-simmered strawberry jam.',
    image: imgCakeStrawberry,
    prepTime: 20,
    cookTime: 28,
    difficulty: 'Medium',
    servings: 8,
    rating: 4.9,
    votes: 142,
    nutrients: { calories: 350, protein: '4g', carbs: '46g', fat: '15g' },
    tags: ['Fruity', 'Strawberry', 'Fresh Cream', 'Signature'],
    category: 'Signature Cakes',
    priceOptions: [
      { label: '500g', price: 600 },
      { label: '1kg', price: 1000 }
    ],
    details: [
      'Filled with hand-crushed fresh strawberry compote',
      'Whipped with premium real dairy fresh cream',
      'Dressed with beautiful strawberry slices on top'
    ],
    ingredients: [
      { name: 'Fresh Strawberries', amount: 200, unit: 'g' },
      { name: 'Cake Flour', amount: 220, unit: 'g' },
      { name: 'Heavy Whipping Cream', amount: 250, unit: 'ml' },
      { name: 'Pureed Strawberry Reduction', amount: 50, unit: 'ml' },
      { name: 'Unsalted Butter', amount: 110, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Simmer chopped strawberries with sugar to create a thick, glossy fruit compote.', durationMs: 480000 },
      { step: 2, text: 'Whip fresh heavy cream to stiff peaks, then fold in cold strawberry reduction.', durationMs: 180000 },
      { step: 3, text: 'Assemble cake by spreading strawberry compote and strawberry cream between moist layers.', durationMs: 300000 }
    ],
    isFavorite: false
  },
  {
    id: 'cake-pineapple',
    name: 'Pineapple Swirl Cake',
    description: 'A light, refreshing vanilla sponge cake layered with juicy pineapple pieces and delicate whipped pineapple fresh cream.',
    image: imgCakePineapple,
    prepTime: 15,
    cookTime: 30,
    difficulty: 'Medium',
    servings: 8,
    rating: 4.7,
    votes: 95,
    nutrients: { calories: 330, protein: '4g', carbs: '44g', fat: '14g' },
    tags: ['Pineapple', 'Tropical', 'Light', 'Signature'],
    category: 'Signature Cakes',
    priceOptions: [
      { label: '500g', price: 600 },
      { label: '1kg', price: 1000 }
    ],
    details: [
      'Garnished with juicy candied pineapple slices and cherries',
      'Light vanilla sponge infused with real pineapple nectar syrup',
      'A tropical favorite'
    ],
    ingredients: [
      { name: 'Pineapple Nectar Syrup', amount: 80, unit: 'ml' },
      { name: 'Peeled Pineapple Bits', amount: 150, unit: 'g' },
      { name: 'Whipping Cream', amount: 200, unit: 'ml' },
      { name: 'Sponge Mix', amount: 250, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Bake sponge layer. Once slightly cooled, soak with tropical pineapple syrup.', durationMs: 600000 },
      { step: 2, text: 'Spread chopped pineapple bits and whipped cream over the bottom sponge layer.', durationMs: 120000 },
      { step: 3, text: 'Frost the exterior with clean pineapple swirl cream patterns.', durationMs: 180000 }
    ],
    isFavorite: false
  },
  {
    id: 'cake-butterscotch',
    name: 'Butterscotch Cake',
    description: 'A luscious sponge cake infused with home-brewed butterscotch sauce and crunchy, handmade butterscotch praline caramel pieces.',
    image: imgCakeButterscotch,
    prepTime: 20,
    cookTime: 30,
    difficulty: 'Medium',
    servings: 8,
    rating: 4.9,
    votes: 167,
    nutrients: { calories: 410, protein: '4.5g', carbs: '52g', fat: '19g' },
    tags: ['Butterscotch', 'Caramel', 'Crunchy', 'Praline'],
    category: 'Signature Cakes',
    priceOptions: [
      { label: '500g', price: 650 },
      { label: '1kg', price: 1100 }
    ],
    details: [
      'Sprinkled with golden caramel cashew praline crunch',
      'Layered with real brown sugar butterscotch buttercream',
      'Satisfying rich caramel crunch texture'
    ],
    ingredients: [
      { name: 'Handmade Butterscotch Sauce', amount: 100, unit: 'ml' },
      { name: 'Cashew Praline Crunch', amount: 80, unit: 'g' },
      { name: 'Butterscotch Fudge Sponge', amount: 1, unit: 'pc' },
      { name: 'Unsalted Butter', amount: 150, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Caramelize sugar and toss in roasted cashews; cool and crush to make the praline crunch.', durationMs: 400000 },
      { step: 2, text: 'Whip butterscotch sauce into premium buttercream frosting.', durationMs: 180000 },
      { step: 3, text: 'Assemble with generous sprinkles of praline between sponge layers.', durationMs: 180000 }
    ],
    isFavorite: false
  },
  {
    id: 'cake-caramel',
    name: 'Whipped Caramel Cake',
    description: 'A light-as-air vanilla bean sponge cake smothered in silky, slow-cooked whipped caramel cream and topped with buttery caramel drizzles.',
    image: imgCakeCaramel,
    prepTime: 18,
    cookTime: 32,
    difficulty: 'Medium',
    servings: 8,
    rating: 4.8,
    votes: 112,
    nutrients: { calories: 390, protein: '4g', carbs: '50g', fat: '18g' },
    tags: ['Caramel', 'Creamy', 'Whipped', 'Drizzle'],
    category: 'Signature Cakes',
    priceOptions: [
      { label: '500g', price: 650 },
      { label: '1kg', price: 1100 }
    ],
    details: [
      'Gourmet caramel sauce prepared in small batches',
      'Whipped caramel cream for an incredibly light texture',
      'Finished with beautiful caramel drip details'
    ],
    ingredients: [
      { name: 'Brown Sugar Caramel Nectar', amount: 120, unit: 'ml' },
      { name: 'Vanilla Sponge Layers', amount: 2, unit: 'pcs' },
      { name: 'Fresh Heavy Cream', amount: 200, unit: 'ml' }
    ],
    instructions: [
      { step: 1, text: 'Cook brown sugar, cream, and butter until a thick, luxurious caramel drips off the spoon.', durationMs: 500000 },
      { step: 2, text: 'Fold cooled caramel syrup into whipped dairy cream to create the heavenly whipped caramel frosting.', durationMs: 120000 },
      { step: 3, text: 'Pipe neat borders on the cake layers, fill with caramel, and drip excess over the edges.', durationMs: 240000 }
    ],
    isFavorite: false
  },
  {
    id: 'cake-truffle',
    name: 'Choco Truffle Cake',
    description: 'An absolute masterpiece. Decadent chocolate cake loaded with dense chocolate ganache truffle layers and coated in dark chocolate glaze.',
    image: imgCakeTruffle,
    prepTime: 25,
    cookTime: 30,
    difficulty: 'Hard',
    servings: 10,
    rating: 4.9,
    votes: 324,
    nutrients: { calories: 480, protein: '6g', carbs: '44g', fat: '28g' },
    tags: ['Chocolate', 'Truffle', 'Ganache', 'Overload'],
    category: 'Signature Cakes',
    priceOptions: [
      { label: '500g', price: 650 },
      { label: '1kg', price: 1100 }
    ],
    details: [
      'Thick, velvety dark chocolate ganache (55% cocoa)',
      'Rich chocolate glaze for a stunning glossy finish',
      'Adorned with dark chocolate curls'
    ],
    ingredients: [
      { name: 'Premium Dark Chocolate Couverture', amount: 250, unit: 'g' },
      { name: 'Heavy Ganache Cream', amount: 200, unit: 'ml' },
      { name: 'Cocoa Cake Base', amount: 1, unit: 'pc' },
      { name: 'Pure Butter', amount: 50, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Heat heavy cream and pour directly over dark chocolate couverture. Let sit for 1 minute, then stir until shiny and thick.', durationMs: 300000 },
      { step: 2, text: 'Slice deep cocoa cake base into three thin, even layers.', durationMs: 120000 },
      { step: 3, text: 'Layer each tier with smooth chocolate ganache, chill, and coat with chocolate glaze.', durationMs: 600000 }
    ],
    isFavorite: false
  },
  {
    id: 'cake-lemon-cream',
    name: 'Lemon Cream Cheese Cake',
    description: 'Bright, zesty lemon-infused sponge cake perfectly matched with a velvety, tangy cream cheese frosting. A refreshing, premium balance of sweet and tart.',
    image: imgCakeLemonCream,
    prepTime: 20,
    cookTime: 35,
    difficulty: 'Hard',
    servings: 8,
    rating: 4.9,
    votes: 156,
    nutrients: { calories: 370, protein: '5g', carbs: '49g', fat: '18g' },
    tags: ['Lemon', 'Cream Cheese', 'Zesty', 'Premium'],
    category: 'Signature Cakes',
    priceOptions: [
      { label: '500g', price: 700 },
      { label: '1kg', price: 1300 }
    ],
    details: [
      'Infused with fresh organic lemon zest and juice',
      'Smoother cream cheese frosting with a hints of vanilla bean',
      'Light, premium, and sophisticated cake choice'
    ],
    ingredients: [
      { name: 'Organic Cream Cheese', amount: 200, unit: 'g' },
      { name: 'Fresh Lemons (Zested)', amount: 2, unit: 'pcs' },
      { name: 'All-Purpose Flour', amount: 220, unit: 'g' },
      { name: 'Unsalted Butter', amount: 120, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Whisk lemon zest, juice, and sugar with butter. Sift in flour to form a beautifully aromatic batter.', durationMs: 240000 },
      { step: 2, text: 'Whip chilled organic cream cheese and soft butter with icing sugar until fluffy.', durationMs: 180000 },
      { step: 3, text: 'Spread cream cheese frosting generously between and around the cooled lemon layers.', durationMs: 180000 }
    ],
    isFavorite: false
  },

  // --- CUPCAKES (BOX OF 6) ---
  {
    id: 'cupcake-vanilla',
    name: 'Classic Vanilla Cupcakes',
    description: 'Super soft, fluffy vanilla cupcakes decorated with a swirl of rich Madagascar vanilla bean buttercream. Classic indulgence.',
    image: imgCupcakeVanilla,
    prepTime: 15,
    cookTime: 18,
    difficulty: 'Easy',
    servings: 6,
    rating: 4.8,
    votes: 92,
    nutrients: { calories: 280, protein: '3g', carbs: '36g', fat: '12g' },
    tags: ['Vanilla', 'Fluffy', 'Cupcake', 'Party'],
    category: 'Cupcakes',
    priceOptions: [
      { label: 'Box of 6', price: 350 }
    ],
    details: [
      'Baked in small, fresh batches',
      'Topped with Madagascar vanilla bean buttercream',
      'Includes beautiful pearlescent sugar sprinkles'
    ],
    ingredients: [
      { name: 'Cake Flour', amount: 150, unit: 'g' },
      { name: 'Vanilla Buttercream', amount: 150, unit: 'g' },
      { name: 'Sprinkles', amount: 10, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Whisk cupcake batter and divide evenly among 6 pastel liners.', durationMs: 180000 },
      { step: 2, text: 'Bake at 175°C for exactly 16-18 minutes until golden.', durationMs: 1080000 },
      { step: 3, text: 'Cool cupcakes, then pipe elegant vanilla bean buttercream peaks.', durationMs: 120000 }
    ],
    isFavorite: false
  },
  {
    id: 'cupcake-strawberry',
    name: 'Strawberry Cupcakes',
    description: 'Lovely pink cupcakes made with real strawberry reduction, capped with a delicious swirl of fresh strawberry cream.',
    image: imgCupcakeStrawberry,
    prepTime: 15,
    cookTime: 20,
    difficulty: 'Easy',
    servings: 6,
    rating: 4.9,
    votes: 81,
    nutrients: { calories: 290, protein: '3g', carbs: '38g', fat: '13g' },
    tags: ['Strawberry', 'Fruity', 'Pink', 'Cupcake'],
    category: 'Cupcakes',
    priceOptions: [
      { label: 'Box of 6', price: 350 }
    ],
    details: [
      'Strawberry reduction mixed directly into the batter',
      'Frosted with natural, strawberry-infused buttercream',
      'No artificial flavorings'
    ],
    ingredients: [
      { name: 'Real Strawberry Puree', amount: 60, unit: 'ml' },
      { name: 'Buttercream base', amount: 120, unit: 'g' },
      { name: 'Egg whites', amount: 2, unit: 'pcs' }
    ],
    instructions: [
      { step: 1, text: 'Fold strawberry pureed reduction into the vanilla cupcake base.', durationMs: 120000 },
      { step: 2, text: 'Bake cupcakes and let cool completely to prevent frosting melt.', durationMs: 1200000 },
      { step: 3, text: 'Pipe strawberry buttercream on top; garnish with dried strawberry powder.', durationMs: 120000 }
    ],
    isFavorite: false
  },
  {
    id: 'cupcake-lemon',
    name: 'Lemon Cupcakes',
    description: 'Bright citrus cupcakes stuffed with a secret center of rich, tangy housemade lemon curd and topped with lemon zest cream.',
    image: imgCupcakeLemon,
    prepTime: 20,
    cookTime: 18,
    difficulty: 'Medium',
    servings: 6,
    rating: 4.8,
    votes: 74,
    nutrients: { calories: 310, protein: '3g', carbs: '41g', fat: '14g' },
    tags: ['Lemon', 'Citrus', 'Tangy', 'Stuffed'],
    category: 'Cupcakes',
    priceOptions: [
      { label: 'Box of 6', price: 380 }
    ],
    details: [
      'Gooey homemade lemon curd center surprise',
      'Topped with a zesty, light lemon buttercream cream',
      'Incredibly refreshing dessert'
    ],
    ingredients: [
      { name: 'Homemade Lemon Curd', amount: 80, unit: 'g' },
      { name: 'Lemon zest', amount: 1, unit: 'tbsp' },
      { name: 'Cream cheese base', amount: 100, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Bake zesty lemon cupcakes. Once cooled, core out a small well in the center of each.', durationMs: 1200000 },
      { step: 2, text: 'Spoon tart homemade lemon curd directly into the cupcake wells.', durationMs: 120000 },
      { step: 3, text: 'Frost over the top with lemon buttercream to seal the core.', durationMs: 120000 }
    ],
    isFavorite: false
  },
  {
    id: 'cupcake-red-velvet',
    name: 'Red Velvet Cupcakes',
    description: 'Soft crimson cocoa cupcakes frosted with high-swirl tangy cream cheese icing. Fluffy, authentic, and delightfully balanced.',
    image: imgCupcakeRedVelvet,
    prepTime: 15,
    cookTime: 18,
    difficulty: 'Easy',
    servings: 6,
    rating: 4.9,
    votes: 154,
    nutrients: { calories: 320, protein: '4g', carbs: '37g', fat: '15g' },
    tags: ['Red Velvet', 'Cream Cheese', 'Cocoa', 'Classic'],
    category: 'Cupcakes',
    priceOptions: [
      { label: 'Box of 6', price: 400 }
    ],
    details: [
      'Vibrant red crumb with hints of light cocoa',
      'Velvety, authentic cream cheese icing',
      'Finished with red velvet velvet crumb sprinkles'
    ],
    ingredients: [
      { name: 'Buttermilk', amount: 60, unit: 'ml' },
      { name: 'Red velvet powder', amount: 100, unit: 'g' },
      { name: 'Cream Cheese', amount: 120, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Mix crimson batter with cocoa and buttermilk to develop a soft sponge texture.', durationMs: 180000 },
      { step: 2, text: 'Bake for 18 minutes; cool. Whip butter and cream cheese for icing.', durationMs: 1200000 },
      { step: 3, text: 'Pipe rich velvet swirls and garnish with cake crumbs.', durationMs: 120000 }
    ],
    isFavorite: false
  },
  {
    id: 'cupcake-oreo',
    name: 'Oreo Cupcakes',
    description: 'Cookies & cream cupcakes stuffed with chopped Oreos, finished with a generous peak of Oreo-crumb buttercream and a mini Oreo.',
    image: imgCupcakeOreo,
    prepTime: 15,
    cookTime: 18,
    difficulty: 'Easy',
    servings: 6,
    rating: 4.8,
    votes: 112,
    nutrients: { calories: 340, protein: '4g', carbs: '42g', fat: '16g' },
    tags: ['Oreo', 'Cookies & Cream', 'Chocolate', 'Crunchy'],
    category: 'Cupcakes',
    priceOptions: [
      { label: 'Box of 6', price: 400 }
    ],
    details: [
      'Oreo crumbs folded directly into the fluffy cake batter',
      'Rich cookies & cream style buttercream frosting',
      'Topped with a cute mini Oreo biscuit'
    ],
    ingredients: [
      { name: 'Oreo Biscuits (Crushed)', amount: 60, unit: 'g' },
      { name: 'White Buttercream', amount: 120, unit: 'g' },
      { name: 'Chocolate Sponge Mix', amount: 120, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Fold finely crushed Oreos into the chocolate cake base before baking.', durationMs: 120000 },
      { step: 2, text: 'Bake at 175°C for 18 minutes. Whip Oreo crumbs into sweet white buttercream.', durationMs: 1200000 },
      { step: 3, text: 'Frost cupcakes generously and top with a whole mini Oreo.', durationMs: 120000 }
    ],
    isFavorite: false
  },
  {
    id: 'cupcake-nutella',
    name: 'Choco Nutella Cupcakes',
    description: 'Intense cocoa cupcakes hollowed out and packed with oozing, pure Nutella. Frosted with rich chocolate Hazelnut buttercream.',
    image: imgCupcakeNutella,
    prepTime: 20,
    cookTime: 18,
    difficulty: 'Medium',
    servings: 6,
    rating: 4.9,
    votes: 132,
    nutrients: { calories: 360, protein: '4.5g', carbs: '44g', fat: '18g' },
    tags: ['Nutella', 'Hazelnut', 'Chocolate', 'Gooey'],
    category: 'Cupcakes',
    priceOptions: [
      { label: 'Box of 6', price: 420 }
    ],
    details: [
      'Filled with 100% genuine gooey Nutella hazelnut spread',
      'Topped with a swirl of rich chocolate hazelnut buttercream',
      'Includes chocolate shavings and toasted hazelnut crunch'
    ],
    ingredients: [
      { name: 'Creamy Nutella Spread', amount: 100, unit: 'g' },
      { name: 'Toasted Hazelnuts', amount: 20, unit: 'g' },
      { name: 'Cocoa Buttercream', amount: 100, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Bake chocolate cupcakes and core a clean well in each center.', durationMs: 1080000 },
      { step: 2, text: 'Warm Nutella slightly and pipe directly into the core of each cupcake.', durationMs: 120000 },
      { step: 3, text: 'Frost with hazelnut-chocolate cream and crown with hazelnut bits.', durationMs: 180000 }
    ],
    isFavorite: false
  },

  // --- BROWNIES (BOX OF 6) ---
  {
    id: 'brownie-classic',
    name: 'Classic Brownie',
    description: 'Fudgy, incredibly dense chocolate brownies baked to perfection with premium butter and dark chocolate. Beautiful crinkly shiny top.',
    image: imgBrownieClassic,
    prepTime: 10,
    cookTime: 22,
    difficulty: 'Easy',
    servings: 6,
    rating: 4.9,
    votes: 212,
    nutrients: { calories: 290, protein: '4g', carbs: '34g', fat: '15g' },
    tags: ['Chocolate', 'Fudgy', 'Classic', 'Brownie'],
    category: 'Brownies',
    priceOptions: [
      { label: 'Box of 6', price: 300 }
    ],
    details: [
      'Authentic fudgy center with chewy corners',
      'Features a signature shiny, crinkled brownie skin',
      'Perfect served with warm milk'
    ],
    ingredients: [
      { name: 'Dark Chocolate (55%)', amount: 120, unit: 'g' },
      { name: 'Pure Butter', amount: 100, unit: 'g' },
      { name: 'Sugar', amount: 150, unit: 'g' },
      { name: 'All-Purpose Flour', amount: 60, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Melt real dark chocolate and butter on low heat until smooth and glassy.', durationMs: 300000 },
      { step: 2, text: 'Whisk eggs and sugar vigorously for 4 minutes to create the shiny crinkle top.', durationMs: 240000 },
      { step: 3, text: 'Fold melted chocolate and flour, then bake at 175°C for exactly 20-22 minutes.', durationMs: 1320000 }
    ],
    isFavorite: false
  },
  {
    id: 'brownie-oreo',
    name: 'Oreo Brownie',
    description: 'Double chocolate fudgy brownies studded with crushed Oreo cookies both inside the batter and pressed on the top crust.',
    image: imgBrownieOreo,
    prepTime: 12,
    cookTime: 22,
    difficulty: 'Easy',
    servings: 6,
    rating: 4.8,
    votes: 94,
    nutrients: { calories: 320, protein: '4g', carbs: '38g', fat: '16g' },
    tags: ['Oreo', 'Oreo Brownie', 'Fudgy', 'Cookies'],
    category: 'Brownies',
    priceOptions: [
      { label: 'Box of 6', price: 370 }
    ],
    details: [
      'Gooey chocolate fudgy core',
      'Stuffed with chunks of classic Oreo cookies',
      'Crunchy Oreo topping contrast'
    ],
    ingredients: [
      { name: 'Oreo Biscuits', amount: 8, unit: 'pcs' },
      { name: 'Fudge Brownie Batter', amount: 450, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Mix classic fudge brownie batter and crush Oreo cookies roughly.', durationMs: 180000 },
      { step: 2, text: 'Fold 2/3 of the Oreo pieces directly into the dark chocolate batter.', durationMs: 60000 },
      { step: 3, text: 'Pour into pan, press remaining Oreos on top, and bake for 22 minutes.', durationMs: 1320000 }
    ],
    isFavorite: false
  },
  {
    id: 'brownie-nutella',
    name: 'Nutella Brownie',
    description: 'Fudgy Belgian chocolate brownies swirled with thick ribbons of Nutella spread, creating gooey chocolate pockets throughout.',
    image: imgBrownieNutella,
    prepTime: 10,
    cookTime: 23,
    difficulty: 'Easy',
    servings: 6,
    rating: 4.9,
    votes: 126,
    nutrients: { calories: 330, protein: '4g', carbs: '40g', fat: '17g' },
    tags: ['Nutella', 'Hazelnut', 'Fudgy', 'Gooey'],
    category: 'Brownies',
    priceOptions: [
      { label: 'Box of 6', price: 380 }
    ],
    details: [
      'Gooey pockets of pure hazelnut Nutella',
      'Fudgy, dense, and ultra-chewy texture',
      'Drizzled with chocolate syrup'
    ],
    ingredients: [
      { name: 'Nutella Spread', amount: 80, unit: 'g' },
      { name: 'Chocolate Brownie Mix', amount: 400, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Spread half the brownie batter into the prepared baking tray.', durationMs: 120000 },
      { step: 2, text: 'Drizzle ribbons of thick Nutella, cover with the rest of batter, and swirl with a knife.', durationMs: 180000 },
      { step: 3, text: 'Bake at 170°C for 22-24 minutes. Let cool before slicing.', durationMs: 1440000 }
    ],
    isFavorite: false
  },
  {
    id: 'brownie-kitkat',
    name: 'KitKat Brownie',
    description: 'Decadent chocolate brownie topped with crunchy, baked KitKat wafer fingers for an amazing combination of fudge and crispy wafer.',
    image: imgBrownieKitkat,
    prepTime: 10,
    cookTime: 22,
    difficulty: 'Easy',
    servings: 6,
    rating: 4.7,
    votes: 82,
    nutrients: { calories: 310, protein: '4g', carbs: '37g', fat: '16g' },
    tags: ['KitKat', 'Crunchy', 'Wafer', 'Brownie'],
    category: 'Brownies',
    priceOptions: [
      { label: 'Box of 6', price: 390 }
    ],
    details: [
      'Gooey, rich brownie base',
      'Stuffed with crushed wafer chocolate chunks',
      'Crowned with crispy whole KitKat finger details'
    ],
    ingredients: [
      { name: 'KitKat Wafer Sticks', amount: 6, unit: 'pcs' },
      { name: 'Classic Fudge Batter', amount: 450, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Crush half of the KitKat fingers roughly with a chef knife.', durationMs: 120000 },
      { step: 2, text: 'Stir crushed wafers into the brownie batter. Pour into the lined tin.', durationMs: 60000 },
      { step: 3, text: 'Arrange whole KitKat fingers in neat rows on top, press down, and bake.', durationMs: 1320000 }
    ],
    isFavorite: false
  },
  {
    id: 'brownie-triple',
    name: 'Triple Chocolate Brownie',
    description: 'The ultimate triple threat. Rich dark chocolate brownie loaded with chunks of dark, milk, and white Belgian chocolate chip pools.',
    image: imgBrownieTriple,
    prepTime: 12,
    cookTime: 22,
    difficulty: 'Medium',
    servings: 6,
    rating: 4.9,
    votes: 145,
    nutrients: { calories: 330, protein: '4g', carbs: '39g', fat: '17g' },
    tags: ['White Chocolate', 'Milk Chocolate', 'Dark Chocolate', 'Fudgy'],
    category: 'Brownies',
    priceOptions: [
      { label: 'Box of 6', price: 400 }
    ],
    details: [
      'Belgian dark chocolate chunks',
      'Sweet white chocolate chips pockets',
      'Creamy milk chocolate melts'
    ],
    ingredients: [
      { name: 'White Chocolate Chips', amount: 40, unit: 'g' },
      { name: 'Milk Chocolate Chips', amount: 40, unit: 'g' },
      { name: 'Dark Chocolate Chips', amount: 45, unit: 'g' },
      { name: 'Brownie Flour Base', amount: 350, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Incorporate white, milk, and dark chocolate chips into the brownie batter gently.', durationMs: 120000 },
      { step: 2, text: 'Spread evenly in an 8-inch square pan and level with a small spatula.', durationMs: 120000 },
      { step: 3, text: 'Bake for exactly 21-23 minutes to preserve the melting chip puddles.', durationMs: 1320000 }
    ],
    isFavorite: false
  },
  {
    id: 'brownie-biscoff',
    name: 'Biscoff Brownie',
    description: 'Fudgy chocolate brownies swirled with decadent caramelized Lotus Biscoff cookie spread and topped with crispy Biscoff biscuits.',
    image: imgBrownieBiscoff,
    prepTime: 12,
    cookTime: 24,
    difficulty: 'Medium',
    servings: 6,
    rating: 4.9,
    votes: 153,
    nutrients: { calories: 340, protein: '3.8g', carbs: '43g', fat: '17g' },
    tags: ['Biscoff', 'Cookie Butter', 'Caramelized', 'Brownie'],
    category: 'Brownies',
    priceOptions: [
      { label: 'Box of 6', price: 410 }
    ],
    details: [
      'Swirled with creamy caramelized Lotus Biscoff spread',
      'Packed with crunchy Lotus Biscoff biscuit chunks',
      'Stunning golden-brown caramel marble finish'
    ],
    ingredients: [
      { name: 'Lotus Biscoff Spread', amount: 90, unit: 'g' },
      { name: 'Lotus Biscoff Biscuits', amount: 5, unit: 'pcs' },
      { name: 'Fudge Brownie Mix', amount: 450, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Warm up Biscoff cookie butter until it is easily pourable.', durationMs: 120000 },
      { step: 2, text: 'Pour brownie mix, dollop Biscoff spread over, and marble swirl with a wooden pick.', durationMs: 180000 },
      { step: 3, text: 'Place whole biscuits on top, press gently, and bake for 22-24 minutes.', durationMs: 1440000 }
    ],
    isFavorite: false
  },
  {
    id: 'brownie-pistachio',
    name: 'Pistachio Brownie',
    description: 'Rich, luxurious dark chocolate brownie swirled with gourmet pistachio cream butter and loaded with crunchy roasted pistachio crumbs.',
    image: imgBrowniePistachio,
    prepTime: 15,
    cookTime: 23,
    difficulty: 'Hard',
    servings: 6,
    rating: 4.9,
    votes: 89,
    nutrients: { calories: 350, protein: '5g', carbs: '38g', fat: '19g' },
    tags: ['Pistachio', 'Gourmet', 'Nuts', 'Premium'],
    category: 'Brownies',
    priceOptions: [
      { label: 'Box of 6', price: 420 }
    ],
    details: [
      'Gourmet 100% real Italian pistachio cream swirl',
      'Topped with bright green roasted pistachio crumbs',
      'A perfect contrast of deep cocoa and salty nutty pistachio'
    ],
    ingredients: [
      { name: 'Pistachio Butter Cream', amount: 75, unit: 'g' },
      { name: 'Roasted Pistachios (Crushed)', amount: 30, unit: 'g' },
      { name: 'Belgian Cocoa Batter', amount: 420, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Pour rich Belgian cocoa batter into the pan, leaving 2 tablespoons for swirling.', durationMs: 120000 },
      { step: 2, text: 'Drizzle rich pistachio cream butter and draw a beautiful pattern.', durationMs: 180000 },
      { step: 3, text: 'Bake for 23 minutes, pull out, and immediately scatter crushed green pistachios.', durationMs: 1380000 }
    ],
    isFavorite: false
  },

  // --- COOKIES (BOX OF 6) ---
  {
    id: 'cookie-choco-chip',
    name: 'Classic Choco Chip Cookies',
    description: 'Thick, soft-baked cookies with crispy golden borders and a gooey, chewy core loaded with melting dark chocolate puddles.',
    image: imgCookieChocoChip,
    prepTime: 10,
    cookTime: 10,
    difficulty: 'Easy',
    servings: 6,
    rating: 4.9,
    votes: 284,
    nutrients: { calories: 230, protein: '3g', carbs: '32g', fat: '11g' },
    tags: ['Cookies', 'Chocolate Chip', 'Soft-Baked', 'Chewy'],
    category: 'Cookies',
    priceOptions: [
      { label: 'Box of 6', price: 250 }
    ],
    details: [
      'Crafted with premium brown butter for an amazing caramel note',
      'Loaded with melt-in-your-mouth milk chocolate chips',
      'Sprinkled with sea salt flakes'
    ],
    ingredients: [
      { name: 'Brown Butter', amount: 100, unit: 'g' },
      { name: 'Light Brown Sugar', amount: 120, unit: 'g' },
      { name: 'Chocolate Chips', amount: 120, unit: 'g' },
      { name: 'Flaky Sea Salt', amount: 1, unit: 'pinch' }
    ],
    instructions: [
      { step: 1, text: 'Cream brown butter with brown sugar and white sugar until light and sandy.', durationMs: 180000 },
      { step: 2, text: 'Fold in chocolate chips; scoop large 2oz balls of cookie dough.', durationMs: 120000 },
      { step: 3, text: 'Bake at 180°C for exactly 10 minutes until edges are set but center remains soft.', durationMs: 600000 }
    ],
    isFavorite: false
  },
  {
    id: 'cookie-double-choco',
    name: 'Double Chocolate Cookies',
    description: 'Rich dark cocoa cookie dough loaded with melting Belgian white and milk chocolate chunks. Incredibly deep chocolate flavor.',
    image: imgCookieDoubleChoco,
    prepTime: 10,
    cookTime: 11,
    difficulty: 'Easy',
    servings: 6,
    rating: 4.8,
    votes: 124,
    nutrients: { calories: 240, protein: '3g', carbs: '31g', fat: '12g' },
    tags: ['Cocoa', 'Double Chocolate', 'Cookies', 'Fudge'],
    category: 'Cookies',
    priceOptions: [
      { label: 'Box of 6', price: 300 }
    ],
    details: [
      'Deep black cocoa cookie dough base',
      'Packed with premium white chocolate chunks',
      'Beautiful dark cocoa aroma'
    ],
    ingredients: [
      { name: 'Cocoa Cookie Dough', amount: 350, unit: 'g' },
      { name: 'Belgian Chocolate Chunks', amount: 100, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Beat butter and cocoa dough base until creamy, then fold in chocolate chips.', durationMs: 180000 },
      { step: 2, text: 'Form cookies and space them 2 inches apart on a baking sheet.', durationMs: 120000 },
      { step: 3, text: 'Bake at 175°C for 11 minutes. Let cool for 5 minutes on the tray.', durationMs: 660000 }
    ],
    isFavorite: false
  },
  {
    id: 'cookie-dark-chunks',
    name: 'Dark Chocolate Chunks Cookies',
    description: 'Thick, heavy bakery-style cookies packed with huge chunks of intense 70% dark chocolate couverture. A sophisticated, semi-sweet bite.',
    image: imgCookieDarkChunks,
    prepTime: 12,
    cookTime: 10,
    difficulty: 'Easy',
    servings: 6,
    rating: 4.9,
    votes: 115,
    nutrients: { calories: 220, protein: '3g', carbs: '30g', fat: '11g' },
    tags: ['Dark Chocolate', 'Couverture', 'Bakery Style', 'Thick'],
    category: 'Cookies',
    priceOptions: [
      { label: 'Box of 6', price: 330 }
    ],
    details: [
      '70% cocoa dark chocolate couverture chunks',
      'Chewy, dense, classic cookie center',
      'Perfect balance of sweet dough and bitter chocolate chunks'
    ],
    ingredients: [
      { name: '70% Dark Chocolate Chunks', amount: 120, unit: 'g' },
      { name: 'Premium Cookie Dough Base', amount: 350, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Fold 70% dark chocolate chunks into chilled butter cookie dough.', durationMs: 120000 },
      { step: 2, text: 'Form into rustic, thick cookies to ensure a chewy center.', durationMs: 120000 },
      { step: 3, text: 'Bake for 10 minutes at 180°C. Do not overbake.', durationMs: 600000 }
    ],
    isFavorite: false
  },
  {
    id: 'cookie-mm',
    name: 'M&M Cookies',
    description: 'Fun, colorful cookies loaded with crunchy and melting M&M chocolate candies. A delightful crispy-shell chocolate bite.',
    image: imgCookieMm,
    prepTime: 10,
    cookTime: 10,
    difficulty: 'Easy',
    servings: 6,
    rating: 4.8,
    votes: 98,
    nutrients: { calories: 240, protein: '3g', carbs: '34g', fat: '11g' },
    tags: ['M&Ms', 'Colorful', 'Kids Choice', 'Fun'],
    category: 'Cookies',
    priceOptions: [
      { label: 'Box of 6', price: 330 }
    ],
    details: [
      'Loaded with crunchy M&M milk chocolate candies',
      'Crispy edge cookie dough with high butter content',
      'The ultimate party cookie'
    ],
    ingredients: [
      { name: 'M&M Candies', amount: 100, unit: 'g' },
      { name: 'Sweet Cookie Batter', amount: 350, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Gently fold M&Ms into cookie dough batter, reserving some for top decoration.', durationMs: 120000 },
      { step: 2, text: 'Scoop cookies and press extra M&Ms directly into the top of each ball.', durationMs: 120000 },
      { step: 3, text: 'Bake for 10 minutes until light golden brown.', durationMs: 600000 }
    ],
    isFavorite: false
  },
  {
    id: 'cookie-red-velvet',
    name: 'Red Velvet + White Choco Cookies',
    description: 'Vibrant red velvet cookie dough mixed with sweet, melting white chocolate chips. Soft, cake-like, and beautiful.',
    image: imgCookieRedVelvet,
    prepTime: 12,
    cookTime: 11,
    difficulty: 'Easy',
    servings: 6,
    rating: 4.9,
    votes: 110,
    nutrients: { calories: 235, protein: '3g', carbs: '32g', fat: '11.5g' },
    tags: ['Red Velvet', 'White Chocolate', 'Colorful', 'Chewy'],
    category: 'Cookies',
    priceOptions: [
      { label: 'Box of 6', price: 300 }
    ],
    details: [
      'Vibrant red velvet cookie dough',
      'Creamy premium white chocolate chip pools',
      'Soft-baked, brownie-like cookie texture'
    ],
    ingredients: [
      { name: 'White Chocolate Chips', amount: 80, unit: 'g' },
      { name: 'Red Velvet Cookie Dough', amount: 350, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Mix red velvet cocoa dough and fold in sweet white chocolate chips.', durationMs: 180000 },
      { step: 2, text: 'Chill cookie balls for 15 minutes to prevent flat spreading.', durationMs: 900000 },
      { step: 3, text: 'Bake at 170°C for 11 minutes; cool before moving.', durationMs: 660000 }
    ],
    isFavorite: false
  },

  // --- NEW ADDITIONS (BOX OF 6) ---
  {
    id: 'add-bomboloni-vanilla',
    name: 'Classic Vanilla Custard Bombolonies',
    description: 'Pillowy, soft Italian yeast donuts rolled in fine granulated sugar and piped with rich, velvety vanilla bean custard filling.',
    image: imgBomboloniVanilla,
    prepTime: 30,
    cookTime: 15,
    difficulty: 'Hard',
    servings: 6,
    rating: 4.9,
    votes: 167,
    nutrients: { calories: 310, protein: '5g', carbs: '39g', fat: '14g' },
    tags: ['Bomboloni', 'Custard', 'Italian Donuts', 'Vanilla'],
    category: 'Bombolonis',
    priceOptions: [
      { label: 'Box of 6', price: 420 }
    ],
    details: [
      'Italian brioche yeast dough raised for 2 hours',
      'Filled with homemade vanilla bean pastry cream (crème pâtissière)',
      'Rolled in fine caster sugar coating'
    ],
    ingredients: [
      { name: 'Yeast Brioche Dough', amount: 400, unit: 'g' },
      { name: 'Vanilla Pastry Cream', amount: 150, unit: 'g' },
      { name: 'Caster Sugar', amount: 50, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Proof the yeast-raised sweet brioche donuts until double in size.', durationMs: 1200000 },
      { step: 2, text: 'Deep fry donuts until puffed and perfectly golden brown on both sides.', durationMs: 300000 },
      { step: 3, text: 'Roll immediately in fine sugar, poke a hole, and pipe cold vanilla custard.', durationMs: 180000 }
    ],
    isFavorite: false
  },
  {
    id: 'add-bomboloni-hazelnut',
    name: 'Choco Hazelnut Bombolonies',
    description: 'Sugared brioche bomboloni donuts stuffed with a velvety, rich chocolate hazelnut Nutella filling. An absolute dream.',
    image: imgBomboloniHazelnut,
    prepTime: 30,
    cookTime: 15,
    difficulty: 'Hard',
    servings: 6,
    rating: 4.9,
    votes: 142,
    nutrients: { calories: 330, protein: '5g', carbs: '41g', fat: '16g' },
    tags: ['Bomboloni', 'Nutella', 'Hazelnut', 'Chocolate'],
    category: 'Bombolonis',
    priceOptions: [
      { label: 'Box of 6', price: 460 }
    ],
    details: [
      'Soft sugar-dusted yeast donuts',
      'Stuffed with gooey chocolate hazelnut cream',
      'Rich, melting chocolate core'
    ],
    ingredients: [
      { name: 'Chocolate Hazelnut Cream', amount: 150, unit: 'g' },
      { name: 'Brioche Yeast base', amount: 400, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Fry pillowy yeast-raised donuts until golden brown.', durationMs: 300000 },
      { step: 2, text: 'Coat donuts in granulated sugar while warm.', durationMs: 120000 },
      { step: 3, text: 'Inject rich choco-hazelnut cream directly into each bomboloni.', durationMs: 180000 }
    ],
    isFavorite: false
  },
  {
    id: 'add-bomboloni-strawberry',
    name: 'Strawberry Burst Bombolonies',
    description: 'Sugar-rolled yeast-raised Italian donuts bursting with gooey, tart, and sweet homemade strawberry jam filling.',
    image: imgBomboloniStrawberry,
    prepTime: 30,
    cookTime: 15,
    difficulty: 'Hard',
    servings: 6,
    rating: 4.8,
    votes: 95,
    nutrients: { calories: 290, protein: '4.5g', carbs: '42g', fat: '12g' },
    tags: ['Bomboloni', 'Strawberry Jam', 'Fruity', 'Italian'],
    category: 'Bombolonis',
    priceOptions: [
      { label: 'Box of 6', price: 480 }
    ],
    details: [
      'Filled with hand-made seedless strawberry jam',
      'Super light and airy brioche dough',
      'Rolled in powdered and caster sugar mix'
    ],
    ingredients: [
      { name: 'Handmade Strawberry Jam', amount: 120, unit: 'g' },
      { name: 'Brioche Yeast Dough', amount: 400, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Proof and fry donuts. Allow to cool slightly so jam filling does not run.', durationMs: 300000 },
      { step: 2, text: 'Roll in sweet caster sugar dust.', durationMs: 60000 },
      { step: 3, text: 'Pipe strawberry preserve filling until it overflows from the top.', durationMs: 120000 }
    ],
    isFavorite: false
  },
  {
    id: 'add-donut-glazed',
    name: 'Classic Glazed Donuts',
    description: 'Pillowy ring donuts glazed with a beautiful, translucent vanilla sugar shell that crackles with every bite. Melt-in-the-mouth soft.',
    image: imgDonutGlazed,
    prepTime: 25,
    cookTime: 10,
    difficulty: 'Medium',
    servings: 6,
    rating: 4.8,
    votes: 110,
    nutrients: { calories: 270, protein: '4g', carbs: '38g', fat: '12g' },
    tags: ['Donut', 'Glazed', 'Soft', 'Classic'],
    category: 'Donuts',
    priceOptions: [
      { label: 'Box of 6', price: 420 }
    ],
    details: [
      'Authentic glazed yeast donuts',
      'Pillowy-soft dough that melts in your mouth',
      'Sweet, glassy vanilla glaze shell'
    ],
    ingredients: [
      { name: 'Translucent Sugar Glaze', amount: 100, unit: 'ml' },
      { name: 'Brioche Ring Dough', amount: 350, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Proof the donut rings until light and highly fragile to touch.', durationMs: 900000 },
      { step: 2, text: 'Fry donuts on medium-high heat for 1 minute on each side.', durationMs: 120000 },
      { step: 3, text: 'Dip hot donuts into warm glaze; let rest for 3 minutes to crackle.', durationMs: 180000 }
    ],
    isFavorite: false
  },
  {
    id: 'add-donut-caramel',
    name: 'Caramel Glazed Donuts',
    description: 'Light, soft yeast-raised ring donuts covered in a thick, buttery house-cooked salted caramel glaze. Perfectly rich and sweet.',
    image: makeSvgUrl(svgCaramelDonut),
    prepTime: 25,
    cookTime: 10,
    difficulty: 'Medium',
    servings: 6,
    rating: 4.9,
    votes: 89,
    nutrients: { calories: 295, protein: '4g', carbs: '40g', fat: '14g' },
    tags: ['Donut', 'Caramel', 'Salted Caramel', 'Sweet'],
    category: 'Donuts',
    priceOptions: [
      { label: 'Box of 6', price: 460 }
    ],
    details: [
      'Housemade rich salted caramel coating',
      'Light yeast-raised ring donuts',
      'Beautiful glossy bronze finish'
    ],
    ingredients: [
      { name: 'Salted Caramel Glaze', amount: 120, unit: 'ml' },
      { name: 'Yeast donut dough', amount: 350, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Fry yeast ring donuts until golden; drain excess oil on paper towel.', durationMs: 180000 },
      { step: 2, text: 'Make salted caramel glaze with brown sugar, butter, and heavy cream.', durationMs: 300000 },
      { step: 3, text: 'Dip the top half of each donut in warm caramel glaze and set on rack.', durationMs: 120000 }
    ],
    isFavorite: false
  },
  {
    id: 'add-donut-oreos',
    name: 'Cookies & Cream Donuts',
    description: 'Fluffy ring donuts glazed with creamy white chocolate and loaded with crushed Oreo cookies. The ultimate sweet confection.',
    image: makeSvgUrl(svgOreoDonut),
    prepTime: 25,
    cookTime: 12,
    difficulty: 'Medium',
    servings: 6,
    rating: 4.9,
    votes: 112,
    nutrients: { calories: 310, protein: '4.5g', carbs: '43g', fat: '15g' },
    tags: ['Donut', 'Oreo', 'Cookies & Cream', 'White Chocolate'],
    category: 'Donuts',
    priceOptions: [
      { label: 'Box of 6', price: 500 }
    ],
    details: [
      'Belgian white chocolate dip base',
      'Topped with cookie crumbs and whole crushed Oreos',
      'Creamy, sweet, and satisfying crunch texture'
    ],
    ingredients: [
      { name: 'Belgian White Chocolate', amount: 100, unit: 'g' },
      { name: 'Crushed Oreo cookies', amount: 40, unit: 'g' },
      { name: 'brioche ring donut', amount: 350, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Melt Belgian white chocolate until glossy and runny.', durationMs: 180000 },
      { step: 2, text: 'Dip golden donuts in melted white chocolate glaze.', durationMs: 120000 },
      { step: 3, text: 'Scatter Oreo cookie crumbs immediately while the chocolate is wet.', durationMs: 120000 }
    ],
    isFavorite: false
  },
  {
    id: 'add-roll-sugar',
    name: 'Classic Sugar Glaze Cinnamon Rolls',
    description: 'Warm, soft, pillowy rolls swirled with sweet cassia cinnamon butter and covered with a crackly, clear glaze drizzle. Pure comfort.',
    image: makeSvgUrl(svgSugarRoll),
    prepTime: 30,
    cookTime: 20,
    difficulty: 'Medium',
    servings: 6,
    rating: 4.8,
    votes: 123,
    nutrients: { calories: 290, protein: '4g', carbs: '41g', fat: '12g' },
    tags: ['Cinnamon Roll', 'Sugar Glaze', 'Warm', 'Comfort'],
    category: 'New Additions',
    priceOptions: [
      { label: 'Box of 6', price: 400 }
    ],
    details: [
      'Rich, aromatic cassia cinnamon spice swirl',
      'Soft brioche bread rolls baked in close contact',
      'Glazed while steaming hot from the oven'
    ],
    ingredients: [
      { name: 'Brioche Roll Dough', amount: 450, unit: 'g' },
      { name: 'Cassia Cinnamon butter', amount: 80, unit: 'g' },
      { name: 'Sugar glaze syrup', amount: 60, unit: 'ml' }
    ],
    instructions: [
      { step: 1, text: 'Roll dough out, spread cinnamon butter, slice, and place in baking tray.', durationMs: 600000 },
      { step: 2, text: 'Bake at 180°C for 18-20 minutes until puffed and lightly browned.', durationMs: 1080000 },
      { step: 3, text: 'Pour sweet sugar glaze directly over hot cinnamon rolls.', durationMs: 60000 }
    ],
    isFavorite: false
  },
  {
    id: 'add-roll-milk',
    name: 'Condensed Milk Glaze Cinnamon Rolls',
    description: 'Gooey cinnamon-spiced rolls drizzled with a rich, silky sweet condensed milk glaze. Incredibly moist and rich flavor.',
    image: makeSvgUrl(svgMilkRoll),
    prepTime: 30,
    cookTime: 20,
    difficulty: 'Medium',
    servings: 6,
    rating: 4.9,
    votes: 145,
    nutrients: { calories: 310, protein: '4.8g', carbs: '44g', fat: '13g' },
    tags: ['Cinnamon Roll', 'Condensed Milk', 'Gooey', 'Moist'],
    category: 'New Additions',
    priceOptions: [
      { label: 'Box of 6', price: 440 }
    ],
    details: [
      'Gooey condensed milk drizzle soak',
      'Super moist cinnamon-infused rolls',
      'A unique Asian bakery style twist'
    ],
    ingredients: [
      { name: 'Sweet Condensed Milk', amount: 80, unit: 'g' },
      { name: 'Cinnamon Roll Bun', amount: 450, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Bake soft cinnamon rolls in close baking pan setup.', durationMs: 1080000 },
      { step: 2, text: 'While steaming hot, poke fine holes and soak with warm condensed milk.', durationMs: 120000 },
      { step: 3, text: 'Let rest for 5 minutes to absorb the creamy milk before serving.', durationMs: 300000 }
    ],
    isFavorite: false
  },
  {
    id: 'add-roll-cream-cheese',
    name: 'Cream Cheese Glaze Cinnamon Rolls',
    description: 'Our absolute bestseller. Soft cinnamon rolls smothered in a thick, velvety layer of sweet and tangy gourmet cream cheese frosting.',
    image: makeSvgUrl(svgCreamCheeseRoll),
    prepTime: 30,
    cookTime: 20,
    difficulty: 'Hard',
    servings: 6,
    rating: 4.9,
    votes: 215,
    nutrients: { calories: 340, protein: '5g', carbs: '42g', fat: '16g' },
    tags: ['Cinnamon Roll', 'Cream Cheese', 'Rich', 'Bestseller'],
    category: 'New Additions',
    priceOptions: [
      { label: 'Box of 6', price: 480 }
    ],
    details: [
      'Cream cheese whipped with vanilla and fresh butter',
      'Rich, melting frosting over warm buns',
      'The ultimate bakery classic cinnamon roll'
    ],
    ingredients: [
      { name: 'Cream Cheese Frosting', amount: 150, unit: 'g' },
      { name: 'Brioche Cinnamon Bun', amount: 450, unit: 'g' }
    ],
    instructions: [
      { step: 1, text: 'Bake cinnamon buns. Prepare cream cheese frosting by beating cream cheese and sugar.', durationMs: 1080000 },
      { step: 2, text: 'Let rolls cool down slightly (about 5 minutes) so frosting melts nicely but stays thick.', durationMs: 300000 },
      { step: 3, text: 'Spread a massive, velvety layer of frosting over the buns.', durationMs: 120000 }
    ],
    isFavorite: false
  }
];
