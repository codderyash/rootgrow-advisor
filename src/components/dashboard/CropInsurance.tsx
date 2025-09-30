import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Calculator, FileText, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InsuranceQuote {
  premium: number;
  coverage: number;
  roi: number;
  recommendations: string[];
  eligibility: boolean;
  documents: string[];
}

export default function CropInsurance() {
  const [formData, setFormData] = useState({
    cropType: "",
    area: "",
    location: "",
    soilType: "",
    irrigationType: "",
    previousYield: "",
    riskFactors: ""
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [quote, setQuote] = useState<InsuranceQuote | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cropTypes = [
    "Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Soybean", 
    "Pulses", "Groundnut", "Sunflower", "Mustard", "Other"
  ];

  const soilTypes = [
    "Alluvial", "Black", "Red", "Laterite", "Desert", "Mountain", "Other"
  ];

  const irrigationTypes = [
    "Rainfed", "Canal", "Tube well", "Drip", "Sprinkler", "Other"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateInsurance = async () => {
    if (!formData.cropType || !formData.area || !formData.location) {
      setError("Please fill in all required fields");
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('crop-insurance', {
        body: { farmData: formData }
      });

      if (functionError) throw functionError;
      
      setQuote(data);
    } catch (error) {
      console.error('Insurance calculation error:', error);
      setError('Failed to calculate insurance. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Crop Insurance</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Insurance Calculator
            </CardTitle>
            <CardDescription>
              Get personalized crop insurance quotes and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type *</Label>
                <Select value={formData.cropType} onValueChange={(value) => handleInputChange('cropType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropTypes.map((crop) => (
                      <SelectItem key={crop} value={crop.toLowerCase()}>
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area (acres) *</Label>
                <Input
                  id="area"
                  type="number"
                  placeholder="5"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  min="0.1"
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="District, State"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="soilType">Soil Type</Label>
                <Select value={formData.soilType} onValueChange={(value) => handleInputChange('soilType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    {soilTypes.map((soil) => (
                      <SelectItem key={soil} value={soil.toLowerCase()}>
                        {soil}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="irrigationType">Irrigation Type</Label>
                <Select value={formData.irrigationType} onValueChange={(value) => handleInputChange('irrigationType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select irrigation" />
                  </SelectTrigger>
                  <SelectContent>
                    {irrigationTypes.map((irrigation) => (
                      <SelectItem key={irrigation} value={irrigation.toLowerCase()}>
                        {irrigation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="previousYield">Previous Yield (tons/acre)</Label>
                <Input
                  id="previousYield"
                  type="number"
                  placeholder="2.5"
                  value={formData.previousYield}
                  onChange={(e) => handleInputChange('previousYield', e.target.value)}
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <Button
              onClick={calculateInsurance}
              disabled={isCalculating}
              className="w-full bg-gradient-primary"
            >
              {isCalculating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  Calculating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Calculate Insurance
                </div>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {quote && (
          <Card className="card-glow border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Insurance Quote
                {quote.eligibility ? (
                  <Badge className="bg-success text-success-foreground">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Eligible
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Eligible
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">₹{quote.premium.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Annual Premium</div>
                </div>
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-success">₹{quote.coverage.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Coverage Amount</div>
                </div>
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <div className="text-2xl font-bold text-warning">{quote.roi}%</div>
                  <div className="text-sm text-muted-foreground">ROI Protection</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Recommendations:
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {quote.recommendations.map((rec, index) => (
                      <li key={index} className="text-muted-foreground">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Required Documents:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {quote.documents.map((doc, index) => (
                      <Badge key={index} variant="outline">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {quote.eligibility && (
                <Button className="w-full bg-gradient-primary">
                  Apply for Insurance
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}