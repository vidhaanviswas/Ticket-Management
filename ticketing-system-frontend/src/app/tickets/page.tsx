'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ticketAPI, userAPI } from '@/lib/api';
import { notifyError, notifyTicketAssigned, notifyTicketStatusChanged } from '@/lib/notifications';
import { Ticket, TicketStatus, TicketPriority, User } from '@/types';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import styles from './page.module.css';

export default function AllTicketsPage() {
  const { user, loading: authLoading, isSupportAgent, isAdmin } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedToId: '',
    search: '',
  });
  const [supportAgents, setSupportAgents] = useState<User[]>([]);

  const formatEnumLabel = (value: string) =>
    value
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const statusPillClass = (status: TicketStatus) => {
    const map: Record<TicketStatus, string> = {
      [TicketStatus.OPEN]: styles.statusOpen,
      [TicketStatus.IN_PROGRESS]: styles.statusInProgress,
      [TicketStatus.RESOLVED]: styles.statusResolved,
      [TicketStatus.CLOSED]: styles.statusClosed,
    };
    return map[status] ?? '';
  };

  const priorityPillClass = (priority: TicketPriority) => {
    const map: Record<TicketPriority, string> = {
      [TicketPriority.LOW]: styles.priorityLow,
      [TicketPriority.MEDIUM]: styles.priorityMedium,
      [TicketPriority.HIGH]: styles.priorityHigh,
      [TicketPriority.URGENT]: styles.priorityUrgent,
    };
    return map[priority] ?? '';
  };

  useEffect(() => {
    if (!authLoading && (!user || !isSupportAgent())) {
      router.push('/dashboard');
    }
  }, [user, authLoading, isSupportAgent, router]);

  useEffect(() => {
    if (user && isSupportAgent()) {
      loadTickets();
      loadSupportAgents();
    }
  }, [user, isSupportAgent]);

  const loadTickets = async () => {
    try {
      const data = await ticketAPI.getAll();
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSupportAgents = async () => {
    try {
      const data = await userAPI.getSupportAgents();
      setSupportAgents(data);
    } catch (error) {
      console.error('Failed to load support agents:', error);
    }
  };

  const filteredTickets = useMemo(() => {
    const status = filters.status.trim();
    const priority = filters.priority.trim();
    const assignedToId = filters.assignedToId.trim();
    const q = filters.search.trim().toLowerCase();

    return tickets.filter((t) => {
      if (status && t.status !== status) return false;
      if (priority && t.priority !== priority) return false;
      if (assignedToId && t.assignedToId !== Number(assignedToId)) return false;
      if (!q) return true;

      const haystack = [
        t.id?.toString() ?? '',
        t.subject ?? '',
        t.description ?? '',
        t.createdByUsername ?? '',
        t.assignedToUsername ?? '',
        t.status ?? '',
        t.priority ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [tickets, filters]);

  const handleAssign = async (ticketId: number, assignedToId: number) => {
    try {
      await ticketAPI.assign(ticketId, assignedToId);
      await loadTickets();
      const agent = supportAgents.find((a) => a.id === assignedToId);
      const label = assignedToId === user?.id ? 'you' : agent?.username;
      notifyTicketAssigned(ticketId, label);
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      notifyError(error, 'Failed to assign ticket');
    }
  };

  const handleStatusChange = async (ticketId: number, status: TicketStatus) => {
    try {
      await ticketAPI.updateStatus(ticketId, status);
      await loadTickets();
      notifyTicketStatusChanged(ticketId, status);
    } catch (error) {
      console.error('Failed to update status:', error);
      notifyError(error, 'Failed to update status');
    }
  };

  const stats = useMemo(() => {
    const total = filteredTickets.length;
    const open = filteredTickets.filter((t) => t.status === TicketStatus.OPEN).length;
    const inProgress = filteredTickets.filter((t) => t.status === TicketStatus.IN_PROGRESS).length;
    const resolved = filteredTickets.filter((t) => t.status === TicketStatus.RESOLVED).length;
    const closed = filteredTickets.filter((t) => t.status === TicketStatus.CLOSED).length;
    const urgent = filteredTickets.filter((t) => t.priority === TicketPriority.URGENT).length;
    const unassigned = filteredTickets.filter((t) => !t.assignedToId).length;
    return { total, open, inProgress, resolved, closed, urgent, unassigned };
  }, [filteredTickets]);

  const sortedTickets = useMemo(() => {
    return [...filteredTickets].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredTickets]);

  if (authLoading || loading) {
    return (
      <div className={styles.shell}>
        <Navbar />
        <main className={styles.page}>
          <div className={styles.container}>
            <div className={styles.header}>
              <div className={styles.heading}>
                <h1 className={styles.title}>All Tickets</h1>
                <p className={styles.subtitle}>Loading tickets…</p>
              </div>
            </div>
            <div className={styles.emptyState}>
              <div className={styles.emptyTitle}>Just a moment</div>
              <div className={styles.emptyText}>We&apos;re fetching the latest tickets.</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.heading}>
              <h1 className={styles.title}>All Tickets</h1>
              <p className={styles.subtitle}>Manage status and assignments across the queue.</p>
            </div>
          </div>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>Overview & filters</div>
              <div className={styles.sectionMeta}>
                {stats.total} ticket{stats.total === 1 ? '' : 's'} • {stats.unassigned} unassigned
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelTop}>
                <div className={styles.panelTitle}>Filters</div>
                <div className={styles.panelHint}>Updates results automatically</div>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>Total</div>
                  <div className={styles.statValue}>{stats.total}</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>Open</div>
                  <div className={styles.statValue}>{stats.open}</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>In Progress</div>
                  <div className={styles.statValue}>{stats.inProgress}</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>Resolved</div>
                  <div className={styles.statValue}>{stats.resolved}</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>Closed</div>
                  <div className={styles.statValue}>{stats.closed}</div>
                </div>
              </div>

              <div className={styles.filtersGrid}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="search">
                    Search
                  </label>
                  <input
                    id="search"
                    className={styles.input}
                    type="text"
                    placeholder="Search by subject or keyword…"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    className={styles.select}
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">All</option>
                    <option value={TicketStatus.OPEN}>Open</option>
                    <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                    <option value={TicketStatus.RESOLVED}>Resolved</option>
                    <option value={TicketStatus.CLOSED}>Closed</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="priority">
                    Priority
                  </label>
                  <select
                    id="priority"
                    className={styles.select}
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  >
                    <option value="">All</option>
                    <option value={TicketPriority.LOW}>Low</option>
                    <option value={TicketPriority.MEDIUM}>Medium</option>
                    <option value={TicketPriority.HIGH}>High</option>
                    <option value={TicketPriority.URGENT}>Urgent</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="assignedTo">
                    Assigned to
                  </label>
                  <select
                    id="assignedTo"
                    className={styles.select}
                    value={filters.assignedToId}
                    onChange={(e) => setFilters({ ...filters, assignedToId: e.target.value })}
                  >
                    <option value="">All</option>
                    {supportAgents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>Tickets</div>
              <div className={styles.sectionMeta}>Sorted by newest first</div>
            </div>

            {sortedTickets.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyTitle}>No tickets found</div>
                <div className={styles.emptyText}>
                  Try clearing filters or searching with different keywords.
                </div>
              </div>
            ) : (
              <div className={styles.ticketsGrid}>
                {sortedTickets.map((ticket) => (
                  <div key={ticket.id} className={styles.ticketCard}>
                    <div className={styles.ticketTop}>
                      <div>
                        <div className={styles.ticketTitle}>{ticket.subject}</div>
                        <div className={styles.ticketSub}>Ticket #{ticket.id}</div>
                      </div>
                      <div className={styles.pills}>
                        <span
                          className={[styles.pill, statusPillClass(ticket.status)].filter(Boolean).join(' ')}
                          title="Status"
                        >
                          {formatEnumLabel(ticket.status)}
                        </span>
                        <span
                          className={[styles.pill, priorityPillClass(ticket.priority)].filter(Boolean).join(' ')}
                          title="Priority"
                        >
                          {formatEnumLabel(ticket.priority)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.metaGrid}>
                      <div className={styles.metaItem}>
                        <span className={styles.metaKey}>Created by:</span>
                        <span>{ticket.createdByUsername}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className={styles.metaKey}>Created:</span>
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className={styles.metaKey}>Assigned:</span>
                        <span>{ticket.assignedToUsername || 'Unassigned'}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className={styles.metaKey}>Urgent:</span>
                        <span>{ticket.priority === TicketPriority.URGENT ? 'Yes' : 'No'}</span>
                      </div>
                    </div>

                    <div className={styles.controlsGrid}>
                      <div className={styles.control}>
                        <label className={styles.label} htmlFor={`status-${ticket.id}`}>
                          Update status
                        </label>
                        <select
                          id={`status-${ticket.id}`}
                          className={styles.select}
                          value={ticket.status}
                          onChange={(e) =>
                            handleStatusChange(ticket.id, e.target.value as TicketStatus)
                          }
                          disabled={
                            user?.role === 'SUPPORT_AGENT' &&
                            Boolean(ticket.assignedToId) &&
                            ticket.assignedToId !== user?.id
                          }
                        >
                          <option value={TicketStatus.OPEN}>Open</option>
                          <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                          <option value={TicketStatus.RESOLVED}>Resolved</option>
                          <option value={TicketStatus.CLOSED}>Closed</option>
                        </select>
                      </div>

                      {isAdmin() && (
                        <div className={styles.control}>
                          <label className={styles.label} htmlFor={`assign-${ticket.id}`}>
                            Assign to
                          </label>
                          <select
                            id={`assign-${ticket.id}`}
                            className={styles.select}
                            value={ticket.assignedToId || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (!value) return;
                              handleAssign(ticket.id, parseInt(value, 10));
                            }}
                          >
                            <option value="">Unassigned</option>
                            {supportAgents.map((agent) => (
                              <option key={agent.id} value={agent.id}>
                                {agent.username}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <Link className={styles.viewLink} href={`/tickets/${ticket.id}`}>
                        View details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
