import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import { 
  Coins, 
  Package, 
  RefreshCw, 
  Clock, 
  Plus, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  TrendingUp
} from "lucide-react";
import type { Item, Swap } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

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

  const { data: userItems, isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ["/api/users", user?.id, "items"],
    enabled: !!user?.id,
    retry: false,
  });

  const { data: userSwaps, isLoading: swapsLoading } = useQuery<Swap[]>({
    queryKey: ["/api/swaps"],
    enabled: !!user?.id,
    retry: false,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const activeItems = userItems?.filter(item => item.status === "active") || [];
  const pendingItems = userItems?.filter(item => item.status === "pending") || [];
  const completedSwaps = userSwaps?.filter(swap => swap.status === "completed") || [];
  const pendingSwaps = userSwaps?.filter(swap => swap.status === "pending") || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "swapped":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.firstName || user?.email}!</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary font-medium">Points Balance</p>
                  <p className="text-2xl font-bold text-primary">{user?.points || 0}</p>
                </div>
                <Coins className="text-primary text-2xl" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Items Listed</p>
                  <p className="text-2xl font-bold text-blue-700">{userItems?.length || 0}</p>
                </div>
                <Package className="text-blue-600 text-2xl" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Successful Swaps</p>
                  <p className="text-2xl font-bold text-green-700">{completedSwaps.length}</p>
                </div>
                <RefreshCw className="text-green-600 text-2xl" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 font-medium">Pending Swaps</p>
                  <p className="text-2xl font-bold text-amber-700">{pendingSwaps.length}</p>
                </div>
                <Clock className="text-amber-600 text-2xl" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">My Items</CardTitle>
                <Link href="/add-item">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {itemsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))
                ) : userItems?.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No items listed yet</p>
                    <Link href="/add-item">
                      <Button size="sm" className="mt-2">
                        List your first item
                      </Button>
                    </Link>
                  </div>
                ) : (
                  userItems?.slice(0, 5).map((item) => (
                    <Link key={item.id} href={`/item/${item.id}`}>
                      <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={item.images?.[0] || "/placeholder-image.jpg"}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {item.status} • {item.points} points
                          </p>
                        </div>
                        <Badge className={getStatusColor(item.status)} variant="secondary">
                          {item.status}
                        </Badge>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {swapsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-3 w-32 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))
                ) : userSwaps?.length === 0 ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No swap activity yet</p>
                    <Link href="/">
                      <Button size="sm" className="mt-2">
                        Browse items to swap
                      </Button>
                    </Link>
                  </div>
                ) : (
                  userSwaps?.slice(0, 5).map((swap) => (
                    <div key={swap.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        swap.status === "completed" ? "bg-green-100" :
                        swap.status === "pending" ? "bg-yellow-100" :
                        "bg-blue-100"
                      }`}>
                        {swap.status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : swap.status === "pending" ? (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {swap.status === "completed" ? "Swap Completed" : 
                           swap.status === "pending" ? "Swap Pending" : "Swap Request"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {swap.pointsOffered ? 
                            `Points offered: ${swap.pointsOffered}` : 
                            "Direct item swap"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(swap.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
