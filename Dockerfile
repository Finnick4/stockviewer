FROM golang:1.24.0
LABEL authors="gallfeder"

WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o main cmd/main.go
EXPOSE 8000
CMD [ "./main" ]
