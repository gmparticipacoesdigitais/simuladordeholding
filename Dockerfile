# [Linha 1]
FROM node:22-slim
# [Linha 2]
WORKDIR /usr/src/app
# [Linha 3]
COPY package*.json ./
# [Linha 4]
RUN npm install
# [Linha 5]
COPY . .
# [Linha 6]
CMD [.js" ]