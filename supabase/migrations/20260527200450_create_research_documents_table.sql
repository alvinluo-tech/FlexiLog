CREATE TABLE IF NOT EXISTS research_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    document_type TEXT CHECK (document_type IN ('competitive_analysis', 'market_research', 'user_research', 'technical_doc')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE research_documents ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for now)
CREATE POLICY "Allow public read access" ON research_documents FOR SELECT USING (true);

-- Allow authenticated insert
CREATE POLICY "Allow authenticated insert" ON research_documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');;
