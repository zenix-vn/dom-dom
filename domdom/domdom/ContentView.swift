//
//  ContentView.swift
//  domdom
//
//  Gốc điều hướng: Onboarding → ứng dụng chính.
//

import SwiftUI

struct ContentView: View {
    @State private var model = AppModel()

    var body: some View {
        Group {
            if model.hasOnboarded {
                MainTabView()
            } else {
                OnboardingView()
            }
        }
        .environment(model)
        .tint(Palette.lacquer)
    }
}

#Preview {
    ContentView()
}
