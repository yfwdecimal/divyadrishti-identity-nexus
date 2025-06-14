
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Camera, Image, X, CheckCircle, AlertTriangle } from 'lucide-react';

interface UploadedImage {
  id: string;
  file: File;
  url: string;
  status: 'processing' | 'completed' | 'error';
  confidence?: number;
  faceDetected?: boolean;
}

export function FacialRecognitionUpload({ onImageUpload }: { onImageUpload: (file: File) => void }) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        processImage(file);
      }
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(processImage);
  };

  const processImage = (file: File) => {
    const url = URL.createObjectURL(file);
    const newImage: UploadedImage = {
      id: Date.now().toString(),
      file,
      url,
      status: 'processing'
    };
    
    setUploadedImages(prev => [...prev, newImage]);
    
    // Simulate face detection processing
    setTimeout(() => {
      setUploadedImages(prev => prev.map(img => 
        img.id === newImage.id 
          ? { 
              ...img, 
              status: 'completed', 
              confidence: 0.85 + Math.random() * 0.1,
              faceDetected: Math.random() > 0.1 
            }
          : img
      ));
    }, 2000);
    
    onImageUpload(file);
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.url);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-purple-400" />
          Facial Recognition Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-purple-400 bg-purple-500/10' 
              : 'border-muted-foreground/30 hover:border-purple-400/50'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-purple-500/20">
                <Upload className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <div>
              <p className="text-lg font-medium text-white">
                Drop facial images here or click to upload
              </p>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, WebP. Max file size: 10MB
              </p>
            </div>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="mx-auto"
            >
              <Image className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Uploaded Images */}
        {uploadedImages.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-white">Uploaded Images</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {uploadedImages.map((image) => (
                <div key={image.id} className="glass-dark rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <img 
                      src={image.url} 
                      alt="Uploaded face" 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">
                          {image.file.name}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeImage(image.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {image.status === 'processing' && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Processing...</p>
                          <Progress value={65} className="h-1" />
                        </div>
                      )}
                      
                      {image.status === 'completed' && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {image.faceDetected ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-400" />
                            )}
                            <p className="text-xs text-muted-foreground">
                              {image.faceDetected ? 'Face detected' : 'No face detected'}
                            </p>
                          </div>
                          {image.confidence && (
                            <Badge variant="outline" className="text-xs">
                              {Math.round(image.confidence * 100)}% confidence
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
