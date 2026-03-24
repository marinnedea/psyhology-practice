-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED');

-- AlterTable: add status column
ALTER TABLE "BlogPost" ADD COLUMN "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT';

-- Migrate data
UPDATE "BlogPost" SET "status" = 'PUBLISHED' WHERE "isPublished" = true;

-- Drop old column
ALTER TABLE "BlogPost" DROP COLUMN "isPublished";
