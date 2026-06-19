package main

import (
	"log"

	"domdom/internal/config"
	"domdom/internal/database"
	"domdom/internal/handlers"
	"domdom/internal/middleware"
	"domdom/internal/seed"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	cfg := config.Load()

	db := database.Connect(cfg.DatabaseURL)
	database.Migrate(db)
	seed.Run(db, cfg)

	h := handlers.New(db, cfg)

	app := fiber.New(fiber.Config{
		AppName: "Đom Đóm API",
	})
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: cfg.CORSOrigins,
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "domdom-api"})
	})

	api := app.Group("/api")

	// ---- Public (ứng dụng iOS) ----
	api.Get("/curriculum", h.Curriculum)
	api.Post("/learners/sync", h.SyncLearner)
	api.Post("/submissions", h.Submit)

	// ---- Admin ----
	api.Post("/admin/login", h.Login)

	admin := api.Group("/admin", middleware.RequireAuth(cfg.JWTSecret))
	admin.Get("/me", h.Me)

	admin.Get("/subjects", h.ListSubjects)
	admin.Get("/subjects/:id", h.GetSubject)
	admin.Post("/subjects", h.CreateSubject)
	admin.Put("/subjects/:id", h.UpdateSubject)
	admin.Delete("/subjects/:id", h.DeleteSubject)

	admin.Get("/subjects/:id/chapters", h.ListChapters)
	admin.Post("/chapters", h.CreateChapter)
	admin.Put("/chapters/:id", h.UpdateChapter)
	admin.Delete("/chapters/:id", h.DeleteChapter)

	admin.Get("/chapters/:id/lessons", h.ListLessons)
	admin.Post("/lessons", h.CreateLesson)
	admin.Put("/lessons/:id", h.UpdateLesson)
	admin.Delete("/lessons/:id", h.DeleteLesson)

	admin.Get("/lessons/:id/questions", h.ListQuestions)
	admin.Post("/questions", h.CreateQuestion)
	admin.Put("/questions/:id", h.UpdateQuestion)
	admin.Delete("/questions/:id", h.DeleteQuestion)

	log.Printf("🚀 Đom Đóm API chạy ở cổng %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
