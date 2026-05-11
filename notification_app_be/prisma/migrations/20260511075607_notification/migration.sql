-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('Event', 'Result', 'Placement');

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "studentId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_studentId_isRead_createdAt_idx" ON "notifications"("studentId", "isRead", "createdAt" DESC);
