// Package handlers chứa các HTTP handler của API.
package handlers

import (
	"domdom/internal/config"

	"gorm.io/gorm"
)

// Handler giữ phụ thuộc dùng chung cho mọi handler.
type Handler struct {
	DB  *gorm.DB
	Cfg config.Config
}

func New(db *gorm.DB, cfg config.Config) *Handler {
	return &Handler{DB: db, Cfg: cfg}
}
