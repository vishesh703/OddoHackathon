import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  points: integer("points").default(0),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Items table
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  brand: text("brand"),
  category: text("category").notNull(),
  size: text("size"),
  condition: text("condition").notNull(),
  color: text("color"),
  material: text("material"),
  tags: text("tags").array(),
  images: text("images").array(),
  points: integer("points").notNull(),
  status: text("status").notNull().default("pending"), // pending, active, swapped, removed
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Swaps table
export const swaps = pgTable("swaps", {
  id: serial("id").primaryKey(),
  requesterUserId: varchar("requester_user_id").notNull().references(() => users.id),
  ownerUserId: varchar("owner_user_id").notNull().references(() => users.id),
  requestedItemId: integer("requested_item_id").notNull().references(() => items.id),
  offeredItemId: integer("offered_item_id").references(() => items.id), // null for point-based swaps
  pointsOffered: integer("points_offered"), // null for direct swaps
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, completed
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wishlists table
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  itemId: integer("item_id").notNull().references(() => items.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  items: many(items),
  sentSwaps: many(swaps, { relationName: "requesterSwaps" }),
  receivedSwaps: many(swaps, { relationName: "ownerSwaps" }),
  wishlists: many(wishlists),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  owner: one(users, { fields: [items.ownerId], references: [users.id] }),
  requestedSwaps: many(swaps, { relationName: "requestedItemSwaps" }),
  offeredSwaps: many(swaps, { relationName: "offeredItemSwaps" }),
  wishlists: many(wishlists),
}));

export const swapsRelations = relations(swaps, ({ one }) => ({
  requester: one(users, { fields: [swaps.requesterUserId], references: [users.id], relationName: "requesterSwaps" }),
  owner: one(users, { fields: [swaps.ownerUserId], references: [users.id], relationName: "ownerSwaps" }),
  requestedItem: one(items, { fields: [swaps.requestedItemId], references: [items.id], relationName: "requestedItemSwaps" }),
  offeredItem: one(items, { fields: [swaps.offeredItemId], references: [items.id], relationName: "offeredItemSwaps" }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, { fields: [wishlists.userId], references: [users.id] }),
  item: one(items, { fields: [wishlists.itemId], references: [items.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const insertItemSchema = createInsertSchema(items).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSwapSchema = createInsertSchema(swaps).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWishlistSchema = createInsertSchema(wishlists).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;
export type InsertSwap = z.infer<typeof insertSwapSchema>;
export type Swap = typeof swaps.$inferSelect;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type Wishlist = typeof wishlists.$inferSelect;
