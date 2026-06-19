// Package seed nạp dữ liệu khởi tạo: tài khoản admin và chương trình mẫu.
package seed

import (
	"log"

	"domdom/internal/config"
	"domdom/internal/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func ptr(s string) *string { return &s }

// Run tạo admin mặc định (nếu chưa có) và chương trình mẫu (nếu DB trống).
func Run(db *gorm.DB, cfg config.Config) {
	seedAdmin(db, cfg)
	seedCurriculum(db)
}

func seedAdmin(db *gorm.DB, cfg config.Config) {
	var count int64
	db.Model(&models.AdminUser{}).Where("email = ?", cfg.AdminEmail).Count(&count)
	if count > 0 {
		return
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(cfg.AdminPassword), bcrypt.DefaultCost)
	admin := models.AdminUser{Email: cfg.AdminEmail, Name: "Quản trị viên", PasswordHash: string(hash)}
	if err := db.Create(&admin).Error; err != nil {
		log.Printf("seed admin lỗi: %v", err)
		return
	}
	log.Printf("✓ tạo admin: %s / %s", cfg.AdminEmail, cfg.AdminPassword)
}

func seedCurriculum(db *gorm.DB) {
	var count int64
	db.Model(&models.Subject{}).Count(&count)
	if count > 0 {
		return
	}

	coLoa := []models.Question{
		{
			Stem:         "Thành Cổ Loa được xây dựng dưới thời vua nào?",
			MediaCaption: ptr("Di tích Cổ Loa"),
			Options:      []string{"Vua Hùng Vương thứ 6", "An Dương Vương (Thục Phán)", "Hai Bà Trưng", "Ngô Quyền"},
			CorrectIndex: 1,
			Explanation:  "Thành Cổ Loa do **An Dương Vương (Thục Phán)** cho xây khoảng thế kỷ III TCN, làm kinh đô nước Âu Lạc. Thành xoắn ốc nhiều vòng nên còn gọi là **Loa thành**.",
			Source:       "SGK Lịch sử & Địa lý 4 · Bài 3", SortOrder: 0,
		},
		{
			Stem:         "Thành Cổ Loa là kinh đô của nước nào?",
			Options:      []string{"Văn Lang", "Âu Lạc", "Đại Việt", "Vạn Xuân"},
			CorrectIndex: 1,
			Explanation:  "Sau khi thống nhất, An Dương Vương lập nên nước **Âu Lạc** và chọn Cổ Loa làm kinh đô.",
			Source:       "SGK Lịch sử & Địa lý 4 · Bài 3", SortOrder: 1,
		},
		{
			Stem:         "Vì sao thành Cổ Loa còn được gọi là Loa thành?",
			Options:      []string{"Vì gần biển", "Vì có hình xoắn ốc nhiều vòng", "Vì xây bằng vỏ ốc", "Vì vua thích ốc"},
			CorrectIndex: 1,
			Explanation:  "Thành được đắp thành **nhiều vòng xoáy trôn ốc**, nên dân gian gọi là Loa thành (loa nghĩa là con ốc).",
			Source:       "SGK Lịch sử & Địa lý 4 · Bài 3", SortOrder: 2,
		},
		{
			Stem:         "Nước Văn Lang do ai đứng đầu?",
			Options:      []string{"An Dương Vương", "Các Vua Hùng", "Bà Triệu", "Lý Bí"},
			CorrectIndex: 1,
			Explanation:  "Nhà nước Văn Lang — nhà nước đầu tiên của người Việt — do **các Vua Hùng** đứng đầu.",
			Source:       "SGK Lịch sử & Địa lý 4 · Bài 1", SortOrder: 3,
		},
		{
			Stem:         "Lễ giỗ Tổ Hùng Vương được tổ chức vào ngày nào?",
			Options:      []string{"10 tháng 3 âm lịch", "2 tháng 9", "15 tháng 8 âm lịch", "1 tháng 1"},
			CorrectIndex: 0,
			Explanation:  "Hằng năm vào **mùng 10 tháng 3 âm lịch**, nhân dân cả nước hướng về Đền Hùng để tưởng nhớ các Vua Hùng.",
			Source:       "SGK Lịch sử & Địa lý 4 · Bài 2", SortOrder: 4,
		},
	}

	history := models.Subject{
		Kind: "history", Title: "Lịch sử & Địa lý", Grade: 4, Series: "Kết nối tri thức",
		TintHex: "C0392B", Icon: "book.closed.fill", SortOrder: 0,
		Chapters: []models.Chapter{
			{
				Title: "Chủ đề 1 · Buổi đầu dựng nước", SortOrder: 0,
				Lessons: []models.Lesson{
					{Idx: 1, Title: "Nước Văn Lang, Âu Lạc", SortOrder: 0},
					{Idx: 2, Title: "Đền Hùng và lễ giỗ Tổ", SortOrder: 1},
					{Idx: 3, Title: "Thành Cổ Loa", SortOrder: 2, Questions: coLoa},
					{Idx: 4, Title: "Ôn tập chủ đề 1", SortOrder: 3},
				},
			},
			{
				Title: "Chủ đề 2 · Trung du, miền núi Bắc Bộ", SortOrder: 1,
				Lessons: []models.Lesson{
					{Idx: 5, Title: "Thiên nhiên vùng núi", SortOrder: 0},
				},
			},
		},
	}

	subjects := []models.Subject{
		history,
		{Kind: "geography", Title: "Địa lý", Grade: 4, Series: "Kết nối tri thức", TintHex: "1F8A78", Icon: "globe.asia.australia.fill", SortOrder: 1},
		{Kind: "vietnamese", Title: "Tiếng Việt", Grade: 4, Series: "Kết nối tri thức", TintHex: "CF9A2C", Icon: "text.book.closed.fill", SortOrder: 2},
		{Kind: "english", Title: "Tiếng Anh", Grade: 4, Series: "Kết nối tri thức", TintHex: "3F76B0", Icon: "character.book.closed.fill", SortOrder: 3},
	}

	if err := db.Create(&subjects).Error; err != nil {
		log.Printf("seed chương trình lỗi: %v", err)
		return
	}
	log.Println("✓ seed chương trình mẫu xong")
}
