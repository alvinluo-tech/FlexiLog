-- Shared Workouts table
CREATE TABLE IF NOT EXISTS shared_workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  workout_data JSONB NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Workout Likes
CREATE TABLE IF NOT EXISTS workout_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  shared_workout_id UUID REFERENCES shared_workouts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, shared_workout_id)
);
-- Workout Comments
CREATE TABLE IF NOT EXISTS workout_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  shared_workout_id UUID REFERENCES shared_workouts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes
CREATE INDEX idx_shared_workouts_user ON shared_workouts(user_id);
CREATE INDEX idx_shared_workouts_public ON shared_workouts(is_public, created_at DESC);
CREATE INDEX idx_workout_likes_workout ON workout_likes(shared_workout_id);
CREATE INDEX idx_workout_comments_workout ON workout_comments(shared_workout_id);
-- RLS
ALTER TABLE shared_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_comments ENABLE ROW LEVEL SECURITY;
-- Shared workouts: public read, own write
CREATE POLICY "Public workouts viewable by everyone" ON shared_workouts FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can share own workouts" ON shared_workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shares" ON shared_workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shares" ON shared_workouts FOR DELETE USING (auth.uid() = user_id);
-- Likes
CREATE POLICY "Likes viewable by everyone" ON workout_likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON workout_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON workout_likes FOR DELETE USING (auth.uid() = user_id);
-- Comments
CREATE POLICY "Comments viewable by everyone" ON workout_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON workout_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON workout_comments FOR DELETE USING (auth.uid() = user_id);
-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON shared_workouts TO authenticated;
GRANT SELECT, INSERT, DELETE ON workout_likes TO authenticated;
GRANT SELECT, INSERT, DELETE ON workout_comments TO authenticated;
GRANT SELECT ON shared_workouts TO anon;
GRANT SELECT ON workout_comments TO anon;
-- Trigger to update likes count
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE shared_workouts SET likes_count = likes_count + 1 WHERE id = NEW.shared_workout_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE shared_workouts SET likes_count = likes_count - 1 WHERE id = OLD.shared_workout_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER likes_count_trigger
  AFTER INSERT OR DELETE ON workout_likes
  FOR EACH ROW EXECUTE FUNCTION update_likes_count();
-- Trigger to update comments count
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE shared_workouts SET comments_count = comments_count + 1 WHERE id = NEW.shared_workout_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE shared_workouts SET comments_count = comments_count - 1 WHERE id = OLD.shared_workout_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER comments_count_trigger
  AFTER INSERT OR DELETE ON workout_comments
  FOR EACH ROW EXECUTE FUNCTION update_comments_count();
