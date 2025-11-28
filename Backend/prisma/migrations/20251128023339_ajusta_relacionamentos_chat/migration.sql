/*
  Warnings:

  - Made the column `empresa_id` on table `convites` required. This step will fail if there are existing NULL values in that column.
  - Made the column `profissional_id` on table `convites` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vaga_id` on table `convites` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "convites" DROP CONSTRAINT "convites_empresa_id_fkey";

-- DropForeignKey
ALTER TABLE "convites" DROP CONSTRAINT "convites_profissional_id_fkey";

-- DropForeignKey
ALTER TABLE "convites" DROP CONSTRAINT "convites_vaga_id_fkey";

-- AlterTable
ALTER TABLE "candidaturas" ALTER COLUMN "data_candidatura" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "convites" ALTER COLUMN "empresa_id" SET NOT NULL,
ALTER COLUMN "profissional_id" SET NOT NULL,
ALTER COLUMN "vaga_id" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "password_hash" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "city" SET DATA TYPE TEXT,
ALTER COLUMN "state" SET DATA TYPE TEXT,
ALTER COLUMN "cnpj" SET DATA TYPE TEXT,
ALTER COLUMN "cpf" SET DATA TYPE TEXT,
ALTER COLUMN "specialty" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "vagas" ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "convites" ADD CONSTRAINT "convites_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convites" ADD CONSTRAINT "convites_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convites" ADD CONSTRAINT "convites_vaga_id_fkey" FOREIGN KEY ("vaga_id") REFERENCES "vagas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
