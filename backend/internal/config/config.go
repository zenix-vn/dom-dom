// Package config nạp cấu hình từ biến môi trường.
package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          string
	DatabaseURL   string
	JWTSecret     string
	AdminEmail    string
	AdminPassword string
	CORSOrigins   string
}

// Load đọc file .env (nếu có) rồi lấy cấu hình từ môi trường, kèm giá trị mặc định.
func Load() Config {
	_ = godotenv.Load()
	return Config{
		Port:          env("PORT", "8080"),
		DatabaseURL:   env("DATABASE_URL", "postgres://domdom:domdom@localhost:5432/domdom?sslmode=disable"),
		JWTSecret:     env("JWT_SECRET", "doi-secret-nay-trong-production"),
		AdminEmail:    env("ADMIN_EMAIL", "admin@domdom.vn"),
		AdminPassword: env("ADMIN_PASSWORD", "domdom123"),
		CORSOrigins:   env("CORS_ORIGINS", "http://localhost:3000"),
	}
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
