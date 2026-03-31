import { NextRequest, NextResponse } from 'next/server';
import { getPartnerFromRequest } from '@/lib/auth';
import {
  getPlanTasksByPartnerIdAndCycle,
  createPlanTask,
  updatePlanTask,
} from '@/lib/kv';
import { PlanTask } from '@/lib/kv';

// Simple UUID generator
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

type DayType = 'montag' | 'dienstag' | 'mittwoch' | 'donnerstag' | 'freitag';

interface TaskTemplate {
  week: number;
  day: DayType;
  text: string;
}

const DEFAULT_TEMPLATE: TaskTemplate[] = [
  // Week 1 - Fundament & Neugier
  { week: 1, day: 'montag', text: 'Namensliste erstellen (50+)' },
  { week: 1, day: 'montag', text: 'Skillbook 1, Kap. 5 wiederholen' },
  { week: 1, day: 'dienstag', text: '5 Neugier-Nachrichten senden' },
  { week: 1, day: 'dienstag', text: 'Intent-Satz üben' },
  { week: 1, day: 'mittwoch', text: '5 Neugier-Nachrichten senden' },
  { week: 1, day: 'mittwoch', text: 'Erste Antworten bearbeiten' },
  { week: 1, day: 'donnerstag', text: '5 Neugier-Nachrichten senden' },
  { week: 1, day: 'donnerstag', text: 'Gespräche terminieren' },
  { week: 1, day: 'freitag', text: 'Restliche Gespräche terminieren' },
  { week: 1, day: 'freitag', text: 'Wochenreflexion' },

  // Week 2 - Gespräche & erste Kunden
  { week: 2, day: 'montag', text: 'Vorbereitung auf Gespräche' },
  { week: 2, day: 'montag', text: '5-Fragen-Struktur üben' },
  { week: 2, day: 'dienstag', text: '2-3 Erstgespräche führen' },
  { week: 2, day: 'dienstag', text: 'Follow-Up Nachrichten senden' },
  { week: 2, day: 'mittwoch', text: '2-3 Erstgespräche führen' },
  { week: 2, day: 'mittwoch', text: 'Erste Kunden registrieren' },
  { week: 2, day: 'donnerstag', text: 'Follow-Up bei allen Gesprächen' },
  { week: 2, day: 'donnerstag', text: 'Weitere Gespräche terminieren' },
  { week: 2, day: 'freitag', text: 'Ergebnisse prüfen (2-3 Kunden?)' },
  { week: 2, day: 'freitag', text: 'Wochenreflexion' },

  // Week 3 - Abschlüsse & Partner-Radar
  { week: 3, day: 'montag', text: 'Follow-Up bei allen Interessenten' },
  { week: 3, day: 'montag', text: '2-3 neue Gespräche führen' },
  { week: 3, day: 'dienstag', text: 'Kundenziel (5) erreichen' },
  { week: 3, day: 'dienstag', text: 'Zufriedene Kunden ansprechen' },
  { week: 3, day: 'mittwoch', text: '3-5 Partner-Gespräche starten' },
  { week: 3, day: 'mittwoch', text: 'Wert der Partnerschaft erklären' },
  { week: 3, day: 'donnerstag', text: 'Follow-Up bei Partner-Interessenten' },
  { week: 3, day: 'donnerstag', text: 'Gespräche terminieren' },
  { week: 3, day: 'freitag', text: 'Ergebnisse prüfen (5 Kunden, 5 Partner-Gespräche?)' },
  { week: 3, day: 'freitag', text: 'Wochenreflexion' },

  // Week 4 - Onboarding & Duplikation
  { week: 4, day: 'montag', text: '3 neue Partner willkommen heißen' },
  { week: 4, day: 'montag', text: 'Onboarding-Call durchführen' },
  { week: 4, day: 'dienstag', text: 'Partnern Skillbook 1 vorstellen' },
  { week: 4, day: 'dienstag', text: 'Bei der Namensliste helfen' },
  { week: 4, day: 'mittwoch', text: 'Erste Schritte der Partner begleiten' },
  { week: 4, day: 'mittwoch', text: 'Fragen beantworten' },
  { week: 4, day: 'donnerstag', text: 'Check-in mit neuen Kunden' },
  { week: 4, day: 'donnerstag', text: 'Check-in mit neuen Partnern' },
  { week: 4, day: 'freitag', text: 'Monatsziel feiern!' },
  { week: 4, day: 'freitag', text: 'Nächsten Monat planen' },
];

export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromRequest(request);
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current cycle start date from query params
    const searchParams = request.nextUrl.searchParams;
    const cycleStart = searchParams.get('cycleStart');

    if (!cycleStart) {
      return NextResponse.json(
        { error: 'cycleStart parameter is required' },
        { status: 400 }
      );
    }

    // Get existing tasks for this cycle
    let tasks = await getPlanTasksByPartnerIdAndCycle(partner.id, cycleStart);

    // If no tasks exist, auto-create the default template
    if (tasks.length === 0) {
      for (const template of DEFAULT_TEMPLATE) {
        const newTask: PlanTask = {
          id: generateId(),
          partnerId: partner.id,
          week: template.week,
          day: template.day,
          text: template.text,
          completed: false,
          cycleStart,
        };
        await createPlanTask(newTask);
        tasks.push(newTask);
      }
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching plan tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const partner = await getPartnerFromRequest(request);
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, completed, text } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Task id is required' },
        { status: 400 }
      );
    }

    const updates: Partial<PlanTask> = {};
    if (completed !== undefined) updates.completed = completed;
    if (text !== undefined) updates.text = text;

    const updatedTask = await updatePlanTask(id, updates);

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating plan task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const partner = await getPartnerFromRequest(request);
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cycleStart } = body;

    if (!cycleStart) {
      return NextResponse.json(
        { error: 'cycleStart is required' },
        { status: 400 }
      );
    }

    // Create fresh template tasks for the new cycle
    const tasks: PlanTask[] = [];
    for (const template of DEFAULT_TEMPLATE) {
      const newTask: PlanTask = {
        id: generateId() as string,
        partnerId: partner.id,
        week: template.week,
        day: template.day,
        text: template.text,
        completed: false,
        cycleStart,
      };
      const created = await createPlanTask(newTask);
      tasks.push(created);
    }

    return NextResponse.json(tasks, { status: 201 });
  } catch (error) {
    console.error('Error creating new plan cycle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
