import SwiftUI

/// Một game trong registry (đọc từ Supabase, ở đây để mẫu tĩnh).
struct GameItem: Identifiable {
    let id: String
    let name: String
    let icon: String
    let entryURL: URL
}

struct ContentView: View {
    // TODO: nạp từ Supabase (bảng games), lọc platforms chứa "mobile".
    private let games: [GameItem] = [
        GameItem(
            id: "quiz",
            name: "Quiz kiến thức",
            icon: "❓",
            entryURL: URL(string: "https://app.domdom.vn/games/quiz/index.html")!
        )
    ]

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                FireflyView(intensity: 0.8)
                List(games) { game in
                    NavigationLink {
                        GameWebView(entry: game.entryURL, gameId: game.id)
                            .navigationTitle(game.name)
                            .navigationBarTitleDisplayMode(.inline)
                    } label: {
                        Label(game.name, systemImage: "gamecontroller")
                    }
                }
            }
            .navigationTitle("✨ Đom Đóm")
        }
    }
}

#Preview { ContentView() }
