/*
  Warnings:

  - You are about to drop the column `enviromental` on the `SurveyResponse` table. All the data in the column will be lost.
  - Added the required column `environmental` to the `SurveyResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SurveyResponse" DROP COLUMN "enviromental",
ADD COLUMN     "environmental" INTEGER NOT NULL;
