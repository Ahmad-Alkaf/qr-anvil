-- CreateTable
CREATE TABLE "TrackedQRReservation" (
    "id" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "userId" TEXT,
    "type" "QRType",
    "destinationUrl" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "activatedAt" TIMESTAMP(3),
    "activatedQRCodeId" TEXT,
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackedQRReservation_pkey" PRIMARY KEY ("id")
);

-- Keep claims for tracked QR codes that existed before reservations were added.
INSERT INTO "TrackedQRReservation" (
    "id",
    "shortCode",
    "userId",
    "type",
    "destinationUrl",
    "expiresAt",
    "activatedAt",
    "activatedQRCodeId",
    "createdAt",
    "updatedAt"
)
SELECT
    CONCAT('legacy_', "id"),
    "shortCode",
    "userId",
    NULL,
    NULL,
    "createdAt",
    "createdAt",
    "id",
    "createdAt",
    "updatedAt"
FROM "QRCode"
WHERE "shortCode" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TrackedQRReservation_shortCode_key" ON "TrackedQRReservation"("shortCode");

-- CreateIndex
CREATE UNIQUE INDEX "TrackedQRReservation_activatedQRCodeId_key" ON "TrackedQRReservation"("activatedQRCodeId");

-- CreateIndex
CREATE INDEX "TrackedQRReservation_userId_idx" ON "TrackedQRReservation"("userId");

-- CreateIndex
CREATE INDEX "TrackedQRReservation_expiresAt_idx" ON "TrackedQRReservation"("expiresAt");

-- CreateIndex
CREATE INDEX "TrackedQRReservation_shortCode_idx" ON "TrackedQRReservation"("shortCode");

-- AddForeignKey
ALTER TABLE "TrackedQRReservation" ADD CONSTRAINT "TrackedQRReservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
