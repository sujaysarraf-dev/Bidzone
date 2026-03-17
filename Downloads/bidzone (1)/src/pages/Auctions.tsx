/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from "react";
import { store } from "../store";
import AuctionCard from "../components/AuctionCard";
import { AuctionListing } from "../types";
import { Search, Filter, Map as MapIcon, Grid, List as ListIcon, ChevronDown, Plus, Minus } from "lucide-react";
import { AssetType, AuctionStatus } from "../types";
import { clsx } from "clsx";
import { motion } from "motion/react";
import { useSearchParams } from "react-router-dom";

export default function Auctions() {
  const [searchParams] = useSearchParams();
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
              <div className="bg-neutral-100 rounded-[3rem] h-[600px] relative overflow-hidden border border-neutral-200 shadow-xl flex items-center justify-center">
                {/* Nepal Map SVG Background */}
                <svg 
                  viewBox="0 0 800 450" 
                  className="w-full h-full max-w-5xl opacity-10 absolute pointer-events-none"
                  fill="currentColor"
                >
                  {/* More detailed Nepal shape */}
                  <path d="M40,240 L60,210 L100,180 L160,160 L240,150 L320,145 L400,155 L480,165 L560,180 L640,200 L720,230 L760,270 L740,330 L680,370 L600,390 L520,400 L440,405 L360,400 L280,385 L200,360 L120,330 L60,290 Z" />
                  
                  {/* Adding some jaggedness to the northern border (Himalayas) */}
                  <path d="M40,240 Q60,200 100,180 T200,155 T350,145 T500,160 T650,190 T760,270 L740,330 Q650,380 500,400 T250,370 T40,240" className="opacity-50" />
                  
                  {/* Major City Indicators (Mock) */}
                  <circle cx="420" cy="280" r="3" className="fill-neutral-900/20" /> {/* Kathmandu */}
                  <circle cx="320" cy="260" r="2" className="fill-neutral-900/20" /> {/* Pokhara */}
                  <circle cx="150" cy="250" r="2" className="fill-neutral-900/20" /> {/* Nepalgunj */}
                  <circle cx="650" cy="330" r="2" className="fill-neutral-900/20" /> {/* Biratnagar */}
                  
                  <text x="400" y="265" textAnchor="middle" className="text-5xl font-black uppercase tracking-[1.5em] fill-neutral-900/10">Nepal</text>
                </svg>

                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-50"></div>
                
                {/* Map Markers */}
                <div className="relative w-full h-full max-w-4xl aspect-[800/450]">
                  {filteredAuctions.map((auction, idx) => {
                    // Nepal approx: Lat 26-30, Lng 80-88
                    // Map viewbox: 800x450
                    // Lng 80 -> 50px, Lng 88 -> 750px
                    // Lat 30 -> 100px, Lat 26 -> 350px
                    const x = ((auction.location.longitude - 80) / 8) * 700 + 50;
                    const y = 450 - (((auction.location.latitude - 26) / 4) * 250 + 100);
                    
                    return (
                      <motion.div
                        key={auction.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.05, type: "spring" }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
                        style={{ left: `${(x / 800) * 100}%`, top: `${(y / 450) * 100}%` }}
                      >
                        <div className="relative">
                          <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg group-hover:scale-150 transition-transform duration-300"></div>
                          <div className="absolute -inset-2 bg-emerald-500/20 rounded-full animate-ping group-hover:hidden"></div>
                        </div>
                        
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover:translate-y-0">
                          <div className="bg-neutral-900 text-white p-3 rounded-2xl whitespace-nowrap shadow-2xl border border-white/10 min-w-[150px]">
                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">{auction.assetType}</p>
                            <h5 className="text-xs font-bold mb-1">{auction.title}</h5>
                            <p className="text-[10px] text-neutral-400">Rs. {auction.currentBid.toLocaleString()}</p>
                          </div>
                          <div className="w-2 h-2 bg-neutral-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="absolute top-8 left-8 flex flex-col gap-2">
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-3xl border border-neutral-200 shadow-xl max-w-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <h4 className="font-bold text-sm">Live Asset Map</h4>
                    </div>
                    <p className="text-[10px] text-neutral-500 leading-relaxed">
                      Currently viewing <strong>{filteredAuctions.length}</strong> active auctions across the provinces of Nepal.
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neutral-200 shadow-sm text-[10px] font-bold text-neutral-600">
                      Kathmandu (3)
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neutral-200 shadow-sm text-[10px] font-bold text-neutral-600">
                      Pokhara (1)
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-8 right-8 flex flex-col gap-2">
                  <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors border border-neutral-200">
                    <Plus size={20} />
                  </button>
                  <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors border border-neutral-200">
                    <Minus size={20} />
                  </button>
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
