import React from 'react';
import { Cake, Sparkles } from 'lucide-react';

interface DashboardSkeletonProps {
  logo?: string;
  websiteName?: string;
  websiteSlogan?: string;
}

export default function DashboardSkeleton({
  logo,
  websiteName = 'THE FROSTING FAIRY',
  websiteSlogan = 'CREATING EDIBLE MAGIC',
}: DashboardSkeletonProps) {
  return (
    <div
      id="dashboard-skeleton-root"
      aria-label="Loading confectionery menu"
      className="flex-1 px-4 sm:px-6 lg:px-8 py-8 bg-brand-cream animate-fadeIn"
    >
      {/* Top Header */}
      <header id="skeleton-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div id="skeleton-header-greetings" className="flex items-center gap-4 text-left">
          <div className="w-16 h-16 rounded-full border border-brand-cocoa-border overflow-hidden bg-white shadow-xs shrink-0 p-0.5 flex items-center justify-center">
            {logo ? (
              <img
                src={logo}
                alt={websiteName}
                width="64"
                height="64"
                className="w-full h-full object-cover rounded-full opacity-80"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-brand-cocoa/10 animate-pulse" />
            )}
          </div>
          <div>
            <h2 id="skeleton-welcome-title" className="font-display font-black text-3xl text-brand-cocoa tracking-tight uppercase">
              {websiteName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p id="skeleton-welcome-subtitle" className="text-xs font-mono uppercase tracking-widest text-brand-pink-dark font-bold">
                {websiteSlogan}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-pink/10 text-brand-pink border border-brand-pink/20 animate-pulse">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Loading Menu</span>
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar Skeleton Placeholder */}
        <div id="skeleton-search-bar" className="w-full md:w-80 h-11 bg-white border border-brand-cocoa-border rounded-xl px-4 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-brand-cocoa/15 shrink-0" />
          <div className="h-3.5 w-44 rounded bg-brand-cocoa/10 animate-pulse" />
        </div>
      </header>

      {/* Hero Recipe Banner Skeleton */}
      <div
        id="skeleton-hero-banner"
        className="relative bg-white rounded-2xl border border-brand-cocoa-border overflow-hidden shadow-xs mb-8 grid grid-cols-1 lg:grid-cols-12"
      >
        {/* Left Side: Hero Image Skeleton */}
        <div className="lg:col-span-7 h-64 lg:h-96 relative bg-brand-cocoa/5 animate-pulse overflow-hidden flex items-center justify-center">
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="h-6 w-24 rounded-full bg-brand-pink/30 animate-pulse" />
            <div className="h-6 w-20 rounded-full bg-white/70 shadow-xs" />
          </div>
          <Cake className="w-16 h-16 text-brand-cocoa/15" />
        </div>

        {/* Right Side: Hero Content Skeleton */}
        <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-28 rounded bg-brand-cocoa/10 animate-pulse" />
              <div className="h-3 w-16 rounded bg-brand-cocoa/10 animate-pulse" />
            </div>

            <div className="space-y-2 pt-1">
              <div className="h-7 w-4/5 rounded-lg bg-brand-cocoa/15 animate-pulse" />
              <div className="h-7 w-2/3 rounded-lg bg-brand-cocoa/10 animate-pulse" />
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="h-3.5 w-full rounded bg-brand-cocoa/10 animate-pulse" />
              <div className="h-3.5 w-5/6 rounded bg-brand-cocoa/10 animate-pulse" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="h-6 w-20 rounded-lg bg-brand-cocoa/5 animate-pulse" />
              <div className="h-6 w-20 rounded-lg bg-brand-cocoa/5 animate-pulse" />
              <div className="h-6 w-20 rounded-lg bg-brand-cocoa/5 animate-pulse" />
            </div>
          </div>

          <div className="pt-4 border-t border-brand-cocoa-border flex items-center justify-between">
            <div>
              <div className="h-2.5 w-16 rounded bg-brand-cocoa/10 mb-1 animate-pulse" />
              <div className="h-6 w-24 rounded bg-brand-cocoa/15 animate-pulse" />
            </div>
            <div className="h-10 w-32 rounded-xl bg-brand-pink/25 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Category Pills Bar Skeleton */}
      <section id="skeleton-category-bar" className="mb-8">
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-2">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={`skeleton-cat-${index}`}
              id={`skeleton-cat-pill-${index}`}
              className="px-4 py-2.5 rounded-2xl bg-white border border-brand-cocoa-border flex items-center gap-2.5 shrink-0 shadow-2xs"
            >
              <div className="w-5 h-5 rounded-full bg-brand-pink/20 animate-pulse" />
              <div className="h-3.5 rounded bg-brand-cocoa/10 animate-pulse w-16" />
            </div>
          ))}
        </div>
      </section>

      {/* Section Header */}
      <div id="skeleton-grid-header" className="flex items-center justify-between border-b border-brand-cocoa-border/40 pb-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-brand-cocoa/15" />
          <div className="h-4 w-44 rounded bg-brand-cocoa/10 animate-pulse" />
        </div>
        <div className="h-3.5 w-20 rounded bg-brand-cocoa/10 animate-pulse" />
      </div>

      {/* Confections Cards Grid Skeleton */}
      <div
        id="skeleton-recipes-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`skeleton-card-${index}`}
            id={`skeleton-product-card-${index}`}
            className="bg-white rounded-2xl border border-brand-cocoa-border overflow-hidden shadow-2xs flex flex-col justify-between"
          >
            {/* Image Placeholder with Badge and Heart */}
            <div className="h-56 bg-brand-cocoa/5 relative overflow-hidden flex items-center justify-center animate-pulse">
              <div className="absolute top-3 left-3 h-5 w-20 rounded-full bg-white/80 shadow-2xs" />
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 shadow-2xs" />
              <Cake className="w-10 h-10 text-brand-cocoa/10" />
            </div>

            {/* Card Body Placeholder */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-brand-cocoa/10 animate-pulse" />
                <div className="h-5 w-4/5 rounded bg-brand-cocoa/15 animate-pulse" />
                <div className="space-y-1 pt-1">
                  <div className="h-3 w-full rounded bg-brand-cocoa/10 animate-pulse" />
                  <div className="h-3 w-3/5 rounded bg-brand-cocoa/10 animate-pulse" />
                </div>
              </div>

              {/* Bottom Row */}
              <div className="pt-3 border-t border-brand-cocoa-border/60 flex items-center justify-between">
                <div>
                  <div className="h-2 w-12 rounded bg-brand-cocoa/10 mb-1 animate-pulse" />
                  <div className="h-5 w-16 rounded bg-brand-cocoa/15 animate-pulse" />
                </div>
                <div className="h-8 w-20 rounded-xl bg-brand-pink/20 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
