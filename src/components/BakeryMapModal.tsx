import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Compass, Phone, Clock, Sparkles, ExternalLink, X, Search } from 'lucide-react';

export const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

export const hasValidMapsKey = Boolean(GOOGLE_MAPS_API_KEY) && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY';

// The Frosting Fairy Kitchens & Studio locations
export const BAKERY_LOCATIONS = [
  {
    id: 'studio-flagship',
    name: 'The Frosting Fairy — Flagship Boutique',
    address: '14 Blossom Boulevard, Central Patisserie Hub, Mumbai',
    city: 'Mumbai',
    phone: '+91 98200 12345',
    hours: '10:00 AM – 9:00 PM (Daily)',
    position: { lat: 19.0760, lng: 72.8777 },
    specialty: 'Signature tiered cakes, tasting lounge & live decorating counter',
    isMain: true
  },
  {
    id: 'studio-express',
    name: 'The Frosting Fairy — Express Bakehouse',
    address: '42 Fairy Garden Way, West Gourmet Arcade, Bandra',
    city: 'Mumbai',
    phone: '+91 98200 67890',
    hours: '11:00 AM – 11:00 PM (Tue-Sun)',
    position: { lat: 19.0596, lng: 72.8295 },
    specialty: 'Fresh cookies box, stuffed bombolonis & cupcakes pickup point',
    isMain: false
  }
];

export function MapsApiKeyBanner({ onClose }: { onClose?: () => void }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-brand-cocoa max-w-xl mx-auto shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-brand-cocoa">Google Maps API Key Required</h3>
            {onClose && (
              <button onClick={onClose} className="text-brand-cocoa/50 hover:text-brand-cocoa">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-brand-cocoa/80 leading-relaxed">
            To view live interactive Google Maps, search delivery addresses, and compute route directions:
          </p>
          <div className="bg-white/80 rounded-xl p-3 border border-amber-200/60 text-xs space-y-1.5 font-mono">
            <p><strong>Step 1:</strong> Open <strong>Settings</strong> (⚙️ gear icon, top-right corner)</p>
            <p><strong>Step 2:</strong> Select <strong>Secrets</strong></p>
            <p><strong>Step 3:</strong> Add <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">GOOGLE_MAPS_PLATFORM_KEY</code></p>
            <p><strong>Step 4:</strong> Paste your API key & press <strong>Enter</strong></p>
          </div>
          <p className="text-[11px] text-brand-cocoa/70 pt-1">
            ✨ The app rebuilds automatically once the secret is saved.
          </p>
        </div>
      </div>
    </div>
  );
}

interface LocationMarkerProps {
  loc: typeof BAKERY_LOCATIONS[0];
  isSelected: boolean;
  onSelect: () => void;
  key?: string;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ loc, isSelected, onSelect }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={loc.position}
        onClick={onSelect}
        title={loc.name}
      >
        <Pin
          background={isSelected ? '#D45B7A' : '#6B3E26'}
          glyphColor="#FFFFFF"
          borderColor="#FFF"
          scale={isSelected ? 1.2 : 1.0}
        />
      </AdvancedMarker>

      {isSelected && (
        <InfoWindow anchor={marker} onCloseClick={onSelect}>
          <div className="p-1 max-w-xs text-brand-cocoa font-sans">
            <div className="flex items-center gap-1.5 text-brand-pink text-xs font-bold font-mono uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              {loc.isMain ? 'Flagship Store' : 'Express Pickup'}
            </div>
            <h4 className="font-serif font-bold text-sm text-brand-cocoa">{loc.name}</h4>
            <p className="text-xs text-brand-cocoa/80 mt-1 flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-pink shrink-0 mt-0.5" />
              {loc.address}
            </p>
            <div className="mt-2 pt-2 border-t border-brand-cocoa-border/40 text-[11px] space-y-1 text-brand-cocoa/70">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-brand-pink" />
                {loc.hours}
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-brand-pink" />
                {loc.phone}
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${loc.position.lat},${loc.position.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-center bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors shadow-sm"
            >
              Get Directions
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export function BakeryStoreMapModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedLocId, setSelectedLocId] = useState<string>(BAKERY_LOCATIONS[0].id);

  if (!isOpen) return null;

  const selectedLoc = BAKERY_LOCATIONS.find(l => l.id === selectedLocId) || BAKERY_LOCATIONS[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-brand-cocoa-border">
        {/* Header */}
        <div className="px-6 py-4 bg-brand-cream/80 border-b border-brand-cocoa-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-brand-pink">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-brand-cocoa">Boutique & Studio Locator</h3>
              <p className="text-xs text-brand-cocoa/70 font-mono">Visit us for tastings, direct pickups & bespoke consultations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-brand-pink/10 border border-brand-cocoa-border/60 flex items-center justify-center text-brand-cocoa transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[450px]">
          {/* Location list sidebar */}
          <div className="lg:col-span-4 p-5 bg-white border-r border-brand-cocoa-border overflow-y-auto space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-pink mb-2">
              Select Bakery Location
            </h4>
            {BAKERY_LOCATIONS.map((loc) => {
              const isSel = loc.id === selectedLocId;
              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocId(loc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSel
                      ? 'bg-brand-pink/10 border-brand-pink shadow-sm'
                      : 'bg-brand-cream/40 border-brand-cocoa-border hover:bg-brand-cream'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-serif font-bold text-sm text-brand-cocoa">{loc.name}</h5>
                    {loc.isMain && (
                      <span className="text-[9px] font-mono px-2 py-0.5 bg-brand-pink text-white rounded-full font-bold uppercase">
                        Main
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-cocoa/80 mt-1 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-pink shrink-0 mt-0.5" />
                    {loc.address}
                  </p>
                  <p className="text-[11px] text-brand-cocoa/60 mt-1 italic">
                    {loc.specialty}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-brand-cocoa/80 pt-2 border-t border-brand-cocoa-border/40">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-brand-pink" />
                      {loc.hours}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="p-3.5 rounded-2xl bg-brand-cream border border-brand-cocoa-border/60 text-xs text-brand-cocoa/80 space-y-1">
              <p className="font-bold flex items-center gap-1 text-brand-pink">
                <Navigation className="w-3.5 h-3.5" /> Direct Delivery Radius
              </p>
              <p className="text-[11px]">
                We deliver all signature cakes, cookies & confectionery across a 25km radius in temperature-controlled bakery vans.
              </p>
            </div>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-8 h-[350px] lg:h-auto relative bg-brand-cream flex flex-col justify-center">
            {hasValidMapsKey ? (
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="weekly">
                <Map
                  defaultCenter={selectedLoc.position}
                  center={selectedLoc.position}
                  defaultZoom={13}
                  mapId="FROSTING_FAIRY_STORE_MAP"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: '100%', height: '100%', minHeight: '380px' }}
                >
                  {BAKERY_LOCATIONS.map((loc) => (
                    <LocationMarker
                      key={loc.id}
                      loc={loc}
                      isSelected={loc.id === selectedLocId}
                      onSelect={() => setSelectedLocId(loc.id)}
                    />
                  ))}
                </Map>
              </APIProvider>
            ) : (
              <div className="p-8">
                <MapsApiKeyBanner />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-brand-cream/60 border-t border-brand-cocoa-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-brand-cocoa/70 font-mono">
            Selected: <strong className="text-brand-cocoa">{selectedLoc.name}</strong>
          </span>
          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLoc.position.lat},${selectedLoc.position.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-pink hover:bg-brand-pink-dark text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5" />
              Open in Google Maps
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-brand-cream border border-brand-cocoa-border text-brand-cocoa font-medium rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
