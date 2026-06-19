//
//  ResultsView.swift
//  domdom
//
//  06 · Kết quả — đóng dấu son, thống kê, chuỗi ngày.
//

import SwiftUI

struct ResultsView: View {
    let lesson: Lesson
    let subjectTint: Color
    var subjectKind: SubjectKind = .history
    let correct: Int
    let total: Int
    let seconds: Int
    var answers: [QuizAnswer] = []

    @Environment(\.dismiss) private var dismiss
    @Environment(AppModel.self) private var model
    @State private var recorded = false

    private var stars: Int {
        let ratio = Double(correct) / Double(max(total, 1))
        return ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1
    }
    private var points: Int { correct * 15 }
    private var timeString: String { String(format: "%d:%02d", seconds / 60, seconds % 60) }

    var body: some View {
        ZStack {
            Wallpaper(kind: .results)

            VStack(spacing: 0) {
                stamp.padding(.top, 14)

                Text("Đóng dấu bài học!")
                    .font(.serif(26))
                    .foregroundStyle(Color(hex: 0x6A4D12))
                    .padding(.top, 14)
                Text("Bài \(lesson.index) · \(lesson.title)")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(Color(hex: 0x8A6C2A))
                    .padding(.top, 5)

                starsRow.padding(.vertical, 18)

                statsRow

                streakBand.padding(.top, 11)

                Spacer(minLength: 18)

                Button {
                    dismiss()
                } label: {
                    Text("Học bài tiếp theo")
                        .font(.system(size: 16, weight: .bold))
                        .frame(maxWidth: .infinity).frame(height: 54)
                }
                .buttonStyle(.glassProminent)
                .tint(subjectTint)

                Button("Về trang chủ") { dismiss() }
                    .font(.system(size: 14.5, weight: .bold))
                    .foregroundStyle(Color(hex: 0x8A6C2A))
                    .frame(height: 46)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 26)
        }
        .navigationBarBackButtonHidden(true)
        .toolbar(.hidden, for: .navigationBar)
        .onAppear {
            guard !recorded else { return }
            recorded = true
            model.recordQuiz(subject: subjectKind, answers: answers)
        }
    }

    private var stamp: some View {
        VStack(spacing: 2) {
            Text("優").font(.serif(30))
            Text("HOÀN THÀNH").font(.system(size: 9.5, weight: .heavy)).tracking(1.5)
        }
        .foregroundStyle(Palette.lacquer)
        .frame(width: 122, height: 122)
        .background(.white.opacity(0.45), in: .rect(cornerRadius: 26))
        .overlay(RoundedRectangle(cornerRadius: 26).strokeBorder(Palette.lacquer, lineWidth: 4))
        .overlay(RoundedRectangle(cornerRadius: 18).strokeBorder(Palette.lacquer.opacity(0.45), lineWidth: 1.5).padding(8))
        .rotationEffect(.degrees(-8))
        .shadow(color: Palette.lacquer.opacity(0.5), radius: 18, y: 12)
    }

    private var starsRow: some View {
        HStack(spacing: 10) {
            ForEach(0..<3) { i in
                Image(systemName: "star.fill")
                    .font(.system(size: 34))
                    .foregroundStyle(i < stars ? Palette.goldBright : Color(hex: 0xEADFC6))
            }
        }
    }

    private var statsRow: some View {
        HStack(spacing: 11) {
            stat("\(correct)/\(total)", "Câu đúng", Palette.su)
            stat("+\(points)", "Điểm", Palette.gold)
            stat(timeString, "Thời gian", Palette.ink)
        }
    }

    private func stat(_ value: String, _ label: String, _ color: Color) -> some View {
        VStack(spacing: 4) {
            Text(value).font(.system(size: 21, weight: .heavy)).foregroundStyle(color)
            Text(label).font(.system(size: 10.5, weight: .semibold)).foregroundStyle(Palette.inkSoft)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .glassEffect(.regular, in: .rect(cornerRadius: 20))
    }

    private var streakBand: some View {
        HStack(spacing: 10) {
            Image(systemName: "flame.fill").font(.system(size: 20)).foregroundStyle(Palette.goldBright)
            Text("Chuỗi ").foregroundStyle(Palette.ink)
            + Text("\(model.profile.streak) ngày").foregroundStyle(Color(hex: 0xA06A14)).bold()
            + Text(" — giữ vững nhé!").foregroundStyle(Palette.ink)
        }
        .font(.system(size: 14, weight: .bold))
        .frame(maxWidth: .infinity)
        .padding(14)
        .glassEffect(.regular, in: .rect(cornerRadius: 20))
    }
}

#Preview {
    NavigationStack {
        ResultsView(lesson: SampleData.history.chapters[0].lessons[2], subjectTint: Palette.su,
                    subjectKind: .history, correct: 13, total: 15, seconds: 168)
    }
    .environment(AppModel())
}
