-- Create a function to set CORS configuration for a bucket
create or replace function set_cors_config(bucket_name text, origins text[])
returns jsonb
language plpgsql
security definer
as $$
  declare
    bucket_id text;
    config jsonb;
    origin text;
  begin
    -- Get the bucket ID
    select id into bucket_id from storage.buckets where name = bucket_name;
    
    if bucket_id is null then
      raise exception 'Bucket % not found', bucket_name;
    end if;
    
    -- Build the CORS configuration
    config := '{"cors": [{
      "origin": ' || 
      (select jsonb_agg(origin) from unnest(origins) as origin) || 
      ',"method": ["GET", "HEAD", "OPTIONS"],' ||
      '"headers": ["Content-Type", "Authorization"],' ||
      '"max_age_seconds": 3600' ||
      '}]}';
    
    -- Update the bucket with the new CORS configuration
    update storage.buckets
    set metadata = metadata || config::jsonb
    where id = bucket_id;
    
    return config;
  end;
$$;
