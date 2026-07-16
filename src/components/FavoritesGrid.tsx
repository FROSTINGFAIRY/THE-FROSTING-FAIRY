import React from 'react';
import { Star, Clock, Flame, Heart, ArrowLeft, BookOpen } from 'lucide-react';
import { Recipe } from '../types';
import { motion } from 'motion/react';

interface FavoritesGridProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string) => void;
  onGoToDiscover: () => void;
}

export default function FavoritesGrid({
  recipes,
  onSelectRecipe,
  onToggleFavorite,
  onGoToDiscover,
}: FavoritesGridProps) {
  const favoriteRecipes = recipes.filter((r) => r.isFavorite);

  return (
    <div id="favorites-root" className="flex-1 px-4 sm:px-6 lg:px-8 py-8 bg-brand-cream">
      {/* Header */}
      <header id="favorites-header" className="mb-8 flex items-center justify-between">
        <div>
          <h2 id="favorites-title" className="font-display font-bold text-3xl text-brand-cocoa tracking-tight">
            Saved Favorites
          </h2>
          <p id="favorites-subtitle" className="text-sm text-brand-cocoa-light mt-1 font-sans">
            Your curated collection of magical pastry recipes and kitchen guides.
          </p>
        </div>
        
        {favoriteRecipes.length > 0 && (
          <button
            id="btn-fav-add-more"
            onClick={onGoToDiscover}
            className="flex items-center gap-2 text-xs font-semibold font-sans bg-white border border-brand-cocoa-border px-4 py-2.5 rounded-xl text-brand-cocoa-light hover:bg-brand-pink-light/30 hover:text-brand-cocoa transition-all shadow-sm cursor-pointer"
          >
            <BookOpen id="fav-book-icon" className="w-4 h-4 text-brand-pink" />
            <span>Discover More</span>
          </button>
        )}
      </header>

      {/* Grid Content */}
      {favoriteRecipes.length > 0 ? (
        <div id="favorites-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              id={`fav-card-${recipe.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl border border-brand-cocoa-border overflow-hidden shadow-sm hover:shadow-md hover:border-brand-pink-accent/50 transition-all duration-300 flex flex-col group"
            >
              {/* Image */}
              <div id={`fav-card-img-wrapper-${recipe.id}`} className="relative h-48 overflow-hidden bg-brand-cream-light shrink-0">
                <img
                  id={`fav-card-image-${recipe.id}`}
                  src={recipe.image}
                  alt={recipe.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Badges */}
                <div id={`fav-card-badges-${recipe.id}`} className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span id={`fav-card-badge-cat-${recipe.id}`} className="px-2.5 py-0.5 text-[10px] font-semibold font-mono bg-brand-cocoa/85 text-brand-pink-light backdrop-blur-xs rounded-full uppercase tracking-wider border border-brand-pink/10">
                    {recipe.category}
                  </span>
                </div>

                <button
                  id={`btn-fav-card-heart-toggle-${recipe.id}`}
                  onClick={() => onToggleFavorite(recipe.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full border bg-brand-pink border-brand-pink text-white flex items-center justify-center shadow-sm hover:bg-brand-pink-dark transition-all cursor-pointer"
                >
                  <Heart id={`fav-card-heart-icon-${recipe.id}`} className="w-4 h-4 fill-white text-white" />
                </button>
              </div>

              {/* Info Details */}
              <div id={`fav-card-info-${recipe.id}`} className="p-5 flex-1 flex flex-col justify-between">
                <div id={`fav-card-texts-${recipe.id}`}>
                  <div id={`fav-card-rating-row-${recipe.id}`} className="flex items-center gap-1 text-xs text-amber-500 font-semibold mb-1.5 font-sans">
                    <Star id={`fav-card-star-${recipe.id}`} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span id={`fav-card-rating-${recipe.id}`}>{recipe.rating}</span>
                    <span id={`fav-card-votes-${recipe.id}`} className="text-brand-cocoa-light/60 font-normal font-sans">({recipe.votes})</span>
                  </div>

                  <h5
                    id={`fav-card-name-${recipe.id}`}
                    onClick={() => onSelectRecipe(recipe)}
                    className="font-display font-bold text-brand-cocoa group-hover:text-brand-pink transition-colors line-clamp-1 text-base cursor-pointer"
                  >
                    {recipe.name}
                  </h5>

                  <p id={`fav-card-desc-${recipe.id}`} className="text-xs text-brand-cocoa-light mt-1.5 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>

                {/* Bottom Stats: Price & View/Order button */}
                <div id={`fav-card-bottom-${recipe.id}`} className="mt-4 pt-4 border-t border-brand-cocoa-border flex items-center justify-between">
                  <div id={`fav-card-stats-${recipe.id}`} className="flex flex-col text-left font-sans">
                    <span className="text-[9px] uppercase font-mono tracking-wider text-brand-cocoa-light/60">Starting From</span>
                    <span className="text-sm font-extrabold text-brand-pink font-display">₹{recipe.priceOptions[0]?.price}</span>
                  </div>

                  <button
                    id={`btn-fav-card-cook-${recipe.id}`}
                    onClick={() => onSelectRecipe(recipe)}
                    className="text-xs font-bold text-brand-cocoa hover:text-brand-pink transition-colors cursor-pointer bg-brand-pink-light/35 px-3 py-1.5 rounded-lg"
                  >
                    Order Treat
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div id="no-favorites-fallback" className="text-center py-20 bg-white rounded-2xl border border-brand-cocoa-border px-4 max-w-2xl mx-auto mt-8">
          <div id="heart-illustration" className="w-16 h-16 bg-brand-pink-light text-brand-pink rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart id="fallback-heart-icon" className="w-8 h-8" />
          </div>
          <h4 id="fallback-fav-title" className="font-display font-bold text-brand-cocoa text-xl">Your Favorites is Empty</h4>
          <p id="fallback-fav-desc" className="text-sm text-brand-cocoa-light mt-2 max-w-sm mx-auto leading-relaxed">
            As you explore our sweet recipes, click the heart icon on any card to save it here for easy access.
          </p>
          <button
            id="btn-fav-explore"
            onClick={onGoToDiscover}
            className="mt-6 inline-flex items-center gap-2 bg-brand-pink hover:bg-brand-pink-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-brand-pink/15 cursor-pointer"
          >
            <BookOpen id="btn-fav-explore-icon" className="w-4 h-4" />
            <span>Discover Recipes</span>
          </button>
        </div>
      )}
    </div>
  );
}
