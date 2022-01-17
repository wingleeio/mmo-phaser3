-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "sprite" INTEGER,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 3089.0,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 1984.0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
