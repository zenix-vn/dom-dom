//
//  ParentReportView.swift
//  domdom
//
//  08 · Báo cáo phụ huynh — tổng quan việc học tuần này: chuỗi ngày,
//  số câu, độ chính xác, biểu đồ 7 ngày, mức thành thạo & gợi ý.
//

import SwiftUI

struct ParentReportView: View {
    @Environment(AppModel.self) private var model

    private let weekdayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

    var body: some View {
        ZStack {
            Wallpaper(kind: .profile)
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    intro
                    summaryGrid.padding(.top, 18)

                    SectionLabel(title: "Hoạt động 7 ngày qua")
                        .padding(.top, 24).padding(.bottom, 13)
                    weekChart

                    SectionLabel(title: "Mức thành thạo theo môn")
                        .padding(.top, 24).padding(.bottom, 13)
                    VStack(spacing: 10) {
                        ForEach(model.mastery) { m in masteryBar(m) }
                    }

                    advice.padding(.top, 22)
                }
                .padding(.horizontal, 20)
                .padding(.top, 4)
                .padding(.bottom, 40)
            }
        }
        .navigationTitle("Báo cáo phụ huynh")
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: Giới thiệu

    private var intro: some View {
        VStack(alignment: .leading, spacing: 5) {
            Text("KHU VỰC PHỤ HUYNH")
                .font(.system(size: 11, weight: .heavy)).tracking(1.4)
                .foregroundStyle(Palette.lacquer)
            Text("Tuần học của \(model.profile.firstName)")
                .font(.serif(23)).foregroundStyle(Palette.ink)
            Text(model.profile.gradeLabel)
                .font(.system(size: 12.5, weight: .semibold))
                .foregroundStyle(Palette.inkSoft)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, 6)
    }

    // MARK: Lưới tổng quan

    private var summaryGrid: some View {
        let cols = [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)]
        return LazyVGrid(columns: cols, spacing: 12) {
            summaryCell("flame.fill", "\(model.profile.streak) ngày", "Chuỗi học", Palette.goldBright)
            summaryCell("calendar", "\(model.daysActiveThisWeek)/7", "Ngày học trong tuần", Palette.dia)
            summaryCell("checklist", "\(model.weeklyAnswered)", "Câu đã làm", Palette.anh)
            summaryCell("target", "\(model.weeklyAccuracy)%", "Độ chính xác", Palette.lacquer)
        }
    }

    private func summaryCell(_ icon: String, _ value: String, _ label: String, _ color: Color) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(.white)
                .frame(width: 40, height: 40)
                .background(color.gradientFill, in: .rect(cornerRadius: 13))
            VStack(alignment: .leading, spacing: 1) {
                Text(value).font(.system(size: 18, weight: .heavy)).foregroundStyle(Palette.ink)
                Text(label).font(.system(size: 10.5, weight: .semibold)).foregroundStyle(Palette.inkSoft)
            }
            Spacer(minLength: 0)
        }
        .padding(13)
        .glassEffect(.regular, in: .rect(cornerRadius: 20))
    }

    // MARK: Biểu đồ tuần

    private var weekChart: some View {
        let stats = model.weeklyStats
        let maxVal = max(stats.map { $0.stat.answered }.max() ?? 0, 1)
        return HStack(alignment: .bottom, spacing: 9) {
            ForEach(stats, id: \.day) { entry in
                VStack(spacing: 7) {
                    Text("\(entry.stat.answered)")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(entry.stat.answered > 0 ? Palette.ink2 : .clear)
                    RoundedRectangle(cornerRadius: 7)
                        .fill(entry.stat.answered > 0 ? Palette.goldBright.gradientFill
                                                       : Palette.inkSoft.opacity(0.16).gradientFill)
                        .frame(height: 90 * CGFloat(entry.stat.answered) / CGFloat(maxVal) + 6)
                    Text(weekdayLabels[((entry.day % 7) + 7) % 7])
                        .font(.system(size: 10.5, weight: .bold))
                        .foregroundStyle(Palette.inkSoft)
                }
                .frame(maxWidth: .infinity)
            }
        }
        .frame(height: 130, alignment: .bottom)
        .padding(.horizontal, 14).padding(.vertical, 14)
        .glassEffect(.regular, in: .rect(cornerRadius: 22))
    }

    // MARK: Thanh mức thành thạo

    private func masteryBar(_ m: Mastery) -> some View {
        HStack(spacing: 12) {
            Image(systemName: m.subject.iconName)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(.white)
                .frame(width: 34, height: 34)
                .background(m.subject.tint.gradientFill, in: .rect(cornerRadius: 11))
            VStack(alignment: .leading, spacing: 5) {
                HStack {
                    Text(m.subject.rawValue).font(.system(size: 13, weight: .bold)).foregroundStyle(Palette.ink)
                    Spacer()
                    Text("\(m.percent)% · \(m.note)")
                        .font(.system(size: 11.5, weight: .semibold)).foregroundStyle(Palette.inkSoft)
                }
                ProgressView(value: Double(m.percent), total: 100)
                    .tint(m.subject.tint)
                    .scaleEffect(x: 1, y: 1.1, anchor: .center)
            }
        }
        .padding(13)
        .glassEffect(.regular, in: .rect(cornerRadius: 20))
    }

    // MARK: Gợi ý

    @ViewBuilder
    private var advice: some View {
        if let weak = model.weakestSubject, let strong = model.strongestSubject {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: "lightbulb.fill")
                    .font(.system(size: 18))
                    .foregroundStyle(Palette.goldBright)
                VStack(alignment: .leading, spacing: 4) {
                    Text("Gợi ý cho ba mẹ")
                        .font(.system(size: 13.5, weight: .bold)).foregroundStyle(Palette.ink)
                    Text("\(model.profile.firstName) đang vững nhất môn **\(strong.subject.rawValue)** (\(strong.percent)%). "
                         + "Tuần tới nên dành thêm thời gian cho môn **\(weak.subject.rawValue)** (\(weak.percent)%) để cân bằng nhé.")
                        .font(.system(size: 12.5, weight: .medium))
                        .foregroundStyle(Palette.ink2)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(15)
            .glassEffect(.regular.tint(Palette.gold.opacity(0.18)), in: .rect(cornerRadius: 20))
        }
    }
}

#Preview {
    NavigationStack {
        ParentReportView().environment(AppModel())
    }
}
