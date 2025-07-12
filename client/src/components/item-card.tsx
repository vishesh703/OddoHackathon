import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Coins } from "lucide-react";
import type { Item } from "@shared/schema";

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-square bg-gray-100 overflow-hidden">
        <img
          src={item.images?.[0] || "/placeholder-image.jpg"}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
          <Badge className={getConditionColor(item.condition)} variant="secondary">
            {formatCondition(item.condition)}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1 text-primary">
            <Coins className="h-4 w-4" />
            <span className="font-semibold">{item.points}</span>
            <span className="text-sm">points</span>
          </div>
          <Link href={`/item/${item.id}`}>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
