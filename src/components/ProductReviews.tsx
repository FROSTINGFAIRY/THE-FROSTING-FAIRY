import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  Star, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  LogIn, 
  ShieldCheck, 
  Clock, 
  ThumbsUp, 
  Sparkles,
  Filter,
  ArrowUpDown,
  X
} from 'lucide-react';
import { db, auth, signInWithGoogle, getAdminRoleFromFirestore } from '../lib/firebase';
import { ProductReview } from '../types';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isAdminOrChef, setIsAdminOrChef] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filters and Sorting
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user?.email) {
        const role = await getAdminRoleFromFirestore(user.email);
        setIsAdminOrChef(role === 'admin' || role === 'chef');
      } else {
        setIsAdminOrChef(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Reviews for this product in real-time
  useEffect(() => {
    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: ProductReview[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            productId: data.productId,
            userId: data.userId,
            userName: data.userName || 'Anonymous Connoisseur',
            userPhoto: data.userPhoto || '',
            rating: typeof data.rating === 'number' ? data.rating : 5,
            comment: data.comment || '',
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        setReviews(list);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching product reviews:', err);
        setError('Failed to load reviews. Please try refreshing.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [productId]);

  // Determine if current user already reviewed
  const userExistingReview = useMemo(() => {
    if (!currentUser) return null;
    return reviews.find((r) => r.userId === currentUser.uid) || null;
  }, [currentUser, reviews]);

  // Populate form if entering edit mode
  useEffect(() => {
    if (isEditing && userExistingReview) {
      setRating(userExistingReview.rating);
      setComment(userExistingReview.comment);
    }
  }, [isEditing, userExistingReview]);

  // Aggregate Stats
  const { totalCount, averageRating, ratingCounts } = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        totalCount: 0,
        averageRating: 0,
        ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
    let sum = 0;
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[rounded] = (counts[rounded] || 0) + 1;
      sum += r.rating;
    });
    return {
      totalCount: total,
      averageRating: parseFloat((sum / total).toFixed(1)),
      ratingCounts: counts,
    };
  }, [reviews]);

  // Filtered and Sorted Reviews
  const displayedReviews = useMemo(() => {
    let list = [...reviews];

    if (selectedStarFilter !== 'all') {
      list = list.filter((r) => Math.round(r.rating) === selectedStarFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;

      // Newest first (handle Firestore Timestamp or dates)
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return timeB - timeA;
    });

    return list;
  }, [reviews, selectedStarFilter, sortBy]);

  // Submit / Update Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setFormError('Please sign in to post your review.');
      return;
    }
    const cleanComment = comment.trim();
    if (!cleanComment) {
      setFormError('Please share your thoughts or tasting experience in your review.');
      return;
    }
    if (cleanComment.length > 1000) {
      setFormError('Comment must be 1000 characters or fewer.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setFormError('Please choose a rating between 1 and 5 stars.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const docId = `${productId}_${currentUser.uid}`;
    const reviewRef = doc(db, 'reviews', docId);

    try {
      const reviewPayload: any = {
        productId,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Gourmet Patron',
        userPhoto: currentUser.photoURL || '',
        rating: Number(rating),
        comment: cleanComment,
        updatedAt: serverTimestamp(),
      };

      if (!userExistingReview) {
        reviewPayload.createdAt = serverTimestamp();
      }

      await setDoc(reviewRef, reviewPayload, { merge: true });
      setIsEditing(false);
      setComment('');
      setRating(5);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setFormError(err?.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Review
  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setDeleteConfirmId(null);
      if (isEditing) {
        setIsEditing(false);
        setComment('');
      }
    } catch (err: any) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review: ' + (err?.message || 'Unknown error'));
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <section id="product-reviews-section" className="w-full bg-white border-t border-brand-cocoa-border mt-12 py-12 px-6 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-cocoa-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-brand-pink" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-pink">
                Customer Feedback
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-brand-cocoa tracking-tight">
              Gourmet Reviews & Ratings
            </h2>
            <p className="text-xs sm:text-sm text-brand-cocoa-light mt-1">
              Real verified impressions for {productName} from our dessert lovers.
            </p>
          </div>

          {/* User Status pill */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2.5 bg-brand-cream-light/60 border border-brand-cocoa-border/70 rounded-full px-3.5 py-1.5 shadow-3xs">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-5 h-5 rounded-full object-cover border border-brand-cocoa-border/60"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-brand-pink text-white text-[10px] font-bold flex items-center justify-center">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-medium text-brand-cocoa truncate max-w-[140px]">
                  {currentUser.displayName || currentUser.email}
                </span>
                {isAdminOrChef && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-brand-pink text-white rounded-full">
                    Admin
                  </span>
                )}
              </div>
            ) : (
              <button
                id="btn-reviews-signin"
                type="button"
                onClick={() => signInWithGoogle()}
                className="flex items-center gap-2 px-4 py-2 bg-brand-pink text-white text-xs font-mono font-bold rounded-full hover:bg-brand-pink-dark transition-all cursor-pointer shadow-3xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Rating Breakdown & Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Average score card */}
          <div className="md:col-span-4 bg-brand-cream/40 border border-brand-cocoa-border rounded-2xl p-6 text-center space-y-2.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-cocoa-light">
              Overall Customer Score
            </span>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-5xl font-display font-black text-brand-cocoa">
                {totalCount > 0 ? averageRating : '—'}
              </span>
              <span className="text-sm font-mono text-brand-cocoa-light">/ 5.0</span>
            </div>

            <div className="flex justify-center gap-1 text-amber-400 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={`avg-star-${star}`}
                  className={`w-5 h-5 ${
                    totalCount > 0 && star <= Math.round(averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-brand-cocoa-border fill-brand-cream'
                  }`}
                />
              ))}
            </div>

            <p className="text-xs font-mono text-brand-cocoa-light">
              Based on {totalCount} verified {totalCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Star Distribution Bars */}
          <div className="md:col-span-8 bg-white border border-brand-cocoa-border rounded-2xl p-6 space-y-2.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-cocoa block mb-1">
              Rating Breakdown
            </span>
            {[5, 4, 3, 2, 1].map((starLevel) => {
              const count = ratingCounts[starLevel] || 0;
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              const isSelected = selectedStarFilter === starLevel;

              return (
                <button
                  key={`bar-${starLevel}`}
                  type="button"
                  onClick={() => setSelectedStarFilter(isSelected ? 'all' : starLevel)}
                  className={`w-full flex items-center gap-3 text-xs font-mono py-1 px-2 rounded-lg transition-all text-left cursor-pointer ${
                    isSelected ? 'bg-brand-pink-light/30 ring-1 ring-brand-pink/50' : 'hover:bg-brand-cream-light/30'
                  }`}
                >
                  <span className="w-12 flex items-center gap-1 text-brand-cocoa font-bold shrink-0">
                    <span>{starLevel}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </span>

                  <div className="flex-1 h-2.5 bg-brand-cream border border-brand-cocoa-border/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span className="w-10 text-right text-brand-cocoa-light text-[11px] shrink-0">
                    {pct}%
                  </span>
                  <span className="w-8 text-right text-brand-cocoa-light/60 text-[10px] shrink-0">
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Review Form / Existing User Review Section */}
        <div id="user-review-panel" className="border border-brand-cocoa-border rounded-2xl p-6 bg-brand-cream/20">
          {!currentUser ? (
            /* Signed-out Call to Action */
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-pink-light/40 border border-brand-pink/30 flex items-center justify-center mx-auto text-brand-pink">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-brand-cocoa">
                Tasted this dessert? Share your experience!
              </h3>
              <p className="text-xs text-brand-cocoa-light max-w-md mx-auto">
                Sign in with Google to post your rating, flavor thoughts, and help other bakery connoisseurs choose.
              </p>
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="px-6 py-2.5 bg-brand-pink text-white rounded-full font-mono font-bold text-xs hover:bg-brand-pink-dark transition-all shadow-md cursor-pointer inline-flex items-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in to write a review</span>
              </button>
            </div>
          ) : userExistingReview && !isEditing ? (
            /* Existing Review Preview Card */
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-brand-cocoa-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Your Review</span>
                  </span>
                  <span className="text-xs text-brand-cocoa-light font-mono">
                    Posted on {formatDate(userExistingReview.createdAt)}
                    {userExistingReview.updatedAt && ' (edited)'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 text-xs font-mono font-bold bg-white text-brand-cocoa border border-brand-cocoa-border rounded-lg hover:border-brand-pink hover:text-brand-pink transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {deleteConfirmId === userExistingReview.id ? (
                    <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2 py-1 rounded-lg">
                      <span className="text-[11px] text-red-700 font-mono font-bold">Delete?</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(userExistingReview.id)}
                        className="text-[10px] font-mono font-bold text-white bg-red-600 px-2 py-0.5 rounded hover:bg-red-700 cursor-pointer"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-[10px] font-mono text-brand-cocoa-light hover:text-brand-cocoa px-1 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(userExistingReview.id)}
                      className="px-3 py-1.5 text-xs font-mono font-bold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Star Rating Display */}
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={`user-star-${star}`}
                      className={`w-4 h-4 ${
                        star <= userExistingReview.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-brand-cocoa-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-mono font-bold text-brand-cocoa">
                  {userExistingReview.rating} out of 5 stars
                </span>
              </div>

              {/* Review Comment Text */}
              <p className="text-sm font-sans text-brand-cocoa leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-brand-cocoa-border/60">
                "{userExistingReview.comment}"
              </p>
            </div>
          ) : (
            /* Review Creation / Editing Form */
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="flex items-center justify-between border-b border-brand-cocoa-border/40 pb-3">
                <h3 className="font-display font-bold text-base text-brand-cocoa flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-pink" />
                  <span>{isEditing ? 'Edit Your Review' : `Review ${productName}`}</span>
                </h3>

                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setComment('');
                      setFormError(null);
                    }}
                    className="text-xs font-mono text-brand-cocoa-light hover:text-brand-cocoa flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Edit</span>
                  </button>
                )}
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Interactive Star Picker */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light block">
                  Your Overall Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeRating = hoverRating || rating;
                    const isFilled = star <= activeRating;
                    return (
                      <button
                        key={`input-star-${star}`}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded hover:scale-115 transition-transform cursor-pointer focus:outline-none"
                        title={`${star} Star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-brand-cocoa-border hover:text-amber-200'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-mono font-bold text-brand-cocoa ml-2">
                    {hoverRating || rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Comment Textarea */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <label htmlFor="review-comment-textarea" className="text-[10px] font-bold font-mono uppercase tracking-wider text-brand-cocoa-light">
                    Your Review & Tasting Notes
                  </label>
                  <span className={`text-[10px] font-mono ${
                    comment.length > 950 ? 'text-red-500 font-bold' : 'text-brand-cocoa-light'
                  }`}>
                    {comment.length} / 1000
                  </span>
                </div>
                <textarea
                  id="review-comment-textarea"
                  rows={4}
                  maxLength={1000}
                  placeholder="How was the texture, sweetness, crumb, and presentation? Would you recommend this to a fellow dessert lover?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-white border border-brand-cocoa-border rounded-xl px-4 py-3 text-sm text-brand-cocoa placeholder-brand-cocoa-light/50 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all resize-y"
                  required
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setComment('');
                      setFormError(null);
                    }}
                    className="px-4 py-2 text-xs font-mono font-bold text-brand-cocoa-light hover:text-brand-cocoa border border-brand-cocoa-border rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || !comment.trim()}
                  className={`px-6 py-2.5 rounded-xl font-mono font-bold text-xs text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                    isSubmitting || !comment.trim()
                      ? 'bg-brand-cocoa-border text-brand-cocoa-light cursor-not-allowed opacity-70'
                      : 'bg-brand-pink hover:bg-brand-pink-dark shadow-brand-pink/20'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isEditing ? 'Save Review Updates' : 'Publish Review'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Filter and Sort Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          {/* Star Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-cocoa-light flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-brand-pink" />
              <span>Filter:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedStarFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                selectedStarFilter === 'all'
                  ? 'bg-brand-cocoa text-white'
                  : 'bg-brand-cream border border-brand-cocoa-border/60 text-brand-cocoa hover:border-brand-pink'
              }`}
            >
              All ({totalCount})
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={`filter-pill-${star}`}
                type="button"
                onClick={() => setSelectedStarFilter(star)}
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  selectedStarFilter === star
                    ? 'bg-brand-pink text-white'
                    : 'bg-brand-cream border border-brand-cocoa-border/60 text-brand-cocoa hover:border-brand-pink'
                }`}
              >
                <span>{star}</span>
                <Star className={`w-3 h-3 ${selectedStarFilter === star ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}`} />
                <span className="text-[10px] opacity-80">({ratingCounts[star] || 0})</span>
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-brand-cocoa-light" />
            <label htmlFor="reviews-sort-select" className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-cocoa-light">
              Sort by:
            </label>
            <select
              id="reviews-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-mono font-semibold text-brand-cocoa bg-white border border-brand-cocoa-border rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-brand-pink cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-brand-cocoa-light space-y-2">
              <span className="w-6 h-6 border-2 border-brand-pink border-t-transparent rounded-full animate-spin inline-block" />
              <p className="text-xs font-mono">Loading gourmet reviews...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center text-xs text-red-700">
              {error}
            </div>
          ) : displayedReviews.length === 0 ? (
            <div className="bg-brand-cream/30 border border-dashed border-brand-cocoa-border rounded-2xl p-10 text-center space-y-2">
              <p className="text-sm font-display font-bold text-brand-cocoa">
                {selectedStarFilter === 'all'
                  ? 'No reviews yet for this confectionery.'
                  : `No ${selectedStarFilter}-star reviews found.`}
              </p>
              <p className="text-xs text-brand-cocoa-light max-w-sm mx-auto">
                {selectedStarFilter === 'all'
                  ? 'Be the very first patron to leave your tasting feedback above!'
                  : 'Try selecting another star rating filter or reset to view all.'}
              </p>
              {selectedStarFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedStarFilter('all')}
                  className="text-xs font-mono font-bold text-brand-pink underline hover:text-brand-pink-dark mt-2 cursor-pointer"
                >
                  View all reviews
                </button>
              )}
            </div>
          ) : (
            displayedReviews.map((rev) => {
              const isAuthor = currentUser && currentUser.uid === rev.userId;
              const canDelete = isAuthor || isAdminOrChef;

              return (
                <div
                  key={`review-${rev.id}`}
                  className="bg-white border border-brand-cocoa-border rounded-2xl p-5 space-y-3 shadow-3xs hover:border-brand-pink-accent/40 transition-all text-left"
                >
                  {/* Top Bar: User & Star Rating & Time */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {rev.userPhoto ? (
                        <img
                          src={rev.userPhoto}
                          alt={rev.userName}
                          className="w-9 h-9 rounded-full object-cover border border-brand-cocoa-border shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-brand-pink-light text-brand-pink-dark text-xs font-bold font-mono flex items-center justify-center border border-brand-pink/30 shrink-0">
                          {(rev.userName || 'U')[0].toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-sans font-bold text-sm text-brand-cocoa">
                            {rev.userName}
                          </span>
                          {isAuthor && (
                            <span className="text-[9px] font-mono font-bold bg-brand-pink text-white px-1.5 py-0.2 rounded-full">
                              You
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Verified Connoisseur
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={`review-star-${rev.id}-${star}`}
                                className={`w-3.5 h-3.5 ${
                                  star <= rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-brand-cocoa-border/60'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-mono text-brand-cocoa-light">
                            {formatDate(rev.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Admin / Author Delete Action */}
                    {canDelete && (
                      <div>
                        {deleteConfirmId === rev.id ? (
                          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2 py-1 rounded-lg">
                            <span className="text-[10px] text-red-700 font-mono font-bold">Confirm delete?</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(rev.id)}
                              className="text-[10px] font-mono font-bold text-white bg-red-600 px-2 py-0.5 rounded hover:bg-red-700 cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-[10px] font-mono text-brand-cocoa-light hover:text-brand-cocoa px-1 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(rev.id)}
                            className="p-1.5 text-brand-cocoa-light/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title={isAdminOrChef && !isAuthor ? 'Moderate / Delete Review (Admin)' : 'Delete your review'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Review Text Body */}
                  <p className="text-sm font-sans text-brand-cocoa leading-relaxed whitespace-pre-line pl-12">
                    {rev.comment}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
