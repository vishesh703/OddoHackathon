import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { 
  Coins, 
  RefreshCw, 
  Heart, 
  ArrowLeft, 
  Star, 
  Leaf,
  Share2
} from "lucide-react";
import { Link } from "wouter";
import type { Item, User } from "@shared/schema";

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [swapMessage, setSwapMessage] = useState("");
  const [pointsOffer, setPointsOffer] = useState("");

  const { data: item, isLoading } = useQuery<Item>({
    queryKey: ["/api/items", id],
    enabled: !!id,
  });

  const { data: itemOwner } = useQuery<User>({
    queryKey: ["/api/users", item?.ownerId],
    enabled: !!item?.ownerId,
  });

  const swapMutation = useMutation({
    mutationFn: async (swapData: { 
      requestedItemId: number; 
      ownerUserId: string; 
      pointsOffered?: number; 
      message?: string; 
    }) => {
      await apiRequest("POST", "/api/swaps", swapData);
    },
    onSuccess: () => {
      toast({
        title: "Swap Request Sent",
        description: "Your swap request has been sent successfully!",
      });
      setSwapMessage("");
      setPointsOffer("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send swap request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const wishlistMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("POST", "/api/wishlist", { itemId });
    },
    onSuccess: () => {
      toast({
        title: "Added to Wishlist",
        description: "Item has been added to your wishlist!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add to wishlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSwapRequest = () => {
    if (!item || !user) return;

    const points = pointsOffer ? parseInt(pointsOffer) : undefined;
    
    if (points && points > (user.points || 0)) {
      toast({
        title: "Insufficient Points",
        description: "You don't have enough points for this offer.",
        variant: "destructive",
      });
      return;
    }

    swapMutation.mutate({
      requestedItemId: item.id,
      ownerUserId: item.ownerId,
      pointsOffered: points,
      message: swapMessage,
    });
  };

  const handleWishlist = () => {
    if (!item) return;
    wishlistMutation.mutate(item.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <Skeleton className="aspect-square w-full rounded-xl mb-4" />
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square w-full rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h2>
          <p className="text-gray-600 mb-4">The item you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "like-new":
        return "bg-green-100 text-green-800";
      case "excellent":
        return "bg-blue-100 text-blue-800";
      case "very-good":
        return "bg-yellow-100 text-yellow-800";
      case "good":
        return "bg-orange-100 text-orange-800";
      case "fair":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCondition = (condition: string) => {
    return condition.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  const isOwnItem = user?.id === item.ownerId;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Browse
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={item.images?.[selectedImage] || "/placeholder-image.jpg"}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            {item.images && item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? "border-primary" : "border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <Badge className={getConditionColor(item.condition)} variant="secondary">
                  {formatCondition(item.condition)}
                </Badge>
                {item.size && (
                  <Badge variant="outline">Size: {item.size.toUpperCase()}</Badge>
                )}
                {item.category && (
                  <Badge variant="outline">{item.category}</Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-primary text-2xl font-bold">
                <Coins className="h-6 w-6" />
                <span>{item.points}</span>
                <span className="text-lg">points</span>
              </div>
            </div>

            {/* Description */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>

            {/* Item Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Item Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {item.brand && (
                  <div>
                    <span className="text-gray-600">Brand:</span>
                    <span className="font-medium ml-2">{item.brand}</span>
                  </div>
                )}
                {item.color && (
                  <div>
                    <span className="text-gray-600">Color:</span>
                    <span className="font-medium ml-2">{item.color}</span>
                  </div>
                )}
                {item.material && (
                  <div>
                    <span className="text-gray-600">Material:</span>
                    <span className="font-medium ml-2">{item.material}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium ml-2">{item.category}</span>
                </div>
              </div>
              {item.tags && item.tags.length > 0 && (
                <div className="mt-4">
                  <span className="text-gray-600 text-sm">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Listed by */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Listed by</h3>
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={itemOwner?.profileImageUrl || ""} alt={itemOwner?.firstName || ""} />
                  <AvatarFallback>
                    {itemOwner?.firstName?.[0] || itemOwner?.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">
                    {itemOwner?.firstName} {itemOwner?.lastName}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    Member since {new Date(itemOwner?.createdAt || "").getFullYear()}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwnItem && (
              <div className="border-t pt-6 space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Request Swap
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Swap</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="points">Points to Offer (Optional)</Label>
                        <input
                          id="points"
                          type="number"
                          value={pointsOffer}
                          onChange={(e) => setPointsOffer(e.target.value)}
                          placeholder="Enter points to offer"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          max={user?.points || 0}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Available: {user?.points || 0} points
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="message">Message (Optional)</Label>
                        <Textarea
                          id="message"
                          value={swapMessage}
                          onChange={(e) => setSwapMessage(e.target.value)}
                          placeholder="Add a message to your swap request..."
                          className="w-full"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={handleSwapRequest}
                          disabled={swapMutation.isPending}
                          className="flex-1"
                        >
                          {swapMutation.isPending ? "Sending..." : "Send Request"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleWishlist}
                    disabled={wishlistMutation.isPending}
                    className="flex-1"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Add to Wishlist
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Sustainability Impact */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 text-green-700">
                <Leaf className="h-5 w-5" />
                <span className="font-medium">Sustainability Impact</span>
              </div>
              <p className="text-sm text-green-600 mt-2">
                By choosing this item, you're saving approximately 2.5kg of CO2 emissions!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
