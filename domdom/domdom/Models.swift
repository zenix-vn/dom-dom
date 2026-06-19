//
//  Models.swift
//  domdom
//
//  Mô hình dữ liệu + dữ liệu mẫu bám SGK Lịch sử & Địa lý lớp 4 (Kết nối tri thức).
//

import SwiftUI

enum SubjectKind: String, CaseIterable, Identifiable, Codable {
    case history    = "Lịch sử"
    case geography  = "Địa lý"
    case vietnamese = "Tiếng Việt"
    case english    = "Tiếng Anh"

    var id: String { rawValue }

    var iconName: String {
        switch self {
        case .history: "book.closed.fill"
        case .geography: "globe.asia.australia.fill"
        case .vietnamese: "text.book.closed.fill"
        case .english: "character.book.closed.fill"
        }
    }
}

struct Subject: Identifiable {
    let id = UUID()
    let kind: SubjectKind
    let title: String          // Tên hiển thị (vd "Lịch sử & Địa lý")
    let totalLessons: Int
    let doneLessons: Int
    let chapters: [Chapter]

    var progress: Double { totalLessons == 0 ? 0 : Double(doneLessons) / Double(totalLessons) }
    var tint: Color { kind.tint }
}

struct Chapter: Identifiable {
    let id = UUID()
    let title: String
    let lessons: [Lesson]
}

enum LessonState: Hashable { case done, current, locked }

struct Lesson: Identifiable, Hashable {
    let id = UUID()
    let index: Int
    let title: String
    let questionCount: Int
    let state: LessonState
    var progressNote: String       // "đã hoàn thành" / "đang học · 6/15" / "Mở khóa khi xong bài 3"
    var questions: [Question] = []
}

struct Question: Identifiable, Hashable, Codable {
    let id = UUID()
    let stem: String
    let mediaCaption: String?
    let options: [String]
    let correctIndex: Int
    let explanation: String
    let source: String

    private enum CodingKeys: String, CodingKey {
        case stem, mediaCaption, options, correctIndex, explanation, source
    }
}

// MARK: - Kết quả một câu trả lời (để chấm điểm & lên lịch ôn tập)

struct QuizAnswer: Hashable {
    let question: Question
    let correct: Bool
}

// MARK: - Ôn tập giãn cách (Leitner)

/// Một thẻ trong lịch ôn tập. Trả lời đúng → đẩy lên hộp cao hơn (ôn thưa dần);
/// sai → về hộp 0 (ôn lại sớm).
struct ReviewItem: Codable, Identifiable {
    var question: Question
    var subject: SubjectKind
    var box: Int          // 0...4, hộp Leitner
    var dueDay: Int       // số ngày (kể từ mốc) khi thẻ đến hạn ôn

    var id: String { question.stem }
}

// MARK: - Nhật ký học theo ngày (cho báo cáo phụ huynh)

struct DayStat: Codable {
    var answered = 0
    var correct = 0
    var xp = 0
}

// MARK: - Hồ sơ người học

struct LearnerProfile: Codable {
    var name = "Nguyễn An Minh"
    var firstName = "Minh"
    var gradeLabel = "Lớp 4 · Kết nối tri thức"
    var level = 8
    var levelTitle = "Học trò chăm"
    var nextLevelTitle = "Tú tài nhí"
    var xp = 1240
    var xpForNext = 1800
    var streak = 12
    var seals = 6
}

struct Mastery: Identifiable {
    let id = UUID()
    let subject: SubjectKind
    var percent: Int
    var note: String
}

struct BadgeItem: Identifiable {
    let id = UUID()
    let glyph: String       // chữ Hán trên dấu son, hoặc "" nếu khóa
    let label: String
    let locked: Bool
}

// MARK: - Dữ liệu mẫu

enum SampleData {
    static let coLoaQuestions: [Question] = [
        Question(
            stem: "Thành Cổ Loa được xây dựng dưới thời vua nào?",
            mediaCaption: "Di tích Cổ Loa",
            options: ["Vua Hùng Vương thứ 6", "An Dương Vương (Thục Phán)", "Hai Bà Trưng", "Ngô Quyền"],
            correctIndex: 1,
            explanation: "Thành Cổ Loa do **An Dương Vương (Thục Phán)** cho xây khoảng thế kỷ III TCN, làm kinh đô nước Âu Lạc. Thành xoắn ốc nhiều vòng nên còn gọi là **Loa thành**.",
            source: "SGK Lịch sử & Địa lý 4 · Bài 3"
        ),
        Question(
            stem: "Thành Cổ Loa là kinh đô của nước nào?",
            mediaCaption: nil,
            options: ["Văn Lang", "Âu Lạc", "Đại Việt", "Vạn Xuân"],
            correctIndex: 1,
            explanation: "Sau khi thống nhất, An Dương Vương lập nên nước **Âu Lạc** và chọn Cổ Loa làm kinh đô.",
            source: "SGK Lịch sử & Địa lý 4 · Bài 3"
        ),
        Question(
            stem: "Vì sao thành Cổ Loa còn được gọi là Loa thành?",
            mediaCaption: nil,
            options: ["Vì gần biển", "Vì có hình xoắn ốc nhiều vòng", "Vì xây bằng vỏ ốc", "Vì vua thích ốc"],
            correctIndex: 1,
            explanation: "Thành được đắp thành **nhiều vòng xoáy trôn ốc**, nên dân gian gọi là Loa thành (loa nghĩa là con ốc).",
            source: "SGK Lịch sử & Địa lý 4 · Bài 3"
        ),
        Question(
            stem: "Nước Văn Lang do ai đứng đầu?",
            mediaCaption: nil,
            options: ["An Dương Vương", "Các Vua Hùng", "Bà Triệu", "Lý Bí"],
            correctIndex: 1,
            explanation: "Nhà nước Văn Lang — nhà nước đầu tiên của người Việt — do **các Vua Hùng** đứng đầu.",
            source: "SGK Lịch sử & Địa lý 4 · Bài 1"
        ),
        Question(
            stem: "Lễ giỗ Tổ Hùng Vương được tổ chức vào ngày nào?",
            mediaCaption: nil,
            options: ["10 tháng 3 âm lịch", "2 tháng 9", "15 tháng 8 âm lịch", "1 tháng 1"],
            correctIndex: 0,
            explanation: "Hằng năm vào **mùng 10 tháng 3 âm lịch**, nhân dân cả nước hướng về Đền Hùng để tưởng nhớ các Vua Hùng.",
            source: "SGK Lịch sử & Địa lý 4 · Bài 2"
        )
    ]

    static let history = Subject(
        kind: .history,
        title: "Lịch sử & Địa lý",
        totalLessons: 24,
        doneLessons: 8,
        chapters: [
            Chapter(title: "Chủ đề 1 · Buổi đầu dựng nước", lessons: [
                Lesson(index: 1, title: "Nước Văn Lang, Âu Lạc", questionCount: 14, state: .done, progressNote: "14 câu · đã hoàn thành"),
                Lesson(index: 2, title: "Đền Hùng và lễ giỗ Tổ", questionCount: 12, state: .done, progressNote: "12 câu · đã hoàn thành"),
                Lesson(index: 3, title: "Thành Cổ Loa", questionCount: 15, state: .current, progressNote: "15 câu · đang học · 6/15", questions: coLoaQuestions),
                Lesson(index: 4, title: "Ôn tập chủ đề 1", questionCount: 10, state: .locked, progressNote: "Mở khóa khi xong bài 3")
            ]),
            Chapter(title: "Chủ đề 2 · Trung du, miền núi Bắc Bộ", lessons: [
                Lesson(index: 5, title: "Thiên nhiên vùng núi", questionCount: 13, state: .locked, progressNote: "Sắp mở khóa")
            ])
        ]
    )

    static let subjects: [Subject] = [
        history,
        Subject(kind: .geography, title: "Địa lý", totalLessons: 20, doneLessons: 5, chapters: []),
        Subject(kind: .vietnamese, title: "Tiếng Việt", totalLessons: 30, doneLessons: 12, chapters: []),
        Subject(kind: .english, title: "Tiếng Anh", totalLessons: 28, doneLessons: 9, chapters: [])
    ]

    static let profile = LearnerProfile()

    static let mastery: [Mastery] = [
        .init(subject: .history, percent: 76, note: "Khá vững"),
        .init(subject: .geography, percent: 52, note: "Đang lên"),
        .init(subject: .vietnamese, percent: 64, note: "Khá vững"),
        .init(subject: .english, percent: 41, note: "Cần ôn thêm")
    ]

    static let badges: [BadgeItem] = [
        .init(glyph: "優", label: "Chăm chỉ", locked: false),
        .init(glyph: "勤", label: "7 ngày", locked: false),
        .init(glyph: "智", label: "Sử nhí", locked: false),
        .init(glyph: "", label: "Đang khóa", locked: true)
    ]
}
