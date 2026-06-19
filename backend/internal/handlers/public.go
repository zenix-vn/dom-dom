package handlers

import (
	"domdom/internal/models"

	"github.com/gofiber/fiber/v2"
)

// Curriculum trả về toàn bộ chương trình học (môn → chương → bài → câu hỏi)
// cho ứng dụng. Có thể lọc theo ?grade=4.
func (h *Handler) Curriculum(c *fiber.Ctx) error {
	q := h.DB.
		Preload("Chapters", orderBy("sort_order asc, id asc")).
		Preload("Chapters.Lessons", orderBy("sort_order asc, idx asc")).
		Preload("Chapters.Lessons.Questions", orderBy("sort_order asc, id asc")).
		Order("sort_order asc, id asc")

	if grade := c.Query("grade"); grade != "" {
		q = q.Where("grade = ?", grade)
	}

	var subjects []models.Subject
	if err := q.Find(&subjects).Error; err != nil {
		return err
	}
	return c.JSON(fiber.Map{"subjects": subjects})
}

type learnerInput struct {
	DeviceID   string `json:"deviceId"`
	Name       string `json:"name"`
	FirstName  string `json:"firstName"`
	Grade      int    `json:"grade"`
	GradeLabel string `json:"gradeLabel"`
}

// SyncLearner tạo mới hoặc cập nhật người học theo deviceId, trả về trạng thái hiện tại.
func (h *Handler) SyncLearner(c *fiber.Ctx) error {
	var in learnerInput
	if err := c.BodyParser(&in); err != nil || in.DeviceID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "thiếu deviceId")
	}

	var learner models.Learner
	err := h.DB.Where("device_id = ?", in.DeviceID).First(&learner).Error
	if err != nil {
		// tạo mới với giá trị khởi tạo
		learner = models.Learner{
			DeviceID:   in.DeviceID,
			Name:       in.Name,
			FirstName:  in.FirstName,
			Grade:      orDefault(in.Grade, 4),
			GradeLabel: in.GradeLabel,
			Level:      1,
			LevelTitle: "Học trò mới",
			XPForNext:  600,
		}
		if e := h.DB.Create(&learner).Error; e != nil {
			return e
		}
	} else if in.Name != "" || in.FirstName != "" {
		learner.Name = in.Name
		learner.FirstName = in.FirstName
		if in.Grade != 0 {
			learner.Grade = in.Grade
		}
		learner.GradeLabel = in.GradeLabel
		h.DB.Save(&learner)
	}

	h.DB.Preload("Masteries").First(&learner, learner.ID)
	return c.JSON(learner)
}

type submissionInput struct {
	DeviceID    string `json:"deviceId"`
	LessonID    *uint  `json:"lessonId"`
	SubjectKind string `json:"subjectKind"`
	Correct     int    `json:"correct"`
	Total       int    `json:"total"`
}

// Submit ghi nhận một lượt làm bài và cập nhật điểm/chuỗi của người học.
func (h *Handler) Submit(c *fiber.Ctx) error {
	var in submissionInput
	if err := c.BodyParser(&in); err != nil || in.DeviceID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "thiếu deviceId")
	}

	var learner models.Learner
	if err := h.DB.Where("device_id = ?", in.DeviceID).First(&learner).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "chưa đồng bộ người học")
	}

	xpGained := in.Correct * 15
	learner.XP += xpGained
	for learner.XP >= learner.XPForNext {
		learner.XP -= learner.XPForNext
		learner.Level++
		learner.XPForNext = int(float64(learner.XPForNext) * 1.25)
	}
	if in.Total > 0 && float64(in.Correct)/float64(in.Total) >= 0.9 {
		learner.Seals++
	}
	h.DB.Save(&learner)

	sub := models.QuizSubmission{
		LearnerID:   learner.ID,
		LessonID:    in.LessonID,
		SubjectKind: in.SubjectKind,
		Correct:     in.Correct,
		Total:       in.Total,
		XPGained:    xpGained,
	}
	if err := h.DB.Create(&sub).Error; err != nil {
		return err
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"submission": sub,
		"learner":    learner,
	})
}

func orDefault(v, def int) int {
	if v == 0 {
		return def
	}
	return v
}
