import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertItemSchema, insertSwapSchema, insertWishlistSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Set up multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Item routes
  app.get("/api/items", async (req, res) => {
    try {
      const { category, condition, status = "active", search, limit, offset } = req.query;
      
      const filters = {
        category: category as string,
        condition: condition as string,
        status: status as string,
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };
      
      const items = await storage.getItems(filters);
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.get("/api/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getItemById(id);
      
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json(item);
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).json({ message: "Failed to fetch item" });
    }
  });

  app.post("/api/items", isAuthenticated, upload.array("images", 5), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = req.files as Express.Multer.File[];
      
      // Process uploaded images
      const imageUrls = files.map(file => `/uploads/${file.filename}`);
      
      const itemData = {
        ...req.body,
        images: imageUrls,
        ownerId: userId,
        points: parseInt(req.body.points),
        tags: req.body.tags ? req.body.tags.split(",").map((tag: string) => tag.trim()) : [],
      };
      
      const validatedData = insertItemSchema.parse(itemData);
      const item = await storage.createItem(validatedData);
      
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  app.put("/api/items/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const item = await storage.getItemById(id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      const user = await storage.getUser(userId);
      if (item.ownerId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Not authorized to update this item" });
      }
      
      const updatedItem = await storage.updateItem(id, req.body);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  app.delete("/api/items/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const item = await storage.getItemById(id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      const user = await storage.getUser(userId);
      if (item.ownerId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Not authorized to delete this item" });
      }
      
      const deleted = await storage.deleteItem(id);
      if (deleted) {
        res.json({ message: "Item deleted successfully" });
      } else {
        res.status(404).json({ message: "Item not found" });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // User items
  app.get("/api/users/:id/items", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const requesterId = req.user.claims.sub;
      
      // Users can only see their own items, unless they're admin
      const requester = await storage.getUser(requesterId);
      if (userId !== requesterId && !requester?.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const items = await storage.getItemsByOwner(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching user items:", error);
      res.status(500).json({ message: "Failed to fetch user items" });
    }
  });

  // Swap routes
  app.get("/api/swaps", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const swaps = await storage.getSwapsByUser(userId);
      res.json(swaps);
    } catch (error) {
      console.error("Error fetching swaps:", error);
      res.status(500).json({ message: "Failed to fetch swaps" });
    }
  });

  app.post("/api/swaps", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const swapData = {
        ...req.body,
        requesterUserId: userId,
      };
      
      const validatedData = insertSwapSchema.parse(swapData);
      const swap = await storage.createSwap(validatedData);
      
      res.status(201).json(swap);
    } catch (error) {
      console.error("Error creating swap:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid swap data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create swap" });
    }
  });

  app.put("/api/swaps/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const swap = await storage.getSwapById(id);
      if (!swap) {
        return res.status(404).json({ message: "Swap not found" });
      }
      
      // Only the owner or requester can update the swap
      if (swap.ownerUserId !== userId && swap.requesterUserId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this swap" });
      }
      
      const updatedSwap = await storage.updateSwap(id, req.body);
      res.json(updatedSwap);
    } catch (error) {
      console.error("Error updating swap:", error);
      res.status(500).json({ message: "Failed to update swap" });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlist = await storage.getWishlistByUser(userId);
      res.json(wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const wishlistData = {
        ...req.body,
        userId,
      };
      
      const validatedData = insertWishlistSchema.parse(wishlistData);
      const wishlist = await storage.addToWishlist(validatedData);
      
      res.status(201).json(wishlist);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid wishlist data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:itemId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.itemId);
      
      const removed = await storage.removeFromWishlist(userId, itemId);
      if (removed) {
        res.json({ message: "Removed from wishlist" });
      } else {
        res.status(404).json({ message: "Item not found in wishlist" });
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // Admin routes
  app.get("/api/admin/items/pending", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const pendingItems = await storage.getPendingItems();
      res.json(pendingItems);
    } catch (error) {
      console.error("Error fetching pending items:", error);
      res.status(500).json({ message: "Failed to fetch pending items" });
    }
  });

  app.get("/api/admin/items/flagged", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const flaggedItems = await storage.getFlaggedItems();
      res.json(flaggedItems);
    } catch (error) {
      console.error("Error fetching flagged items:", error);
      res.status(500).json({ message: "Failed to fetch flagged items" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
