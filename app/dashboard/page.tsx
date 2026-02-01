"use client";

import { useState, useMemo, useEffect } from "react";
import { Check, Pencil, Trash2, Plus, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { THEMES } from "@/lib/themes";
import { apiFetch } from "@/lib/api";

const INITIAL_HABITS = ["Workout", "Reading", "Coding", "Meditation", "Journaling"];
const SLEEP_LEVELS = [9, 8, 7, 6, 5];
const MAX_BAR_HEIGHT = 102;

function ordinal(n: number) {
  if (n % 10 === 1 && n !== 11) return `${n}st`;
  if (n % 10 === 2 && n !== 12) return `${n}nd`;
  if (n % 10 === 3 && n !== 13) return `${n}rd`;
  return `${n}th`;
}

export default function DashboardPage() {
  const [themeId, setThemeId] = useState("dark");
  const [themeOpen, setThemeOpen] = useState(false);
  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  const [habits, setHabits] = useState<string[]>(INITIAL_HABITS);
  const [completed, setCompleted] = useState<Record<string, Set<number>>>({});
  const [sleep, setSleep] = useState<Record<number, number>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [userName, setUserName] = useState("Rahul");
  const [editingName, setEditingName] = useState(false);

  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [addingHabit, setAddingHabit] = useState(false);
  const [habitDraft, setHabitDraft] = useState("");

  useEffect(() => {
    apiFetch("/habits")
      .then((data) => {
        if (data?.length) {
          setHabits(data.map((h: any) => h.name));
        }
      })
      .catch(() => {
        setHabits(INITIAL_HABITS);
      });
  }, []);

  // ✅ MONTH LOGIC
  function prevMonth() {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  }

  function nextMonth() {
    const next = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );

    if (next > new Date()) return; // block future
    setCurrentMonth(next);
  }

  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === currentMonth.getMonth() &&
    today.getFullYear() === currentMonth.getFullYear();

  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const days = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, monthIndex, i + 1);
      return {
        day: i + 1,
        label: `${d.toLocaleString("default", {
          weekday: "short",
        })} ${ordinal(i + 1)}`,
      };
    });
  }, [year, monthIndex, daysInMonth]);

  function toggleHabit(habit: string, day: number) {
    setCompleted((prev) => {
      const set = new Set(prev[habit] || []);
      set.has(day) ? set.delete(day) : set.add(day);
      return { ...prev, [habit]: set };
    });
  }

  function setSleepHours(day: number, hrs: number) {
    setSleep((prev) => ({ ...prev, [day]: hrs }));
  }

  function saveNewHabit() {
    if (!habitDraft.trim()) {
      setAddingHabit(false);
      return;
    }
    setHabits((h) => [...h, habitDraft.trim()]);
    setHabitDraft("");
    setAddingHabit(false);
  }

  function deleteHabit(habit: string) {
    setHabits((h) => h.filter((x) => x !== habit));
    setCompleted((prev) => {
      const copy = { ...prev };
      delete copy[habit];
      return copy;
    });
  }

  function renameHabit(oldName: string, newName: string) {
    if (!newName.trim()) {
      setEditingHabit(null);
      return;
    }
    setHabits((h) => h.map((x) => (x === oldName ? newName : x)));
    setCompleted((prev) => {
      const copy = { ...prev };
      copy[newName] = copy[oldName] || new Set();
      delete copy[oldName];
      return copy;
    });
    setEditingHabit(null);
  }

  return (
  <div className={`min-h-screen p-6 ${theme.bg} ${theme.text}`}>
    {/* TOP BAR */}
    <div className="relative flex items-center justify-between mb-6">
      <h1 className={`text-3xl font-bold ${theme.primary}`}>Habit Tracker</h1>

      <div className="absolute left-1/2 -translate-x-1/2">
        <div className="relative">
          <button
            onClick={() => setThemeOpen((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${theme.secondary} ${theme.text}`}
          >
            <Palette size={16} />
            Themes
          </button>

          {themeOpen && (
            <div
              className={`absolute top-full mt-2 w-56 rounded-lg border shadow-lg z-50 ${theme.card} ${theme.text}`}
            >
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setThemeId(t.id);
                    setThemeOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:${theme.secondary}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    <Card className={`${theme.card} border border-black/20`}>
      <CardContent className={`p-6 space-y-8 ${theme.text}`}>
        {/* HEADER */}
        <div className="flex justify-between items-center border-b pb-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button onClick={prevMonth} className="h-9 w-9 rounded-full border">
                ‹
              </button>

              <div>
                <p className={`text-xs uppercase ${theme.mutedText}`}>Month</p>
                <p className="font-semibold">{monthName}</p>
              </div>

              <button
                onClick={nextMonth}
                disabled={isCurrentMonth}
                className="h-9 w-9 rounded-full border disabled:opacity-40"
              >
                ›
              </button>
            </div>

            <div>
              <p className={`text-xs uppercase ${theme.mutedText}`}>Name</p>
              {editingName ? (
                <input
                  autoFocus
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                  className="bg-transparent border-b outline-none"
                />
              ) : (
                <p className="font-semibold flex items-center gap-2">
                  {userName}
                  <Pencil size={14} onClick={() => setEditingName(true)} />
                </p>
              )}
            </div>
          </div>

          <p className={`text-sm uppercase ${theme.mutedText}`}>
            Small habits. Big change.
          </p>
        </div>

        {/* HABITS */}
        <div>
          <h3 className="font-semibold mb-4">Habits</h3>

          <div className="overflow-x-auto pb-4">
            <div className="min-w-[1200px]">
              {/* DAYS HEADER */}
              <div className="grid grid-cols-[160px_repeat(31,32px)] gap-2 text-xs mb-2">
                <div />
                {days.map((d) => (
                  <div key={d.day} className={`text-center ${theme.mutedText}`}>
                    {d.label}
                  </div>
                ))}
              </div>

              {/* HABIT ROWS */}
              {habits.map((habit) => (
                <div
                  key={habit}
                  className="grid grid-cols-[160px_repeat(31,32px)] gap-2 mb-2"
                >
                  <div className="flex items-center gap-2">
                    {editingHabit === habit ? (
                      <input
                        autoFocus
                        defaultValue={habit}
                        onBlur={(e) =>
                          renameHabit(habit, e.target.value)
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          renameHabit(
                            habit,
                            (e.target as HTMLInputElement).value
                          )
                        }
                        className="bg-transparent border-b outline-none w-28"
                      />
                    ) : (
                      <span>{habit}</span>
                    )}

                    <Pencil size={14} onClick={() => setEditingHabit(habit)} />
                    <Trash2 size={14} onClick={() => deleteHabit(habit)} />
                  </div>

                  {days.map((d) => {
                    const done = completed[habit]?.has(d.day);
                    return (
                      <div
                        key={d.day}
                        onClick={() => toggleHabit(habit, d.day)}
                        className={`h-7 rounded-md border flex items-center justify-center cursor-pointer ${
                          done ? theme.gridFilled : theme.gridEmpty
                        }`}
                      >
                        {done && <Check size={14} />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* ADD HABIT */}
          <button
            onClick={() => setAddingHabit(true)}
            className={`${theme.primary} flex items-center gap-1 mt-3`}
          >
            <Plus size={16} /> Add Habit
          </button>

          {addingHabit && (
            <div className="flex gap-2 mt-3">
              <input
                autoFocus
                value={habitDraft}
                onChange={(e) => setHabitDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveNewHabit()}
                className="px-2 py-1 rounded bg-black/40 border"
                placeholder="New habit name"
              />
              <button
                onClick={saveNewHabit}
                className="px-3 py-1 rounded bg-green-600"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* SLEEP */}
        <div>
          <h3 className="font-semibold mb-3">Sleep</h3>

          <div className="overflow-x-auto pb-4">
            <div className="min-w-[1200px]">
              <div className="grid grid-cols-[160px_repeat(31,32px)] gap-2 text-xs mb-2">
                <div />
                {days.map((d) => (
                  <div key={d.day} className={`text-center ${theme.mutedText}`}>
                    {ordinal(d.day)}
                  </div>
                ))}
              </div>

              {SLEEP_LEVELS.map((hrs) => (
                <div
                  key={hrs}
                  className="grid grid-cols-[160px_repeat(31,32px)] gap-2 mb-2"
                >
                  <div>{hrs} hrs</div>
                  {days.map((d) => (
                    <div
                      key={d.day}
                      onClick={() => setSleepHours(d.day, hrs)}
                      className={`h-7 rounded-md border cursor-pointer ${
                        sleep[d.day] === hrs
                          ? theme.gridFilled
                          : theme.gridEmpty
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SLEEP GRAPH */}
        <div>
          <h3 className="font-semibold mb-3">Sleep Graph</h3>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[500px] flex items-end gap-3 h-[160px] bg-black/20 rounded-lg p-4">
              {days.map((d) => {
                const hrs = sleep[d.day];
                if (!hrs) return <div key={d.day} className="w-4" />;
                const height = (hrs / 9) * MAX_BAR_HEIGHT;
                return (
                  <div key={d.day} className="flex flex-col items-center">
                    <div
                      style={{ height }}
                      className={`w-4 rounded-full ${
                        hrs >= 8
                          ? "bg-green-500"
                          : hrs >= 6
                          ? "bg-yellow-400"
                          : "bg-red-400"
                      }`}
                    />
                    <span className="text-xs mt-1">{ordinal(d.day)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
}