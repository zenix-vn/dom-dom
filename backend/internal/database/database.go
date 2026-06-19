// Package database mở kết nối Postgres và chạy migrate.
package database

import (
	"log"

	"domdom/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Connect mở kết nối tới Postgres bằng DSN cho trước.
func Connect(dsn string) *gorm.DB {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatalf("không kết nối được database: %v", err)
	}
	return db
}

// Migrate tạo/cập nhật bảng theo các model.
func Migrate(db *gorm.DB) {
	if err := db.AutoMigrate(models.AllModels()...); err != nil {
		log.Fatalf("migrate thất bại: %v", err)
	}
	log.Println("✓ migrate xong")
}
