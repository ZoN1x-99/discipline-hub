import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  CalendarDays,
  Check,
  CheckCircle2,
  Compass,
  Flame,
  Gauge,
  Home,
  LayoutDashboard,
  LineChart,
  Menu,
  Plus,
  Rocket,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  User,
  X,
  Zap
} from "lucide-react";
import "./styles.css";

const HABIT_KEY = "discipline-hub-habits-v2";
const GOALS_KEY = "discipline-hub-goals-v1";
const PROFILE_KEY = "discipline-hub-profile-v1";

const today = new Date();
const dateKey = (date = today) => date.toISOString().slice(0, 10);
const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};
const makeId = () => globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 }
  }
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getSeedCompletions(offsets) {
  return offsets.map((offset) => dateKey(addDays(today, offset)));
}

const starterHabits = [
  {
    id: makeId(),
    name: "Deep Work",
    category: "Focus",
    target: "90 min",
    xp: 80,
    color: "aurora",
    completions: getSeedCompletions([-8, -7, -6, -5, -3, -2, -1, 0])
  },
  {
    id: makeId(),
    name: "Morning Training",
    category: "Body",
    target: "45 min",
    xp: 70,
    color: "ember",
    completions: getSeedCompletions([-7, -5, -4, -3, -2, 0])
  },
  {
    id: makeId(),
    name: "Evening Review",
    category: "Mind",
    target: "10 min",
    xp: 45,
    color: "vita",
    completions: getSeedCompletions([-9, -8, -7, -6, -5, -4, -3, -2, -1, 0])
  }
];

const starterGoals = [
  { id: makeId(), title: "Complete 30 days of Deep Work", done: false, xp: 400 },
  { id: makeId(), title: "Hit 20 total training sessions", done: false, xp: 300 },
  { id: makeId(), title: "Build a no-zero-days night routine", done: true, xp: 250 }
];

const pageList = [
  { id: "home", label: "Home", icon: Home },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "habits", label: "Habits", icon: CheckCircle2 },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "goals", label: "Goals", icon: Target },
  { id: "pricing", label: "Pricing", icon: Rocket },
  { id: "profile", label: "Profile", icon: User }
];

function getHashPage() {
  const hash = window.location.hash.replace("#", "");
  return pageList.some((page) => page.id === hash) ? hash : "home";
}

function normalizeHabit(habit, index = 0) {
  return {
    id: typeof habit?.id === "string" ? habit.id : makeId(),
    name: typeof habit?.name === "string" && habit.name.trim() ? habit.name : `Habit ${index + 1}`,
    category: typeof habit?.category === "string" ? habit.category : "Focus",
    target: typeof habit?.target === "string" ? habit.target : "30 min",
    xp: Number.isFinite(Number(habit?.xp)) ? Number(habit.xp) : 50,
    color: ["aurora", "ember", "vita", "pulse"].includes(habit?.color) ? habit.color : "aurora",
    completions: Array.isArray(habit?.completions) ? [...new Set(habit.completions.filter((item) => typeof item === "string"))] : []
  };
}

function normalizeGoal(goal, index = 0) {
  return {
    id: typeof goal?.id === "string" ? goal.id : makeId(),
    title: typeof goal?.title === "string" && goal.title.trim() ? goal.title : `Milestone ${index + 1}`,
    done: Boolean(goal?.done),
    xp: Number.isFinite(Number(goal?.xp)) ? Number(goal.xp) : 250
  };
}

function normalizeProfile(profile) {
  return {
    name: typeof profile?.name === "string" && profile.name.trim() ? profile.name : "Alex",
    identity:
      typeof profile?.identity === "string" && profile.identity.trim()
        ? profile.identity
        : "Building calm, dangerous consistency"
  };
}

function normalizeHabits(value) {
  return Array.isArray(value) ? value.map(normalizeHabit) : starterHabits;
}

function normalizeGoals(value) {
  return Array.isArray(value) ? value.map(normalizeGoal) : starterGoals;
}

function useLocalState(key, fallback, normalize = (value) => value) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return normalize(saved ? JSON.parse(saved) : fallback);
    } catch {
      return normalize(fallback);
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function completedOn(habit, key = dateKey()) {
  return Array.isArray(habit.completions) && habit.completions.includes(key);
}

function getStreak(habit) {
  let streak = 0;
  for (let index = 0; index < 365; index += 1) {
    const key = dateKey(addDays(today, -index));
    if (!completedOn(habit, key)) break;
    streak += 1;
  }
  return streak;
}

function getCompletionRate(habits, days = 7) {
  if (!habits.length) return 0;
  let completed = 0;
  for (let index = 0; index < days; index += 1) {
    const key = dateKey(addDays(today, -index));
    completed += habits.filter((habit) => completedOn(habit, key)).length;
  }
  return Math.round((completed / (habits.length * days)) * 100);
}

function getDailyCounts(habits, days = 14) {
  return Array.from({ length: days }, (_, index) => {
    const offset = index - days + 1;
    const key = dateKey(addDays(today, offset));
    return {
      key,
      label: addDays(today, offset).toLocaleDateString("en", { weekday: "short" }),
      value: habits.filter((habit) => completedOn(habit, key)).length
    };
  });
}

function getStats(habits, goals) {
  const completedToday = habits.filter((habit) => completedOn(habit)).length;
  const totalCompletions = habits.reduce((sum, habit) => sum + (habit.completions?.length || 0), 0);
  const xp =
    habits.reduce((sum, habit) => sum + (habit.completions?.length || 0) * habit.xp, 0) +
    goals.filter((goal) => goal.done).reduce((sum, goal) => sum + goal.xp, 0);
  const bestStreak = habits.reduce((max, habit) => Math.max(max, getStreak(habit)), 0);
  const completionRate = getCompletionRate(habits, 7);
  const disciplineScore = Math.min(99, Math.round(completionRate * 0.75 + bestStreak * 2 + completedToday * 3));
  const level = Math.max(1, Math.floor(xp / 700) + 1);
  const nextLevelXp = level * 700;
  const previousLevelXp = (level - 1) * 700;
  const levelProgress = Math.round(((xp - previousLevelXp) / (nextLevelXp - previousLevelXp)) * 100);

  return {
    bestStreak,
    completedToday,
    completionRate,
    disciplineScore,
    habitsCount: habits.length,
    level,
    levelProgress,
    totalCompletions,
    xp
  };
}

function toneClasses(tone = "aurora") {
  const tones = {
    aurora: {
      glow: "bg-aurora/20",
      text: "text-aurora",
      border: "border-aurora/30",
      fill: "from-aurora to-pulse",
      soft: "bg-aurora/10"
    },
    ember: {
      glow: "bg-ember/20",
      text: "text-ember",
      border: "border-ember/30",
      fill: "from-ember to-amber-300",
      soft: "bg-ember/10"
    },
    vita: {
      glow: "bg-vita/20",
      text: "text-vita",
      border: "border-vita/30",
      fill: "from-vita to-emerald-200",
      soft: "bg-vita/10"
    },
    pulse: {
      glow: "bg-pulse/20",
      text: "text-pulse",
      border: "border-pulse/30",
      fill: "from-pulse to-fuchsia-300",
      soft: "bg-pulse/10"
    }
  };
  return tones[tone] || tones.aurora;
}

function AnimatedNumber({ value, suffix = "" }) {
  return (
    <motion.span
      key={`${value}${suffix}`}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      initial={{ opacity: 0, y: 12, filter: "blur(5px)" }}
      transition={{ duration: 0.3 }}
    >
      {value}
      {suffix}
    </motion.span>
  );
}

function Particles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        left: `${(index * 37) % 100}%`,
        top: `${(index * 61) % 100}%`,
        delay: (index % 8) * 0.35,
        size: 2 + (index % 3)
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((dot) => (
        <motion.span
          aria-hidden="true"
          className="absolute rounded-full bg-white/50"
          key={dot.id}
          style={{ left: dot.left, top: dot.top, height: dot.size, width: dot.size }}
          animate={{ opacity: [0.06, 0.48, 0.06], y: [0, -22, 0] }}
          transition={{ duration: 5 + (dot.id % 5), delay: dot.delay, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

function GlowButton({ children, variant = "primary", onClick }) {
  return (
    <button
      className={cx(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold transition duration-300",
        "focus:outline-none focus:ring-2 focus:ring-aurora/60 focus:ring-offset-2 focus:ring-offset-void",
        variant === "primary"
          ? "bg-white text-void shadow-[0_0_38px_rgba(53,243,255,.22)] hover:scale-[1.03]"
          : "border border-white/15 bg-white/[.06] text-white backdrop-blur-xl hover:border-aurora/50 hover:bg-white/[.1]"
      )}
      onClick={onClick}
      type="button"
    >
      <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-[120%]" />
      <span className="relative flex items-center gap-2">
        {children}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  );
}

function ProgressBar({ label, value, tone = "aurora" }) {
  const colors = toneClasses(tone);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-white/60">
        <span>{label}</span>
        <span>{Math.min(100, value)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={cx("h-full rounded-full bg-gradient-to-r", colors.fill)}
          animate={{ width: `${Math.min(100, value)}%` }}
          initial={{ width: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <motion.div
      className={cx("rounded-[24px] border border-white/10 bg-white/[.055] p-5 backdrop-blur-2xl", className)}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      {children}
    </motion.div>
  );
}

function TopNav({ activePage, setPage }) {
  const [open, setOpen] = useState(false);

  const selectPage = (page) => {
    setPage(page);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-void/70 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <button className="flex items-center gap-3 text-left text-sm font-semibold text-white" onClick={() => selectPage("home")} type="button">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/10">
            <ShieldCheck className="h-5 w-5 text-aurora" />
          </span>
          <span>Discipline Hub</span>
        </button>

        <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[.045] p-1 md:flex">
          {pageList.slice(0, 6).map((item) => (
            <button
              className={cx(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                activePage === item.id ? "bg-white text-void" : "text-white/58 hover:text-white"
              )}
              key={item.id}
              onClick={() => selectPage(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden md:block">
          <button
            className="rounded-full border border-white/15 bg-white/[.07] px-4 py-2 text-sm font-semibold text-white transition hover:border-aurora/50 hover:bg-white/[.12]"
            onClick={() => selectPage("profile")}
            type="button"
          >
            Profile
          </button>
        </div>

        <button
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[.06] text-white md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <motion.div className="border-t border-white/10 bg-void/95 px-5 py-4 backdrop-blur-2xl md:hidden" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid gap-2">
            {pageList.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className={cx(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition",
                    activePage === item.id ? "bg-white text-void" : "bg-white/[.05] text-white/70"
                  )}
                  key={item.id}
                  onClick={() => selectPage(item.id)}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </header>
  );
}

function AppBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-radial-aura opacity-80" />
      <div className="absolute left-[-8rem] top-20 h-80 w-80 rounded-full bg-aurora/15 blur-3xl" />
      <div className="absolute right-[-10rem] top-36 h-96 w-96 rounded-full bg-ember/15 blur-3xl" />
      <div className="absolute bottom-[-14rem] left-1/3 h-96 w-96 rounded-full bg-pulse/15 blur-3xl" />
    </div>
  );
}

function PageFrame({ kicker, title, children, action }) {
  return (
    <section className="relative mx-auto min-h-screen max-w-7xl px-5 pb-20 pt-28 sm:px-8">
      <motion.div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end" initial="hidden" animate="visible" variants={stagger}>
        <div>
          <motion.p variants={fadeUp} className="text-sm font-semibold uppercase tracking-[0.3em] text-aurora">
            {kicker}
          </motion.p>
          <motion.h1 variants={fadeUp} className="mt-4 max-w-4xl text-4xl font-black leading-tight text-white sm:text-6xl">
            {title}
          </motion.h1>
        </div>
        {action}
      </motion.div>
      {children}
    </section>
  );
}

function MiniChart({ data, max }) {
  const highest = max || Math.max(1, ...data.map((item) => item.value));
  return (
    <div className="flex h-32 items-end gap-2">
      {data.map((item, index) => (
        <div className="flex flex-1 flex-col items-center gap-2" key={`${item.key}-${index}`}>
          <motion.div
            className="w-full rounded-t-lg bg-gradient-to-t from-aurora/25 via-aurora/70 to-white/90"
            animate={{ height: `${Math.max(8, (item.value / highest) * 100)}%` }}
            initial={{ height: 0 }}
            transition={{ delay: index * 0.03, duration: 0.55 }}
          />
          <span className="text-[10px] text-white/35">{item.label.slice(0, 1)}</span>
        </div>
      ))}
    </div>
  );
}

function CommandPreview({ habits, goals, stats, setPage, toggleHabitToday }) {
  return (
    <motion.div className="relative mx-auto w-full max-w-[560px]" animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
      <div className="absolute -inset-8 rounded-[40px] bg-aurora/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[.07] p-4 shadow-glow backdrop-blur-2xl sm:p-5">
        <div className="relative rounded-3xl border border-white/10 bg-void/72 p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-aurora/70">Live Command Center</p>
              <h3 className="mt-1 text-xl font-semibold text-white">Level {stats.level}: Relentless</h3>
            </div>
            <button className="rounded-full border border-white/10 bg-white/10 p-3 text-white transition hover:scale-105" onClick={() => setPage("dashboard")} type="button">
              <Zap className="h-5 w-5 text-amber-200" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              ["XP", stats.xp.toLocaleString(), Trophy],
              ["Streak", stats.bestStreak, Flame],
              ["Score", stats.disciplineScore, Gauge]
            ].map(([label, value, Icon]) => (
              <div className="rounded-2xl border border-white/10 bg-white/[.06] p-3" key={label}>
                <Icon className="mb-3 h-4 w-4 text-aurora" />
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">{label}</p>
                <div className="mt-1 text-lg font-bold text-white">
                  <AnimatedNumber value={value} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.045] p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-white">Discipline Analytics</span>
              <span className="rounded-full bg-vita/10 px-3 py-1 text-xs text-vita">{stats.completionRate}% week</span>
            </div>
            <MiniChart data={getDailyCounts(habits, 12)} max={Math.max(1, habits.length)} />
          </div>

          <div className="mt-4 space-y-3">
            {habits.slice(0, 3).map((habit) => (
              <button
                className="w-full rounded-2xl border border-white/10 bg-white/[.04] p-4 text-left transition hover:border-aurora/30 hover:bg-white/[.07]"
                key={habit.id}
                onClick={() => toggleHabitToday(habit.id)}
                type="button"
              >
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-white">{habit.name}</span>
                  <span className={completedOn(habit) ? "text-vita" : "text-white/38"}>{completedOn(habit) ? "Done" : "Tap to log"}</span>
                </div>
                <ProgressBar label={habit.target} tone={habit.color} value={Math.min(100, getStreak(habit) * 12 + 28)} />
              </button>
            ))}
          </div>
          <button className="mt-4 w-full rounded-full bg-white px-5 py-3 text-sm font-bold text-void transition hover:scale-[1.02]" onClick={() => setPage("habits")} type="button">
            Open Habit Tracker
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function HomePage({ habits, goals, stats, setPage, toggleHabitToday }) {
  return (
    <>
      <section className="relative min-h-screen overflow-hidden px-5 pb-24 pt-32 sm:px-8 lg:pt-40">
        <Particles />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_.9fr]">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-aurora/80">
              <Sparkles className="h-4 w-4" />
              Systems become identity
            </motion.div>
            <motion.h1 variants={fadeUp} className="max-w-5xl text-5xl font-black leading-[.95] text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              Build discipline. <span className="text-gradient">See real progress.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-7 max-w-2xl text-lg leading-8 text-white/68 sm:text-xl">
              Track habits, visualize growth, and become who you said you'd be.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-4 sm:flex-row">
              <GlowButton onClick={() => setPage("habits")}>Start Free</GlowButton>
              <GlowButton onClick={() => setPage("dashboard")} variant="secondary">
                View Dashboard
              </GlowButton>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-center">
              {[
                [stats.xp.toLocaleString(), "XP earned"],
                [`${stats.completionRate}%`, "completion"],
                [stats.bestStreak, "best streak"]
              ].map(([value, label]) => (
                <div className="rounded-2xl border border-white/10 bg-white/[.045] p-4 backdrop-blur-xl" key={label}>
                  <div className="text-xl font-bold text-white">{value}</div>
                  <div className="mt-1 text-xs text-white/45">{label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
          <CommandPreview habits={habits} goals={goals} stats={stats} setPage={setPage} toggleHabitToday={toggleHabitToday} />
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={stagger}>
          <motion.div variants={fadeUp} className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-ember">Built for inner momentum</p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-white sm:text-6xl">
              Discipline that feels visible, earned, and alive.
            </h2>
          </motion.div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {[
              [Target, "Habit Tracking", "Create habits, log today's wins, preserve streaks, and keep your system alive.", "bg-vita/20"],
              [BarChart3, "Discipline Analytics", "See completion rates, daily consistency, XP, streaks, and category momentum.", "bg-aurora/20"],
              [Compass, "Goal Roadmap", "Turn bigger ambitions into unlockable milestones with rewarding progress feedback.", "bg-ember/20"]
            ].map(([Icon, title, text, glow]) => (
              <motion.div className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[.055] p-7 backdrop-blur-xl" key={title} variants={fadeUp} whileHover={{ y: -10, scale: 1.015 }}>
                <div className={cx("absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl transition-opacity group-hover:opacity-90", glow)} />
                <div className="relative">
                  <div className="mb-7 grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/10">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">{title}</h3>
                  <p className="mt-4 leading-7 text-white/60">{text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="px-5 py-24 sm:px-8">
        <motion.div className="mx-auto max-w-5xl text-center" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }}>
          <div className="mx-auto mb-10 h-px max-w-2xl bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <blockquote className="text-3xl font-black leading-tight text-white sm:text-5xl">
            "You do not rise to the level of your goals. You fall to the level of your systems."
          </blockquote>
          <p className="mt-7 text-lg text-white/48">James Clear</p>
        </motion.div>
      </section>
    </>
  );
}

function StatCard({ icon: Icon, label, value, hint, tone = "aurora" }) {
  const colors = toneClasses(tone);
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/45">{label}</p>
          <div className="mt-3 text-4xl font-black text-white">
            <AnimatedNumber value={value} />
          </div>
          <p className="mt-2 text-sm text-white/45">{hint}</p>
        </div>
        <div className={cx("grid h-12 w-12 place-items-center rounded-2xl border", colors.soft, colors.border)}>
          <Icon className={cx("h-6 w-6", colors.text)} />
        </div>
      </div>
    </Card>
  );
}

function DashboardPage({ habits, goals, stats, toggleHabitToday, setPage }) {
  const dailyCounts = getDailyCounts(habits, 14);
  return (
    <PageFrame kicker="Dashboard" title="Your command center for today's discipline.">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Trophy} label="Total XP" value={stats.xp.toLocaleString()} hint={`Level ${stats.level}`} tone="aurora" />
        <StatCard icon={Flame} label="Best streak" value={stats.bestStreak} hint="Consecutive days" tone="ember" />
        <StatCard icon={Gauge} label="Discipline score" value={stats.disciplineScore} hint={`${stats.completionRate}% weekly completion`} tone="pulse" />
        <StatCard icon={CheckCircle2} label="Done today" value={`${stats.completedToday}/${stats.habitsCount}`} hint="Habits completed" tone="vita" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Today</h2>
              <p className="mt-1 text-sm text-white/45">Click a habit to log or unlog today's completion.</p>
            </div>
            <button className="rounded-full bg-white px-4 py-2 text-sm font-bold text-void" onClick={() => setPage("habits")} type="button">
              Manage
            </button>
          </div>
          <div className="space-y-3">
            {habits.map((habit) => {
              const done = completedOn(habit);
              return (
                <button
                  className={cx(
                    "w-full rounded-2xl border p-4 text-left transition hover:scale-[1.01]",
                    done ? "border-vita/30 bg-vita/10" : "border-white/10 bg-white/[.045] hover:border-aurora/25"
                  )}
                  key={habit.id}
                  onClick={() => toggleHabitToday(habit.id)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-white">{habit.name}</h3>
                      <p className="mt-1 text-sm text-white/45">{habit.category} / {habit.target} / {habit.xp} XP</p>
                    </div>
                    <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-full border", done ? "border-vita/40 bg-vita/15 text-vita" : "border-white/10 bg-white/[.06] text-white/35")}>
                      <Check className="h-5 w-5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Level Progression</h2>
              <p className="mt-1 text-sm text-white/45">Next rank: Architect</p>
            </div>
            <Rocket className="h-6 w-6 text-ember" />
          </div>
          <ProgressBar label={`Level ${stats.level} progress`} value={stats.levelProgress} tone="ember" />
          <div className="mt-8 rounded-2xl border border-white/10 bg-void/60 p-4">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">14-day graph</span>
              <LineChart className="h-5 w-5 text-vita" />
            </div>
            <MiniChart data={dailyCounts} max={Math.max(1, habits.length)} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {goals.slice(0, 2).map((goal) => (
              <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4" key={goal.id}>
                <p className="text-sm font-semibold text-white">{goal.done ? "Unlocked" : "In progress"}</p>
                <p className="mt-1 text-xs text-white/45">{goal.title}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageFrame>
  );
}

function HabitWeek({ habit }) {
  return (
    <div className="mt-4 grid grid-cols-7 gap-2">
      {Array.from({ length: 7 }, (_, index) => {
        const day = addDays(today, index - 6);
        const key = dateKey(day);
        const done = completedOn(habit, key);
        return (
          <div className="text-center" key={key}>
            <div className={cx("mx-auto h-8 rounded-xl border", done ? "border-vita/40 bg-vita/20" : "border-white/10 bg-white/[.045]")} />
            <div className="mt-1 text-[10px] text-white/35">{day.toLocaleDateString("en", { weekday: "short" }).slice(0, 1)}</div>
          </div>
        );
      })}
    </div>
  );
}

function HabitsPage({ habits, setHabits, toggleHabitToday }) {
  const [form, setForm] = useState({ name: "", category: "Focus", target: "30 min", xp: 50, color: "aurora" });

  const addHabit = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    setHabits((current) => [
      {
        id: makeId(),
        name,
        category: form.category,
        target: form.target,
        xp: Number(form.xp) || 50,
        color: form.color,
        completions: []
      },
      ...current
    ]);
    setForm({ name: "", category: "Focus", target: "30 min", xp: 50, color: "aurora" });
  };

  const deleteHabit = (id) => {
    setHabits((current) => current.filter((habit) => habit.id !== id));
  };

  return (
    <PageFrame kicker="Habit Tracker" title="Build the system. Log the proof.">
      <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
        <Card>
          <h2 className="text-2xl font-black text-white">Create habit</h2>
          <form className="mt-6 space-y-4" onSubmit={addHabit}>
            <label className="block">
              <span className="text-sm text-white/50">Habit name</span>
              <input className="mt-2 w-full rounded-2xl border border-white/10 bg-void/70 px-4 py-3 text-white outline-none transition focus:border-aurora/50" onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Read, train, focus..." value={form.name} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-white/50">Category</span>
                <select className="mt-2 w-full rounded-2xl border border-white/10 bg-void/70 px-4 py-3 text-white outline-none focus:border-aurora/50" onChange={(event) => setForm({ ...form, category: event.target.value })} value={form.category}>
                  <option>Focus</option>
                  <option>Body</option>
                  <option>Mind</option>
                  <option>Skill</option>
                  <option>Recovery</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-white/50">Target</span>
                <input className="mt-2 w-full rounded-2xl border border-white/10 bg-void/70 px-4 py-3 text-white outline-none focus:border-aurora/50" onChange={(event) => setForm({ ...form, target: event.target.value })} value={form.target} />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-white/50">XP reward</span>
                <input className="mt-2 w-full rounded-2xl border border-white/10 bg-void/70 px-4 py-3 text-white outline-none focus:border-aurora/50" min="10" onChange={(event) => setForm({ ...form, xp: event.target.value })} type="number" value={form.xp} />
              </label>
              <label className="block">
                <span className="text-sm text-white/50">Energy</span>
                <select className="mt-2 w-full rounded-2xl border border-white/10 bg-void/70 px-4 py-3 text-white outline-none focus:border-aurora/50" onChange={(event) => setForm({ ...form, color: event.target.value })} value={form.color}>
                  <option value="aurora">Aurora</option>
                  <option value="ember">Ember</option>
                  <option value="vita">Vita</option>
                  <option value="pulse">Pulse</option>
                </select>
              </label>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-void transition hover:scale-[1.02]" type="submit">
              <Plus className="h-4 w-4" />
              Add Habit
            </button>
          </form>
        </Card>

        <div className="grid gap-4">
          {habits.map((habit) => {
            const done = completedOn(habit);
            const colors = toneClasses(habit.color);
            return (
              <Card className={cx(done && "border-vita/25 bg-vita/[.06]")} key={habit.id}>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={cx("rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]", colors.border, colors.text, colors.soft)}>
                        {habit.category}
                      </span>
                      <span className="text-sm text-white/45">{habit.target}</span>
                      <span className="text-sm text-white/45">{habit.xp} XP</span>
                    </div>
                    <h3 className="mt-4 text-2xl font-black text-white">{habit.name}</h3>
                    <p className="mt-2 text-sm text-white/45">Current streak: {getStreak(habit)} days / Total logs: {habit.completions?.length || 0}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className={cx("rounded-full px-4 py-2 text-sm font-bold transition", done ? "bg-vita text-void" : "border border-white/15 bg-white/[.06] text-white hover:bg-white/[.1]")} onClick={() => toggleHabitToday(habit.id)} type="button">
                      {done ? "Logged" : "Log Today"}
                    </button>
                    <button aria-label={`Delete ${habit.name}`} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[.06] text-white/55 transition hover:border-ember/40 hover:text-ember" onClick={() => deleteHabit(habit.id)} type="button">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <HabitWeek habit={habit} />
              </Card>
            );
          })}
        </div>
      </div>
    </PageFrame>
  );
}

function AnalyticsPage({ habits, stats }) {
  const dailyCounts = getDailyCounts(habits, 21);
  const categories = Object.entries(
    habits.reduce((map, habit) => {
      const current = map[habit.category] || { total: 0, completions: 0 };
      current.total += 7;
      current.completions += Array.from({ length: 7 }, (_, index) => dateKey(addDays(today, -index))).filter((key) => completedOn(habit, key)).length;
      map[habit.category] = current;
      return map;
    }, {})
  ).map(([name, data]) => ({ name, value: Math.round((data.completions / data.total) * 100) }));

  return (
    <PageFrame kicker="Analytics" title="Know the rhythm behind your progress.">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Card>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">21-day consistency</h2>
              <p className="mt-1 text-sm text-white/45">Each bar shows completed habits for that day.</p>
            </div>
            <LineChart className="h-6 w-6 text-aurora" />
          </div>
          <MiniChart data={dailyCounts} max={Math.max(1, habits.length)} />
        </Card>
        <Card>
          <h2 className="text-2xl font-black text-white">System health</h2>
          <div className="mt-6 space-y-5">
            <ProgressBar label="Weekly completion" value={stats.completionRate} tone="vita" />
            <ProgressBar label="Level progress" value={stats.levelProgress} tone="ember" />
            <ProgressBar label="Discipline score" value={stats.disciplineScore} tone="aurora" />
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {categories.map((category, index) => (
          <Card key={category.name}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">{category.name}</h3>
              <Activity className={cx("h-5 w-5", index % 2 ? "text-ember" : "text-vita")} />
            </div>
            <div className="mt-5 text-5xl font-black text-white">{category.value}%</div>
            <p className="mt-2 text-sm text-white/45">7-day category completion</p>
          </Card>
        ))}
      </div>
    </PageFrame>
  );
}

function GoalsPage({ goals, setGoals }) {
  const [title, setTitle] = useState("");

  const addGoal = (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    setGoals((current) => [{ id: makeId(), title: title.trim(), done: false, xp: 250 }, ...current]);
    setTitle("");
  };

  const toggleGoal = (id) => {
    setGoals((current) => current.map((goal) => (goal.id === id ? { ...goal, done: !goal.done } : goal)));
  };

  const removeGoal = (id) => {
    setGoals((current) => current.filter((goal) => goal.id !== id));
  };

  const doneCount = goals.filter((goal) => goal.done).length;
  const progress = goals.length ? Math.round((doneCount / goals.length) * 100) : 0;

  return (
    <PageFrame kicker="Goal Roadmap" title="Turn future identity into unlockable milestones.">
      <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <Card>
          <h2 className="text-2xl font-black text-white">Roadmap progress</h2>
          <div className="mt-6 text-6xl font-black text-white">{progress}%</div>
          <ProgressBar label={`${doneCount}/${goals.length} milestones unlocked`} value={progress} tone="pulse" />
          <form className="mt-8 flex gap-2" onSubmit={addGoal}>
            <input className="min-w-0 flex-1 rounded-full border border-white/10 bg-void/70 px-4 py-3 text-white outline-none focus:border-aurora/50" onChange={(event) => setTitle(event.target.value)} placeholder="Add a milestone" value={title} />
            <button className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-void" type="submit">
              <Plus className="h-5 w-5" />
            </button>
          </form>
        </Card>
        <div className="space-y-4">
          {goals.map((goal, index) => (
            <Card className={goal.done ? "border-vita/25 bg-vita/[.06]" : ""} key={goal.id}>
              <div className="flex items-center gap-4">
                <button className={cx("grid h-12 w-12 shrink-0 place-items-center rounded-2xl border", goal.done ? "border-vita/40 bg-vita/20 text-vita" : "border-white/10 bg-white/[.06] text-white/40")} onClick={() => toggleGoal(goal.id)} type="button">
                  <Check className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/35">Milestone {index + 1}</p>
                  <h3 className="mt-1 text-lg font-black text-white">{goal.title}</h3>
                  <p className="mt-1 text-sm text-white/45">{goal.xp} XP reward</p>
                </div>
                <button className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[.06] text-white/50 hover:text-ember" onClick={() => removeGoal(goal.id)} type="button">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageFrame>
  );
}

function PricingPage() {
  const plans = [
    ["FREE", "Free", ["Track up to 3 habits", "Basic analytics", "Daily streaks"]],
    ["PLUS", "$7/month", ["Unlimited habits", "Advanced insights", "Discipline score", "Weekly reports"], true],
    ["MAX", "$15/month", ["Everything in Plus", "AI insights", "Goal roadmap", "Premium analytics"]]
  ];

  return (
    <PageFrame kicker="Pricing" title="Start simple. Scale your discipline.">
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map(([name, price, features, popular]) => (
          <motion.div
            className={cx(
              "relative rounded-[26px] border p-7 backdrop-blur-2xl transition duration-300 hover:-translate-y-2",
              popular ? "border-aurora/45 bg-aurora/[.09] shadow-glow" : "border-white/10 bg-white/[.05] hover:border-white/20"
            )}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            key={name}
          >
            {popular && <span className="absolute right-6 top-6 rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-void">Most Popular</span>}
            <h3 className="text-lg font-black tracking-[0.25em] text-white">{name}</h3>
            <div className="mt-8 text-4xl font-black text-white">{price}</div>
            <ul className="mt-8 space-y-4">
              {features.map((feature) => (
                <li className="flex items-center gap-3 text-white/66" key={feature}>
                  <Check className="h-5 w-5 text-vita" />
                  {feature}
                </li>
              ))}
            </ul>
            <button className={cx("mt-9 w-full rounded-full px-5 py-3 text-sm font-bold transition", popular ? "bg-white text-void hover:scale-[1.02]" : "border border-white/15 bg-white/[.06] text-white hover:bg-white/[.1]")} type="button">
              Start {name}
            </button>
          </motion.div>
        ))}
      </div>
    </PageFrame>
  );
}

function ProfilePage({ profile, setProfile, stats, resetData }) {
  return (
    <PageFrame kicker="Profile" title="Tune your identity system.">
      <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
        <Card>
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-3xl border border-aurora/25 bg-aurora/10 text-3xl font-black text-white">
              {profile.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{profile.name}</h2>
              <p className="text-sm text-white/45">{profile.identity}</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
              <p className="text-2xl font-black text-white">{stats.level}</p>
              <p className="mt-1 text-xs text-white/40">Level</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
              <p className="text-2xl font-black text-white">{stats.bestStreak}</p>
              <p className="mt-1 text-xs text-white/40">Streak</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
              <p className="text-2xl font-black text-white">{stats.disciplineScore}</p>
              <p className="mt-1 text-xs text-white/40">Score</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="mb-6 flex items-center gap-3">
            <Settings className="h-6 w-6 text-aurora" />
            <h2 className="text-2xl font-black text-white">Settings</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-white/50">Name</span>
              <input className="mt-2 w-full rounded-2xl border border-white/10 bg-void/70 px-4 py-3 text-white outline-none focus:border-aurora/50" onChange={(event) => setProfile({ ...profile, name: event.target.value })} value={profile.name} />
            </label>
            <label className="block">
              <span className="text-sm text-white/50">Identity line</span>
              <input className="mt-2 w-full rounded-2xl border border-white/10 bg-void/70 px-4 py-3 text-white outline-none focus:border-aurora/50" onChange={(event) => setProfile({ ...profile, identity: event.target.value })} value={profile.identity} />
            </label>
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.04] p-5">
            <p className="text-sm text-white/45">Data is saved locally in this browser with localStorage. It behaves like a real tracker without needing a backend.</p>
          </div>
          <button className="mt-5 rounded-full border border-ember/30 bg-ember/10 px-5 py-3 text-sm font-bold text-ember transition hover:bg-ember/15" onClick={resetData} type="button">
            Reset Demo Data
          </button>
        </Card>
      </div>
    </PageFrame>
  );
}

function App() {
  const [activePage, setActivePage] = useState(getHashPage);
  const [habits, setHabits] = useLocalState(HABIT_KEY, starterHabits, normalizeHabits);
  const [goals, setGoals] = useLocalState(GOALS_KEY, starterGoals, normalizeGoals);
  const [profile, setProfile] = useLocalState(PROFILE_KEY, {
    name: "Alex",
    identity: "Building calm, dangerous consistency"
  }, normalizeProfile);
  const stats = useMemo(() => getStats(habits, goals), [habits, goals]);

  useEffect(() => {
    const onHashChange = () => setActivePage(getHashPage());
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
    };
  }, []);

  const goToPage = (page) => {
    setActivePage(page);
    const nextHash = page === "home" ? "" : `#${page}`;
    window.history.pushState(null, "", `${window.location.pathname}${nextHash}`);
  };

  const toggleHabitToday = (id) => {
    const key = dateKey();
    setHabits((current) =>
      current.map((habit) => {
        if (habit.id !== id) return habit;
        const exists = completedOn(habit, key);
        return {
          ...habit,
          completions: exists ? habit.completions.filter((completion) => completion !== key) : [...habit.completions, key]
        };
      })
    );
  };

  const resetData = () => {
    setHabits(starterHabits.map(normalizeHabit));
    setGoals(starterGoals.map(normalizeGoal));
    setProfile(normalizeProfile({ name: "Alex", identity: "Building calm, dangerous consistency" }));
  };

  const pages = {
    home: <HomePage habits={habits} goals={goals} stats={stats} setPage={goToPage} toggleHabitToday={toggleHabitToday} />,
    dashboard: <DashboardPage habits={habits} goals={goals} stats={stats} toggleHabitToday={toggleHabitToday} setPage={goToPage} />,
    habits: <HabitsPage habits={habits} setHabits={setHabits} toggleHabitToday={toggleHabitToday} />,
    analytics: <AnalyticsPage habits={habits} stats={stats} />,
    goals: <GoalsPage goals={goals} setGoals={setGoals} />,
    pricing: <PricingPage />,
    profile: <ProfilePage profile={profile} setProfile={setProfile} stats={stats} resetData={resetData} />
  };

  return (
    <main className="min-h-screen overflow-hidden bg-void text-white">
      <AppBackdrop />
      <TopNav activePage={activePage} setPage={goToPage} />
      <motion.div key={activePage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="relative">
        {pages[activePage]}
      </motion.div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
