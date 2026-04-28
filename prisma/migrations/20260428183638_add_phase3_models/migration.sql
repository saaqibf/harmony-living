-- CreateEnum
CREATE TYPE "SwipeDirection" AS ENUM ('CONNECT', 'PASS');

-- CreateEnum
CREATE TYPE "PhotoVisibility" AS ENUM ('ALWAYS', 'UNTIL_MATCH', 'PRIVATE');

-- CreateEnum
CREATE TYPE "IntroMediaType" AS ENUM ('VOICE', 'VIDEO');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "introMediaType" "IntroMediaType",
ADD COLUMN     "introMediaUrl" TEXT,
ADD COLUMN     "photoVisibility" "PhotoVisibility" NOT NULL DEFAULT 'UNTIL_MATCH';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailySwipeQuota" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "femaleOnlyMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireVerifiedConnections" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "OnboardingState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "intent" TEXT,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "completedSteps" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "completedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "draftData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Swipe" (
    "id" TEXT NOT NULL,
    "swiperUserId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "direction" "SwipeDirection" NOT NULL,
    "context" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Swipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversationId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "listingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseholdMember" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseholdMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingState_userId_key" ON "OnboardingState"("userId");

-- CreateIndex
CREATE INDEX "OnboardingState_userId_idx" ON "OnboardingState"("userId");

-- CreateIndex
CREATE INDEX "Swipe_targetUserId_direction_idx" ON "Swipe"("targetUserId", "direction");

-- CreateIndex
CREATE INDEX "Swipe_swiperUserId_createdAt_idx" ON "Swipe"("swiperUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Swipe_swiperUserId_targetUserId_key" ON "Swipe"("swiperUserId", "targetUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_conversationId_key" ON "Match"("conversationId");

-- CreateIndex
CREATE INDEX "Match_userAId_matchedAt_idx" ON "Match"("userAId", "matchedAt");

-- CreateIndex
CREATE INDEX "Match_userBId_matchedAt_idx" ON "Match"("userBId", "matchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Match_userAId_userBId_key" ON "Match"("userAId", "userBId");

-- CreateIndex
CREATE INDEX "Household_listingId_idx" ON "Household"("listingId");

-- CreateIndex
CREATE INDEX "HouseholdMember_userId_idx" ON "HouseholdMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdMember_householdId_userId_key" ON "HouseholdMember"("householdId", "userId");

-- AddForeignKey
ALTER TABLE "OnboardingState" ADD CONSTRAINT "OnboardingState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swipe" ADD CONSTRAINT "Swipe_swiperUserId_fkey" FOREIGN KEY ("swiperUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swipe" ADD CONSTRAINT "Swipe_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Household" ADD CONSTRAINT "Household_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseholdMember" ADD CONSTRAINT "HouseholdMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
