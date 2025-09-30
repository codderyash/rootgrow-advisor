import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, Camera, Scan, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DiseaseDetection {
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  symptoms: string[];
  treatment: string[];
  prevention: string[];
}

export default function DiseaseDetector() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detection, setDetection] = useState<DiseaseDetection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setDetection(null);
      setError(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        const { data, error: functionError } = await supabase.functions.invoke('disease-detection', {
          body: { image: base64 }
        });

        if (functionError) throw functionError;
        
        setDetection(data);
      };
      reader.readAsDataURL(selectedImage);
    } catch (error) {
      console.error('Disease detection error:', error);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-success text-success-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'high': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Scan className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Disease Detector</h1>
      </div>
      
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Upload Plant Image
          </CardTitle>
          <CardDescription>
            Take or upload a photo of your plant to detect diseases and get treatment recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Plant Image</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Choose Image
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {selectedImage && (
                <span className="text-sm text-muted-foreground">
                  {selectedImage.name}
                </span>
              )}
            </div>
          </div>

          {imagePreview && (
            <div className="space-y-3">
              <div className="border rounded-lg p-4 bg-muted/20">
                <img
                  src={imagePreview}
                  alt="Plant preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              
              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full bg-gradient-primary"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    Analyzing Image...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Scan className="h-4 w-4" />
                    Analyze for Diseases
                  </div>
                )}
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {detection && (
            <div className="space-y-4 mt-6">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Detection Results
                    <Badge className={getSeverityColor(detection.severity)}>
                      {getSeverityIcon(detection.severity)}
                      {detection.severity.toUpperCase()} RISK
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg text-primary">{detection.disease}</h4>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {detection.confidence}%
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-2">Symptoms Detected:</h5>
                      <div className="flex flex-wrap gap-2">
                        {detection.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="outline">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Recommended Treatment:</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {detection.treatment.map((treatment, index) => (
                          <li key={index} className="text-muted-foreground">
                            {treatment}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Prevention Tips:</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {detection.prevention.map((tip, index) => (
                          <li key={index} className="text-muted-foreground">
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}