import SwiftUI
import WebKit

/// Nạp một game web trong WKWebView và cầu nối postMessage giống web host.
/// Giao thức khớp `packages/game-sdk/src/protocol.ts`.
struct GameWebView: UIViewRepresentable {
    let entry: URL
    let gameId: String

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        let controller = WKUserContentController()
        // Game gọi window.webkit.messageHandlers.domdom.postMessage({...})
        controller.add(context.coordinator, name: "domdom")
        config.userContentController = controller

        let webView = WKWebView(frame: .zero, configuration: config)
        context.coordinator.webView = webView
        webView.load(URLRequest(url: entry))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKScriptMessageHandler {
        weak var webView: WKWebView?

        // GAME → HOST
        func userContentController(
            _ controller: WKUserContentController,
            didReceive message: WKScriptMessage
        ) {
            guard let body = message.body as? [String: Any],
                  let type = body["type"] as? String else { return }

            switch type {
            case "ready":
                send(["type": "init",
                      "user": ["id": "demo",
                               "displayName": "Bé Đom",
                               "gradeBand": "tieu-hoc"],
                      "locale": "vi"])
            case "result":
                // TODO: gọi Edge Function submit-score qua Supabase.
                break
            case "firefly":
                // TODO: cập nhật FireflyView.
                break
            default:
                break
            }
        }

        // HOST → GAME
        func send(_ payload: [String: Any]) {
            guard let data = try? JSONSerialization.data(withJSONObject: payload),
                  let json = String(data: data, encoding: .utf8) else { return }
            webView?.evaluateJavaScript("window.postMessage(\(json), '*')")
        }
    }
}
