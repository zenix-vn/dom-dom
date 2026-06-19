//
//  ProfileView.swift
//  domdom
//
//  07 · Hồ sơ — cấp độ, mức thành thạo, dấu son sưu tầm.
//

import SwiftUI

struct ProfileView: View {
    @Environment(AppModel.self) private var model
    private let cols = [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)]

    var body: some View {
        NavigationStack {
            ZStack {
                Wallpaper(kind: .profile)
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        head
                        levelCard.padding(.top, 18)
                        parentReportLink.padding(.top, 12)

                        SectionLabel(title: "Mức thành thạo", action: "Chi tiết")
                            .padding(.top, 20).padding(.bottom, 13)
                        LazyVGrid(columns: cols, spacing: 12) {
                            ForEach(model.mastery) { m in masteryCard(m) }
                        }

                        SectionLabel(title: "Dấu son đã sưu tầm", action: "Tất cả")
                            .padding(.top, 22).padding(.bottom, 13)
                        HStack(spacing: 11) {
                            ForEach(SampleData.badges) { b in badge(b) }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 4)
                    .padding(.bottom, 110)
                }
                .navigationBarTitleDisplayMode(.inline)
                .toolbar(.hidden, for: .navigationBar)
            }
        }
    }

    private var head: some View {
        HStack(spacing: 15) {
            FireflyMascot(size: 60)
                .frame(width: 70, height: 70)
                .background(
                    RadialGradient(colors: [Color(hex: 0x33518A), Color(hex: 0x172741)],
                                   center: .init(x: 0.5, y: 0.4), startRadius: 2, endRadius: 52),
                    in: .rect(cornerRadius: 22)
                )
                .shadow(color: Color(hex: 0x172741).opacity(0.5), radius: 10, y: 6)

            VStack(alignment: .leading, spacing: 2) {
                Text(model.profile.name).font(.serif(21)).foregroundStyle(Palette.ink)
                Text(model.profile.gradeLabel)
                    .font(.system(size: 12.5, weight: .semibold))
                    .foregroundStyle(Palette.inkSoft)
            }
            Spacer()
        }
        .padding(.top, 6)
    }

    private var parentReportLink: some View {
        NavigationLink {
            ParentReportView()
        } label: {
            HStack(spacing: 13) {
                Image(systemName: "person.2.fill")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(width: 40, height: 40)
                    .background(Palette.lacquer.gradientFill, in: .rect(cornerRadius: 13))
                VStack(alignment: .leading, spacing: 2) {
                    Text("Báo cáo phụ huynh")
                        .font(.system(size: 14, weight: .bold)).foregroundStyle(Palette.ink)
                    Text("Xem con học gì, mạnh/yếu môn nào trong tuần")
                        .font(.system(size: 11.5, weight: .medium)).foregroundStyle(Palette.inkSoft)
                        .fixedSize(horizontal: false, vertical: true)
                }
                Spacer(minLength: 0)
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .bold)).foregroundStyle(Palette.inkSoft)
            }
            .padding(14)
            .glassEffect(.regular, in: .rect(cornerRadius: 20))
        }
        .buttonStyle(.plain)
    }

    private var levelCard: some View {
        let p = model.profile
        return VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text("Cấp ").font(.system(size: 13, weight: .bold)).foregroundStyle(Palette.ink)
                + Text("\(p.level) · \(p.levelTitle)").font(.system(size: 13, weight: .bold))
                    .foregroundStyle(Color(hex: 0xA06A14))
                Spacer()
                Text("\(p.xp) / \(p.xpForNext)")
                    .font(.system(size: 13, weight: .bold)).foregroundStyle(Palette.inkSoft)
            }
            ProgressView(value: Double(p.xp), total: Double(p.xpForNext))
                .tint(Palette.goldBright)
                .scaleEffect(x: 1, y: 1.4, anchor: .center)
                .padding(.top, 11)
            Text("Còn \(p.xpForNext - p.xp) điểm để lên Cấp \(p.level + 1) · \(p.nextLevelTitle)")
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(Palette.inkSoft)
                .padding(.top, 10)
        }
        .padding(16)
        .glassEffect(.regular, in: .rect(cornerRadius: 22))
    }

    private func masteryCard(_ m: Mastery) -> some View {
        HStack(spacing: 12) {
            ProgressRing(percent: m.percent, color: m.subject.tint, size: 46)
            VStack(alignment: .leading, spacing: 2) {
                Text(m.subject.rawValue).font(.system(size: 13, weight: .bold)).foregroundStyle(Palette.ink)
                Text(m.note).font(.system(size: 11, weight: .semibold)).foregroundStyle(Palette.inkSoft)
            }
            Spacer(minLength: 0)
        }
        .padding(14)
        .glassEffect(.regular, in: .rect(cornerRadius: 20))
    }

    private func badge(_ b: BadgeItem) -> some View {
        VStack(spacing: 6) {
            if b.locked {
                Image(systemName: "lock.fill")
                    .font(.system(size: 13))
                    .foregroundStyle(Color(hex: 0xB5A584))
                    .frame(width: 34, height: 34)
                    .overlay(Circle().strokeBorder(Palette.inkSoft.opacity(0.35), lineWidth: 2))
            } else {
                SealView(glyph: b.glyph, size: 34)
            }
            Text(b.label)
                .font(.system(size: 9.5, weight: .bold))
                .foregroundStyle(Palette.inkSoft)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 13)
        .glassEffect(.regular, in: .rect(cornerRadius: 18))
    }
}

#Preview {
    ProfileView().environment(AppModel())
}
