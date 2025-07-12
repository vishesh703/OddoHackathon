import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Camera, RefreshCw, Heart, Coins } from "lucide-react";

export default function Landing() {
  const featuredItems = [
    {
      id: 1,
      title: "Vintage Denim Jacket",
      description: "Classic blue denim jacket, perfect for layering",
      condition: "like-new",
      points: 180,
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
    },
    {
      id: 2,
      title: "Floral Summer Dress",
      description: "Lightweight floral dress, perfect for summer",
      condition: "good",
      points: 150,
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
    },
    {
      id: 3,
      title: "Leather Boots",
      description: "Genuine leather boots, barely worn",
      condition: "excellent",
      points: 220,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
    },
    {
      id: 4,
      title: "Cozy Knit Sweater",
      description: "Soft wool blend sweater, perfect for fall",
      condition: "very-good",
      points: 135,
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
    },
  ];

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Swap, Share, Sustain</h1>
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                Transform your wardrobe sustainably. Exchange unused clothing through direct swaps or earn points for eco-friendly fashion choices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-gray-100"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Start Swapping
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Browse Items
                </Button>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-2xl font-bold">15K+</div>
                  <div className="text-green-100 text-sm">Items Swapped</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">8K+</div>
                  <div className="text-green-100 text-sm">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">2.5M</div>
                  <div className="text-green-100 text-sm">CO2 Saved (kg)</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=800" 
                alt="Sustainable Fashion Model" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <Leaf className="text-primary" />
                  <span className="text-sm font-semibold text-gray-900">100% Sustainable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Items</h2>
            <p className="text-gray-600">Discover amazing clothing waiting for a new home</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <Badge className={getConditionColor(item.condition)} variant="secondary">
                      {formatCondition(item.condition)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1 text-primary">
                      <Coins className="h-4 w-4" />
                      <span className="font-semibold">{item.points}</span>
                      <span className="text-sm">points</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => window.location.href = '/api/login'}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">Simple steps to sustainable fashion</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="text-primary text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. List Your Items</h3>
              <p className="text-gray-600">Upload photos and describe your unused clothing items</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="text-primary text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Swap or Redeem</h3>
              <p className="text-gray-600">Exchange directly with other users or use points to get items</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-primary text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Enjoy & Repeat</h3>
              <p className="text-gray-600">Get new-to-you items and contribute to sustainable fashion</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Sustainable Fashion Journey?</h2>
          <p className="text-xl mb-8 text-green-100">
            Join thousands of users making a positive impact on the planet, one swap at a time.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-gray-100"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Leaf className="text-primary text-2xl mr-2" />
                <span className="text-xl font-bold">ReWear</span>
              </div>
              <p className="text-gray-400">Sustainable fashion through community-driven clothing exchange.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">How It Works</a></li>
                <li><a href="#" className="hover:text-white">Browse Items</a></li>
                <li><a href="#" className="hover:text-white">List an Item</a></li>
                <li><a href="#" className="hover:text-white">Point System</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Safety Guidelines</a></li>
                <li><a href="#" className="hover:text-white">Community Rules</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Newsletter</a></li>
                <li><a href="#" className="hover:text-white">Social Media</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Sustainability Report</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ReWear. All rights reserved. • Privacy Policy • Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
