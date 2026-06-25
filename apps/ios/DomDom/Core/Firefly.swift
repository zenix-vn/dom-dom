import Foundation

/// Port của @domdom/core (firefly.ts). TypeScript là chuẩn — giữ công thức khớp.
enum Firefly {
    static let decayPerDay = 0.34

    static func currentEnergy(energy: Double, lastUpdatedDay: Int, today: Int) -> Double {
        let idleDays = max(0, today - lastUpdatedDay)
        return clamp01(energy - decayPerDay * Double(idleDays))
    }

    static func feed(energy: Double, amount: Double) -> Double {
        clamp01(energy + amount)
    }

    private static func clamp01(_ x: Double) -> Double {
        max(0, min(1, x))
    }
}
