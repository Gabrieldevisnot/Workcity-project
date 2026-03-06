# Usa uma versão mais compatível (Debian Slim) para evitar erros de SSL do Alpine
FROM node:18-slim

# Instala o OpenSSL necessário para o Prisma
RUN apt-get update -y && apt-get install -y openssl

# Cria a pasta de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências primeiro (para aproveitar o cache)
COPY package*.json ./
COPY prisma ./prisma/

# Instala as dependências
RUN npm install

# Gera o cliente do Prisma (importante!)
RUN npx prisma generate

# Copia o resto do código do backend
COPY . .

# Expõe a porta 3000
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]