CREATE INDEX IF NOT EXISTS "user_createdAt_idx" ON "user"("createdAt");

CREATE INDEX IF NOT EXISTS "word_createdAt_idx" ON "word"("createdAt");

CREATE INDEX IF NOT EXISTS "review_last_reviewed_idx" ON "review"("last_reviewed");
