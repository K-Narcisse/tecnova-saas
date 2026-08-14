-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "cart" JSONB NOT NULL DEFAULT '[]';
