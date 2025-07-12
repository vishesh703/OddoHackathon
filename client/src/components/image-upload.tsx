import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
  existingImages?: string[];
}

export default function ImageUpload({ 
  onImagesChange, 
  maxImages = 5, 
  existingImages = [] 
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const totalImages = selectedFiles.length + existingImages.length;
    const remainingSlots = maxImages - totalImages;
    const filesToAdd = files.slice(0, remainingSlots);

    if (filesToAdd.length > 0) {
      const newFiles = [...selectedFiles, ...filesToAdd];
      setSelectedFiles(newFiles);
      
      // Create preview URLs
      const newPreviews = [...previews];
      filesToAdd.forEach(file => {
        const previewUrl = URL.createObjectURL(file);
        newPreviews.push(previewUrl);
      });
      setPreviews(newPreviews);
      
      onImagesChange(newFiles);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(previews[index]);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onImagesChange(newFiles);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const totalImages = selectedFiles.length + existingImages.length;
  const canAddMore = totalImages < maxImages;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Existing images */}
        {existingImages.map((image, index) => (
          <Card key={`existing-${index}`} className="relative">
            <CardContent className="p-2">
              <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={image}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* New image previews */}
        {previews.map((preview, index) => (
          <Card key={`preview-${index}`} className="relative">
            <CardContent className="p-2">
              <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* Upload trigger */}
        {canAddMore && (
          <Card 
            className="border-2 border-dashed border-gray-300 hover:border-primary/50 cursor-pointer transition-colors"
            onClick={triggerFileInput}
          >
            <CardContent className="p-4">
              <div className="aspect-square flex flex-col items-center justify-center text-gray-500 hover:text-primary transition-colors">
                <Upload className="h-8 w-8 mb-2" />
                <p className="text-sm text-center">Click to upload</p>
                <p className="text-xs text-center mt-1">
                  {totalImages}/{maxImages} images
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* File input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload info */}
      <div className="text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <ImageIcon className="h-4 w-4" />
          <span>Upload up to {maxImages} images (JPG, PNG, max 10MB each)</span>
        </div>
      </div>
    </div>
  );
}
