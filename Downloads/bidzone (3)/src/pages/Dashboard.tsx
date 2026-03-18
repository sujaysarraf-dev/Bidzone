/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { store } from "../store";
import { 
  LayoutDashboard, 
  Gavel, 
  History, 
  Settings, 
  LogOut, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  Plus,
  Bell
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { UserRole } from "../types";

const DATA = [
  { name: "Mon", bids: 4 },
  { name: "Tue", bids: 7 },
  { name: "Wed", bids: 5 },
  { name: "Thu", bids: 9 },
  { name: "Fri", bids: 12 },
  { name: "Sat", bids: 8 },
  { name: "Sun", bids: 15 },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(store.getStats());
  const [user, setUser] = useState(store.getUser());
  const [notifications, setNotifications] = useState(store.getNotifications());
  const navigate = useNavigate();

  const userBids = store.getUserBids();
  const auctions = store.getAuctions();

  // Simple recommendation logic: based on user's bid history
  const biddedAuctionIds = Object.keys(userBids);
  const biddedAssetTypes = auctions
    .filter(a => biddedAuctionIds.includes(a.id))
    .map(a => a.assetType);
  
  const recommendations = auctions
    .filter(a => !biddedAuctionIds.includes(a.id) && biddedAssetTypes.includes(a.assetType))
    .slice(0, 3);

  const activeBids = auctions.filter(a => biddedAuctionIds.includes(a.id));

  useEffect(() => {
    // Refresh stats every time the component mounts or tab changes
    setStats(store.getStats());
    setNotifications(store.getNotifications());
  }, [activeTab]);

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "active-bids", label: "Active Bids", icon: Gavel },
    { id: "history", label: "Bidding History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleSignOut = () => {
    navigate("/login");
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-neutral-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 hidden md:flex flex-col">
        <div className="p-6 flex-1">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  activeTab === item.id 
                    ? "bg-neutral-900 text-white shadow-sm" 
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6 border-t border-neutral-100">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.displayName.split(' ')[0]}</h1>
              <p className="text-neutral-500 text-sm flex items-center gap-2">
                Here's what's happening with your auctions.
                <button 
                  onClick={() => {
                    store.login(user?.email || "demo@bidzone.com", UserRole.INSTITUTION);
                    window.location.reload();
                  }}
                  className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors"
                >
                  Demo: Switch to Institution View
                </button>
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setActiveTab("notifications")}
                className="relative p-3 bg-white border border-neutral-200 rounded-xl text-neutral-500 hover:text-neutral-900 transition-all"
              >
                <Bell size={20} />
                {stats.notificationsCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              <button className="btn-primary flex items-center gap-2">
                <Plus size={20} /> New Listing
              </button>
            </div>
          </header>

          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <TrendingUp size={20} />
                    </div>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
                  </div>
                  <span className="text-neutral-500 text-sm font-medium">Active Bids</span>
                  <h3 className="text-2xl font-bold mt-1">{stats.activeBids}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                      <Clock size={20} />
                    </div>
                    <span className="text-xs font-bold text-neutral-400 bg-neutral-50 px-2 py-1 rounded-lg">Pending</span>
                  </div>
                  <span className="text-neutral-500 text-sm font-medium">Total Bidded Value</span>
                  <h3 className="text-2xl font-bold mt-1">Rs. {(stats.totalSpent / 1000000).toFixed(1)}M</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">Won</span>
                  </div>
                  <span className="text-neutral-500 text-sm font-medium">Auctions Won</span>
                  <h3 className="text-2xl font-bold mt-1">{stats.wonAuctions}</h3>
                </div>
              </div>

              {/* Chart Section */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm mb-8">
                <h3 className="font-bold mb-6">Bidding Activity</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={DATA}>
                      <defs>
                        <linearGradient id="colorBids" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: "#a3a3a3" }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: "#a3a3a3" }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="bids" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorBids)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <section className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Recommended for You</h2>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                      AI Powered
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {recommendations.map((auction) => (
                      <motion.div
                        key={auction.id}
                        whileHover={{ y: -5 }}
                        className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm group cursor-pointer"
                        onClick={() => navigate(`/auctions/${auction.id}`)}
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <img src={auction.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-xs mb-2 line-clamp-1">{auction.title}</h4>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Current Bid</p>
                              <p className="font-bold text-emerald-600 text-sm">Rs. {auction.currentBid.toLocaleString()}</p>
                            </div>
                            <button className="p-1.5 bg-neutral-900 text-white rounded-lg">
                              <ArrowUpRight size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Active Bids List */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Your Active Bids</h2>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                  <div className="divide-y divide-neutral-100">
                    {activeBids.map((auction) => (
                      <div key={auction.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden">
                            <img src={auction.images[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{auction.title}</h4>
                            <p className="text-xs text-neutral-400">Your Bid: Rs. {userBids[auction.id].toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">Rs. {auction.currentBid.toLocaleString()}</p>
                          <p className={clsx(
                            "text-[10px] font-bold uppercase tracking-wider",
                            userBids[auction.id] >= auction.currentBid ? "text-emerald-600" : "text-red-600"
                          )}>
                            {userBids[auction.id] >= auction.currentBid ? "Winning" : "Outbid"}
                          </p>
                        </div>
                      </div>
                    ))}
                    {activeBids.length === 0 && (
                      <div className="p-12 text-center text-neutral-400 text-sm">
                        You haven't placed any bids yet.
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Recent Notifications */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                  <h3 className="font-bold">Recent Notifications</h3>
                  <button 
                    onClick={() => setActiveTab("notifications")}
                    className="text-sm font-bold text-neutral-400 hover:text-neutral-900 transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="divide-y divide-neutral-100">
                  {notifications.slice(0, 3).map((n) => (
                    <div key={n.id} className="p-6 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={clsx(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          n.type === "won" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                        )}>
                          <Bell size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{n.title}</h4>
                          <p className="text-neutral-500 text-xs">{n.message}</p>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-400">Just now</span>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="p-12 text-center text-neutral-400 text-sm">
                      No recent notifications
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="bg-white rounded-[2.5rem] border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-neutral-100">
                  <h3 className="text-xl font-bold">All Notifications</h3>
                </div>
                <div className="divide-y divide-neutral-100">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-8 flex items-start gap-6 hover:bg-neutral-50 transition-colors">
                      <div className={clsx(
                        "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                        n.type === "won" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                      )}>
                        <Bell size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold">{n.title}</h4>
                          <span className="text-xs text-neutral-400">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-neutral-500 text-sm leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
