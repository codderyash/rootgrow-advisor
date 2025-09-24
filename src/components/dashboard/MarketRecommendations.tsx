import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  IndianRupee,
  Store,
  RefreshCw,
  Truck,
  Clock,
  Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MarketData {
  market: string;
  location: string;
  avgPrice: number;
  priceChange: number;
  distance: number;
  transportCost: number;
  rating: number;
  lastUpdated: string;
}

interface CropPrice {
  crop: string;
  currentPrice: number;
  marketTrend: "up" | "down" | "stable";
  demandLevel: "high" | "medium" | "low";
  bestSellTime: string;
}

export default function MarketRecommendations() {
  const [currentCrop] = useState("Rice"); // Would come from global state
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [cropPrices, setCropPrices] = useState<CropPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock market data generator
  const generateMarketData = (): MarketData[] => {
    const markets = [
      { name: "APMC Mumbai", location: "Mumbai, Maharashtra" },
      { name: "Azadpur Mandi", location: "Delhi, NCR" },
      { name: "Koyambedu Market", location: "Chennai, Tamil Nadu" },
      { name: "Vashi APMC", location: "Navi Mumbai, Maharashtra" },
      { name: "Bangalore APMC", location: "Bangalore, Karnataka" },
      { name: "Hyderabad Market", location: "Hyderabad, Telangana" }
    ];

    return markets.map(market => ({
      market: market.name,
      location: market.location,
      avgPrice: Math.round((Math.random() * 1000 + 1500) * 100) / 100,
      priceChange: Math.round((Math.random() * 20 - 10) * 100) / 100,
      distance: Math.round(Math.random() * 500 + 50),
      transportCost: Math.round((Math.random() * 200 + 100) * 10) / 10,
      rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
      lastUpdated: "2 hours ago"
    })).sort((a, b) => (b.avgPrice - b.transportCost) - (a.avgPrice - a.transportCost));
  };

  // Mock crop prices data
  const generateCropPrices = (): CropPrice[] => {
    const crops = [
      { crop: "Rice", trend: "up" as const },
      { crop: "Wheat", trend: "stable" as const },
      { crop: "Maize", trend: "up" as const },
      { crop: "Cotton", trend: "down" as const },
      { crop: "Sugarcane", trend: "stable" as const },
      { crop: "Soybean", trend: "up" as const }
    ];

    const demandLevels = ["high", "medium", "low"] as const;
    const sellTimes = ["Morning (6-9 AM)", "Afternoon (12-3 PM)", "Evening (4-6 PM)"];

    return crops.map(crop => ({
      crop: crop.crop,
      currentPrice: Math.round((Math.random() * 1000 + 1200) * 100) / 100,
      marketTrend: crop.trend,
      demandLevel: demandLevels[Math.floor(Math.random() * demandLevels.length)],
      bestSellTime: sellTimes[Math.floor(Math.random() * sellTimes.length)]
    }));
  };

  const updateMarketData = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setMarketData(generateMarketData());
    const aiCropPrices = await generateCropPrices();
    setCropPrices(aiCropPrices);
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    updateMarketData();
  }, []);

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <div className="h-4 w-4 bg-muted-foreground rounded-full"></div>;
  };

  const getDemandColor = (demand: string) => {
    if (demand === "high") return "bg-success/20 text-success border-success/30";
    if (demand === "medium") return "bg-warning/20 text-warning border-warning/30";
    return "bg-muted/50 text-muted-foreground border-border";
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-success";
    if (rating >= 4.0) return "text-warning";
    return "text-muted-foreground";
  };

  if (isLoading && marketData.length === 0) {
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
          <h1 className="text-3xl font-bold">Market Intelligence</h1>
          <p className="text-muted-foreground">
            Real-time market prices and selling recommendations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            Updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button
            onClick={updateMarketData}
            disabled={isLoading}
            variant="outline"
            className="border-primary/20 hover:bg-primary/5"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Updating..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Current Crop Focus */}
      <Card className="card-glow border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Current Crop: {currentCrop}
          </CardTitle>
          <CardDescription>Market analysis for your recommended crop</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary-glow/10 border border-primary/20">
              <IndianRupee className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">₹1,850</div>
              <div className="text-sm text-muted-foreground">Avg Price/Quintal</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-success/10 to-success/20 border border-success/20">
              <TrendingUp className="h-6 w-6 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-success">+8.5%</div>
              <div className="text-sm text-muted-foreground">Price Trend</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20">
              <Badge className="bg-success/20 text-success border-success/30 mb-2">High</Badge>
              <div className="text-sm text-muted-foreground">Demand Level</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
              <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-sm font-medium">6-9 AM</div>
              <div className="text-sm text-muted-foreground">Best Sell Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Markets */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Best Markets for {currentCrop}
            </CardTitle>
            <CardDescription>Ranked by net profit potential</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketData.slice(0, 5).map((market, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{market.market}</h4>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{market.location}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        {market.distance}km
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className={`h-3 w-3 ${getRatingColor(market.rating)}`} />
                        {market.rating}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      ₹{market.avgPrice}
                    </div>
                    <div className={`text-xs flex items-center gap-1 ${
                      market.priceChange > 0 ? 'text-success' : market.priceChange < 0 ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {market.priceChange > 0 ? <TrendingUp className="h-3 w-3" /> : 
                       market.priceChange < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                      {market.priceChange > 0 ? '+' : ''}{market.priceChange}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Net: ₹{(market.avgPrice - market.transportCost).toFixed(0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Crop Price Trends */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle>All Crop Prices</CardTitle>
            <CardDescription>Current market rates for different crops</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cropPrices.map((crop, index) => (
                <div key={index} className={`p-3 rounded-lg border transition-colors ${
                  crop.crop === currentCrop ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-muted/20'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{crop.crop}</h4>
                      {crop.crop === currentCrop && (
                        <Badge variant="secondary" className="text-xs bg-primary/20 text-primary">
                          Your Crop
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{crop.currentPrice}</div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(crop.marketTrend)}
                        <span className="text-xs text-muted-foreground">
                          {crop.marketTrend}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <Badge className={`${getDemandColor(crop.demandLevel)} border`}>
                      {crop.demandLevel} demand
                    </Badge>
                    <span className="text-muted-foreground">
                      Best time: {crop.bestSellTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Insights */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle>Market Insights & Tips</CardTitle>
          <CardDescription>AI-powered market analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-primary">💡 Smart Selling Tips</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-success/10 border border-success/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Peak demand for {currentCrop} is expected in the morning hours (6-9 AM)</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-sm">APMC Mumbai offers the best net price after transport costs</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Consider direct sales to reduce middleman costs by 15-20%</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-primary">📈 Market Trends</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Export demand for Indian rice is increasing by 12% this quarter</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Festive season approaching - expect 15-20% price increase</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Weather forecast suggests good harvest - plan timing carefully</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}