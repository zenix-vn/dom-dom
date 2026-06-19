//
//  Components.swift
//  domdom
//
//  Thành phần tái sử dụng: linh vật đom đóm, dấu son, thẻ kính.
//

import SwiftUI

// MARK: - Linh vật Đom Đóm

struct FireflyMascot: View {
    var size: CGFloat = 64
    var glowing: Bool = false
    /// Độ sáng của quầng khi đang phát sáng (0...1) — phản ánh năng lượng của Đóm.
    var intensity: Double = 1

    @State private var pulse = false

    var body: some View {
        ZStack {
            if glowing {
                Circle()
                    .fill(RadialGradient(colors: [Palette.goldBright.opacity(0.7 * max(0.25, intensity)), .clear],
                                         center: .center, startRadius: 0, endRadius: size * 0.9))
                    .frame(width: size * 1.7, height: size * 1.7)
                    .scaleEffect(pulse ? 1.08 : 0.9)
                    .opacity(pulse ? 1 : 0.65)
                    .animation(.easeInOut(duration: 1.6).repeatForever(autoreverses: true), value: pulse)
                    .onAppear { pulse = true }
            }
            Image("DomDomMascot")
                .resizable()
                .interpolation(.high)
                .scaledToFit()
                .frame(width: size, height: size)
        }
    }
}

// MARK: - Dấu son (con dấu chữ Hán)

struct SealView: View {
    var glyph: String = "優"
    var size: CGFloat = 34

    var body: some View {
        Text(glyph)
            .font(.serif(size * 0.44, weight: .semibold))
            .foregroundStyle(Palette.lacquer)
            .frame(width: size, height: size)
            .background(.white.opacity(0.4), in: RoundedRectangle(cornerRadius: size * 0.26))
            .overlay(RoundedRectangle(cornerRadius: size * 0.26).strokeBorder(Palette.lacquer, lineWidth: 2))
            .overlay(
                RoundedRectangle(cornerRadius: size * 0.18)
                    .strokeBorder(Palette.lacquer.opacity(0.5), lineWidth: 1)
                    .padding(3)
            )
            .rotationEffect(.degrees(-8))
    }
}

// MARK: - Vòng tiến độ (mastery ring)

struct ProgressRing: View {
    var percent: Int
    var color: Color
    var size: CGFloat = 46

    var body: some View {
        ZStack {
            Circle().stroke(Palette.inkSoft.opacity(0.18), lineWidth: 5)
            Circle()
                .trim(from: 0, to: CGFloat(percent) / 100)
                .stroke(color, style: StrokeStyle(lineWidth: 5, lineCap: .round))
                .rotationEffect(.degrees(-90))
            Text("\(percent)%")
                .font(.system(size: size * 0.28, weight: .bold))
                .foregroundStyle(color)
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Thẻ kính tiện dụng

struct GlassCard<Content: View>: View {
    var corner: CGFloat = 24
    var tint: Color? = nil
    @ViewBuilder var content: Content

    var body: some View {
        content
            .glassEffect(glass, in: .rect(cornerRadius: corner))
    }

    private var glass: Glass {
        if let tint { return .regular.tint(tint.opacity(0.5)) }
        return .regular
    }
}

// MARK: - Nhãn tiêu đề mục

struct SectionLabel: View {
    let title: String
    var action: String? = nil
    var actionColor: Color = Palette.lacquer

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(title).font(.system(size: 16, weight: .bold)).foregroundStyle(Palette.ink)
            Spacer()
            if let action {
                Text(action).font(.system(size: 12.5, weight: .bold)).foregroundStyle(actionColor)
            }
        }
    }
}
