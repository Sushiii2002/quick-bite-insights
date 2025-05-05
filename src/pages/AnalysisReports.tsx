
import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { fetchNutritionSummary, fetchFoodLogs } from '@/services/supabaseService';
import { ChartContainer } from '@/components/ui/chart';

type TimeFrame = 'day' | 'week' | 'month';

const AnalysisReports = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('day');
  const [nutritionData, setNutritionData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

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
      
      const summaryData = await fetchNutritionSummary(
        user.id,
        timeFrame,
        startDate,
        endDate
      );
      
      // Fallback to manual data processing if RPC fails
      if (!summaryData || summaryData.length === 0) {
        const logs = await fetchFoodLogs(user.id, undefined, startDate, endDate);
        
        // Group by day
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

  // Generate mock progress over time data
  const progressData = useMemo(() => {
    const data = [];
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 30);
    
    let weight = 75; // Starting weight in kg
    
    for (let i = 0; i < 30; i++) {
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Small random weight fluctuation
      weight = weight + (Math.random() * 0.4 - 0.2);
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        calories: Math.floor(Math.random() * 500) + 1500,
        weight: weight.toFixed(1)
      });
    }
    
    return data;
  }, [timeFrame]);

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
        {/* Weekly Trend Line Graph */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Nutrition Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
                Loading chart data...
              </div>
            ) : (
              <ChartContainer
                config={{
                  calories: { label: 'Calories' },
                  protein: { label: 'Protein', theme: { light: '#3b82f6' } },
                  carbs: { label: 'Carbs', theme: { light: '#10b981' } },
                  fat: { label: 'Fat', theme: { light: '#ef4444' } },
                }}
                className="aspect-[2/1]"
              >
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={nutritionData}>
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
                    <Line 
                      type="monotone" 
                      dataKey="calories" 
                      stroke="var(--color-calories)" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Nutrition experts recommend tracking weekly averages rather than focusing exclusively on daily fluctuations.
            </p>
          </CardContent>
        </Card>

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
