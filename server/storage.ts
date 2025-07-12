import {
  users,
  items,
  swaps,
  wishlists,
  type User,
  type UpsertUser,
  type Item,
  type InsertItem,
  type Swap,
  type InsertSwap,
  type Wishlist,
  type InsertWishlist,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Item operations
  getItems(filters?: {
    category?: string;
    condition?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Item[]>;
  getItemById(id: number): Promise<Item | undefined>;
  getItemsByOwner(ownerId: string): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, updates: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: number): Promise<boolean>;
  
  // Swap operations
  getSwapsByUser(userId: string): Promise<Swap[]>;
  getSwapById(id: number): Promise<Swap | undefined>;
  createSwap(swap: InsertSwap): Promise<Swap>;
  updateSwap(id: number, updates: Partial<InsertSwap>): Promise<Swap | undefined>;
  
  // Wishlist operations
  getWishlistByUser(userId: string): Promise<Wishlist[]>;
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: string, itemId: number): Promise<boolean>;
  
  // Admin operations
  getPendingItems(): Promise<Item[]>;
  getFlaggedItems(): Promise<Item[]>;
  getStats(): Promise<{
    totalItems: number;
    totalUsers: number;
    totalSwaps: number;
    pendingReviews: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Item operations
  async getItems(filters?: {
    category?: string;
    condition?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Item[]> {
    let query = db.select().from(items);
    
    const conditions = [];
    
    if (filters?.category) {
      conditions.push(eq(items.category, filters.category));
    }
    
    if (filters?.condition) {
      conditions.push(eq(items.condition, filters.condition));
    }
    
    if (filters?.status) {
      conditions.push(eq(items.status, filters.status));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          ilike(items.title, `%${filters.search}%`),
          ilike(items.description, `%${filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(desc(items.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
  }

  async getItemById(id: number): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async getItemsByOwner(ownerId: string): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.ownerId, ownerId)).orderBy(desc(items.createdAt));
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db.insert(items).values(item).returning();
    return newItem;
  }

  async updateItem(id: number, updates: Partial<InsertItem>): Promise<Item | undefined> {
    const [updatedItem] = await db
      .update(items)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(items.id, id))
      .returning();
    return updatedItem;
  }

  async deleteItem(id: number): Promise<boolean> {
    const result = await db.delete(items).where(eq(items.id, id));
    return result.rowCount > 0;
  }

  // Swap operations
  async getSwapsByUser(userId: string): Promise<Swap[]> {
    return await db
      .select()
      .from(swaps)
      .where(or(eq(swaps.requesterUserId, userId), eq(swaps.ownerUserId, userId)))
      .orderBy(desc(swaps.createdAt));
  }

  async getSwapById(id: number): Promise<Swap | undefined> {
    const [swap] = await db.select().from(swaps).where(eq(swaps.id, id));
    return swap;
  }

  async createSwap(swap: InsertSwap): Promise<Swap> {
    const [newSwap] = await db.insert(swaps).values(swap).returning();
    return newSwap;
  }

  async updateSwap(id: number, updates: Partial<InsertSwap>): Promise<Swap | undefined> {
    const [updatedSwap] = await db
      .update(swaps)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(swaps.id, id))
      .returning();
    return updatedSwap;
  }

  // Wishlist operations
  async getWishlistByUser(userId: string): Promise<Wishlist[]> {
    return await db.select().from(wishlists).where(eq(wishlists.userId, userId));
  }

  async addToWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    const [newWishlist] = await db.insert(wishlists).values(wishlist).returning();
    return newWishlist;
  }

  async removeFromWishlist(userId: string, itemId: number): Promise<boolean> {
    const result = await db
      .delete(wishlists)
      .where(and(eq(wishlists.userId, userId), eq(wishlists.itemId, itemId)));
    return result.rowCount > 0;
  }

  // Admin operations
  async getPendingItems(): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.status, "pending")).orderBy(desc(items.createdAt));
  }

  async getFlaggedItems(): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.status, "flagged")).orderBy(desc(items.createdAt));
  }

  async getStats(): Promise<{
    totalItems: number;
    totalUsers: number;
    totalSwaps: number;
    pendingReviews: number;
  }> {
    const [itemCount] = await db.select({ count: sql<number>`count(*)` }).from(items);
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [swapCount] = await db.select({ count: sql<number>`count(*)` }).from(swaps);
    const [pendingCount] = await db.select({ count: sql<number>`count(*)` }).from(items).where(eq(items.status, "pending"));

    return {
      totalItems: itemCount.count,
      totalUsers: userCount.count,
      totalSwaps: swapCount.count,
      pendingReviews: pendingCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
