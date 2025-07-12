import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, CircleOff } from "lucide-react";
import { Link, useLocation } from "wouter";
import ImageUpload from "@/components/image-upload";

const addItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  brand: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  size: z.string().optional(),
  condition: z.string().min(1, "Condition is required"),
  color: z.string().optional(),
  material: z.string().optional(),
  tags: z.string().optional(),
  pointsOption: z.enum(["auto", "manual"]),
  customPoints: z.string().optional(),
});

type AddItemFormData = z.infer<typeof addItemSchema>;

export default function AddItem() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

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

  const form = useForm<AddItemFormData>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      title: "",
      description: "",
      brand: "",
      category: "",
      size: "",
      condition: "",
      color: "",
      material: "",
      tags: "",
      pointsOption: "auto",
      customPoints: "",
    },
  });

  const watchedCategory = form.watch("category");
  const watchedCondition = form.watch("condition");
  const watchedPointsOption = form.watch("pointsOption");

  const addItemMutation = useMutation({
    mutationFn: async (data: AddItemFormData) => {
      const formData = new FormData();
      
      // Add images
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });
      
      // Add form data
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("condition", data.condition);
      formData.append("points", getCalculatedPoints().toString());
      
      if (data.brand) formData.append("brand", data.brand);
      if (data.size) formData.append("size", data.size);
      if (data.color) formData.append("color", data.color);
      if (data.material) formData.append("material", data.material);
      if (data.tags) formData.append("tags", data.tags);
      
      const response = await fetch("/api/items", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Item Listed Successfully",
        description: "Your item has been submitted for review and will be available soon!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "items"] });
      setLocation("/dashboard");
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
        description: "Failed to list item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getCalculatedPoints = () => {
    const { category, condition, pointsOption, customPoints } = form.getValues();
    
    if (pointsOption === "manual" && customPoints) {
      return parseInt(customPoints);
    }
    
    // Auto-calculate based on category and condition
    let basePoints = 100;
    
    // Category multiplier
    const categoryMultipliers: Record<string, number> = {
      "outerwear": 1.5,
      "shoes": 1.4,
      "dresses": 1.3,
      "accessories": 1.2,
      "tops": 1.1,
      "bottoms": 1.0,
    };
    
    // Condition multiplier
    const conditionMultipliers: Record<string, number> = {
      "like-new": 2.0,
      "excellent": 1.8,
      "very-good": 1.5,
      "good": 1.2,
      "fair": 1.0,
    };
    
    basePoints *= categoryMultipliers[category] || 1.0;
    basePoints *= conditionMultipliers[condition] || 1.0;
    
    return Math.round(basePoints);
  };

  const onSubmit = (data: AddItemFormData) => {
    if (selectedImages.length === 0) {
      toast({
        title: "Images Required",
        description: "Please upload at least one image of your item.",
        variant: "destructive",
      });
      return;
    }
    
    addItemMutation.mutate(data);
  };

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

  const categories = [
    { value: "tops", label: "Tops" },
    { value: "bottoms", label: "Bottoms" },
    { value: "outerwear", label: "Outerwear" },
    { value: "dresses", label: "Dresses" },
    { value: "shoes", label: "Shoes" },
    { value: "accessories", label: "Accessories" },
  ];

  const conditions = [
    { value: "like-new", label: "Like New" },
    { value: "excellent", label: "Excellent" },
    { value: "very-good", label: "Very Good" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
  ];

  const sizes = [
    { value: "xs", label: "XS" },
    { value: "s", label: "S" },
    { value: "m", label: "M" },
    { value: "l", label: "L" },
    { value: "xl", label: "XL" },
    { value: "xxl", label: "XXL" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">List a New Item</CardTitle>
            <p className="text-gray-600">Share your unused clothing with the ReWear community</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Image Upload */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Photos</Label>
                <ImageUpload
                  onImagesChange={setSelectedImages}
                  maxImages={5}
                />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Item Title *</Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    placeholder="e.g., Vintage Denim Jacket"
                  />
                  {form.formState.errors.title && (
                    <p className="text-red-600 text-sm mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    {...form.register("brand")}
                    placeholder="e.g., Levi's"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Describe your item, including condition, style, and any special features..."
                  rows={4}
                />
                {form.formState.errors.description && (
                  <p className="text-red-600 text-sm mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              {/* Category, Size, Condition */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => form.setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-red-600 text-sm mt-1">
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="size">Size</Label>
                  <Select onValueChange={(value) => form.setValue("size", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="condition">Condition *</Label>
                  <Select onValueChange={(value) => form.setValue("condition", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.condition && (
                    <p className="text-red-600 text-sm mt-1">
                      {form.formState.errors.condition.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Color and Material */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    {...form.register("color")}
                    placeholder="e.g., Classic Blue"
                  />
                </div>
                <div>
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    {...form.register("material")}
                    placeholder="e.g., 100% Cotton"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  {...form.register("tags")}
                  placeholder="e.g., vintage, casual, summer (comma-separated)"
                />
              </div>

              {/* Point Value */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Point Value</h3>
                <RadioGroup
                  value={watchedPointsOption}
                  onValueChange={(value) => form.setValue("pointsOption", value as "auto" | "manual")}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="auto" id="auto-points" />
                    <Label htmlFor="auto-points">Auto-calculate points based on condition and category</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manual" id="manual-points" />
                    <Label htmlFor="manual-points">Set custom point value</Label>
                    {watchedPointsOption === "manual" && (
                      <Input
                        type="number"
                        {...form.register("customPoints")}
                        placeholder="180"
                        className="w-24 ml-2"
                      />
                    )}
                  </div>
                </RadioGroup>
                <div className="flex items-center space-x-2 mt-3 text-sm text-gray-600">
                  <CircleOff className="h-4 w-4" />
                  <span>
                    Estimated value: <span className="font-semibold text-primary">
                      {getCalculatedPoints()} points
                    </span>
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => form.reset()}
                >
                  Clear Form
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={addItemMutation.isPending}
                >
                  {addItemMutation.isPending ? "Listing Item..." : "List Item"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
