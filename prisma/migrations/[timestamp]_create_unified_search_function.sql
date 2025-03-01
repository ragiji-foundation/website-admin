CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION unified_search(search_text text)
RETURNS TABLE (
    source_table text,
    source_column text,
    record_id text,
    match_text text,
    similarity_score float
) AS $$
BEGIN
    RETURN QUERY
    -- Search in success_stories
    SELECT 
        'success_stories' as source_table,
        'title' as source_column,
        id::text as record_id,
        title as match_text,
        similarity(title, search_text) as similarity_score
    FROM success_stories
    WHERE similarity(title, search_text) > 0.1
    
    UNION ALL
    
    -- Search in blogs
    SELECT 
        'blogs' as source_table,
        'title' as source_column,
        id::text as record_id,
        title as match_text,
        similarity(title, search_text) as similarity_score
    FROM blogs
    WHERE similarity(title, search_text) > 0.1
    
    UNION ALL
    
    -- Search in initiatives
    SELECT 
        'initiatives' as source_table,
        'title' as source_column,
        id::text as record_id,
        title as match_text,
        similarity(title, search_text) as similarity_score
    FROM initiatives
    WHERE similarity(title, search_text) > 0.1;
END;
$$ LANGUAGE plpgsql;
