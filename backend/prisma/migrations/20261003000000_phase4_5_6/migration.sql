CREATE TABLE "deck" (
  "id" SERIAL NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'GENERAL',
  "level" TEXT DEFAULT 'Intermediate',
  "cover_image" TEXT,
  "is_curated" BOOLEAN NOT NULL DEFAULT true,
  "creator_id" INTEGER,
  "createdAt" BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000),
  "updatedAt" BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000),
  CONSTRAINT "deck_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "deck_word" (
  "deck_id" INTEGER NOT NULL,
  "word" TEXT NOT NULL,
  "meaning_vi" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'noun',
  "phonetic" TEXT,
  "example" TEXT,
  "audio_url" TEXT,
  "createdAt" BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000),
  CONSTRAINT "deck_word_pkey" PRIMARY KEY ("deck_id", "word")
);

CREATE TABLE "system_config" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "is_maintenance_mode" BOOLEAN NOT NULL DEFAULT false,
  "is_registration_open" BOOLEAN NOT NULL DEFAULT true,
  "rateLimit" INTEGER NOT NULL DEFAULT 100,
  "cors_enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000),
  "updatedAt" BIGINT NOT NULL DEFAULT (extract(epoch from now()) * 1000),
  CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "deck_category_idx" ON "deck"("category");
CREATE INDEX "deck_is_curated_idx" ON "deck"("is_curated");

ALTER TABLE "deck"
  ADD CONSTRAINT "deck_creator_id_fkey"
  FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "deck_word"
  ADD CONSTRAINT "deck_word_deck_id_fkey"
  FOREIGN KEY ("deck_id") REFERENCES "deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
