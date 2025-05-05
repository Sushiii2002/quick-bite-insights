
import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { fetchNutritionSummary, fetchFoodLogs, fetchUserProfile } from '@/services/supabaseService';
import { ChartContainer } from '@/components/ui/chart';

type TimeFrame = 'day' | 'week' | 'month';

interface NutrientData {
  name: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
  percentage: number;
}

const AnalysisReports = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('day');
  const [nutritionData, setNutritionData] = useState<any[]>([]);
  const [macroData, setMacroData] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [nutrientData, setNutrientData] = useState<NutrientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  const MACRO_COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  const loadData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      let startDate = new Date();
      let endDate = new Date();
      
      if (timeFrame === 'day') {
        startDate.setDate(startDate.getDate() - 7); // Last 7 days for daily view
      } else if (timeFrame === 'week') {
        startDate.setDate(startDate.getDate() - 28); // Last 4 weeks for weekly view
      } else {
        startDate.setMonth(startDate.getMonth() - 6); // Last 6 months for monthly view
      }
      
      // Start date should be at beginning of day
      startDate.setHours(0, 0, 0, 0);
      
      // Get user profile for nutrient goals
      const profile = await fetchUserProfile(user.id);
      let nutrientGoals = {
        fiber: 25,
        vitaminC: 90,
        calcium: 1000,
        iron: 18,
        sodium: 2300
      };
      
      // Load nutrition data
      const summaryData = await fetchNutritionSummary(
        user.id,
        timeFrame,
        startDate,
        endDate
      );
      
      const logs = await fetchFoodLogs(user.id, undefined, startDate, endDate);
      
      // Calculate macro distribution
      const totalMacros = {
        protein: 0,
        carbs: 0,
        fat: 0
      };
      
      // Progress data for weight and calories
      const weightProgressMap = new Map();
      
      logs.forEach(log => {
        totalMacros.protein += log.protein;
        totalMacros.carbs += log.carbs;
        totalMacros.fat += log.fat;
        
        const dateKey = log.loggedAt.toISOString().split('T')[0];
        if (!weightProgressMap.has(dateKey)) {
          weightProgressMap.set(dateKey, {
            date: dateKey,
            calories: 0,
            weight: profile?.weight || 70 // Default weight if not available
          });
        }
        
        const entry = weightProgressMap.get(dateKey);
        entry.calories += log.calories;
      });
      
      // Generate progress data sorted by date
      const progressArray = Array.from(weightProgressMap.values())
        .sort((a, b) => a.date.localeCompare(b.date));
      
      // Add small random variations to weight to simulate weight tracking
      let currentWeight = profile?.weight || 70;
      progressArray.forEach((day, index) => {
        // Apply small random fluctuation
        if (index > 0) {
          const calorieDeficit = day.calories - 2000; // Assuming 2000 is maintenance
          const weightChange = calorieDeficit / 7700 * 0.5; // Very approximate weight change + random factor
          currentWeight = Math.round((currentWeight + weightChange + (Math.random() * 0.4 - 0.2)) * 10) / 10;
        }
        day.weight = currentWeight;
      });
      
      // Create macro distribution data for pie chart
      const macroTotal = totalMacros.protein + totalMacros.carbs + totalMacros.fat;
      const macroDistribution = [
        { 
          name: 'Protein', 
          value: totalMacros.protein,
          percentage: Math.round((totalMacros.protein / macroTotal) * 100) || 0,
        },
        { 
          name: 'Carbs', 
          value: totalMacros.carbs,
          percentage: Math.round((totalMacros.carbs / macroTotal) * 100) || 0,
        },
        { 
          name: 'Fat', 
          value: totalMacros.fat,
          percentage: Math.round((totalMacros.fat / macroTotal) * 100) || 0,
        }
      ];
      
      // Create nutrient breakdown data
      // In a real app, this would come from API data about micronutrients
      const nutrients: NutrientData[] = [
        {
          name: 'Fiber',
          value: Math.round(logs.reduce((sum, log) => sum + (log.fiber || 0), 0)),
          goal: nutrientGoals.fiber,
          unit: 'g',
          color: '#10b981',
          percentage: 0
        },
        {
          name: 'Vitamin C',
          value: 75,
          goal: nutrientGoals.vitaminC,
          unit: 'mg',
          color: '#f59e0b',
          percentage: 0
        },
        {
          name: 'Calcium',
          value: 850,
          goal: nutrientGoals.calcium,
          unit: 'mg',
          color: '#3b82f6',
          percentage: 0
        },
        {
          name: 'Iron',
          value: 12,
          goal: nutrientGoals.iron,
          unit: 'mg',
          color: '#ef4444',
          percentage: 0
        },
        {
          name: 'Sodium',
          value: 1500,
          goal: nutrientGoals.sodium,
          unit: 'mg',
          color: '#8b5cf6',
          percentage: 0
        },
      ];
      
      // Calculate percentages for nutrient data
      nutrients.forEach(nutrient => {
        nutrient.percentage = Math.round((nutrient.value / nutrient.goal) * 100);
      });
      
      // Update state with all our calculated data
      setMacroData(macroDistribution);
      setProgressData(progressArray);
      setNutrientData(nutrients);
      
      // Fallback to manual data processing if RPC fails
      if (!summaryData || summaryData.length === 0) {
        const groupedData = new Map();
        
        logs.forEach(log => {
          const date = new Date(log.loggedAt);
          let key;
          
          if (timeFrame === 'day') {
            // Format: YYYY-MM-DD
            key = date.toISOString().split('T')[0];
          } else if (timeFrame === 'week') {
            // Get week number
            const weekNumber = getWeekNumber(date);
            key = `W${weekNumber}`;
          } else {
            // Format: YYYY-MM
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          }
          
          if (!groupedData.has(key)) {
            groupedData.set(key, {
              date: key,
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              fiber: 0,
              count: 0
            });
          }
          
          const entry = groupedData.get(key);
          entry.calories += log.calories;
          entry.protein += log.protein;
          entry.carbs += log.carbs;
          entry.fat += log.fat;
          entry.fiber += (log.fiber || 0);
          entry.count += 1;
        });
        
        setNutritionData(Array.from(groupedData.values())
          .sort((a, b) => a.date.localeCompare(b.date)));
      } else {
        setNutritionData(summaryData);
      }
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, timeFrame]);

  // Helper function to get week number
  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Generate mock data for meal timing distribution
  const mealTimingData = useMemo(() => {
    const data = [];
    for (let hour = 5; hour < 24; hour++) {
      data.push({
        time: `${hour}:00`,
        calories: Math.floor(Math.random() * 400) + (hour >= 12 && hour <= 14 ? 400 : hour >= 18 && hour <= 20 ? 500 : 100)
      });
    }
    return data;
  }, [timeFrame]);

  // Generate mock category breakdown data
  const categoryBreakdownData = useMemo(() => [
    { name: 'Protein Foods', calories: 420 },
    { name: 'Vegetables', calories: 180 },
    { name: 'Fruits', calories: 240 },
    { name: 'Grains', calories: 350 },
    { name: 'Dairy', calories: 220 },
    { name: 'Fats & Oils', calories: 190 },
    { name: 'Sweets', calories: 150 },
    { name: 'Beverages', calories: 120 },
  ], [timeFrame]);

  const renderNutrientProgress = (nutrient: NutrientData) => {
    const percentage = Math.min(nutrient.percentage, 100);
    let barColor;
    
    // Color based on how close to goal
    if (percentage < 50) barColor = 'bg-red-400';
    else if (percentage < 80) barColor = 'bg-yellow-400';
    else barColor = 'bg-green-400';

    return (
      <div key={nutrient.name} className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-sm">{nutrient.name}</span>
          <span className="text-sm">
            {nutrient.value}{nutrient.unit} / {nutrient.goal}{nutrient.unit}
          </span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`${barColor} h-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Analysis Reports</h1>
        <p className="text-sm text-muted-foreground">Track your nutrition patterns over time</p>
      </div>

      <div className="mb-4">
        <Tabs 
          defaultValue="day" 
          value={timeFrame} 
          onValueChange={(value) => setTimeFrame(value as TimeFrame)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="day">Daily</TabsTrigger>
            <TabsTrigger value="week">Weekly</TabsTrigger>
            <TabsTrigger value="month">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-8">
        {/* Daily Calorie Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Daily Calorie Intake</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
                Loading chart data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={nutritionData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      if (timeFrame === 'day') {
                        return value.substring(5); // Just show MM-DD
                      }
                      return value;
                    }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="calories" fill="#4ECDC4" name="Calories" />
                </BarChart>
              </ResponsiveContainer>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              This chart provides an immediate visual indication of whether you're meeting your calorie goals.
            </p>
          </CardContent>
        </Card>

        {/* Macro Distribution Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Macro Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
                Loading chart data...
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="w-full md:w-1/2">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={macroData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={MACRO_COLORS[index % MACRO_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}g`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="space-y-4">
                    {macroData.map((macro, index) => (
                      <div key={macro.name} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: MACRO_COLORS[index % MACRO_COLORS.length] }}
                        ></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span>{macro.name}</span>
                            <span className="font-semibold">{macro.percentage}%</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{Math.round(macro.value)}g</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              A healthy diet typically consists of 10-35% protein, 45-65% carbs, and 20-35% fat of total daily calories.
            </p>
          </CardContent>
        </Card>

        {/* Nutrient Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Nutrient Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {nutrientData.map(renderNutrientProgress)}
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Monitoring your micronutrient intake is crucial for overall health and preventing nutritional deficiencies.
            </p>
          </CardContent>
        </Card>

        {/* Calorie Source Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Calorie Source Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryBreakdownData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="calories" fill="#F97316" name="Calories" />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-xs text-muted-foreground">
              Visualizing which food categories contribute most to your daily calories can help identify areas for potential adjustment.
            </p>
          </CardContent>
        </Card>

        {/* Meal Timing/Distribution Graph */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Meal Timing Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mealTimingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calories" fill="#8B5CF6" name="Calories" />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-xs text-muted-foreground">
              Research suggests that not just what but when you eat may impact weight management.
            </p>
          </CardContent>
        </Card>

        {/* Progress Over Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
                Loading chart data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => value.substring(5)} />
                  <YAxis yAxisId="left" orientation="left" stroke="#4ECDC4" />
                  <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="calories" 
                    name="Calories" 
                    stroke="#4ECDC4" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="weight" 
                    name="Weight (kg)" 
                    stroke="#8884d8" 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              A dual-axis chart showing calorie intake alongside weight changes helps understand the relationship between consumption and results.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AnalysisReports;
