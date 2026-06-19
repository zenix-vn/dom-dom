//
//  QuizView.swift
//  domdom
//
//  04 · Câu hỏi  ·  05 · Phản hồi (sheet kính)  ·  06 · Kết quả.
//

import SwiftUI
import Combine

struct QuizView: View {
    let lesson: Lesson
    let subjectTint: Color
    var subjectKind: SubjectKind = .history
    var titleOverride: String? = nil

    @Environment(\.dismiss) private var dismiss

    @State private var index = 0
    @State private var selected: Int? = nil
    @State private var showFeedback = false
    @State private var correctCount = 0
    @State private var answers: [QuizAnswer] = []
    @State private var finished = false
    @State private var elapsed = 0

    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    private var questions: [Question] {
        lesson.questions.isEmpty ? SampleData.coLoaQuestions : lesson.questions
    }
    private var question: Question { questions[index] }
    private var isLast: Bool { index == questions.count - 1 }
    private var isCorrect: Bool { selected == question.correctIndex }

    var body: some View {
        ZStack {
            Wallpaper(kind: .quiz)

            VStack(spacing: 0) {
                topBar
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        Text("Câu \(index + 1) / \(questions.count) · Bài: \(lesson.title)")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundStyle(Palette.inkSoft)
                            .padding(.bottom, 7)

                        Text(question.stem)
                            .font(.serif(21))
                            .foregroundStyle(Palette.ink)
                            .fixedSize(horizontal: false, vertical: true)
                            .padding(.bottom, 14)

                        if let caption = question.mediaCaption {
                            media(caption)
                        }

                        VStack(spacing: 11) {
                            ForEach(Array(question.options.enumerated()), id: \.offset) { i, opt in
                                optionRow(i, opt)
                            }
                        }

                        Button(action: check) {
                            Text("Kiểm tra")
                                .font(.system(size: 16, weight: .bold))
                                .frame(maxWidth: .infinity).frame(height: 56)
                        }
                        .buttonStyle(.glassProminent)
                        .tint(subjectTint)
                        .disabled(selected == nil)
                        .opacity(selected == nil ? 0.6 : 1)
                        .padding(.top, 18)
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 40)
                }
            }
        }
        .navigationBarBackButtonHidden(true)
        .toolbar(.hidden, for: .navigationBar)
        .onReceive(timer) { _ in if !showFeedback && !finished { elapsed += 1 } }
        .sheet(isPresented: $showFeedback) {
            FeedbackSheet(question: question, correct: isCorrect, isLast: isLast,
                          subjectTint: subjectTint, onNext: next)
                .presentationDetents([.fraction(0.62), .large])
                .presentationDragIndicator(.visible)
                .presentationBackground(.clear)
                .interactiveDismissDisabled()
        }
        .navigationDestination(isPresented: $finished) {
            ResultsView(lesson: lesson, subjectTint: subjectTint, subjectKind: subjectKind,
                        correct: correctCount, total: questions.count, seconds: elapsed,
                        answers: answers)
        }
    }

    // MARK: Thanh trên

    private var topBar: some View {
        HStack(spacing: 11) {
            Button { dismiss() } label: {
                Image(systemName: "xmark").font(.system(size: 14, weight: .bold))
                    .foregroundStyle(Palette.ink2).frame(width: 36, height: 36)
            }
            .buttonStyle(.glass)

            ProgressView(value: Double(index + (showFeedback ? 1 : 0)), total: Double(questions.count))
                .tint(subjectTint)
                .scaleEffect(x: 1, y: 1.6, anchor: .center)
                .glassEffect(.regular, in: .capsule)
                .frame(height: 10)

            HStack(spacing: 5) {
                Image(systemName: "clock.fill")
                Text(timeString)
            }
            .font(.system(size: 13, weight: .heavy))
            .foregroundStyle(subjectTint)
            .padding(.horizontal, 12).padding(.vertical, 8)
            .glassEffect(.regular, in: .capsule)
        }
        .padding(.horizontal, 20)
        .padding(.top, 8)
        .padding(.bottom, 18)
    }

    private var timeString: String {
        String(format: "%d:%02d", elapsed / 60, elapsed % 60)
    }

    private func media(_ caption: String) -> some View {
        ZStack(alignment: .bottomTrailing) {
            LinearGradient(colors: [Color(hex: 0xE9D9B6).opacity(0.6), Color(hex: 0xD8C49A).opacity(0.5)],
                           startPoint: .topLeading, endPoint: .bottomTrailing)
            Image(systemName: "building.columns")
                .font(.system(size: 46))
                .foregroundStyle(Color(hex: 0x9A7C4E).opacity(0.75))
            Text(caption)
                .font(.system(size: 10, weight: .bold))
                .foregroundStyle(Color(hex: 0x9A7C4E))
                .padding(8)
        }
        .frame(height: 118)
        .glassEffect(.regular, in: .rect(cornerRadius: 20))
        .clipShape(.rect(cornerRadius: 20))
        .padding(.bottom, 18)
    }

    private func optionRow(_ i: Int, _ text: String) -> some View {
        let isSel = selected == i
        return Button {
            withAnimation(.snappy) { selected = i }
        } label: {
            HStack(spacing: 13) {
                Text(String(UnicodeScalar(65 + i)!))
                    .font(.system(size: 14, weight: .heavy))
                    .foregroundStyle(isSel ? .white : Palette.ink2)
                    .frame(width: 32, height: 32)
                    .background((isSel ? Color.white.opacity(0.3) : Palette.inkSoft.opacity(0.14)),
                               in: .rect(cornerRadius: 10))
                Text(text)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(isSel ? .white : Palette.ink)
                    .multilineTextAlignment(.leading)
                Spacer(minLength: 0)
            }
            .padding(.horizontal, 15).padding(.vertical, 14)
            .background {
                if isSel {
                    RoundedRectangle(cornerRadius: 18).fill(subjectTint.gradientFill)
                }
            }
            .glassEffect(isSel ? .clear : .regular, in: .rect(cornerRadius: 18))
        }
        .buttonStyle(.plain)
    }

    // MARK: Luồng

    private func check() {
        if isCorrect { correctCount += 1 }
        answers.append(QuizAnswer(question: question, correct: isCorrect))
        showFeedback = true
    }

    private func next() {
        showFeedback = false
        if isLast {
            finished = true
        } else {
            withAnimation(.smooth) {
                index += 1
                selected = nil
            }
        }
    }
}

extension Color {
    var gradientFill: LinearGradient {
        LinearGradient(colors: [opacity(0.92), mix(with: .black, by: 0.18).opacity(0.86)],
                       startPoint: .topLeading, endPoint: .bottomTrailing)
    }
}

#Preview {
    NavigationStack {
        QuizView(lesson: SampleData.history.chapters[0].lessons[2], subjectTint: Palette.su)
    }
    .environment(AppModel())
}
