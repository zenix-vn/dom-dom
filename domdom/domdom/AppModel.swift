//
//  AppModel.swift
//  domdom
//
//  Trạng thái ứng dụng dùng chung — có lưu lại qua các lần mở app,
//  nuôi "sự sống" cho linh vật Đom Đóm, lên lịch ôn tập giãn cách
//  và ghi nhật ký học cho báo cáo phụ huynh.
//

import SwiftUI

@MainActor
@Observable
final class AppModel {
    var hasOnboarded = false { didSet { save() } }
    var selectedGrade = 4 { didSet { save() } }
    var profile = SampleData.profile
    var subjects = SampleData.subjects
    var mastery = SampleData.mastery

    /// Năng lượng phát sáng của Đom Đóm (0...1). Học → đầy, bỏ bê → mờ dần.
    var fireflyEnergy: Double = 1.0

    /// Lịch ôn tập giãn cách, khóa theo nội dung câu hỏi (stem) để bền qua các lần mở app.
    var reviews: [String: ReviewItem] = [:]

    /// Nhật ký học theo ngày (khóa = số ngày kể từ mốc tham chiếu).
    var studyLog: [Int: DayStat] = [:]

    /// Ngày học gần nhất (số ngày kể từ mốc tham chiếu). nil nếu chưa từng học.
    @ObservationIgnored private var lastStudyDay: Int? = nil
    @ObservationIgnored private var isLoading = false

    var historySubject: Subject { subjects.first { $0.kind == .history } ?? SampleData.history }

    init() {
        if !load() { seedFreshState() }
        refreshDailyDecay()
    }

    // MARK: - Đom Đóm sống

    /// Lời nhắn + việc có phát sáng hay không, suy ra từ năng lượng hiện tại.
    var fireflyMood: (text: String, glowing: Bool) {
        switch fireflyEnergy {
        case 0.66...:     ("Đom Đóm đang rực sáng — cậu học đều lắm!", true)
        case 0.33..<0.66: ("Đom Đóm hơi mờ rồi — học một bài để thắp sáng nhé!", true)
        default:          ("Đom Đóm sắp tắt mất! Học ngay để cứu bạn ấy nào.", false)
        }
    }

    /// Tính hao hụt ánh sáng cho những ngày không học (gọi khi mở app).
    private func refreshDailyDecay() {
        guard let last = lastStudyDay else { return }
        let gap = AppModel.today - last
        guard gap >= 1 else { return }
        // Mỗi ngày bỏ bê, ánh sáng giảm ~0.34 (≈ 3 ngày là tắt hẳn).
        fireflyEnergy = max(0, fireflyEnergy - Double(gap) * 0.34)
        // Lỡ trọn một ngày → đứt chuỗi.
        if gap >= 2 { profile.streak = 0 }
        save()
    }

    // MARK: - Ôn tập giãn cách

    /// Số ngày thêm vào sau khi trả lời ĐÚNG, theo từng hộp Leitner.
    private static let reviewIntervals = [1, 2, 4, 8, 16]

    /// Các thẻ đã đến hạn ôn hôm nay (cũ nhất trước), tối đa 12 thẻ/ngày.
    var dueReviews: [ReviewItem] {
        let today = AppModel.today
        return reviews.values
            .filter { $0.dueDay <= today }
            .sorted { $0.dueDay < $1.dueDay }
            .prefix(12)
            .map { $0 }
    }

    var dueReviewQuestions: [Question] { dueReviews.map(\.question) }
    var dueCount: Int { dueReviews.count }

    /// Cập nhật lịch cho một câu sau khi trả lời.
    private func scheduleReview(question: Question, subject: SubjectKind, correct: Bool) {
        let today = AppModel.today
        let existing = reviews[question.stem]
        var box = existing?.box ?? 0
        if correct {
            box = min(box + 1, AppModel.reviewIntervals.count - 1)
        } else {
            box = 0
        }
        let due = correct ? today + AppModel.reviewIntervals[box] : today + 1
        reviews[question.stem] = ReviewItem(
            question: question,
            subject: existing?.subject ?? subject,
            box: box,
            dueDay: due
        )
    }

    // MARK: - Ghi nhận kết quả làm bài

    /// Cập nhật điểm, cấp độ, chuỗi ngày, mức thành thạo, lịch ôn tập,
    /// nhật ký học & thắp sáng Đom Đóm — từ kết quả từng câu.
    func recordQuiz(subject: SubjectKind, answers: [QuizAnswer]) {
        guard !answers.isEmpty else { return }
        let correct = answers.filter(\.correct).count
        let total = answers.count
        let gained = correct * 15
        profile.xp += gained

        // Lên cấp khi đủ điểm; mốc kế tiếp tăng dần.
        while profile.xp >= profile.xpForNext {
            profile.xp -= profile.xpForNext
            profile.level += 1
            profile.xpForNext = Int(Double(profile.xpForNext) * 1.25)
        }

        let today = AppModel.today

        // Chuỗi ngày: chỉ tính một lần mỗi ngày.
        if lastStudyDay != today {
            if let last = lastStudyDay {
                profile.streak = (today - last == 1) ? profile.streak + 1 : 1
            } // lần học đầu tiên: giữ nguyên chuỗi khởi tạo
            lastStudyDay = today
        }

        // Đóng dấu son khi đạt 3 sao.
        let ratio = Double(correct) / Double(total)
        if ratio >= 0.9 { profile.seals += 1 }

        // Nhích mức thành thạo của môn về phía điểm vừa đạt.
        if let i = mastery.firstIndex(where: { $0.subject == subject }) {
            let target = Int(ratio * 100)
            let nudged = mastery[i].percent + Int(Double(target - mastery[i].percent) * 0.25)
            mastery[i].percent = min(100, max(mastery[i].percent, nudged))
            mastery[i].note = AppModel.note(for: mastery[i].percent)
        }

        // Lên lịch ôn tập cho từng câu.
        for a in answers {
            scheduleReview(question: a.question, subject: subject, correct: a.correct)
        }

        // Ghi nhật ký học hôm nay.
        var day = studyLog[today] ?? DayStat()
        day.answered += total
        day.correct += correct
        day.xp += gained
        studyLog[today] = day

        // Thắp sáng lại Đom Đóm.
        fireflyEnergy = 1.0
        save()
    }

    static func note(for percent: Int) -> String {
        switch percent {
        case 80...:    "Rất vững"
        case 65..<80:  "Khá vững"
        case 45..<65:  "Đang lên"
        default:       "Cần ôn thêm"
        }
    }

    // MARK: - Báo cáo phụ huynh

    /// Thống kê 7 ngày gần nhất (cũ → mới) cho biểu đồ tuần.
    var weeklyStats: [(day: Int, stat: DayStat)] {
        let today = AppModel.today
        return (0..<7).reversed().map { offset in
            let d = today - offset
            return (d, studyLog[d] ?? DayStat())
        }
    }

    var weeklyAnswered: Int { weeklyStats.reduce(0) { $0 + $1.stat.answered } }
    var weeklyCorrect: Int { weeklyStats.reduce(0) { $0 + $1.stat.correct } }
    var weeklyAccuracy: Int {
        weeklyAnswered == 0 ? 0 : Int(Double(weeklyCorrect) / Double(weeklyAnswered) * 100)
    }
    var daysActiveThisWeek: Int { weeklyStats.filter { $0.stat.answered > 0 }.count }

    var strongestSubject: Mastery? { mastery.max { $0.percent < $1.percent } }
    var weakestSubject: Mastery? { mastery.min { $0.percent < $1.percent } }

    // MARK: - Lưu / nạp

    private struct Snapshot: Codable {
        var hasOnboarded: Bool
        var selectedGrade: Int
        var profile: LearnerProfile
        var masteryPercents: [String: Int]
        var fireflyEnergy: Double
        var lastStudyDay: Int?
        var reviews: [String: ReviewItem]
        var studyLog: [Int: DayStat]
    }

    private static let storeKey = "domdom.state.v2"

    /// Số ngày kể từ mốc tham chiếu — dùng so sánh ngày, không phụ thuộc giờ.
    private static var today: Int {
        Int(Date().timeIntervalSinceReferenceDate / 86_400)
    }

    private func save() {
        guard !isLoading else { return }
        let snap = Snapshot(
            hasOnboarded: hasOnboarded,
            selectedGrade: selectedGrade,
            profile: profile,
            masteryPercents: Dictionary(uniqueKeysWithValues: mastery.map { ($0.subject.rawValue, $0.percent) }),
            fireflyEnergy: fireflyEnergy,
            lastStudyDay: lastStudyDay,
            reviews: reviews,
            studyLog: studyLog
        )
        if let data = try? JSONEncoder().encode(snap) {
            UserDefaults.standard.set(data, forKey: AppModel.storeKey)
        }
    }

    /// Trả về true nếu nạp được trạng thái đã lưu.
    @discardableResult
    private func load() -> Bool {
        guard let data = UserDefaults.standard.data(forKey: AppModel.storeKey),
              let snap = try? JSONDecoder().decode(Snapshot.self, from: data) else { return false }
        isLoading = true
        defer { isLoading = false }

        hasOnboarded = snap.hasOnboarded
        selectedGrade = snap.selectedGrade
        profile = snap.profile
        fireflyEnergy = snap.fireflyEnergy
        lastStudyDay = snap.lastStudyDay
        reviews = snap.reviews
        studyLog = snap.studyLog
        for i in mastery.indices {
            if let p = snap.masteryPercents[mastery[i].subject.rawValue] {
                mastery[i].percent = p
                mastery[i].note = AppModel.note(for: p)
            }
        }
        return true
    }

    /// Gieo dữ liệu mẫu cho lần chạy đầu: vài thẻ ôn tập đến hạn + ít ngày học gần đây,
    /// để các tính năng có nội dung sống ngay.
    private func seedFreshState() {
        let today = AppModel.today
        // Thẻ ôn tập: lấy từ các câu Cổ Loa, đặt một số đến hạn hôm nay.
        for (i, q) in SampleData.coLoaQuestions.enumerated() {
            let due = i < 4 ? today - 1 : today + 2   // 4 thẻ đến hạn, 1 thẻ ôn sau
            reviews[q.stem] = ReviewItem(question: q, subject: .history,
                                         box: i < 4 ? 0 : 2, dueDay: due)
        }
        // Nhật ký 7 ngày gần nhất (mẫu) cho biểu đồ tuần.
        let sample: [Int: DayStat] = [
            today - 6: DayStat(answered: 12, correct: 9, xp: 135),
            today - 5: DayStat(answered: 15, correct: 13, xp: 195),
            today - 4: DayStat(answered: 0,  correct: 0,  xp: 0),
            today - 3: DayStat(answered: 18, correct: 15, xp: 225),
            today - 2: DayStat(answered: 10, correct: 8,  xp: 120),
            today - 1: DayStat(answered: 14, correct: 12, xp: 180)
        ]
        studyLog = sample
    }
}
