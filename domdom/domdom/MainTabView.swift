//
//  MainTabView.swift
//  domdom
//
//  Khung tab chính — thanh tab kính nổi (Liquid Glass mặc định của iOS 26).
//

import SwiftUI

struct MainTabView: View {
    @State private var selection = 0

    var body: some View {
        TabView(selection: $selection) {
            Tab("Trang chủ", systemImage: "house.fill", value: 0) {
                HomeView()
            }
            Tab("Môn học", systemImage: "square.grid.2x2.fill", value: 1) {
                SubjectsTab()
            }
            Tab("Xếp hạng", systemImage: "chart.bar.fill", value: 2) {
                LeaderboardView()
            }
            Tab("Hồ sơ", systemImage: "person.crop.circle.fill", value: 3) {
                ProfileView()
            }
        }
        .tint(Palette.lacquer)
    }
}

/// Tab "Môn học" — danh sách môn dẫn tới chi tiết.
struct SubjectsTab: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        NavigationStack {
            ZStack {
                Wallpaper(kind: .home)
                ScrollView {
                    VStack(spacing: 13) {
                        ForEach(model.subjects) { subject in
                            NavigationLink {
                                SubjectDetailView(subject: subject)
                            } label: {
                                SubjectTile(subject: subject)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                    .padding(.bottom, 110)
                }
            }
            .navigationTitle("Môn học")
        }
    }
}

/// Placeholder cho tab Xếp hạng.
struct LeaderboardView: View {
    var body: some View {
        NavigationStack {
            ZStack {
                Wallpaper(kind: .results)
                VStack(spacing: 14) {
                    Image(systemName: "trophy.fill")
                        .font(.system(size: 54))
                        .foregroundStyle(goldGradient)
                    Text("Bảng xếp hạng")
                        .font(.serif(24))
                        .foregroundStyle(Palette.ink)
                    Text("Sắp ra mắt — cùng thi đua với các bạn nhé!")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(Palette.inkSoft)
                        .multilineTextAlignment(.center)
                }
                .padding(28)
                .glassEffect(.regular, in: .rect(cornerRadius: 28))
                .padding(.horizontal, 32)
            }
            .navigationTitle("Xếp hạng")
        }
    }
}

#Preview {
    MainTabView().environment(AppModel())
}
