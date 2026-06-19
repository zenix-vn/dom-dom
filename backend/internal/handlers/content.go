package handlers

import (
	"domdom/internal/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// ---- Subjects ----

// ListSubjects trả về danh sách môn (kèm số chương) theo thứ tự.
func (h *Handler) ListSubjects(c *fiber.Ctx) error {
	var subjects []models.Subject
	if err := h.DB.Order("sort_order asc, id asc").Find(&subjects).Error; err != nil {
		return err
	}
	return c.JSON(subjects)
}

// GetSubject trả về một môn kèm toàn bộ cây chương → bài → câu hỏi.
func (h *Handler) GetSubject(c *fiber.Ctx) error {
	var s models.Subject
	if err := h.DB.
		Preload("Chapters", orderBy("sort_order asc, id asc")).
		Preload("Chapters.Lessons", orderBy("sort_order asc, idx asc")).
		Preload("Chapters.Lessons.Questions", orderBy("sort_order asc, id asc")).
		First(&s, c.Params("id")).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "không tìm thấy môn")
	}
	return c.JSON(s)
}

func (h *Handler) CreateSubject(c *fiber.Ctx) error {
	var s models.Subject
	if err := c.BodyParser(&s); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "dữ liệu không hợp lệ")
	}
	if err := h.DB.Create(&s).Error; err != nil {
		return err
	}
	return c.Status(fiber.StatusCreated).JSON(s)
}

func (h *Handler) UpdateSubject(c *fiber.Ctx) error {
	var s models.Subject
	if err := h.DB.First(&s, c.Params("id")).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "không tìm thấy môn")
	}
	if err := c.BodyParser(&s); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "dữ liệu không hợp lệ")
	}
	if err := h.DB.Save(&s).Error; err != nil {
		return err
	}
	return c.JSON(s)
}

func (h *Handler) DeleteSubject(c *fiber.Ctx) error {
	if err := h.DB.Delete(&models.Subject{}, c.Params("id")).Error; err != nil {
		return err
	}
	return c.SendStatus(fiber.StatusNoContent)
}

// ---- Chapters ----

func (h *Handler) ListChapters(c *fiber.Ctx) error {
	var chapters []models.Chapter
	if err := h.DB.Where("subject_id = ?", c.Params("id")).
		Order("sort_order asc, id asc").Find(&chapters).Error; err != nil {
		return err
	}
	return c.JSON(chapters)
}

func (h *Handler) CreateChapter(c *fiber.Ctx) error {
	var ch models.Chapter
	if err := c.BodyParser(&ch); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "dữ liệu không hợp lệ")
	}
	if err := h.DB.Create(&ch).Error; err != nil {
		return err
	}
	return c.Status(fiber.StatusCreated).JSON(ch)
}

func (h *Handler) UpdateChapter(c *fiber.Ctx) error {
	var ch models.Chapter
	if err := h.DB.First(&ch, c.Params("id")).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "không tìm thấy chương")
	}
	if err := c.BodyParser(&ch); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "dữ liệu không hợp lệ")
	}
	if err := h.DB.Save(&ch).Error; err != nil {
		return err
	}
	return c.JSON(ch)
}

func (h *Handler) DeleteChapter(c *fiber.Ctx) error {
	if err := h.DB.Delete(&models.Chapter{}, c.Params("id")).Error; err != nil {
		return err
	}
	return c.SendStatus(fiber.StatusNoContent)
}

// ---- Lessons ----

func (h *Handler) ListLessons(c *fiber.Ctx) error {
	var lessons []models.Lesson
	if err := h.DB.Where("chapter_id = ?", c.Params("id")).
		Order("sort_order asc, idx asc").Find(&lessons).Error; err != nil {
		return err
	}
	return c.JSON(lessons)
}

func (h *Handler) CreateLesson(c *fiber.Ctx) error {
	var l models.Lesson
	if err := c.BodyParser(&l); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "dữ liệu không hợp lệ")
	}
	if err := h.DB.Create(&l).Error; err != nil {
		return err
	}
	return c.Status(fiber.StatusCreated).JSON(l)
}

func (h *Handler) UpdateLesson(c *fiber.Ctx) error {
	var l models.Lesson
	if err := h.DB.First(&l, c.Params("id")).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "không tìm thấy bài")
	}
	if err := c.BodyParser(&l); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "dữ liệu không hợp lệ")
	}
	if err := h.DB.Save(&l).Error; err != nil {
		return err
	}
	return c.JSON(l)
}

func (h *Handler) DeleteLesson(c *fiber.Ctx) error {
	if err := h.DB.Delete(&models.Lesson{}, c.Params("id")).Error; err != nil {
		return err
	}
	return c.SendStatus(fiber.StatusNoContent)
}

// ---- Questions ----

func (h *Handler) ListQuestions(c *fiber.Ctx) error {
	var qs []models.Question
	if err := h.DB.Where("lesson_id = ?", c.Params("id")).
		Order("sort_order asc, id asc").Find(&qs).Error; err != nil {
		return err
	}
	return c.JSON(qs)
}

func (h *Handler) CreateQuestion(c *fiber.Ctx) error {
	var q models.Question
	if err := c.BodyParser(&q); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "dữ liệu không hợp lệ")
	}
	if err := h.DB.Create(&q).Error; err != nil {
		return err
	}
	return c.Status(fiber.StatusCreated).JSON(q)
}

func (h *Handler) UpdateQuestion(c *fiber.Ctx) error {
	var q models.Question
	if err := h.DB.First(&q, c.Params("id")).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "không tìm thấy câu hỏi")
	}
	if err := c.BodyParser(&q); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "dữ liệu không hợp lệ")
	}
	if err := h.DB.Save(&q).Error; err != nil {
		return err
	}
	return c.JSON(q)
}

func (h *Handler) DeleteQuestion(c *fiber.Ctx) error {
	if err := h.DB.Delete(&models.Question{}, c.Params("id")).Error; err != nil {
		return err
	}
	return c.SendStatus(fiber.StatusNoContent)
}

// orderBy là helper cho Preload có sắp xếp.
func orderBy(clause string) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB { return db.Order(clause) }
}
