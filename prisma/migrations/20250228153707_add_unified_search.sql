CREATE OR REPLACE FUNCTION unified_search(search_query text)
RETURNS TABLE (
  record_id text,
  match_text text,
  source_table text,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id::text as record_id,
    title as match_text,
    'success_stories' as source_table,
    similarity(title, search_query) as similarity
  FROM success_stories
  WHERE title % search_query
  UNION ALL
  SELECT
    id::text,
    title,
    'blogs',
    similarity(title, search_query)
  FROM blogs
  WHERE title % search_query
  UNION ALL
  SELECT
    id::text,
    title,
    'initiatives',
    similarity(title, search_query)
  FROM initiatives
  WHERE title % search_query
  ORDER BY similarity DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;
