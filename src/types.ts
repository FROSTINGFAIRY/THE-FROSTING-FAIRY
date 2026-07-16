export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface NutritionalInfo {
  calories: number;
  protein: string; // e.g. "15g"
  carbs: string;   // e.g. "45g"
  fat: string;     // e.g. "12g"
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface RecipeInstruction {
  step: number;
  text: string;
  durationMs?: number; // Optional duration for steps that require timers
}

export interface PriceOption {
  label: string;
  price: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  image: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  difficulty: Difficulty;
  servings: number;
  rating: number;
  votes: number;
  nutrients: NutritionalInfo;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  tags: string[];
  category: string; // 'Signature Cakes' | 'Cupcakes' | 'Brownies' | 'Cookies' | 'New Additions'
  isFavorite?: boolean;
  
  // Custom Bakery fields
  priceOptions: PriceOption[];
  details: string[];
}

export interface ShoppingItem {
  id: string;
  productId?: string;
  name: string;
  category: string;
  selectedOption?: string; // e.g. "500g" or "Box of 6"
  price?: number;
  amount: number; // represents quantity or amount
  unit: string; // e.g. "pcs", "box"
  image?: string;
  customMessage?: string; // e.g. "Happy Birthday Romy!"
  isBought: boolean;
  recipeName?: string;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';

export interface MealPlanEntry {
  id: string;
  cakeType: string; // "Bento Cake", "Half Kg Cake", "1 Kg Custom Cake", etc.
  flavor: string;
  weight: string;
  message: string;
  instructions: string;
  pickupDate: string;
  pickupTime?: string;
  contactName: string;
  contactPhone: string;
  estimatedPrice: number;
  status?: 'Pending' | 'Confirmed' | 'Baking' | 'Ready' | 'Ready for Pickup' | 'Out for Delivery' | 'Completed';
  day?: string; // compatibility
  mealType?: string; // compatibility
  recipe?: Recipe; // compatibility
  customerName?: string;
  customerPhone?: string;
  specialInstructions?: string;
  deliveryType?: 'Pickup' | 'Delivery';
  deliveryAddress?: string;
  gpsCoordinates?: string;
  paymentMethod?: 'Card' | 'UPI' | 'COD';
  paymentDetails?: {
    cardHolder?: string;
    cardNumber?: string;
    upiId?: string;
  };
}

