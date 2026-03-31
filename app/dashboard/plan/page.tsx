'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PlanTask } from '@/lib/kv';

type DayType = 'montag' | 'dienstag' | 'mittwoch' | 'donnerstag' | 'freitag';

const dayLabels: Record<DayType, string> = {
  montag: 'Montag',
  dienstag: 'Dienstag',
  mittwoch: 'Mittwoch',
  donnerstag: 'Donnerstag',
  freitag: 'Freitag',
};

const dayOrder: DayType[] = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag'];

const weekTitles: Record<number, string> = {
  1: 'Fundament & Neugier',
  2: 'Gespräche & erste Kunden',
  3: 'Abschlüsse & Partner-Radar',
  4: 'Onboarding & Duplikation',
};

interface TasksByDay {
  montag: PlanTask[];
  dienstag: PlanTask[];
  mittwoch: PlanTask[];
  donnerstag: PlanTask[];
  freitag: PlanTask[];
}

export default function PlanPage() {
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [cycleStart, setCycleStart] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize cycle start date (first day of current week)
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const isoDate = monday.toISOString().split('T')[0];
    setCycleStart(isoDate);
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!cycleStart) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/partners/plan?cycleStart=${cycleStart}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [cycleStart]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Toggle task completion
  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      const response = await fetch('/api/partners/plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          completed: !task.completed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Start editing task
  const startEditingTask = (task: PlanTask) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  // Save edited task
  const saveEditedTask = async () => {
    if (!editingTaskId) return;

    try {
      const response = await fetch('/api/partners/plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTaskId,
          text: editingText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map((t) => (t.id === editingTaskId ? updatedTask : t)));
      setEditingTaskId(null);
      setEditingText('');
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingText('');
  };

  // Start new cycle
  const startNewCycle = async () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const newCycleStart = monday.toISOString().split('T')[0];

    try {
      const response = await fetch('/api/partners/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycleStart: newCycleStart }),
      });

      if (!response.ok) {
        throw new Error('Failed to start new cycle');
      }

      setCycleStart(newCycleStart);
      const data = await response.json();
      setTasks(data);
      setCurrentWeek(1);
    } catch (error) {
      console.error('Error starting new cycle:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Group tasks by week and day
  const tasksByWeek: Record<number, TasksByDay> = {};
  for (let week = 1; week <= 4; week++) {
    tasksByWeek[week] = {
      montag: [],
      dienstag: [],
      mittwoch: [],
      donnerstag: [],
      freitag: [],
    };
  }

  tasks.forEach((task) => {
    if (tasksByWeek[task.week]) {
      tasksByWeek[task.week][task.day].push(task);
    }
  });

  // Calculate stats
  const currentWeekTasks = Object.values(tasksByWeek[currentWeek]).flat();
  const completedCount = currentWeekTasks.filter((t) => t.completed).length;
  const totalCount = currentWeekTasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Render task item
  const renderTaskItem = (task: PlanTask) => {
    const isEditing = editingTaskId === task.id;

    return (
      <div
        key={task.id}
        className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded transition-colors"
      >
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTaskCompletion(task.id)}
          className="mt-1 cursor-pointer accent-purple-600 flex-shrink-0"
        />
        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              autoFocus
            />
            <button
              onClick={saveEditedTask}
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            >
              ✓
            </button>
            <button
              onClick={cancelEditing}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            >
              ✕
            </button>
          </div>
        ) : (
          <span
            className={`flex-1 text-sm cursor-pointer hover:underline ${
              task.completed ? 'line-through text-gray-400' : 'text-gray-800'
            }`}
            onClick={() => startEditingTask(task)}
          >
            {task.text}
          </span>
        )}
      </div>
    );
  };

  // Render day column
  const renderDayColumn = (day: DayType, tasks: PlanTask[], isMobileView: boolean) => {
    return (
      <div
        key={day}
        className={`flex-1 min-w-0 ${
          isMobileView ? 'block' : ''
        } bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm`}
      >
        <div
          className="px-4 py-3 text-center font-semibold text-white"
          style={{ backgroundColor: '#6e0147' }}
        >
          {dayLabels[day]}
        </div>
        <div className="divide-y divide-gray-100">
          {tasks.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">Keine Aufgaben</div>
          ) : (
            tasks.map((task) => renderTaskItem(task))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Dein Wochenplan</h1>

        {/* Week Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4].map((week) => (
            <button
              key={week}
              onClick={() => setCurrentWeek(week)}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                currentWeek === week
                  ? 'bg-white border-2 shadow-md'
                  : 'bg-white border border-gray-200 hover:border-gray-300'
              }`}
              style={{
                color: currentWeek === week ? '#6e0147' : '#6b7280',
                borderColor: currentWeek === week ? '#6e0147' : '#d1d5db',
              }}
            >
              <div className="text-sm font-semibold">Woche {week}</div>
              <div className="text-xs text-gray-500 mt-1">{weekTitles[week]}</div>
            </button>
          ))}
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Woche {currentWeek} Fortschritt</h2>
            <span className="text-sm font-medium text-gray-600">
              {completedCount} / {totalCount} Aufgaben
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${completionPercentage}%`,
                backgroundColor: '#E8A838',
              }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {completionPercentage === 100
              ? '🎉 Woche abgeschlossen! Großartig!'
              : completionPercentage >= 75
              ? '👏 Fast geschafft! Weiter so!'
              : completionPercentage >= 50
              ? '💪 Gute Fortschritte!'
              : 'Du packst das! 🚀'}
          </p>
        </div>

        {/* Start New Cycle Button */}
        <button
          onClick={startNewCycle}
          className="px-6 py-3 bg-white border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          style={{ color: '#6e0147', borderColor: '#6e0147' }}
        >
          Neuen Zyklus starten
        </button>
      </div>

      {/* Week View */}
      {isMobile ? (
        // Mobile View - Single Day at a Time
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dayOrder.map((day) => (
              <button
                key={day}
                onClick={() => {
                  // Scroll to that day's view
                  const element = document.getElementById(`day-${day}`);
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-2 rounded text-sm font-medium whitespace-nowrap border"
                style={{
                  backgroundColor: '#f8f9fb',
                  color: '#6e0147',
                  borderColor: '#6e0147',
                }}
              >
                {dayLabels[day].substring(0, 3)}
              </button>
            ))}
          </div>
          {dayOrder.map((day) => (
            <div key={day} id={`day-${day}`}>
              {renderDayColumn(day, tasksByWeek[currentWeek][day], true)}
            </div>
          ))}
        </div>
      ) : (
        // Desktop View - 5 Columns
        <div className="grid grid-cols-5 gap-4">
          {dayOrder.map((day) =>
            renderDayColumn(day, tasksByWeek[currentWeek][day], false)
          )}
        </div>
      )}

      {/* Monthly Overview */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Monatsübersicht</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((week) => {
            const weekTasks = Object.values(tasksByWeek[week]).flat();
            const weekCompleted = weekTasks.filter((t) => t.completed).length;
            const weekTotal = weekTasks.length;
            const weekPercentage = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

            return (
              <div
                key={week}
                className={`bg-white rounded-lg border p-4 space-y-3 ${
                  currentWeek === week
                    ? 'border-2 shadow-md'
                    : 'border-gray-200'
                }`}
                style={{
                  borderColor: currentWeek === week ? '#6e0147' : '#d1d5db',
                }}
              >
                <div>
                  <h3 className="font-semibold text-gray-900">Woche {week}</h3>
                  <p className="text-sm text-gray-600">{weekTitles[week]}</p>
                </div>
                <div className="text-sm text-gray-600">
                  {weekCompleted} / {weekTotal} Aufgaben
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${weekPercentage}%`,
                      backgroundColor: '#E8A838',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Dein Zyklus</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Aktuelle Woche</p>
            <p className="text-3xl font-bold" style={{ color: '#6e0147' }}>
              Woche {currentWeek} / 4
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Gesamtfortschritt</p>
            <p className="text-3xl font-bold" style={{ color: '#6e0147' }}>
              {Math.round(
                (tasks.filter((t) => t.completed).length / tasks.length) * 100
              )}
              %
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Zyklus Start</p>
            <p className="text-sm font-semibold text-gray-900">{cycleStart}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
