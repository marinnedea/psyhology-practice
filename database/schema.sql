-- ─────────────────────────────────────────────────────────────
-- Psychology Practice — Full Database Schema
-- Generated from prisma/schema.prisma + all applied migrations.
--
-- This file is for REFERENCE / DBA use only.
-- For production deployments, always use Prisma migrations:
--   npx prisma migrate deploy
--
-- To apply from scratch manually (after running setup.sql):
--   psql -U psychology_app -d psychology_practice_next -f database/schema.sql
-- ─────────────────────────────────────────────────────────────

-- ── Enums ────────────────────────────────────────────────────

CREATE TYPE "Role" AS ENUM ('ADMIN', 'PSYCHOLOGIST', 'CLIENT');

CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED');

CREATE TYPE "TicketCategory" AS ENUM ('TECHNICAL', 'APPOINTMENT', 'BILLING', 'GENERAL', 'OTHER');

CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

CREATE TYPE "TicketPriority" AS ENUM ('NORMAL', 'HIGH', 'URGENT');

-- ── Tables ───────────────────────────────────────────────────

CREATE TABLE "User" (
    "id"           TEXT        NOT NULL,
    "email"        TEXT        NOT NULL,
    "passwordHash" TEXT        NOT NULL,
    "name"         TEXT        NOT NULL,
    "role"         "Role"      NOT NULL DEFAULT 'CLIENT',
    "image"        TEXT,
    "isApproved"   BOOLEAN     NOT NULL DEFAULT false,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "Account" (
    "id"                TEXT NOT NULL,
    "userId"            TEXT NOT NULL,
    "type"              TEXT NOT NULL,
    "provider"          TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token"     TEXT,
    "access_token"      TEXT,
    "expires_at"        INTEGER,
    "token_type"        TEXT,
    "scope"             TEXT,
    "id_token"          TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "Session" (
    "id"           TEXT        NOT NULL,
    "sessionToken" TEXT        NOT NULL,
    "userId"       TEXT        NOT NULL,
    "expires"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "Image" (
    "id"               TEXT        NOT NULL,
    "localPath"        TEXT        NOT NULL,
    "originalUrl"      TEXT,
    "unsplashId"       TEXT,
    "photographerName" TEXT,
    "photographerUrl"  TEXT,
    "altText"          TEXT,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "PsychologistProfile" (
    "id"             TEXT NOT NULL,
    "userId"         TEXT NOT NULL,
    "bio"            TEXT,
    "qualifications" TEXT,
    "studies"        TEXT,
    "specialties"    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "location"       TEXT,
    "phone"          TEXT,
    "websiteUrl"     TEXT,
    "linkedinUrl"    TEXT,
    "facebookUrl"    TEXT,
    "instagramUrl"   TEXT,
    "profileImageId" TEXT,

    CONSTRAINT "PsychologistProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PsychologistProfile_userId_key" ON "PsychologistProfile"("userId");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "Service" (
    "id"          TEXT           NOT NULL,
    "name"        TEXT           NOT NULL,
    "description" TEXT,
    "price"       DECIMAL(10, 2) NOT NULL,
    "duration"    INTEGER        NOT NULL,
    "isActive"    BOOLEAN        NOT NULL DEFAULT true,
    "sortOrder"   INTEGER        NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)   NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "PsychologistService" (
    "id"             TEXT           NOT NULL,
    "psychologistId" TEXT           NOT NULL,
    "serviceId"      TEXT           NOT NULL,
    "customPrice"    DECIMAL(10, 2),

    CONSTRAINT "PsychologistService_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PsychologistService_psychologistId_serviceId_key"
    ON "PsychologistService"("psychologistId", "serviceId");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "Availability" (
    "id"             TEXT    NOT NULL,
    "psychologistId" TEXT    NOT NULL,
    "dayOfWeek"      INTEGER NOT NULL,
    "startTime"      TEXT    NOT NULL,
    "endTime"        TEXT    NOT NULL,
    "isActive"       BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "Appointment" (
    "id"             TEXT                NOT NULL,
    "clientId"       TEXT                NOT NULL,
    "psychologistId" TEXT                NOT NULL,
    "serviceId"      TEXT,
    "dateTime"       TIMESTAMP(3)        NOT NULL,
    "endTime"        TIMESTAMP(3)        NOT NULL,
    "status"         "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "notes"          TEXT,
    "createdAt"      TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3)        NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "BlogCategory" (
    "id"   TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlogCategory_name_key" ON "BlogCategory"("name");
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "BlogPost" (
    "id"              TEXT            NOT NULL,
    "title"           TEXT            NOT NULL,
    "slug"            TEXT            NOT NULL,
    "content"         TEXT            NOT NULL,
    "excerpt"         TEXT,
    "authorId"        TEXT            NOT NULL,
    "categoryId"      TEXT,
    "status"          "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt"     TIMESTAMP(3),
    "featuredImageId" TEXT,
    "createdAt"       TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3)    NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "PageSection" (
    "id"         TEXT         NOT NULL,
    "page"       TEXT         NOT NULL,
    "sectionKey" TEXT         NOT NULL,
    "title"      TEXT,
    "subtitle"   TEXT,
    "content"    TEXT,
    "imageId"    TEXT,
    "sortOrder"  INTEGER      NOT NULL DEFAULT 0,
    "isVisible"  BOOLEAN      NOT NULL DEFAULT true,
    "metadata"   JSONB,
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageSection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PageSection_page_sectionKey_key" ON "PageSection"("page", "sectionKey");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "Testimonial" (
    "id"         TEXT         NOT NULL,
    "clientName" TEXT         NOT NULL,
    "clientRole" TEXT,
    "quote"      TEXT         NOT NULL,
    "rating"     INTEGER      NOT NULL DEFAULT 5,
    "avatarUrl"  TEXT,
    "isActive"   BOOLEAN      NOT NULL DEFAULT true,
    "sortOrder"  INTEGER      NOT NULL DEFAULT 0,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "NewsletterSubscriber" (
    "id"             TEXT         NOT NULL,
    "email"          TEXT         NOT NULL,
    "isActive"       BOOLEAN      NOT NULL DEFAULT true,
    "subscribedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "ContactMessage" (
    "id"        TEXT         NOT NULL,
    "name"      TEXT         NOT NULL,
    "email"     TEXT         NOT NULL,
    "subject"   TEXT,
    "message"   TEXT         NOT NULL,
    "isRead"    BOOLEAN      NOT NULL DEFAULT false,
    "repliedAt" TIMESTAMP(3),
    "replyBody" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "SiteSetting" (
    "key"       TEXT         NOT NULL,
    "value"     TEXT         NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "Ticket" (
    "id"        TEXT             NOT NULL,
    "userId"    TEXT             NOT NULL,
    "subject"   TEXT             NOT NULL,
    "category"  "TicketCategory" NOT NULL DEFAULT 'GENERAL',
    "status"    "TicketStatus"   NOT NULL DEFAULT 'OPEN',
    "priority"  "TicketPriority" NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)     NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "TicketMessage" (
    "id"         TEXT         NOT NULL,
    "ticketId"   TEXT         NOT NULL,
    "senderId"   TEXT         NOT NULL,
    "body"       TEXT         NOT NULL,
    "isInternal" BOOLEAN      NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketMessage_pkey" PRIMARY KEY ("id")
);

-- ── Foreign Keys ─────────────────────────────────────────────

ALTER TABLE "Account"
    ADD CONSTRAINT "Account_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Session"
    ADD CONSTRAINT "Session_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PsychologistProfile"
    ADD CONSTRAINT "PsychologistProfile_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PsychologistProfile"
    ADD CONSTRAINT "PsychologistProfile_profileImageId_fkey"
    FOREIGN KEY ("profileImageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PsychologistService"
    ADD CONSTRAINT "PsychologistService_psychologistId_fkey"
    FOREIGN KEY ("psychologistId") REFERENCES "PsychologistProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PsychologistService"
    ADD CONSTRAINT "PsychologistService_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Availability"
    ADD CONSTRAINT "Availability_psychologistId_fkey"
    FOREIGN KEY ("psychologistId") REFERENCES "PsychologistProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Appointment"
    ADD CONSTRAINT "Appointment_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment"
    ADD CONSTRAINT "Appointment_psychologistId_fkey"
    FOREIGN KEY ("psychologistId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Appointment"
    ADD CONSTRAINT "Appointment_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BlogPost"
    ADD CONSTRAINT "BlogPost_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "BlogPost"
    ADD CONSTRAINT "BlogPost_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BlogPost"
    ADD CONSTRAINT "BlogPost_featuredImageId_fkey"
    FOREIGN KEY ("featuredImageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PageSection"
    ADD CONSTRAINT "PageSection_imageId_fkey"
    FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Ticket"
    ADD CONSTRAINT "Ticket_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TicketMessage"
    ADD CONSTRAINT "TicketMessage_ticketId_fkey"
    FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TicketMessage"
    ADD CONSTRAINT "TicketMessage_senderId_fkey"
    FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
