-- Check current production database schema
-- Run this to see what fields currently exist in your Railway database

-- Check cards table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cards' 
    AND column_name IN ('birthDate', 'birthYear', 'deathDate', 'deathYear')
ORDER BY ordinal_position;

-- Check proposals table structure  
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'proposals' 
    AND column_name IN ('birthDate', 'birthYear', 'deathDate', 'deathYear')
ORDER BY ordinal_position;

-- Check admins table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'admins' 
    AND column_name IN ('instagramUrl', 'twitterUrl', 'facebookUrl', 'linkedinUrl', 'youtubeUrl')
ORDER BY ordinal_position;
