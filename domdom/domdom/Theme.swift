//
//  Theme.swift
//  domdom
//
//  Design system cho "Đom Đóm" — phối màu sơn mài + ngôn ngữ Liquid Glass (iOS 26).
//

import SwiftUI

// MARK: - Bảng màu

extension Color {
    init(hex: UInt32) {
        let r = Double((hex >> 16) & 0xFF) / 255
        let g = Double((hex >> 8) & 0xFF) / 255
        let b = Double(hex & 0xFF) / 255
        self.init(.sRGB, red: r, green: g, blue: b, opacity: 1)
    }
}

enum Palette {
    static let ink      = Color(hex: 0x2A2118)
    static let ink2     = Color(hex: 0x5B5044)
    static let inkSoft  = Color(hex: 0x857862)

    static let gold     = Color(hex: 0xC8922B)
    static let goldBright = Color(hex: 0xE7A12E)
    static let lacquer  = Color(hex: 0xB5392C)

    // Màu theo môn
    static let su  = Color(hex: 0xC0392B)   // Lịch sử
    static let dia = Color(hex: 0x1F8A78)   // Địa lý
    static let van = Color(hex: 0xCF9A2C)   // Tiếng Việt / Văn học
    static let anh = Color(hex: 0x3F76B0)   // Tiếng Anh
}

// MARK: - Font

extension Font {
    /// Tiêu đề kiểu "Lora" — dùng serif của hệ thống.
    static func serif(_ size: CGFloat, weight: Font.Weight = .semibold) -> Font {
        .system(size: size, weight: weight, design: .serif)
    }
}

// MARK: - Wallpaper (nền ấm nhiều màu sau lớp kính)

struct Wallpaper: View {
    enum Kind { case onboarding, home, subject, quiz, feedback, results, profile }
    let kind: Kind

    var body: some View {
        ZStack {
            base
            ForEach(Array(blobs.enumerated()), id: \.offset) { _, blob in
                RadialGradient(
                    colors: [blob.color, blob.color.opacity(0)],
                    center: blob.center,
                    startRadius: 0,
                    endRadius: blob.radius
                )
            }
        }
        .ignoresSafeArea()
    }

    private var base: some View {
        let pair: (Color, Color)
        switch kind {
        case .onboarding: pair = (Color(hex: 0xFBEFD2), Color(hex: 0xF6E4BE))
        case .home:       pair = (Color(hex: 0xFCF4E6), Color(hex: 0xF4E8D2))
        case .subject:    pair = (Color(hex: 0xF7E2DC), Color(hex: 0xF1D6CD))
        case .quiz:       pair = (Color(hex: 0xFBEEE6), Color(hex: 0xF4E3D6))
        case .feedback:   pair = (Color(hex: 0xDDEFEA), Color(hex: 0xCFE7E0))
        case .results:    pair = (Color(hex: 0xFCEFCE), Color(hex: 0xF6E3B8))
        case .profile:    pair = (Color(hex: 0xFCF3E4), Color(hex: 0xF3E7D1))
        }
        return LinearGradient(colors: [pair.0, pair.1], startPoint: .top, endPoint: .bottom)
    }

    private struct Blob { let color: Color; let center: UnitPoint; let radius: CGFloat }

    private var blobs: [Blob] {
        switch kind {
        case .onboarding:
            return [.init(color: Palette.goldBright.opacity(0.85), center: .init(x: 0.5, y: 0.05), radius: 320),
                    .init(color: Palette.gold.opacity(0.4), center: .init(x: 0.5, y: 1.0), radius: 300)]
        case .home:
            return [.init(color: Palette.goldBright.opacity(0.7), center: .init(x: 0.16, y: 0.1), radius: 220),
                    .init(color: Palette.su.opacity(0.5), center: .init(x: 0.94, y: 0.18), radius: 220),
                    .init(color: Palette.dia.opacity(0.5), center: .init(x: 0.86, y: 0.9), radius: 240),
                    .init(color: Palette.anh.opacity(0.45), center: .init(x: 0.08, y: 0.95), radius: 220)]
        case .subject:
            return [.init(color: Palette.su.opacity(0.8), center: .init(x: 0.5, y: 0.03), radius: 280),
                    .init(color: Color(hex: 0x8C2A20).opacity(0.5), center: .init(x: 0.5, y: 1.0), radius: 260)]
        case .quiz:
            return [.init(color: Palette.su.opacity(0.5), center: .init(x: 0.5, y: 0.0), radius: 260),
                    .init(color: Palette.goldBright.opacity(0.4), center: .init(x: 0.2, y: 1.0), radius: 260)]
        case .feedback:
            return [.init(color: Palette.dia.opacity(0.85), center: .init(x: 0.5, y: 0.1), radius: 280),
                    .init(color: Color(hex: 0x166E62).opacity(0.5), center: .init(x: 0.5, y: 1.0), radius: 260)]
        case .results:
            return [.init(color: Palette.goldBright.opacity(0.9), center: .init(x: 0.5, y: 0.04), radius: 300),
                    .init(color: Palette.gold.opacity(0.5), center: .init(x: 0.5, y: 1.0), radius: 260)]
        case .profile:
            return [.init(color: Palette.goldBright.opacity(0.7), center: .init(x: 0.14, y: 0.08), radius: 220),
                    .init(color: Palette.su.opacity(0.45), center: .init(x: 0.94, y: 0.16), radius: 220),
                    .init(color: Palette.anh.opacity(0.45), center: .init(x: 0.9, y: 0.96), radius: 240)]
        }
    }
}

// MARK: - Tiện ích gradient theo môn

extension SubjectKind {
    var tint: Color {
        switch self {
        case .history: Palette.su
        case .geography: Palette.dia
        case .vietnamese: Palette.van
        case .english: Palette.anh
        }
    }

    var gradient: LinearGradient {
        let c = tint
        return LinearGradient(
            colors: [c.opacity(0.92), c.mix(with: .black, by: 0.18).opacity(0.85)],
            startPoint: .topLeading, endPoint: .bottomTrailing
        )
    }
}

let lacquerGradient = LinearGradient(
    colors: [Color(hex: 0xC0392B), Color(hex: 0x8C2A20)],
    startPoint: .topLeading, endPoint: .bottomTrailing
)

let goldGradient = LinearGradient(
    colors: [Color(hex: 0xF4C24B), Color(hex: 0xE7A12E)],
    startPoint: .leading, endPoint: .trailing
)
