/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuctionListing, UserProfile, Notification, UserRole, UserStatus, AuctionStatus, SystemSettings } from "./types";
import { MOCK_AUCTIONS } from "./constants";

// Initial state
const INITIAL_USER: UserProfile = {
  uid: "user1",
  displayName: "Demo User",
  email: "demo@bidzone.com",
  phoneNumber: "+977 9800000000",
  role: UserRole.BUYER,
  status: UserStatus.ACTIVE,
  photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
  createdAt: new Date().toISOString(),
};

const INITIAL_SETTINGS: SystemSettings = {
  categories: ["Real Estate", "Vehicle", "Machinery", "Financial Asset", "Other"],
  currencies: ["NPR", "USD", "INR"],
  timeZones: ["Asia/Kathmandu", "UTC", "Asia/Kolkata"],
  notificationTemplates: {
    "outbid": "You have been outbid on {auctionTitle}. Current bid is {currency} {amount}.",
    "won": "Congratulations! You won the auction for {auctionTitle}.",
    "new_listing": "A new {assetType} has been listed: {auctionTitle}."
  }
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    userId: "user1",
    title: "Welcome to Bidzone!",
    message: "Start exploring financial asset auctions from top institutions.",
    type: "new_listing",
    read: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "n2",
    userId: "user1",
    title: "Outbid Alert!",
    message: "You have been outbid on 'Prime Commercial Land in Kathmandu'. Current bid is NPR 52,500,000.",
    type: "outbid",
    auctionId: "1",
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "n3",
    userId: "user1",
    title: "Auction Ending Soon",
    message: "The auction for '2022 Toyota Hilux' is ending in 2 hours. Place your final bid now!",
    type: "ending_soon",
    auctionId: "2",
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  }
];

const INITIAL_USER_BIDS: Record<string, number> = {
  "2": 4600000,
  "4": 2050000,
  "6": 8700000,
};

class Store {
  private auctions: AuctionListing[] = [];
  private user: UserProfile | null = null;
  private notifications: Notification[] = [];
  private userBids: Record<string, number> = {}; // auctionId -> maxBid
  private auditLogs: { id: string; action: string; details: string; timestamp: string }[] = [];
  private users: UserProfile[] = [INITIAL_USER];
  private settings: SystemSettings = INITIAL_SETTINGS;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const savedAuctions = localStorage.getItem("bidzone_auctions");
    const savedUser = localStorage.getItem("bidzone_user");
    const savedNotifications = localStorage.getItem("bidzone_notifications");
    const savedUserBids = localStorage.getItem("bidzone_user_bids");

    this.auctions = savedAuctions ? JSON.parse(savedAuctions) : MOCK_AUCTIONS;
    this.user = savedUser ? JSON.parse(savedUser) : INITIAL_USER;
    this.notifications = savedNotifications ? JSON.parse(savedNotifications) : INITIAL_NOTIFICATIONS;
    this.userBids = savedUserBids ? JSON.parse(savedUserBids) : INITIAL_USER_BIDS;
    this.auditLogs = JSON.parse(localStorage.getItem("bidzone_audit_logs") || "[]");
    this.users = JSON.parse(localStorage.getItem("bidzone_users") || JSON.stringify([INITIAL_USER]));
    this.settings = JSON.parse(localStorage.getItem("bidzone_settings") || JSON.stringify(INITIAL_SETTINGS));

    // If no auctions in storage, save the mock ones
    if (!savedAuctions) {
      this.saveAuctions();
    }
  }

  private saveAuctions() {
    localStorage.setItem("bidzone_auctions", JSON.stringify(this.auctions));
  }

  private saveUser() {
    localStorage.setItem("bidzone_user", JSON.stringify(this.user));
  }

  private saveNotifications() {
    localStorage.setItem("bidzone_notifications", JSON.stringify(this.notifications));
  }

  private saveUserBids() {
    localStorage.setItem("bidzone_user_bids", JSON.stringify(this.userBids));
  }

  private saveAuditLogs() {
    localStorage.setItem("bidzone_audit_logs", JSON.stringify(this.auditLogs));
  }

  private saveUsers() {
    localStorage.setItem("bidzone_users", JSON.stringify(this.users));
  }

  private saveSettings() {
    localStorage.setItem("bidzone_settings", JSON.stringify(this.settings));
  }

  // Auction Methods
  getAuctions() {
    return this.auctions;
  }

  getAuctionById(id: string) {
    return this.auctions.find(a => a.id === id);
  }

  placeBid(auctionId: string, amount: number) {
    const auction = this.auctions.find(a => a.id === auctionId);
    if (!auction) return { success: false, message: "Auction not found" };
    
    if (amount <= auction.currentBid) {
      return { success: false, message: "Bid must be higher than current bid" };
    }

    // Update auction
    auction.currentBid = amount;
    auction.bidCount += 1;
    this.saveAuctions();

    // Update user bids
    this.userBids[auctionId] = amount;
    this.saveUserBids();

    // Add notification
    this.addNotification({
      title: "Bid Placed Successfully",
      message: `Your bid of NPR ${amount.toLocaleString()} for "${auction.title}" has been placed.`,
      type: "won",
    });

    return { success: true };
  }

  createAuction(data: Omit<AuctionListing, "id" | "bidCount" | "currentBid" | "createdAt">) {
    const newAuction: AuctionListing = {
      id: Math.random().toString(36).substr(2, 9),
      bidCount: 0,
      currentBid: data.basePrice,
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.auctions = [newAuction, ...this.auctions];
    this.saveAuctions();
    this.addAuditLog("Auction Created", `New auction "${newAuction.title}" created by ${newAuction.institutionName}`);
    return newAuction;
  }

  moderateAuction(id: string, status: AuctionStatus) {
    const auction = this.auctions.find(a => a.id === id);
    if (auction) {
      const oldStatus = auction.status;
      auction.status = status;
      this.saveAuctions();
      this.addAuditLog("Auction Moderated", `Auction "${auction.title}" status changed from ${oldStatus} to ${status}`);
    }
  }

  // User Methods
  getUser() {
    return this.user;
  }

  updateUser(data: Partial<UserProfile>) {
    if (this.user) {
      this.user = { ...this.user, ...data };
      this.saveUser();
      
      // Update in users list too
      const idx = this.users.findIndex(u => u.uid === this.user?.uid);
      if (idx !== -1) {
        this.users[idx] = { ...this.users[idx], ...data };
        this.saveUsers();
      }
    }
  }

  getUsers() {
    return this.users;
  }

  updateUserStatus(uid: string, status: UserStatus) {
    const user = this.users.find(u => u.uid === uid);
    if (user) {
      const oldStatus = user.status;
      user.status = status;
      this.saveUsers();
      this.addAuditLog("User Status Updated", `User ${user.displayName} status changed from ${oldStatus} to ${status}`);
      
      // If it's the current user, update them too
      if (this.user?.uid === uid) {
        this.user.status = status;
        this.saveUser();
      }
    }
  }

  getUserBids() {
    return this.userBids;
  }

  // Audit Logs
  getAuditLogs() {
    return this.auditLogs;
  }

  addAuditLog(action: string, details: string) {
    const log = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs = [log, ...this.auditLogs];
    this.saveAuditLogs();
  }

  // Notification Methods
  getNotifications() {
    return this.notifications;
  }

  addNotification(data: Omit<Notification, "id" | "createdAt" | "read" | "userId">) {
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId: this.user?.uid || "anon",
      createdAt: new Date().toISOString(),
      read: false,
      ...data,
    };
    this.notifications = [newNotification, ...this.notifications];
    this.saveNotifications();
    return newNotification;
  }

  markNotificationAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  // Settings Methods
  getSettings() {
    return this.settings;
  }

  updateSettings(data: Partial<SystemSettings>) {
    this.settings = { ...this.settings, ...data };
    this.saveSettings();
    this.addAuditLog("Settings Updated", "System configuration modified");
  }

  // Stats
  getStats() {
    const activeBids = Object.keys(this.userBids).length;
    const wonAuctions = this.auctions.filter(a => 
      a.status === "Closed" && this.userBids[a.id] === a.currentBid
    ).length;
    const totalSpent = Object.values(this.userBids).reduce((acc, val) => acc + val, 0);

    return {
      activeBids,
      wonAuctions,
      totalSpent,
      notificationsCount: this.notifications.filter(n => !n.read).length,
    };
  }
}

export const store = new Store();
