"use client";

import { useState, useMemo, useEffect } from "react";
import { Check, Pencil, Trash2, Plus, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { THEMES } from "@/lib/themes";
import { apiFetch } from "@/lib/api";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LogOut } from "lucide-react";

const INITIAL_HABITS = ["Workout", "Reading", "Coding", "Meditation", "Journaling"];
const SLEEP_LEVELS = [9, 8, 7, 6, 5];
const MAX_BAR_HEIGHT = 112;

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

  // ✅ Start empty → prevents flicker
  const [habits, setHabits] = useState<string[]>([]);
  const [habitIds, setHabitIds] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState<Record<string, Set<number>>>({});
  const [sleep, setSleep] = useState<Record<number, number>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [userName, setUserName] = useState("Rahul");
  const [editingName, setEditingName] = useState(false);

  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [addingHabit, setAddingHabit] = useState(false);
  const [habitDraft, setHabitDraft] = useState("");

  // =========================
  // LOAD HABITS + SEED + LOAD LOGS
  // =========================
  useEffect(() => {
    async function loadAll() {
      try {
        let data = await apiFetch("/habits");

        // ✅ New user → seed initial habits
        if (!data || data.length === 0) {
          for (const h of INITIAL_HABITS) {
            await apiFetch("/habits", {
              method: "POST",
              body: JSON.stringify({ name: h }),
            });
          }
          data = await apiFetch("/habits");
        }

        const names = data.map((x: any) => x.name);
        const idMap: Record<string, number> = {};
        data.forEach((x: any) => (idMap[x.name] = x.id));

        setHabits(names);
        setHabitIds(idMap);

        // ✅ Load logs (ticks)
        const logs = await apiFetch(
          `/habits/logs?month=${currentMonth.getMonth() + 1}&year=${currentMonth.getFullYear()}`
        );

        const map: Record<string, Set<number>> = {};
        logs.forEach((l: any) => {
          if (!map[l.habit_name]) map[l.habit_name] = new Set();
          map[l.habit_name].add(l.day);
        });

        setCompleted(map);
      } catch (e) {
        console.error(e);
      }
    }

    loadAll();
  }, [currentMonth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
  };

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
    if (next > new Date()) return;
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

  // =========================
  // TOGGLE → DB + UI
  // =========================
  async function toggleHabit(habit: string, day: number) {
    const habitId = habitIds[habit];
    if (!habitId) return;

    setCompleted((prev) => {
      const set = new Set(prev[habit] || []);
      set.has(day) ? set.delete(day) : set.add(day);
      return { ...prev, [habit]: set };
    });

    try {
      await apiFetch(`/habits/${habitId}/toggle`, {
        method: "POST",
        body: JSON.stringify({
          day: day,
          month: currentMonth.getMonth() + 1,
          year: currentMonth.getFullYear(),
        }),
      });
    } catch (e) {
      console.error("Toggle failed:", e);
    }
  }

  function setSleepHours(day: number, hrs: number) {
    setSleep((prev) => ({ ...prev, [day]: hrs }));
  }

  // =========================
  // CREATE HABIT
  // =========================
  async function saveNewHabit() {
    if (!habitDraft.trim()) {
      setAddingHabit(false);
      return;
    }

    const created = await apiFetch("/habits", {
      method: "POST",
      body: JSON.stringify({ name: habitDraft.trim() }),
    });

    setHabits((h) => [...h, created.name]);
    setHabitIds((p) => ({ ...p, [created.name]: created.id }));

    setHabitDraft("");
    setAddingHabit(false);
  }

  // =========================
  // DELETE HABIT
  // =========================
  async function deleteHabit(habit: string) {
    const id = habitIds[habit];
    if (!id) return;

    await apiFetch(`/habits/${id}`, { method: "DELETE" });

    setHabits((h) => h.filter((x) => x !== habit));
  }

  function renameHabit(oldName: string, newName: string) {
    if (!newName.trim()) {
      setEditingHabit(null);
      return;
    }
    setHabits((h) => h.map((x) => (x === oldName ? newName : x)));
    setEditingHabit(null);
  }
  
  return (
    <div className={`relative min-h-screen p-6 ${theme.bg} ${theme.text}`}>
  
  {/* 🌌 DARK THEME BACKGROUND EFFECT (ONLY FOR DARK) */}
  {themeId === "dark" && (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    
    {/* 🌑 Base vignette for depth */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.0),rgba(0,0,0,0.55))]" />

    {/* 🌿 Top-left emerald glow */}
    <div className="absolute -top-40 -left-40 h-[620px] w-[620px] 
      bg-[radial-gradient(circle,rgba(16,185,129,0.35),transparent_65%)]
      animate-[pulse_12s_ease-in-out_infinite]" />

    {/* 🌿 Top-right soft teal */}
    <div className="absolute -top-48 -right-48 h-[680px] w-[680px]
      bg-[radial-gradient(circle,rgba(45,212,191,0.18),transparent_70%)]" />

    {/* 🌿 Bottom-left deep emerald */}
    <div className="absolute -bottom-56 -left-56 h-[760px] w-[760px]
      bg-[radial-gradient(circle,rgba(16,185,129,0.22),transparent_72%)]" />

    {/* 🌿 Bottom-right faint balance */}
    <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px]
      bg-[radial-gradient(circle,rgba(16,185,129,0.15),transparent_70%)]" />

    {/* 🧊 Subtle diagonal depth wash */}
    <div className="absolute inset-0 
      bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent 
      rotate-6 scale-125" />

    {/* 🎞️ Ultra-fine noise (prevents flat look) */}
    <div
      className="absolute inset-0 opacity-[0.035]"
      style={{
        backgroundImage:
          "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"120\" height=\"120\" filter=\"url(%23n)\"/></svg>')",
      }}
    />
  </div>
)}
  {/* CONTENT LAYER */}
  <div className="relative z-10">

      {/* TOP BAR */}
      <div className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className={`text-2xl sm:text-3xl font-bold ${theme.primary}`}>
            HabitFlow
          </h1>

          <div className="flex items-center gap-3">
            {/* ✅ THEMES BUTTON — FIXED ONLY */}
            <div className="relative sm:absolute sm:left-1/2 sm:-translate-x-1/2 z-[100]">
              <button
                onClick={() => setThemeOpen((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border ${theme.secondary} ${theme.text}`}
              >
                <Palette size={16} />
                Themes
              </button>

              {themeOpen && (
                <div
                  className={`absolute top-full mt-2 w-56 rounded-lg border shadow-lg z-[100] ${theme.card} ${theme.text}`}
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

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 rounded-full border text-sm hover:bg-red-500/10 text-red-400"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </div>

    <Card className={`${theme.card} border border-black/20`}>
      <CardContent className={`p-6 space-y-8 ${theme.text}`}>
        {/* HEADER */}
<div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
    {/* Month */}
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

    {/* Name */}
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

  {/* Quote */}
  <p
    className={`text-xs sm:text-sm uppercase ${theme.mutedText} sm:text-right`}
  >
    Small habits. Big change.
  </p>
</div>

        {/* HABITS */}
        <div>
          <h3 className="font-semibold mb-4">Habits</h3>

          <div className="overflow-x-auto pb-4">
            <div className="min-w-[1200px]">
              {/* DAYS HEADER */}
              <div
  className={`
    grid grid-cols-[160px_repeat(31,32px)] gap-2 text-xs mb-2
    sticky top-0 z-20
    ${theme.card}
  `}
>
  <div
    className={`sticky left-0 z-30 ${theme.card}`}
  />
  {days.map((d) => (
    <div
      key={d.day}
      className={`text-center ${theme.mutedText}`}
    >
      {d.label}
    </div>
  ))}
</div>


              {/* HABIT ROWS */}
              {habits.map((habit,index) => (
                <div
                  key={habit + "-" + index}
                  className="grid grid-cols-[160px_repeat(31,32px)] gap-2 mb-2"
                >
                  <div
  className={`
    flex items-center gap-2
    sticky left-0 z-10
    ${theme.card}
    pr-2
  `}
>
  {editingHabit === habit ? (
    <input
      autoFocus
      defaultValue={habit}
      onBlur={(e) => renameHabit(habit, e.target.value)}
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
  </div>
);
}