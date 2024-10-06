-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" SERIAL NOT NULL,
    "enviromental" INTEGER NOT NULL,
    "social" INTEGER NOT NULL,
    "governance" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);
