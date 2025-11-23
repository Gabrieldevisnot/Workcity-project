-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('empresa', 'profissional');

-- CreateTable
CREATE TABLE "candidaturas" (
    "id" SERIAL NOT NULL,
    "vaga_id" INTEGER,
    "profissional_id" INTEGER,
    "data_candidatura" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(20) DEFAULT 'pendente',

    CONSTRAINT "candidaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "convites" (
    "id" SERIAL NOT NULL,
    "empresa_id" INTEGER,
    "profissional_id" INTEGER,
    "vaga_id" INTEGER,
    "mensagem" TEXT,
    "status" VARCHAR(20) DEFAULT 'enviado',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "convites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "user_type" "UserType" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "city" VARCHAR(100),
    "state" VARCHAR(2),
    "address" TEXT,
    "cnpj" VARCHAR(20),
    "cpf" VARCHAR(20),
    "specialty" VARCHAR(100),
    "experience_years" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vagas" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "titulo" VARCHAR(255) NOT NULL,
    "especialidade" VARCHAR(100),
    "localizacao" VARCHAR(255),
    "descricao" TEXT,
    "salario_min" DECIMAL(10,2),
    "salario_max" DECIMAL(10,2),
    "tipo_contrato" VARCHAR(50),
    "experiencia_minima" VARCHAR(100),
    "requisitos" TEXT,
    "beneficios" TEXT,
    "status" VARCHAR(20) DEFAULT 'aberta',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vagas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidaturas_vaga_id_profissional_id_key" ON "candidaturas"("vaga_id", "profissional_id");

-- CreateIndex
CREATE UNIQUE INDEX "convites_vaga_id_profissional_id_key" ON "convites"("vaga_id", "profissional_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "candidaturas" ADD CONSTRAINT "candidaturas_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "candidaturas" ADD CONSTRAINT "candidaturas_vaga_id_fkey" FOREIGN KEY ("vaga_id") REFERENCES "vagas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "convites" ADD CONSTRAINT "convites_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "convites" ADD CONSTRAINT "convites_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "convites" ADD CONSTRAINT "convites_vaga_id_fkey" FOREIGN KEY ("vaga_id") REFERENCES "vagas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vagas" ADD CONSTRAINT "vagas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
