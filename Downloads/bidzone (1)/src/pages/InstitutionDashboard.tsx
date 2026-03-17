/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { store } from "../store";
import { 
  Plus, 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  MoreVertical,
  Search,
  LogOut
} from "lucide-react";
import { AuctionListing } from "../types";
import { clsx } from "clsx";

export default function InstitutionDashboard() {
  const navigate = useNavigate();
  const auctions = store.getAuctions();
  const user = store.getUser();
  
  const stats = [
    { label: "Active Auctions", value: auctions.filter(a => a.status === "Active").length.toString(), icon: <Clock size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Recovery", value: "Rs. 4.2M", icon: <TrendingUp size={20} />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Bidders", value: "156", icon: <Users size={20} />, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Completed", value: "48", icon: <CheckCircle2 size={20} />, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const handleSignOut = () => {
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-neutral-100">
          <h2 className="text-xl font-bold tracking-tight">Institution Hub</h2>
          <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest mt-1">NICA Asia Bank</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="flex items-center gap-3 w-full px-4 py-3 bg-neutral-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-neutral-900/20">
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 text-neutral-500 hover:bg-neutral-100 rounded-xl text-sm font-bold transition-all">
            <FileText size={18} /> My Listings
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 text-neutral-500 hover:bg-neutral-100 rounded-xl text-sm font-bold transition-all">
            <Users size={18} /> Bidders
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 text-neutral-500 hover:bg-neutral-100 rounded-xl text-sm font-bold transition-all">
            <Settings size={18} /> Settings
          </button>
        </nav>

        <div className="p-4 border-t border-neutral-100">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold transition-all"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
            <p className="text-neutral-500 mt-1">Welcome back, {user?.displayName} Team.</p>
          </div>
          <button 
            onClick={() => navigate("/create-auction")}
            className="btn-primary flex items-center gap-2 py-3 px-6 shadow-xl shadow-emerald-500/20"
          >
            <Plus size={20} /> Create New Listing
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-[2rem] border border-neutral-200 shadow-sm"
            >
              <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.bg, stat.color)}>
                {stat.icon}
              </div>
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest block mb-1">{stat.label}</span>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Recent Listings */}
        <div className="bg-white border border-neutral-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Recent Listings</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input 
                type="text" 
                placeholder="Search listings..." 
                className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 transition-all"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-neutral-50 text-[10px] text-neutral-400 uppercase font-bold tracking-widest">
                  <th className="px-8 py-4">Asset Details</th>
                  <th className="px-8 py-4">Current Bid</th>
                  <th className="px-8 py-4">Bids</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {auctions.slice(0, 5).map((auction) => (
                  <tr key={auction.id} className="hover:bg-neutral-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={auction.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{auction.title}</h4>
                          <p className="text-xs text-neutral-400">{auction.assetType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-bold text-sm">Rs. {auction.currentBid.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium">{auction.bidCount}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        Active
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-neutral-50 border-t border-neutral-100 text-center">
            <button className="text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors">
              View All Listings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
