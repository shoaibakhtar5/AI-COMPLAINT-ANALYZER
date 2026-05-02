/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { readJSON, writeJSON } from './storage';
import { sleep } from './sleep';
import { complaints as seedComplaints } from '../data/complaints';

const KEY = 'complaints';

function seed() {
  // Normalize seed data into a consistent workflow for the demo.
  return seedComplaints.map((c) => ({
    ...c,
    status: c.status === 'Resolved' ? 'Resolved' : c.status === 'Investigating' ? 'In Progress' : 'Pending',
    notes: c.notes ?? '',
    timeline: c.timeline ?? [
      { label: 'Received', at: c.createdAt ?? '—', completed: true },
      { label: 'Classified', at: 'AI auto', completed: true },
      { label: 'In Progress', at: 'Assigned', completed: c.status !== 'Queued' },
      { label: 'Resolved', at: '—', completed: c.status === 'Resolved' },
    ],
  }));
}

function load() {
  return readJSON(localStorage, KEY, null) ?? seed();
}

function persist(next) {
  writeJSON(localStorage, KEY, next);
}

const ComplaintsContext = createContext(null);

function makeId() {
  const n = Math.floor(1000 + Math.random() * 8999);
  return `AE-${n}`;
}

export function ComplaintsProvider({ children }) {
  const [items, setItems] = useState(load);

  const refresh = useCallback(async () => {
    await sleep(650);
    setItems(load());
  }, []);

  const getById = useCallback(
    (id) => items.find((c) => c.id.toLowerCase() === String(id).trim().toLowerCase()) ?? null,
    [items],
  );

  const submit = useCallback(async ({ name, email, subject, message, category, department, attachmentName }) => {
    await sleep(1400);
    const id = makeId();
    const now = new Date();
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(
      2,
      '0',
    )} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const complaint = {
      id,
      customer: name,
      company: 'Direct Consumer',
      subject,
      category,
      channel: 'Portal',
      status: 'Pending',
      priority: 'P2',
      sentiment: 'Neutral',
      risk: Number((55 + Math.random() * 35).toFixed(1)),
      department,
      assignee: 'Unassigned',
      createdAt,
      updatedAt: 'just now',
      message,
      contactEmail: email,
      attachmentName: attachmentName ?? null,
      notes: '',
      timeline: [
        { label: 'Received', at: createdAt, completed: true },
        { label: 'Classified', at: 'AI queued', completed: false },
        { label: 'In Progress', at: '—', completed: false },
        { label: 'Resolved', at: '—', completed: false },
      ],
    };

    setItems((prev) => {
      const next = [complaint, ...prev];
      persist(next);
      return next;
    });

    return complaint;
  }, []);

  const update = useCallback(async (id, patch) => {
    await sleep(900);
    setItems((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: 'just now' } : c));
      persist(next);
      return next;
    });
  }, []);

  const advanceStatus = useCallback(async (id) => {
    await sleep(850);
    setItems((prev) => {
      const next = prev.map((c) => {
        if (c.id !== id) return c;
        const nextStatus = c.status === 'Pending' ? 'In Progress' : c.status === 'In Progress' ? 'Resolved' : 'Resolved';
        const timeline = (c.timeline ?? []).map((t) => {
          if (t.label === 'Classified' && nextStatus !== 'Pending') return { ...t, completed: true, at: t.at === 'AI queued' ? 'AI auto' : t.at };
          if (t.label === 'In Progress') return { ...t, completed: nextStatus !== 'Pending', at: nextStatus !== 'Pending' ? 'Assigned' : t.at };
          if (t.label === 'Resolved') return { ...t, completed: nextStatus === 'Resolved', at: nextStatus === 'Resolved' ? 'Completed' : '—' };
          return t;
        });
        return { ...c, status: nextStatus, timeline, updatedAt: 'just now' };
      });
      persist(next);
      return next;
    });
  }, []);

  const api = useMemo(
    () => ({
      items,
      refresh,
      getById,
      submit,
      update,
      advanceStatus,
    }),
    [advanceStatus, getById, items, refresh, submit, update],
  );

  return <ComplaintsContext.Provider value={api}>{children}</ComplaintsContext.Provider>;
}

export function useComplaints() {
  const ctx = useContext(ComplaintsContext);
  if (!ctx) throw new Error('useComplaints must be used within ComplaintsProvider');
  return ctx;
}

