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
  category: string; // 'Signature Cakes' | 'Cupcakes' | 'Brownies' | 'Cookies' | 'Donuts' | 'Bombolonis' | 'Overloaded Tubs' | 'Cinnamon Rolls' | 'Assorted Boxes'
  isFavorite?: boolean;
  
  // Custom Bakery fields
  priceOptions: PriceOption[];
  details: string[];

  // Assorted Box configuration
  isBuildYourBox?: boolean;
  boxMinItems?: number;       // minimum total items required before checkout is allowed
  boxCapacity?: number;       // legacy/optional
  boxEligibleCategories?: string[];
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
  boxContents?: { name: string; quantity: number; price: number }[]; // live snapshot of box items with unit prices
}

export interface CategoryInfo {
  name: string;
  emoji: string;
  description: string;
  image?: string;
  imageUrl?: string;
  itemCountText: string;
  startingPrice: number;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';

export interface CheckoutData {
  customerName: string;
  customerPhone: string;
  pickupDate: string;
  pickupTime: string;
  specialInstructions: string;
  deliveryType: 'Pickup' | 'Delivery';
  deliveryAddress: string;
  gpsCoordinates: string;
  paymentMethod: 'Razorpay' | 'COD';
  paymentStatus?: 'Unpaid' | 'Paid' | 'Pending' | 'Failed';
  paymentDetails: {
    gateway?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    gatewayRef?: string;
    paidAt?: string;
    verifiedOnServer?: boolean;
    cardHolder?: string;
    cardNumber?: string;
    upiId?: string;
  };
}

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
  customerEmail?: string;
  contactEmail?: string;
  specialInstructions?: string;
  deliveryType?: 'Pickup' | 'Delivery';
  deliveryAddress?: string;
  gpsCoordinates?: string;
  paymentMethod?: 'Razorpay' | 'COD' | 'Card' | 'UPI';
  paymentStatus?: 'Unpaid' | 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  transactionId?: string;
  paymentTimestamp?: string;
  paidAmount?: number;
  paymentDetails?: {
    gateway?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    cardHolder?: string;
    cardNumber?: string;
    upiId?: string;
    customerUpiId?: string;
    upiTransactionId?: string;
    paidAt?: string;
    gatewayRef?: string;
    verifiedOnServer?: boolean;
  };
  adminNotes?: string[];
  boxContents?: { name: string; quantity: number; price?: number }[]; // assorted box item selections with price
}

export interface LayoutContextType {
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  mealPlan: MealPlanEntry[];
  setMealPlan: React.Dispatch<React.SetStateAction<MealPlanEntry[]>>;
  categoryInfos: CategoryInfo[];
  setCategoryInfos: React.Dispatch<React.SetStateAction<CategoryInfo[]>>;
  logo: string;
  setLogo: React.Dispatch<React.SetStateAction<string>>;
  websiteName: string;
  setWebsiteName: React.Dispatch<React.SetStateAction<string>>;
  websiteSlogan: string;
  setWebsiteSlogan: React.Dispatch<React.SetStateAction<string>>;
  upiId: string;
  setUpiId: React.Dispatch<React.SetStateAction<string>>;
  upiQrCode: string;
  setUpiQrCode: React.Dispatch<React.SetStateAction<string>>;
  cashOnDeliveryEnabled: boolean;
  setCashOnDeliveryEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  shoppingList: ShoppingItem[];
  setShoppingList: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
  toasts: { id: string; title: string; message: string; type: 'success' | 'info' | 'warning' }[];
  setToasts: React.Dispatch<React.SetStateAction<{ id: string; title: string; message: string; type: 'success' | 'info' | 'warning' }[]>>;
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  toggleTheme: () => void;
  handleToggleFavorite: (recipeId: string) => void;
  handleSelectRecipe: (recipe: Recipe) => void;
  handleAddMeal: (entry: MealPlanEntry) => void;
  handleRemoveMeal: (id: string) => Promise<void>;
  handleReorder: (order: MealPlanEntry) => void;
  handleUpdateOrderStatus: (orderId: string, newStatus: MealPlanEntry['status']) => Promise<void>;
  handleAddToCart: (item: {
    productId: string;
    name: string;
    category: string;
    selectedOption: string;
    price: number;
    amount: number;
    unit: string;
    image: string;
    customMessage: string;
    recipeName: string;
    boxContents?: { name: string; quantity: number; price: number }[];
  }) => void;
  handleCheckout: (checkoutData: CheckoutData) => Promise<void>;
  handleUpiPaymentSuccess: (verifiedData: {
    orderIds: string[];
    orderNumber: string;
    paidAmount: number;
    transactionId: string;
    paidAt: string;
    gatewayRef: string;
    checkoutData: any;
  }) => void;
  handleToggleBought: (id: string) => void;
  handleUpdateQuantity: (id: string, newAmount: number) => void;
  handleRemoveShoppingItem: (id: string) => void;
  handleClearCompleted: () => void;
  handleClearAllShopping: () => void;
  handleAddIngredientsToShoppingList: (recipe: Recipe, scaledServings?: number) => void;
  setIsBakeryMapOpen: (open: boolean) => void;
}

