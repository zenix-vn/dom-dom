// Package models định nghĩa lược đồ dữ liệu cho Đom Đóm.
package models

import "time"

// Base là các trường chung cho mọi bảng.
type Base struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// AdminUser — tài khoản đăng nhập trang quản trị.
type AdminUser struct {
	Base
	Email        string `json:"email" gorm:"uniqueIndex;not null"`
	Name         string `json:"name"`
	PasswordHash string `json:"-" gorm:"not null"`
}

// Subject — môn học (Lịch sử, Địa lý, Tiếng Việt, Tiếng Anh).
type Subject struct {
	Base
	Kind      string    `json:"kind" gorm:"uniqueIndex;not null"` // slug: history/geography/vietnamese/english
	Title     string    `json:"title" gorm:"not null"`
	Grade     int       `json:"grade" gorm:"default:4"`
	Series    string    `json:"series"`  // bộ sách, vd "Kết nối tri thức"
	TintHex   string    `json:"tintHex"` // màu chủ đề, vd "C0392B"
	Icon      string    `json:"icon"`    // tên SF Symbol
	SortOrder int       `json:"sortOrder"`
	Chapters  []Chapter `json:"chapters,omitempty" gorm:"constraint:OnDelete:CASCADE;"`
}

// Chapter — chủ đề/chương trong một môn.
type Chapter struct {
	Base
	SubjectID uint     `json:"subjectId" gorm:"index;not null"`
	Title     string   `json:"title" gorm:"not null"`
	SortOrder int      `json:"sortOrder"`
	Lessons   []Lesson `json:"lessons,omitempty" gorm:"constraint:OnDelete:CASCADE;"`
}

// Lesson — bài học trong một chương.
type Lesson struct {
	Base
	ChapterID uint       `json:"chapterId" gorm:"index;not null"`
	Idx       int        `json:"index"` // số thứ tự bài hiển thị
	Title     string     `json:"title" gorm:"not null"`
	SortOrder int        `json:"sortOrder"`
	Questions []Question `json:"questions,omitempty" gorm:"constraint:OnDelete:CASCADE;"`
}

// Question — câu hỏi trắc nghiệm.
type Question struct {
	Base
	LessonID     uint     `json:"lessonId" gorm:"index;not null"`
	Stem         string   `json:"stem" gorm:"not null"`
	MediaCaption *string  `json:"mediaCaption"`
	Options      []string `json:"options" gorm:"serializer:json"`
	CorrectIndex int      `json:"correctIndex"`
	Explanation  string   `json:"explanation"`
	Source       string   `json:"source"`
	SortOrder    int      `json:"sortOrder"`
}

// Learner — người học (tài khoản phía ứng dụng iOS).
type Learner struct {
	Base
	DeviceID      string    `json:"deviceId" gorm:"uniqueIndex;not null"`
	Name          string    `json:"name"`
	FirstName     string    `json:"firstName"`
	Grade         int       `json:"grade" gorm:"default:4"`
	GradeLabel    string    `json:"gradeLabel"`
	Level         int       `json:"level" gorm:"default:1"`
	LevelTitle    string    `json:"levelTitle"`
	XP            int       `json:"xp"`
	XPForNext     int       `json:"xpForNext" gorm:"default:600"`
	Streak        int       `json:"streak"`
	Seals         int       `json:"seals"`
	FireflyEnergy float64   `json:"fireflyEnergy" gorm:"default:1"`
	LastStudyDay  int       `json:"lastStudyDay"`
	Masteries     []Mastery `json:"masteries,omitempty" gorm:"constraint:OnDelete:CASCADE;"`
}

// Mastery — mức thành thạo theo môn của một người học.
type Mastery struct {
	Base
	LearnerID   uint   `json:"learnerId" gorm:"index;not null"`
	SubjectKind string `json:"subjectKind"`
	Percent     int    `json:"percent"`
	Note        string `json:"note"`
}

// QuizSubmission — một lượt làm bài của người học (để báo cáo/thống kê).
type QuizSubmission struct {
	Base
	LearnerID   uint   `json:"learnerId" gorm:"index;not null"`
	LessonID    *uint  `json:"lessonId"`
	SubjectKind string `json:"subjectKind"`
	Correct     int    `json:"correct"`
	Total       int    `json:"total"`
	XPGained    int    `json:"xpGained"`
}

// AllModels trả về con trỏ tới mọi model để AutoMigrate.
func AllModels() []any {
	return []any{
		&AdminUser{},
		&Subject{}, &Chapter{}, &Lesson{}, &Question{},
		&Learner{}, &Mastery{}, &QuizSubmission{},
	}
}
