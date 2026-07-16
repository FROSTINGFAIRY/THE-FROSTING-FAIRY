import { Recipe } from './types';

export const INITIAL_RECIPES: Recipe[] = [
  // --- SIGNATURE CAKES (BY WEIGHT) ---
  {
    id: 'cake-vanilla',
    name: 'Classic Vanilla Cake',
    description: 'Freshly baked premium vanilla bean sponge, delicately layered with smooth whipped vanilla buttercream. Simple, elegant, and timeless.',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=800&q=80',
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
    isFavorite: true
  },
  {
    id: 'cake-chocolate',
    name: 'Chocolate Cake',
    description: 'Rich cocoa sponge paired with luxurious Belgian chocolate cream. A deep, heavenly experience for chocolate purists.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
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
    isFavorite: true
  },
  {
    id: 'cake-caramel',
    name: 'Whipped Caramel Cake',
    description: 'A light-as-air vanilla bean sponge cake smothered in silky, slow-cooked whipped caramel cream and topped with buttery caramel drizzles.',
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
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
    isFavorite: true
  },
  {
    id: 'cake-lemon-cream',
    name: 'Lemon Cream Cheese Cake',
    description: 'Bright, zesty lemon-infused sponge cake perfectly matched with a velvety, tangy cream cheese frosting. A refreshing, premium balance of sweet and tart.',
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1614707267537-b85acf00c4b8?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80',
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
    isFavorite: true
  },
  {
    id: 'cupcake-oreo',
    name: 'Oreo Cupcakes',
    description: 'Cookies & cream cupcakes stuffed with chopped Oreos, finished with a generous peak of Oreo-crumb buttercream and a mini Oreo.',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?auto=format&fit=crop&w=800&q=80',
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
    isFavorite: true
  },

  // --- BROWNIES (BOX OF 6) ---
  {
    id: 'brownie-classic',
    name: 'Classic Brownie',
    description: 'Fudgy, incredibly dense chocolate brownies baked to perfection with premium butter and dark chocolate. Beautiful crinkly shiny top.',
    image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=800&q=80',
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
    isFavorite: true
  },
  {
    id: 'brownie-oreo',
    name: 'Oreo Brownie',
    description: 'Double chocolate fudgy brownies studded with crushed Oreo cookies both inside the batter and pressed on the top crust.',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62dade37?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1606312440196-41a4188b8e62?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1564936281291-291556940a83?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=800&q=80',
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
    isFavorite: true
  },
  {
    id: 'brownie-biscoff',
    name: 'Biscoff Brownie',
    description: 'Fudgy chocolate brownies swirled with decadent caramelized Lotus Biscoff cookie spread and topped with crispy Biscoff biscuits.',
    image: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=800&q=80',
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
    isFavorite: true
  },

  // --- COOKIES (BOX OF 6) ---
  {
    id: 'cookie-choco-chip',
    name: 'Classic Choco Chip Cookies',
    description: 'Thick, soft-baked cookies with crispy golden borders and a gooey, chewy core loaded with melting dark chocolate puddles.',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
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
    isFavorite: true
  },
  {
    id: 'cookie-double-choco',
    name: 'Double Chocolate Cookies',
    description: 'Rich dark cocoa cookie dough loaded with melting Belgian white and milk chocolate chunks. Incredibly deep chocolate flavor.',
    image: 'https://images.unsplash.com/photo-1618963372282-5d7026845341?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1600431521340-491eca880813?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1558961309-dbdf71799f5a?auto=format&fit=crop&w=800&q=80',
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
    isFavorite: true
  },

  // --- NEW ADDITIONS (BOX OF 6) ---
  {
    id: 'add-bomboloni-vanilla',
    name: 'Classic Vanilla Custard Bombolonies',
    description: 'Pillowy, soft Italian yeast donuts rolled in fine granulated sugar and piped with rich, velvety vanilla bean custard filling.',
    image: 'https://images.unsplash.com/photo-1557827983-012eb6ea8dc1?auto=format&fit=crop&w=800&q=80',
    prepTime: 30,
    cookTime: 15,
    difficulty: 'Hard',
    servings: 6,
    rating: 4.9,
    votes: 167,
    nutrients: { calories: 310, protein: '5g', carbs: '39g', fat: '14g' },
    tags: ['Bomboloni', 'Custard', 'Italian Donuts', 'Vanilla'],
    category: 'New Additions',
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
    isFavorite: true
  },
  {
    id: 'add-bomboloni-hazelnut',
    name: 'Choco Hazelnut Bombolonies',
    description: 'Sugared brioche bomboloni donuts stuffed with a velvety, rich chocolate hazelnut Nutella filling. An absolute dream.',
    image: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80',
    prepTime: 30,
    cookTime: 15,
    difficulty: 'Hard',
    servings: 6,
    rating: 4.9,
    votes: 142,
    nutrients: { calories: 330, protein: '5g', carbs: '41g', fat: '16g' },
    tags: ['Bomboloni', 'Nutella', 'Hazelnut', 'Chocolate'],
    category: 'New Additions',
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
    image: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80',
    prepTime: 30,
    cookTime: 15,
    difficulty: 'Hard',
    servings: 6,
    rating: 4.8,
    votes: 95,
    nutrients: { calories: 290, protein: '4.5g', carbs: '42g', fat: '12g' },
    tags: ['Bomboloni', 'Strawberry Jam', 'Fruity', 'Italian'],
    category: 'New Additions',
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
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
    prepTime: 25,
    cookTime: 10,
    difficulty: 'Medium',
    servings: 6,
    rating: 4.8,
    votes: 110,
    nutrients: { calories: 270, protein: '4g', carbs: '38g', fat: '12g' },
    tags: ['Donut', 'Glazed', 'Soft', 'Classic'],
    category: 'New Additions',
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
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
    prepTime: 25,
    cookTime: 10,
    difficulty: 'Medium',
    servings: 6,
    rating: 4.9,
    votes: 89,
    nutrients: { calories: 295, protein: '4g', carbs: '40g', fat: '14g' },
    tags: ['Donut', 'Caramel', 'Salted Caramel', 'Sweet'],
    category: 'New Additions',
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
    image: 'https://images.unsplash.com/photo-1612240498936-65f5101365d2?auto=format&fit=crop&w=800&q=80',
    prepTime: 25,
    cookTime: 12,
    difficulty: 'Medium',
    servings: 6,
    rating: 4.9,
    votes: 112,
    nutrients: { calories: 310, protein: '4.5g', carbs: '43g', fat: '15g' },
    tags: ['Donut', 'Oreo', 'Cookies & Cream', 'White Chocolate'],
    category: 'New Additions',
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
    isFavorite: true
  },
  {
    id: 'add-roll-sugar',
    name: 'Classic Sugar Glaze Cinnamon Rolls',
    description: 'Warm, soft, pillowy rolls swirled with sweet cassia cinnamon butter and covered with a crackly, clear glaze drizzle. Pure comfort.',
    image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=800&q=80',
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
    isFavorite: true
  },
  {
    id: 'add-roll-cream-cheese',
    name: 'Cream Cheese Glaze Cinnamon Rolls',
    description: 'Our absolute bestseller. Soft cinnamon rolls smothered in a thick, velvety layer of sweet and tangy gourmet cream cheese frosting.',
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80',
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
    isFavorite: true
  }
];
