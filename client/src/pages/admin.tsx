import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";
import { 
  Clock, 
  Check, 
  X, 
  Flag, 
  Package, 
  Users, 
  RefreshCw,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import type { Item } from "@shared/schema";

interface AdminStats {
  totalItems: number;
  totalUsers: number;
  totalSwaps: number;
  pendingReviews: number;
}

export default function Admin() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && isAuthenticated && !user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [user?.isAdmin, isAuthenticated, authLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
    retry: false,
  });

  const { data: pendingItems, isLoading: pendingLoading } = useQuery<Item[]>({
    queryKey: ["/api/admin/items/pending"],
    enabled: !!user?.isAdmin,
    retry: false,
  });

  const { data: flaggedItems, isLoading: flaggedLoading } = useQuery<Item[]>({
    queryKey: ["/api/admin/items/flagged"],
    enabled: !!user?.isAdmin,
    retry: false,
  });

  const approveItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("PUT", `/api/items/${itemId}`, { status: "active" });
    },
    onSuccess: () => {
      toast({
        title: "Item Approved",
        description: "Item has been approved and is now live.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
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
        description: "Failed to approve item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("PUT", `/api/items/${itemId}`, { status: "rejected" });
    },
    onSuccess: () => {
      toast({
        title: "Item Rejected",
        description: "Item has been rejected and removed from listings.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
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
        description: "Failed to reject item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("DELETE", `/api/items/${itemId}`);
    },
    onSuccess: () => {
      toast({
        title: "Item Removed",
        description: "Item has been permanently removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items/flagged"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
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
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Moderate content and manage the platform</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Pending Review</p>
                  <p className="text-2xl font-bold text-red-700">
                    {statsLoading ? <Skeleton className="h-8 w-8" /> : stats?.pendingReviews || 0}
                  </p>
                </div>
                <Clock className="text-red-600 text-2xl" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Items</p>
                  <p className="text-2xl font-bold text-green-700">
                    {statsLoading ? <Skeleton className="h-8 w-8" /> : stats?.totalItems || 0}
                  </p>
                </div>
                <Package className="text-green-600 text-2xl" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {statsLoading ? <Skeleton className="h-8 w-8" /> : stats?.totalUsers || 0}
                  </p>
                </div>
                <Users className="text-blue-600 text-2xl" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 font-medium">Total Swaps</p>
                  <p className="text-2xl font-bold text-amber-700">
                    {statsLoading ? <Skeleton className="h-8 w-8" /> : stats?.totalSwaps || 0}
                  </p>
                </div>
                <RefreshCw className="text-amber-600 text-2xl" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Awaiting Review */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Items Awaiting Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                ))
              ) : pendingItems?.length === 0 ? (
                <div className="text-center py-8">
                  <Check className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No items pending review</p>
                </div>
              ) : (
                pendingItems?.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.images?.[0] || "/placeholder-image.jpg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">
                        Listed by {item.ownerId} • {formatDate(item.createdAt!)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{item.category}</Badge>
                        <Badge className={getConditionColor(item.condition)} variant="secondary">
                          {formatCondition(item.condition)}
                        </Badge>
                        <span className="text-sm text-primary font-medium">{item.points} points</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rejectItemMutation.mutate(item.id)}
                        disabled={rejectItemMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => approveItemMutation.mutate(item.id)}
                        disabled={approveItemMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Flagged Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Flag className="mr-2 h-5 w-5" />
              Flagged Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flaggedLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                ))
              ) : flaggedItems?.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No flagged items</p>
                </div>
              ) : (
                flaggedItems?.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.images?.[0] || "/placeholder-image.jpg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">
                        Listed by {item.ownerId} • {formatDate(item.createdAt!)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{item.category}</Badge>
                        <Badge className={getConditionColor(item.condition)} variant="secondary">
                          {formatCondition(item.condition)}
                        </Badge>
                        <Badge variant="destructive">Flagged</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => approveItemMutation.mutate(item.id)}
                        disabled={approveItemMutation.isPending}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Restore
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItemMutation.mutate(item.id)}
                        disabled={removeItemMutation.isPending}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
