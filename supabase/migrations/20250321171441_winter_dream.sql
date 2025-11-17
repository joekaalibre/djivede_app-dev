/*
  # Add Page Views Function
  
  1. New Function
    - Creates a stored function to get page view counts
    - Properly handles aggregation with GROUP BY
    
  2. Security
    - Function is accessible to authenticated users
*/

CREATE OR REPLACE FUNCTION get_page_views()
RETURNS TABLE (
  page_url text,
  view_count bigint
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    page_url,
    COUNT(*) as view_count
  FROM user_interactions
  WHERE interaction_type = 'page_view'
  GROUP BY page_url
  ORDER BY view_count DESC;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_page_views() TO authenticated;