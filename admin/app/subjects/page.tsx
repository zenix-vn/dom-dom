"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import Modal, { Field, inputClass } from "@/components/Modal";
import { api, Subject } from "@/lib/api";

const emptyForm = {
  kind: "",
  title: "",
  grade: 4,
  series: "Kết nối tri thức",
  tintHex: "C0392B",
  icon: "book.closed.fill",
  sortOrder: 0,
};

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setSubjects(await api<Subject[]>("/admin/subjects"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(s: Subject) {
    setEditing(s);
    setForm({
      kind: s.kind,
      title: s.title,
      grade: s.grade,
      series: s.series,
      tintHex: s.tintHex,
      icon: s.icon,
      sortOrder: s.sortOrder,
    });
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await api(`/admin/subjects/${editing.id}`, { method: "PUT", body: form });
      } else {
        await api("/admin/subjects", { method: "POST", body: form });
      }
      setShowForm(false);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lưu thất bại");
    }
  }

  async function remove(s: Subject) {
    if (!confirm(`Xoá môn "${s.title}"? Mọi chương/bài/câu hỏi bên trong sẽ bị xoá.`))
      return;
    await api(`/admin/subjects/${s.id}`, { method: "DELETE" });
    load();
  }

  return (
    <Shell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink">Môn học</h1>
          <p className="text-sm text-inksoft">Quản lý chương trình theo môn</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-xl bg-lacquer px-4 py-2.5 font-bold text-white hover:bg-lacquer/90"
        >
          + Thêm môn
        </button>
      </div>

      {error && <p className="text-lacquer">{error}</p>}
      {loading ? (
        <p className="text-inksoft">Đang tải…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <div
                className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: `#${s.tintHex}` }}
              >
                ●
              </div>
              <h3 className="font-bold text-ink">{s.title}</h3>
              <p className="text-xs text-inksoft">
                {s.kind} · Lớp {s.grade} · {s.series}
              </p>
              <div className="mt-4 flex gap-2 text-sm font-semibold">
                <Link
                  href={`/subjects/${s.id}`}
                  className="rounded-lg bg-black/5 px-3 py-1.5 text-ink hover:bg-black/10"
                >
                  Nội dung
                </Link>
                <button
                  onClick={() => openEdit(s)}
                  className="rounded-lg px-3 py-1.5 text-ink hover:bg-black/5"
                >
                  Sửa
                </button>
                <button
                  onClick={() => remove(s)}
                  className="rounded-lg px-3 py-1.5 text-lacquer hover:bg-lacquer/10"
                >
                  Xoá
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal
          title={editing ? "Sửa môn" : "Thêm môn"}
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={save}>
            <Field label="Mã môn (slug, vd history)">
              <input
                className={inputClass}
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value })}
                required
              />
            </Field>
            <Field label="Tên hiển thị">
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Lớp">
                <input
                  type="number"
                  className={inputClass}
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: +e.target.value })}
                />
              </Field>
              <Field label="Màu (hex, không #)">
                <input
                  className={inputClass}
                  value={form.tintHex}
                  onChange={(e) => setForm({ ...form, tintHex: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Bộ sách">
              <input
                className={inputClass}
                value={form.series}
                onChange={(e) => setForm({ ...form, series: e.target.value })}
              />
            </Field>
            <Field label="Icon (SF Symbol)">
              <input
                className={inputClass}
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              />
            </Field>
            <button className="mt-2 w-full rounded-xl bg-lacquer py-2.5 font-bold text-white hover:bg-lacquer/90">
              {editing ? "Lưu thay đổi" : "Tạo môn"}
            </button>
          </form>
        </Modal>
      )}
    </Shell>
  );
}
