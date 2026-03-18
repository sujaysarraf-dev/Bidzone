/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from "react";
import { store } from "../store";
import AuctionCard from "../components/AuctionCard";
import { AuctionListing } from "../types";
import { Search, Filter, Map as MapIcon, Grid, List as ListIcon, ChevronDown, Plus, Minus, ExternalLink } from "lucide-react";
import { AssetType, AuctionStatus } from "../types";
import { clsx } from "clsx";
import { motion } from "motion/react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// Fix for default marker icons in Leaflet with React
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function Auctions() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedType, setSelectedType] = useState<AssetType | "All">("All");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [auctions, setAuctions] = useState<AuctionListing[]>(store.getAuctions());

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  const filteredAuctions = useMemo(() => {
    return auctions.filter(auction => {
      const matchesSearch = auction.title.toLowerCase().includes(search.toLowerCase()) || 
                           auction.description.toLowerCase().includes(search.toLowerCase()) ||
                           auction.location.address.toLowerCase().includes(search.toLowerCase());
      const matchesType = selectedType === "All" || auction.assetType === selectedType;
      return matchesSearch && matchesType;
    });
  }, [search, selectedType, auctions]);

  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Browse Auctions</h1>
          <p className="text-neutral-500 max-w-2xl">
            Discover high-value assets from verified financial institutions. 
            Use filters to find exactly what you're looking for.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by title, description, or location..." 
                className="input-field pl-10 py-2 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900/10 cursor-pointer"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
              >
                <option value="All">All Categories</option>
                {Object.values(AssetType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode("grid")}
              className={clsx(
                "p-2 rounded-lg transition-all",
                viewMode === "grid" ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={clsx(
                "p-2 rounded-lg transition-all",
                viewMode === "list" ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <ListIcon size={18} />
            </button>
            <div className="w-px h-4 bg-neutral-200 mx-1"></div>
            <button 
              onClick={() => setViewMode("map")}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all rounded-lg",
                viewMode === "map" ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <MapIcon size={18} />
              <span className="hidden sm:inline">Map View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {filteredAuctions.length > 0 ? (
          <>
            {viewMode === "map" ? (
              <div className="bg-neutral-100 rounded-[3rem] h-[600px] relative overflow-hidden border border-neutral-200 shadow-xl">
                <MapContainer 
                  center={[28.3949, 84.1240]} 
                  zoom={7} 
                  style={{ height: "100%", width: "100%", zIndex: 0 }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filteredAuctions.map((auction) => (
                    <Marker 
                      key={auction.id} 
                      position={[auction.location.latitude, auction.location.longitude]}
                    >
                      <Popup className="custom-popup">
                        <div className="p-1 min-w-[200px]">
                          <img 
                            src={auction.images[0]} 
                            className="w-full h-24 object-cover rounded-lg mb-2" 
                            referrerPolicy="no-referrer"
                          />
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">{auction.assetType}</p>
                          <h4 className="font-bold text-sm mb-1">{auction.title}</h4>
                          <p className="text-xs text-neutral-500 mb-2">{auction.location.address}</p>
                          <div className="flex justify-between items-center">
                            <p className="font-bold text-neutral-900">Rs. {auction.currentBid.toLocaleString()}</p>
                            <button 
                              onClick={() => navigate(`/auctions/${auction.id}`)}
                              className="text-neutral-900 hover:text-emerald-600 transition-colors"
                            >
                              <ExternalLink size={16} />
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>

                <div className="absolute top-8 left-8 z-[400] flex flex-col gap-2">
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-3xl border border-neutral-200 shadow-xl max-w-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <h4 className="font-bold text-sm">Live Asset Map</h4>
                    </div>
                    <p className="text-[10px] text-neutral-500 leading-relaxed">
                      Currently viewing <strong>{filteredAuctions.length}</strong> active auctions across Nepal.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={clsx(
                "grid gap-8",
                viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              )}>
                {filteredAuctions.map(auction => (
                  <AuctionCard key={auction.id} auction={auction as AuctionListing} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-200">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-neutral-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">No auctions found</h3>
            <p className="text-neutral-500">Try adjusting your search or filters to find what you're looking for.</p>
            <button 
              onClick={() => { setSearch(""); setSelectedType("All"); }}
              className="mt-6 text-neutral-900 font-bold underline underline-offset-4"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
