
-- This file is for documentation purposes only. Run this SQL in the Supabase SQL editor.

-- Create a function to get the most frequently logged foods
CREATE OR REPLACE FUNCTION public.get_favorite_foods(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 6
)
RETURNS SETOF public.food_logs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (food_name) *
  FROM public.food_logs
  WHERE user_id = user_id_param
  ORDER BY food_name, logged_at DESC
  LIMIT limit_param;
END;
$$;

-- Create a function to get nutrition summary by period
CREATE OR REPLACE FUNCTION public.get_nutrition_summary(
  user_id_param UUID,
  period_param TEXT DEFAULT 'day',
  start_date_param TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date_param TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  date TEXT,
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fat NUMERIC,
  fiber NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF period_param = 'day' THEN
    RETURN QUERY
    SELECT
      TO_CHAR(DATE_TRUNC('day', logged_at), 'YYYY-MM-DD') as date,
      SUM(calories) as calories,
      SUM(protein) as protein,
      SUM(carbs) as carbs,
      SUM(fat) as fat,
      SUM(COALESCE(fiber, 0)) as fiber
    FROM public.food_logs
    WHERE 
      user_id = user_id_param
      AND (start_date_param IS NULL OR logged_at >= start_date_param)
      AND (end_date_param IS NULL OR logged_at <= end_date_param)
    GROUP BY DATE_TRUNC('day', logged_at)
    ORDER BY date;
  ELSIF period_param = 'week' THEN
    RETURN QUERY
    SELECT
      'W' || TO_CHAR(DATE_TRUNC('week', logged_at), 'IW') as date,
      SUM(calories) as calories,
      SUM(protein) as protein,
      SUM(carbs) as carbs,
      SUM(fat) as fat,
      SUM(COALESCE(fiber, 0)) as fiber
    FROM public.food_logs
    WHERE 
      user_id = user_id_param
      AND (start_date_param IS NULL OR logged_at >= start_date_param)
      AND (end_date_param IS NULL OR logged_at <= end_date_param)
    GROUP BY DATE_TRUNC('week', logged_at)
    ORDER BY MIN(logged_at);
  ELSE -- month
    RETURN QUERY
    SELECT
      TO_CHAR(DATE_TRUNC('month', logged_at), 'YYYY-MM') as date,
      SUM(calories) as calories,
      SUM(protein) as protein,
      SUM(carbs) as carbs,
      SUM(fat) as fat,
      SUM(COALESCE(fiber, 0)) as fiber
    FROM public.food_logs
    WHERE 
      user_id = user_id_param
      AND (start_date_param IS NULL OR logged_at >= start_date_param)
      AND (end_date_param IS NULL OR logged_at <= end_date_param)
    GROUP BY DATE_TRUNC('month', logged_at)
    ORDER BY date;
  END IF;
END;
$$;
