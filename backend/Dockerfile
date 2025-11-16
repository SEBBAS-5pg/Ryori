# ryori/backend/Dockerfile

# --- Stage 1: Build ---
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /ryori-backend ./main.go

# --- Stage 2: Final ---
FROM alpine:latest
WORKDIR /app

# Copia el binario compilado
COPY --from=builder /ryori-backend .

# --- ¡ESTA ES LA LÍNEA NUEVA! ---
# Crea el directorio 'uploads' dentro del contenedor en /app/uploads
RUN mkdir uploads

# Expone el puerto y corre la app
EXPOSE 8080
CMD ["./ryori-backend"]