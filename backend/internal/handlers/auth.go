package handlers

import (
	"domdom/internal/middleware"
	"domdom/internal/models"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type loginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Login xác thực admin và trả về JWT.
func (h *Handler) Login(c *fiber.Ctx) error {
	var in loginInput
	if err := c.BodyParser(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "dữ liệu không hợp lệ")
	}

	var admin models.AdminUser
	if err := h.DB.Where("email = ?", in.Email).First(&admin).Error; err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "email hoặc mật khẩu sai")
	}
	if bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(in.Password)) != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "email hoặc mật khẩu sai")
	}

	token, err := middleware.GenerateToken(h.Cfg.JWTSecret, admin.ID, admin.Email)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "không tạo được token")
	}
	return c.JSON(fiber.Map{
		"token": token,
		"admin": fiber.Map{"id": admin.ID, "email": admin.Email, "name": admin.Name},
	})
}

// Me trả về thông tin admin hiện tại (dựa vào token).
func (h *Handler) Me(c *fiber.Ctx) error {
	email, _ := c.Locals("adminEmail").(string)
	var admin models.AdminUser
	if err := h.DB.Where("email = ?", email).First(&admin).Error; err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "không tìm thấy admin")
	}
	return c.JSON(admin)
}
