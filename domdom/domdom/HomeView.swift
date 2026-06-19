//
//  HomeView.swift
//  domdom
//
//  02 · Trang chủ — lời chào, thử thách hôm nay, lưới môn học.
//

import SwiftUI

struct HomeView: View {
    @Environment(AppModel.self) private var model
    @State private var showDaily = false
    @State private var showReview = false
    private let cols = [GridItem(.flexible(), spacing: 13), GridItem(.flexible(), spacing: 13)]

    var body: some View {
        NavigationStack {
            ZStack {
                Wallpaper(kind: .home)
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        header
                        fireflyStatus.padding(.top, 16)
                        reviewCard.padding(.top, 13)
                        dailyCard.padding(.top, 13)
                        SectionLabel(title: "Môn học của bạn", action: "Tất cả")
                            .padding(.top, 22).padding(.bottom, 13)
                        LazyVGrid(columns: cols, spacing: 13) {
                            ForEach(model.subjects) { subject in
                                NavigationLink {
                                    SubjectDetailView(subject: subject)
                                } label: {
                                    SubjectTile(subject: subject)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 4)
                    .padding(.bottom, 110)
                }
                .navigationBarTitleDisplayMode(.inline)
                .toolbar(.hidden, for: .navigationBar)
            }
            .navigationDestination(isPresented: $showDaily) {
                QuizView(lesson: SampleData.history.chapters[0].lessons[2],
                         subjectTint: Palette.su,
                         subjectKind: .history,
                         titleOverride: "Thử thách hôm nay")
            }
            .navigationDestination(isPresented: $showReview) {
                QuizView(lesson: reviewLesson,
                         subjectTint: Palette.gold,
                         subjectKind: .history,
                         titleOverride: "Ôn tập hôm nay")
            }
        }
    }

    private var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(todayLabel)
                    .font(.system(size: 11, weight: .bold))
                    .tracking(1.4)
                    .foregroundStyle(Palette.inkSoft)
                Text("Chào \(model.profile.firstName)!")
                    .font(.serif(25))
                    .foregroundStyle(Palette.ink)
            }
            Spacer()
            HStack(spacing: 6) {
                Image(systemName: "flame.fill").foregroundStyle(Palette.goldBright)
                Text("\(model.profile.streak)")
            }
            .font(.system(size: 13, weight: .heavy))
            .foregroundStyle(Color(hex: 0x8A5A12))
            .padding(.horizontal, 13).padding(.vertical, 8)
            .glassEffect(.regular, in: .capsule)
        }
        .padding(.top, 4)
    }

    private var todayLabel: String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "vi_VN")
        f.dateFormat = "EEEE, dd/MM"
        return f.string(from: Date()).capitalized
    }

    // MARK: - Ôn tập giãn cách (thẻ đến hạn hôm nay)

    private var reviewLesson: Lesson {
        Lesson(index: 0, title: "Ôn tập giãn cách",
               questionCount: model.dueReviewQuestions.count,
               state: .current, progressNote: "",
               questions: model.dueReviewQuestions)
    }

    @ViewBuilder
    private var reviewCard: some View {
        let count = model.dueCount
        Button { if count > 0 { showReview = true } } label: {
            HStack(spacing: 14) {
                ZStack {
                    Circle().fill(Palette.gold.opacity(0.16)).frame(width: 46, height: 46)
                    Image(systemName: count > 0 ? "arrow.triangle.2.circlepath" : "checkmark")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(Palette.gold)
                }
                VStack(alignment: .leading, spacing: 3) {
                    Text("Ôn tập hôm nay")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(Palette.ink)
                    Text(count > 0
                         ? "\(count) thẻ cần ôn — nhớ lâu hơn nhé!"
                         : "Tuyệt! Hôm nay không còn thẻ nào cần ôn.")
                        .font(.system(size: 12.5, weight: .semibold))
                        .foregroundStyle(Palette.inkSoft)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 0)
                if count > 0 {
                    Text("\(count)")
                        .font(.system(size: 15, weight: .heavy))
                        .foregroundStyle(.white)
                        .frame(minWidth: 30, minHeight: 30)
                        .padding(.horizontal, 5)
                        .background(Palette.gold, in: .capsule)
                }
            }
            .padding(15)
            .glassEffect(.regular, in: .rect(cornerRadius: 22))
        }
        .buttonStyle(.plain)
        .disabled(count == 0)
    }

    // MARK: - Trạng thái Đom Đóm (linh vật sống theo việc học)

    private var fireflyStatus: some View {
        let mood = model.fireflyMood
        return HStack(spacing: 14) {
            FireflyMascot(size: 60, glowing: mood.glowing, intensity: model.fireflyEnergy)
                .frame(width: 60, height: 60)

            VStack(alignment: .leading, spacing: 7) {
                Text(mood.text)
                    .font(.system(size: 13.5, weight: .bold))
                    .foregroundStyle(Palette.ink)
                    .fixedSize(horizontal: false, vertical: true)
                ProgressView(value: model.fireflyEnergy)
                    .tint(Palette.goldBright)
                    .scaleEffect(x: 1, y: 1.1, anchor: .center)
            }
            Spacer(minLength: 0)
        }
        .padding(15)
        .glassEffect(.regular, in: .rect(cornerRadius: 22))
    }

    private var dailyCard: some View {
        Button { showDaily = true } label: {
            ZStack(alignment: .topTrailing) {
                FireflyMascot(size: 90)
                    .opacity(0.45)
                    .offset(x: 14, y: -10)

                VStack(alignment: .leading, spacing: 0) {
                    Text("THỬ THÁCH HÔM NAY")
                        .font(.system(size: 11, weight: .heavy)).tracking(1)
                        .opacity(0.92)
                    Text("10 câu hỏi nhanh · Lịch sử")
                        .font(.serif(20))
                        .padding(.top, 4)
                    HStack(spacing: 7) {
                        Text("Chơi ngay")
                        Image(systemName: "arrow.right")
                    }
                    .font(.system(size: 13, weight: .bold))
                    .padding(.horizontal, 16).padding(.vertical, 9)
                    .glassEffect(.clear.interactive(), in: .capsule)
                    .padding(.top, 13)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .foregroundStyle(.white)
            .padding(18)
            .background(SubjectKind.vietnamese.gradient.opacity(0.95), in: .rect(cornerRadius: 26))
            .glassEffect(.clear, in: .rect(cornerRadius: 26))
            .clipShape(.rect(cornerRadius: 26))
            .shadow(color: Palette.gold.opacity(0.4), radius: 18, y: 10)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Ô môn học

struct SubjectTile: View {
    let subject: Subject

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Image(systemName: subject.kind.iconName)
                .font(.system(size: 19, weight: .semibold))
                .foregroundStyle(.white)
                .frame(width: 40, height: 40)
                .background(.white.opacity(0.26), in: .rect(cornerRadius: 13))

            Spacer(minLength: 12)

            Text(subject.title)
                .font(.system(size: 15, weight: .bold))
            Text("\(subject.doneLessons)/\(subject.totalLessons) bài")
                .font(.system(size: 11, weight: .semibold))
                .opacity(0.92)
                .padding(.top, 2)

            ProgressView(value: subject.progress)
                .tint(.white)
                .scaleEffect(x: 1, y: 1.2, anchor: .center)
                .padding(.top, 8)
        }
        .foregroundStyle(.white)
        .padding(15)
        .frame(maxWidth: .infinity, minHeight: 124, alignment: .topLeading)
        .background(subject.kind.gradient, in: .rect(cornerRadius: 24))
        .glassEffect(.clear, in: .rect(cornerRadius: 24))
        .clipShape(.rect(cornerRadius: 24))
        .shadow(color: subject.tint.opacity(0.35), radius: 12, y: 8)
    }
}

#Preview {
    HomeView().environment(AppModel())
}
