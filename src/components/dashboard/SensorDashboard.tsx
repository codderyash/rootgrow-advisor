import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Thermometer, 
  Droplets, 
  Zap, 
  CloudRain,
  Leaf,
  TrendingUp,
  TrendingDown,
  Minus,
  Sun,
  Cloud,
  CloudDrizzle
} from "lucide-react";

interface SensorData {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

interface WeatherForecast {
  day: string;
  temp: number;
  description: string;
}

export default function SensorDashboard() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [recommendedCrop, setRecommendedCrop] = useState<string>("");
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulate sensor data
  const simulateSensorData = (): SensorData => {
    return {
      N: Math.round(Math.random() * 140),
      P: Math.round(Math.random() * 145 + 5),
      K: Math.round(Math.random() * 205 + 5),
      temperature: Math.round((Math.random() * 30 + 10) * 10) / 10,
      humidity: Math.round(Math.random() * 68 + 30),
      ph: Math.round((Math.random() * 5 + 4) * 10) / 10,
      rainfall: Math.round(Math.random() * 280 + 20)
    };
  };

  // Mock crop recommendation based on sensor data
  const getCropRecommendation = (data: SensorData): string => {
    const crops = ["Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Soybean", "Tomato", "Potato"];
    // Simple logic for demo - in real app this would be ML model
    if (data.temperature > 25 && data.humidity > 70) return "Rice";
    if (data.temperature < 20 && data.rainfall < 100) return "Wheat";
    if (data.N > 80 && data.P > 60) return "Maize";
    return crops[Math.floor(Math.random() * crops.length)];
  };

  // Mock weather forecast
  const generateWeatherForecast = (): WeatherForecast[] => {
    const days = ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5"];
    const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Heavy Rain"];
    
    return days.map(day => ({
      day,
      temp: Math.round(Math.random() * 15 + 20),
      description: conditions[Math.floor(Math.random() * conditions.length)]
    }));
  };

  useEffect(() => {
    const updateData = () => {
      const newSensorData = simulateSensorData();
      setSensorData(newSensorData);
      setRecommendedCrop(getCropRecommendation(newSensorData));
      setWeatherForecast(generateWeatherForecast());
      setLastUpdate(new Date());
    };

    updateData();
    const interval = setInterval(updateData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (value: number, optimal: number) => {
    if (value > optimal * 1.1) return <TrendingUp className="h-4 w-4 text-success" />;
    if (value < optimal * 0.9) return <TrendingDown className="h-4 w-4 text-warning" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getWeatherIcon = (description: string) => {
    if (description.includes("Sunny")) return <Sun className="h-5 w-5 text-warning" />;
    if (description.includes("Rain")) return <CloudDrizzle className="h-5 w-5 text-primary" />;
    return <Cloud className="h-5 w-5 text-muted-foreground" />;
  };

  if (!sensorData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
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
          <h1 className="text-3xl font-bold">Agricultural Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time sensor data and crop recommendations
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Current Recommendation */}
      <Card className="card-glow border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            Crop Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">{recommendedCrop}</p>
              <p className="text-muted-foreground">Based on current conditions</p>
            </div>
            <Badge variant="secondary" className="bg-success/20 text-success">
              Optimal Match
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sensor Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Temperature */}
        <Card className="sensor-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{sensorData.temperature}°C</div>
              {getTrendIcon(sensorData.temperature, 25)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Optimal: 20-30°C
            </p>
          </CardContent>
        </Card>

        {/* Humidity */}
        <Card className="sensor-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Humidity</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{sensorData.humidity}%</div>
              {getTrendIcon(sensorData.humidity, 60)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Optimal: 50-70%
            </p>
          </CardContent>
        </Card>

        {/* pH Level */}
        <Card className="sensor-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">pH Level</CardTitle>
            <Zap className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{sensorData.ph}</div>
              {getTrendIcon(sensorData.ph, 6.5)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Optimal: 6.0-7.5
            </p>
          </CardContent>
        </Card>

        {/* Rainfall */}
        <Card className="sensor-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rainfall</CardTitle>
            <CloudRain className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{sensorData.rainfall}mm</div>
              {getTrendIcon(sensorData.rainfall, 150)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* NPK Nutrients */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle>Soil Nutrients (NPK)</CardTitle>
          <CardDescription>Nitrogen, Phosphorus, and Potassium levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
              <div className="text-2xl font-bold text-green-500">{sensorData.N}</div>
              <div className="text-sm text-muted-foreground">Nitrogen (N)</div>
              <div className="text-xs text-green-600 mt-1">Good for leafy growth</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20">
              <div className="text-2xl font-bold text-orange-500">{sensorData.P}</div>
              <div className="text-sm text-muted-foreground">Phosphorus (P)</div>
              <div className="text-xs text-orange-600 mt-1">Root development</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-500">{sensorData.K}</div>
              <div className="text-sm text-muted-foreground">Potassium (K)</div>
              <div className="text-xs text-purple-600 mt-1">Disease resistance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Forecast */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle>5-Day Weather Forecast</CardTitle>
          <CardDescription>Mumbai region weather outlook</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {weatherForecast.map((forecast, index) => (
              <div key={index} className="text-center p-3 rounded-lg bg-muted/50">
                <div className="font-medium text-sm mb-2">{forecast.day}</div>
                <div className="flex justify-center mb-2">
                  {getWeatherIcon(forecast.description)}
                </div>
                <div className="text-lg font-bold">{forecast.temp}°C</div>
                <div className="text-xs text-muted-foreground">{forecast.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}