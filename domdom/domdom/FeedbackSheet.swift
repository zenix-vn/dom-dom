//
//  FeedbackSheet.swift
//  domdom
//
//  05 · Phản hồi — sheet kính, giải thích & nguồn SGK.
//

import SwiftUI

struct FeedbackSheet: View {
    let question: Question
    let correct: Bool
    let isLast: Bool
    let subjectTint: Color
    let onNext: () -> Void

    private var accent: Color { correct ? Palette.dia : Palette.su }

    var body: some View {
        ZStack {
            Wallpaper(kind: correct ? .feedback : .quiz)

            VStack(spacing: 0) {
                VStack(spacing: 0) {
                    ZStack {
                        Circle().fill(accent.gradientFill)
                            .frame(width: 100, height: 100)
                            .shadow(color: accent.opacity(0.6), radius: 18, y: 10)
                        Image(systemName: correct ? "checkmark" : "xmark")
                            .font(.system(size: 44, weight: .bold))
                            .foregroundStyle(.white)
                    }
                    .padding(.top, 14)

                    Text(correct ? "Chính xác!" : "Chưa đúng rồi")
                        .font(.serif(28))
                        .foregroundStyle(correct ? Color(hex: 0x176256) : Palette.su)
                        .padding(.top, 14)

                    HStack(spacing: 7) {
                        Image(systemName: "star.fill").foregroundStyle(Palette.gold)
                        Text(correct ? "+15 điểm" : "Cố lên nhé!")
                    }
                    .font(.system(size: 14, weight: .heavy))
                    .foregroundStyle(Color(hex: 0x8A5A12))
                    .padding(.horizontal, 17).padding(.vertical, 9)
                    .glassEffect(.regular, in: .capsule)
                    .padding(.top, 14)
                }
                .frame(maxWidth: .infinity)

                Spacer(minLength: 16)

                explainCard.padding(.top, 18)

                Button(action: onNext) {
                    Text(isLast ? "Xem kết quả" : "Câu tiếp theo")
                        .font(.system(size: 16, weight: .bold))
                        .frame(maxWidth: .infinity).frame(height: 54)
                }
                .buttonStyle(.glassProminent)
                .tint(accent)
                .padding(.top, 14)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 26)
        }
    }

    private var explainCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 8) {
                Image(systemName: "lightbulb.fill").foregroundStyle(Palette.gold)
                Text("GIẢI THÍCH").tracking(0.6)
            }
            .font(.system(size: 12, weight: .heavy))
            .foregroundStyle(Palette.gold)
            .padding(.bottom, 9)

            Text(attributed(question.explanation))
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(Color(hex: 0x3F3526))
                .lineSpacing(4)
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 7) {
                Image(systemName: "doc.text")
                Text(question.source)
            }
            .font(.system(size: 11.5, weight: .semibold))
            .foregroundStyle(Palette.inkSoft)
            .padding(.top, 12)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(18)
        .glassEffect(.regular, in: .rect(cornerRadius: 24))
    }

    private func attributed(_ md: String) -> AttributedString {
        (try? AttributedString(markdown: md)) ?? AttributedString(md)
    }
}

#Preview {
    FeedbackSheet(question: SampleData.coLoaQuestions[0], correct: true, isLast: false,
                  subjectTint: Palette.su, onNext: {})
}
