//
//  SubjectDetailView.swift
//  domdom
//
//  03 · Môn học — thẻ tổng quan + danh sách bài theo chủ đề.
//

import SwiftUI

struct SubjectDetailView: View {
    let subject: Subject
    @Environment(AppModel.self) private var model
    @State private var activeLesson: Lesson?

    var body: some View {
        ZStack {
            Wallpaper(kind: subject.kind == .history ? .subject : .home)

            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    headerCard

                    if subject.chapters.isEmpty {
                        emptyState
                    } else {
                        ForEach(subject.chapters) { chapter in
                            chapterLabel(chapter.title)
                            ForEach(chapter.lessons) { lesson in
                                lessonRow(lesson)
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 4)
                .padding(.bottom, 110)
            }
        }
        .navigationTitle(subject.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button { } label: { Image(systemName: "magnifyingglass") }
            }
        }
        .navigationDestination(item: $activeLesson) { lesson in
            QuizView(lesson: lesson, subjectTint: subject.tint, subjectKind: subject.kind)
        }
    }

    private var headerCard: some View {
        ZStack(alignment: .bottomTrailing) {
            Image(systemName: subject.kind.iconName)
                .font(.system(size: 110))
                .foregroundStyle(.white.opacity(0.16))
                .offset(x: 18, y: 24)

            VStack(alignment: .leading, spacing: 0) {
                Text("Lớp 4 · Kết nối tri thức")
                    .font(.system(size: 11, weight: .bold)).tracking(1.4)
                    .opacity(0.85)
                Text(subject.title)
                    .font(.serif(24))
                    .padding(.top, 4)
                HStack(spacing: 20) {
                    metric("\(subject.doneLessons)/\(subject.totalLessons)", "Bài đã học")
                    metric("\(Int(subject.progress * 100))%", "Hoàn thành")
                    metric("\(model.profile.seals)", "Dấu son")
                }
                .padding(.top, 15)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .foregroundStyle(.white)
            .padding(18)
        }
        .background(subject.kind.gradient, in: .rect(cornerRadius: 26))
        .glassEffect(.clear, in: .rect(cornerRadius: 26))
        .clipShape(.rect(cornerRadius: 26))
        .shadow(color: subject.tint.opacity(0.35), radius: 16, y: 10)
        .padding(.bottom, 20)
    }

    private func metric(_ value: String, _ label: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(value).font(.system(size: 19, weight: .heavy))
            Text(label).font(.system(size: 11.5, weight: .semibold)).opacity(0.92)
        }
    }

    private func chapterLabel(_ title: String) -> some View {
        HStack(spacing: 8) {
            RoundedRectangle(cornerRadius: 3).fill(subject.tint).frame(width: 8, height: 8)
            Text(title.uppercased())
                .font(.system(size: 12.5, weight: .heavy)).tracking(0.6)
                .foregroundStyle(subject.tint)
        }
        .padding(.bottom, 12)
    }

    private func lessonRow(_ lesson: Lesson) -> some View {
        Button {
            if lesson.state != .locked { activeLesson = lesson }
        } label: {
            HStack(spacing: 13) {
                Text("\(lesson.index)")
                    .font(.system(size: 14, weight: .heavy))
                    .foregroundStyle(subject.tint)
                    .frame(width: 36, height: 36)
                    .background(subject.tint.opacity(0.16), in: .rect(cornerRadius: 12))

                VStack(alignment: .leading, spacing: 2) {
                    Text(lesson.title)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(Palette.ink)
                    Text(lesson.progressNote)
                        .font(.system(size: 11.5, weight: .medium))
                        .foregroundStyle(Palette.inkSoft)
                }
                Spacer(minLength: 8)
                trailing(lesson)
            }
            .padding(.horizontal, 14).padding(.vertical, 13)
            .glassEffect(.regular, in: .rect(cornerRadius: 20))
            .overlay {
                if lesson.state == .current {
                    RoundedRectangle(cornerRadius: 20).strokeBorder(subject.tint.opacity(0.4), lineWidth: 1)
                }
            }
            .opacity(lesson.state == .locked ? 0.5 : 1)
        }
        .buttonStyle(.plain)
        .disabled(lesson.state == .locked)
        .padding(.bottom, 11)
    }

    @ViewBuilder
    private func trailing(_ lesson: Lesson) -> some View {
        switch lesson.state {
        case .done:
            SealView(glyph: "優", size: 34)
        case .current:
            ZStack {
                Circle().trim(from: 0, to: 0.4)
                    .stroke(subject.tint, style: StrokeStyle(lineWidth: 2.2, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                Image(systemName: "checkmark")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundStyle(subject.tint)
            }
            .frame(width: 28, height: 28)
        case .locked:
            Image(systemName: "lock.fill")
                .font(.system(size: 12))
                .foregroundStyle(Color(hex: 0xB5A584))
                .frame(width: 28, height: 28)
                .overlay(Circle().strokeBorder(Palette.inkSoft.opacity(0.35), lineWidth: 2))
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "hourglass")
                .font(.system(size: 40))
                .foregroundStyle(subject.tint.opacity(0.7))
            Text("Nội dung đang được biên soạn")
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(Palette.ink)
            Text("Các bài học môn này sẽ sớm có mặt.")
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Palette.inkSoft)
        }
        .frame(maxWidth: .infinity)
        .padding(28)
        .glassEffect(.regular, in: .rect(cornerRadius: 24))
        .padding(.top, 20)
    }
}

#Preview {
    NavigationStack {
        SubjectDetailView(subject: SampleData.history)
    }
    .environment(AppModel())
}
