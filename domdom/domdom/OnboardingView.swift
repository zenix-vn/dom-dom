//
//  OnboardingView.swift
//  domdom
//
//  01 · Mở đầu — giới thiệu ngắn 3 bước rồi chọn lớp.
//

import SwiftUI

struct OnboardingView: View {
    @Environment(AppModel.self) private var model
    @State private var step = 0

    private let lastStep = 2

    private struct Grade: Identifiable { let id = UUID(); let n: Int; let level: String }
    private let grades: [Grade] = [
        .init(n: 3, level: "Tiểu học"), .init(n: 4, level: "Tiểu học"), .init(n: 5, level: "Tiểu học"),
        .init(n: 6, level: "THCS"), .init(n: 7, level: "THCS"), .init(n: 8, level: "THCS")
    ]
    private let cols = Array(repeating: GridItem(.flexible(), spacing: 11), count: 3)

    var body: some View {
        ZStack {
            Wallpaper(kind: .onboarding)

            VStack(spacing: 0) {
                topBar

                TabView(selection: $step) {
                    welcomePage.tag(0)
                    featuresPage.tag(1)
                    gradePage.tag(2)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.smooth, value: step)

                bottomBar
            }
            .padding(.horizontal, 24)
            .padding(.top, 10)
            .padding(.bottom, 20)
        }
    }

    // MARK: - Thanh trên (nút Bỏ qua)

    private var topBar: some View {
        HStack {
            Spacer()
            if step < lastStep {
                Button("Bỏ qua") {
                    withAnimation(.smooth) { step = lastStep }
                }
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(Color(hex: 0x8A6C2A))
            }
        }
        .frame(height: 24)
    }

    // MARK: - Bước 1 · Chào

    private var welcomePage: some View {
        VStack(spacing: 0) {
            Spacer(minLength: 8)

            FireflyMascot(size: 190, glowing: true)

            Text("Chào cậu, tớ là Đóm!")
                .font(.serif(28))
                .foregroundStyle(Color(hex: 0x5A3D12))
                .padding(.top, 26)

            Text("Tớ là chú đom đóm nhỏ, sẽ học cùng cậu mỗi ngày\nvà thắp sáng tri thức bằng những câu hỏi thật vui.")
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(Color(hex: 0x7A5E2A))
                .multilineTextAlignment(.center)
                .lineSpacing(3)
                .padding(.top, 12)

            Spacer(minLength: 8)
        }
    }

    // MARK: - Bước 2 · Giới thiệu giá trị

    private var featuresPage: some View {
        VStack(alignment: .leading, spacing: 0) {
            Spacer(minLength: 8)

            HStack(spacing: 12) {
                FireflyMascot(size: 64)
                Text("Đom Đóm giúp gì\ncho cậu?")
                    .font(.serif(24))
                    .foregroundStyle(Color(hex: 0x5A3D12))
            }
            .padding(.bottom, 26)

            featureRow("book.closed.fill", Palette.su,
                       "Bám sát sách giáo khoa",
                       "Câu hỏi đúng chương trình lớp của cậu.")
            featureRow("arrow.triangle.2.circlepath", Palette.gold,
                       "Ôn tập giãn cách",
                       "Nhắc lại đúng lúc sắp quên, nhớ lâu hơn hẳn.")
            featureRow("flame.fill", Palette.lacquer,
                       "Nuôi Đom Đóm mỗi ngày",
                       "Học đều để giữ chuỗi ngày và thắp sáng Đóm.")

            Spacer(minLength: 8)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func featureRow(_ icon: String, _ tint: Color, _ title: String, _ desc: String) -> some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 20, weight: .semibold))
                .foregroundStyle(.white)
                .frame(width: 48, height: 48)
                .background(tint.gradientFill, in: .rect(cornerRadius: 15))
            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.system(size: 15.5, weight: .bold))
                    .foregroundStyle(Palette.ink)
                Text(desc)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(Palette.inkSoft)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 0)
        }
        .padding(14)
        .glassEffect(.regular, in: .rect(cornerRadius: 20))
        .padding(.bottom, 12)
    }

    // MARK: - Bước 3 · Chọn lớp

    private var gradePage: some View {
        VStack(spacing: 0) {
            Spacer(minLength: 8)

            Text("Cậu đang học lớp mấy nhỉ?")
                .font(.serif(24))
                .foregroundStyle(Color(hex: 0x5A3D12))
                .multilineTextAlignment(.center)

            Text("Để tớ chọn đúng bài cho cậu nhé.")
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(Color(hex: 0x7A5E2A))
                .padding(.top, 8)

            LazyVGrid(columns: cols, spacing: 11) {
                ForEach(grades) { g in gradeCard(g) }
            }
            .padding(.top, 24)

            seriesNote.padding(.top, 18)

            Spacer(minLength: 8)
        }
    }

    private func gradeCard(_ g: Grade) -> some View {
        let selected = model.selectedGrade == g.n
        return Button {
            withAnimation(.snappy) { model.selectedGrade = g.n }
        } label: {
            VStack(spacing: 2) {
                Text("\(g.n)")
                    .font(.system(size: 21, weight: .heavy))
                    .foregroundStyle(selected ? .white : Color(hex: 0x6A4D1C))
                Text(g.level)
                    .font(.system(size: 10.5, weight: .semibold))
                    .foregroundStyle(selected ? .white.opacity(0.9) : Color(hex: 0x90744A))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
        }
        .buttonStyle(.plain)
        .background {
            if selected {
                RoundedRectangle(cornerRadius: 20).fill(lacquerGradient)
                    .shadow(color: Palette.lacquer.opacity(0.5), radius: 12, y: 8)
            }
        }
        .glassEffect(selected ? .clear : .regular, in: .rect(cornerRadius: 20))
    }

    private var seriesNote: some View {
        HStack(spacing: 9) {
            Image(systemName: "books.vertical.fill")
                .foregroundStyle(Color(hex: 0x6A4D1C))
            Text("Bộ sách: ").foregroundStyle(Color(hex: 0x6A4D1C))
            + Text("Kết nối tri thức").foregroundStyle(Color(hex: 0x6A4D1C)).bold()
            + Text(" · đổi sau ở Cài đặt").foregroundStyle(Color(hex: 0x6A4D1C).opacity(0.8))
            Spacer(minLength: 0)
        }
        .font(.system(size: 12.5, weight: .semibold))
        .padding(.horizontal, 15).padding(.vertical, 13)
        .glassEffect(.regular, in: .rect(cornerRadius: 18))
    }

    // MARK: - Thanh dưới (chấm trang + nút chính)

    private var bottomBar: some View {
        VStack(spacing: 18) {
            HStack(spacing: 7) {
                ForEach(0...lastStep, id: \.self) { i in
                    Capsule()
                        .fill(i == step ? Palette.lacquer : Palette.inkSoft.opacity(0.3))
                        .frame(width: i == step ? 22 : 7, height: 7)
                        .animation(.snappy, value: step)
                }
            }

            Button {
                if step < lastStep {
                    withAnimation(.smooth) { step += 1 }
                } else {
                    withAnimation(.smooth) { model.hasOnboarded = true }
                }
            } label: {
                HStack(spacing: 9) {
                    Text(step < lastStep ? "Tiếp tục" : "Bắt đầu học")
                    Image(systemName: "arrow.right")
                }
                .font(.system(size: 16, weight: .bold))
                .frame(maxWidth: .infinity)
                .frame(height: 58)
            }
            .buttonStyle(.glassProminent)
            .tint(Palette.lacquer)
        }
    }

}

#Preview {
    OnboardingView().environment(AppModel())
}
