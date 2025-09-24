import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Tractor, 
  Droplets, 
  Zap,
  MapPin,
  Calendar,
  RefreshCw,
  BarChart3
} from "lucide-react";

interface FarmData {
  farmArea: number;
  irrigationType: string;
  fertilizerUsed: number;
  pesticideUsed: number;
  soilType: string;
  season: string;
  waterUsage: number;
}

interface YieldPrediction {
  predictedYield: number;
  confidence: number;
  recommendations: string[];
}

export default function YieldPrediction() {
  const [farmData, setFarmData] = useState<FarmData | null>(null);
  const [yieldPrediction, setYieldPrediction] = useState<YieldPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock farm data generator
  const generateFarmData = (): FarmData => {
    const irrigationTypes = ["Manual", "Sprinkler", "Flood", "Rain-fed", "Drip"];
    const soilTypes = ["Loamy", "Clay", "Silty", "Peaty", "Sandy"];
    const seasons = ["Kharif", "Rabi", "Zaid"];

    return {
      farmArea: Math.round((Math.random() * 490 + 10) * 10) / 10,
      irrigationType: irrigationTypes[Math.floor(Math.random() * irrigationTypes.length)],
      fertilizerUsed: Math.round((Math.random() * 9 + 1) * 10) / 10,
      pesticideUsed: Math.round((Math.random() * 9.5 + 0.5) * 10) / 10,
      soilType: soilTypes[Math.floor(Math.random() * soilTypes.length)],
      season: seasons[Math.floor(Math.random() * seasons.length)],
      waterUsage: Math.round(Math.random() * 80000 + 20000)
    };
  };

  // Mock yield prediction based on farm data
  const predictYield = (data: FarmData): YieldPrediction => {
    // Simple mock algorithm - in real app this would be ML model
    let baseYield = data.farmArea * 3.5; // Base yield per acre
    
    // Adjust based on irrigation
    const irrigationMultiplier = {
      "Drip": 1.3,
      "Sprinkler": 1.2,
      "Flood": 1.0,
      "Manual": 0.9,
      "Rain-fed": 0.8
    };
    baseYield *= irrigationMultiplier[data.irrigationType as keyof typeof irrigationMultiplier] || 1.0;
    
    // Adjust based on fertilizer usage
    baseYield *= Math.min(1.2, 0.8 + (data.fertilizerUsed / 10) * 0.4);
    
    // Adjust based on soil type
    const soilMultiplier = {
      "Loamy": 1.2,
      "Silty": 1.1,
      "Clay": 1.0,
      "Sandy": 0.9,
      "Peaty": 0.95
    };
    baseYield *= soilMultiplier[data.soilType as keyof typeof soilMultiplier] || 1.0;
    
    // Add some randomness
    baseYield += (Math.random() - 0.5) * baseYield * 0.2;
    
    const predictedYield = Math.round(baseYield * 10) / 10;
    const confidence = Math.round((85 + Math.random() * 10) * 10) / 10;
    
    // Generate recommendations
    const recommendations = [];
    if (data.fertilizerUsed < 3) {
      recommendations.push("Consider increasing fertilizer application for better yield");
    }
    if (data.irrigationType === "Rain-fed") {
      recommendations.push("Installing drip irrigation could increase yield by 30-40%");
    }
    if (data.pesticideUsed > 7) {
      recommendations.push("High pesticide usage detected. Consider integrated pest management");
    }
    if (data.soilType === "Sandy") {
      recommendations.push("Sandy soil may benefit from organic matter addition");
    }
    if (recommendations.length === 0) {
      recommendations.push("Your farming practices look optimal for current conditions");
    }
    
    return {
      predictedYield,
      confidence,
      recommendations
    };
  };

  const updatePrediction = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newFarmData = generateFarmData();
    const prediction = predictYield(newFarmData);
    
    setFarmData(newFarmData);
    setYieldPrediction(prediction);
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    updatePrediction();
  }, []);

  const getIrrigationIcon = (type: string) => {
    if (type.includes("Drip") || type.includes("Sprinkler")) return <Droplets className="h-4 w-4 text-blue-500" />;
    return <Droplets className="h-4 w-4 text-blue-400" />;
  };

  const getSoilTypeColor = (soil: string) => {
    const colors = {
      "Loamy": "text-green-500 bg-green-500/10 border-green-500/20",
      "Clay": "text-orange-500 bg-orange-500/10 border-orange-500/20",
      "Silty": "text-purple-500 bg-purple-500/10 border-purple-500/20",
      "Sandy": "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
      "Peaty": "text-brown-500 bg-amber-500/10 border-amber-500/20"
    };
    return colors[soil as keyof typeof colors] || "text-muted-foreground bg-muted/50 border-border";
  };

  if (!farmData || !yieldPrediction) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-muted rounded-lg"></div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Yield Prediction</h1>
          <p className="text-muted-foreground">
            AI-powered crop yield forecasting based on farm conditions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            Updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button
            onClick={updatePrediction}
            disabled={isLoading}
            variant="outline"
            className="border-primary/20 hover:bg-primary/5"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Updating..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Farm Data Card */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tractor className="h-5 w-5 text-primary" />
              Farm Configuration
            </CardTitle>
            <CardDescription>Current farm parameters for yield prediction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Farm Area */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Farm Area</span>
              </div>
              <span className="text-lg font-bold">{farmData.farmArea} acres</span>
            </div>

            {/* Irrigation Type */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                {getIrrigationIcon(farmData.irrigationType)}
                <span className="text-sm font-medium">Irrigation</span>
              </div>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">
                {farmData.irrigationType}
              </Badge>
            </div>

            {/* Soil Type */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                <span className="text-sm font-medium">Soil Type</span>
              </div>
              <Badge className={`${getSoilTypeColor(farmData.soilType)} border`}>
                {farmData.soilType}
              </Badge>
            </div>

            {/* Season */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Season</span>
              </div>
              <span className="font-medium">{farmData.season}</span>
            </div>

            {/* Resources Used */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
                <Zap className="h-4 w-4 text-green-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-500">{farmData.fertilizerUsed}t</div>
                <div className="text-xs text-green-600">Fertilizer</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                <Droplets className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-500">{farmData.waterUsage.toLocaleString()}</div>
                <div className="text-xs text-blue-600">Liters Water</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Yield Prediction Card */}
        <Card className="card-glow border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Yield Prediction
            </CardTitle>
            <CardDescription>AI-powered forecast for your crop yield</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Prediction */}
            <div className="text-center p-6 rounded-lg bg-gradient-primary/10 border border-primary/20">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
              <div className="text-4xl font-bold text-primary mb-2">
                {yieldPrediction.predictedYield} tons
              </div>
              <div className="text-sm text-muted-foreground">Expected Yield</div>
              <div className="mt-3">
                <Badge 
                  variant="secondary" 
                  className={`${yieldPrediction.confidence > 90 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}
                >
                  {yieldPrediction.confidence}% Confidence
                </Badge>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-lg font-bold">
                  {(yieldPrediction.predictedYield / farmData.farmArea).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Tons per Acre</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-lg font-bold">
                  ₹{(yieldPrediction.predictedYield * 25000).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Est. Revenue</div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">AI Recommendations</h4>
              <div className="space-y-2">
                {yieldPrediction.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-muted-foreground">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle>Yield Optimization Insights</CardTitle>
          <CardDescription>Factors affecting your predicted yield</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary-glow/10 border border-primary/20">
              <div className="text-2xl font-bold text-primary">
                {farmData.irrigationType === "Drip" ? "+30%" : farmData.irrigationType === "Sprinkler" ? "+20%" : "0%"}
              </div>
              <div className="text-sm text-muted-foreground">Irrigation Impact</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
              <div className="text-2xl font-bold text-green-500">
                {farmData.soilType === "Loamy" ? "+20%" : farmData.soilType === "Silty" ? "+10%" : "0%"}
              </div>
              <div className="text-sm text-muted-foreground">Soil Quality</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-500">
                {farmData.fertilizerUsed > 5 ? "+15%" : farmData.fertilizerUsed > 3 ? "+10%" : "0%"}
              </div>
              <div className="text-sm text-muted-foreground">Nutrition Level</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-500">
                {farmData.season === "Kharif" ? "+5%" : farmData.season === "Rabi" ? "+10%" : "0%"}
              </div>
              <div className="text-sm text-muted-foreground">Seasonal Factor</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}