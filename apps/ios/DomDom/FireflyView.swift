import SwiftUI

/// Mascot Đom — độ sáng theo năng lượng (0...1). Nhấp nháy nhẹ.
struct FireflyView: View {
    let intensity: Double
    @State private var pulse = false

    var body: some View {
        Image(systemName: "sparkle")
            .font(.system(size: 64))
            .foregroundStyle(.yellow)
            .opacity(0.4 + 0.6 * intensity)
            .scaleEffect(pulse ? 1.08 : 0.96)
            .shadow(color: .yellow.opacity(intensity), radius: 20 * intensity)
            .animation(
                .easeInOut(duration: 1.4).repeatForever(autoreverses: true),
                value: pulse
            )
            .onAppear { pulse = true }
    }
}

#Preview { FireflyView(intensity: 0.8) }
