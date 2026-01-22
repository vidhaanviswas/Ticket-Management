'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ticketAPI } from '@/lib/api';
import { notifyError, notifyTicketCreated } from '@/lib/notifications';
import { Ticket, TicketStatus, TicketPriority, Role } from '@/types';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import styles from './page.module.css';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTicketFiles, setNewTicketFiles] = useState<File[]>([]);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: TicketPriority.MEDIUM,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  useEffect(() => {
    if (!showCreateModal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [showCreateModal]);

  const loadTickets = async () => {
    try {
      const isStaff = user?.role === Role.SUPPORT_AGENT || user?.role === Role.ADMIN;
      const data = isStaff ? await ticketAPI.getAll() : await ticketAPI.getMyTickets();
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const created = await ticketAPI.create(newTicket);

      let attachmentError: any = null;
      if (newTicketFiles.length > 0) {
        try {
          await ticketAPI.uploadAttachments(created.id, newTicketFiles);
        } catch (err) {
          attachmentError = err;
        }
      }

      setShowCreateModal(false);
      setNewTicket({ subject: '', description: '', priority: TicketPriority.MEDIUM });
      setNewTicketFiles([]);
      loadTickets();

      notifyTicketCreated(created.id);
      if (attachmentError) {
        notifyError(attachmentError, 'Ticket created, but failed to upload attachments');
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      notifyError(error, 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

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

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === TicketStatus.OPEN).length;
    const inProgress = tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS).length;
    const resolved = tickets.filter((t) => t.status === TicketStatus.RESOLVED).length;
    const closed = tickets.filter((t) => t.status === TicketStatus.CLOSED).length;
    const urgent = tickets.filter((t) => t.priority === TicketPriority.URGENT).length;
    return { total, open, inProgress, resolved, closed, urgent };
  }, [tickets]);

  const userHasActiveTicket = useMemo(() => {
    if (user?.role !== Role.USER) return false;
    return tickets.some((t) => t.status !== TicketStatus.CLOSED);
  }, [tickets, user?.role]);

  const sortedTickets = useMemo(() => {
    return [...tickets].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [tickets]);

  if (authLoading || loading) {
    return (
      <div className={styles.shell}>
        <Navbar />
        <main className={styles.page}>
          <div className={styles.container}>
            <div className={styles.header}>
              <div className={styles.heading}>
                <h1 className={styles.title}>Dashboard</h1>
                <p className={styles.subtitle}>Loading your tickets…</p>
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.emptyState}>
                <div className={styles.emptyTitle}>Just a moment</div>
                <div className={styles.emptyText}>We&apos;re fetching your latest tickets.</div>
              </div>
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
              <h1 className={styles.title}>
                {user?.role === Role.ADMIN
                  ? 'All Tickets'
                  : user?.role === Role.SUPPORT_AGENT
                    ? 'Assigned Tickets'
                    : 'My Tickets'}
              </h1>
              <p className={styles.subtitle}>
                {user?.role === Role.ADMIN
                  ? 'System-wide overview of tickets.'
                  : user?.role === Role.SUPPORT_AGENT
                    ? 'Tickets assigned to you (and tickets you created).'
                    : 'Create, track, and manage your support requests.'}
              </p>
            </div>
            {user?.role !== Role.ADMIN && (
              <div className={styles.headerActions}>
                <button
                  className={styles.primaryButton}
                  onClick={() => setShowCreateModal(true)}
                  disabled={creating || userHasActiveTicket}
                  title={
                    userHasActiveTicket
                      ? 'You already have an active ticket. Close it before creating a new one.'
                      : undefined
                  }
                >
                  Create Ticket
                </button>
                {userHasActiveTicket && (
                  <div className={styles.hintText}>
                    You already have an active ticket. Close it to create a new one.
                  </div>
                )}
              </div>
            )}
          </div>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>Overview</div>
              <div className={styles.sectionMeta}>
                {stats.total} ticket{stats.total === 1 ? '' : 's'} total
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total</div>
                <div className={styles.statValue}>{stats.total}</div>
                <div className={styles.statHint}>All tickets you&apos;ve created</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Open</div>
                <div className={styles.statValue}>{stats.open}</div>
                <div className={styles.statHint}>Waiting to be picked up</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>In Progress</div>
                <div className={styles.statValue}>{stats.inProgress}</div>
                <div className={styles.statHint}>Currently being worked on</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Resolved</div>
                <div className={styles.statValue}>{stats.resolved}</div>
                <div className={styles.statHint}>
                  {stats.urgent > 0 ? `${stats.urgent} urgent ticket(s)` : 'No urgent tickets'}
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Closed</div>
                <div className={styles.statValue}>{stats.closed}</div>
                <div className={styles.statHint}>Finalized tickets</div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitle}>Recent tickets</div>
              <div className={styles.sectionMeta}>
                Sorted by newest first
              </div>
            </div>

            {sortedTickets.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyTitle}>No tickets yet</div>
                <div className={styles.emptyText}>
                  {user?.role === Role.ADMIN
                    ? 'No tickets found yet.'
                    : 'Create your first ticket to get help from the support team.'}
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

                    <div className={styles.ticketFooter}>
                      <div className={styles.metaRow}>
                        <span className={styles.metaItem}>
                          <span className={styles.metaKey}>Assigned:</span>
                          <span>{ticket.assignedToUsername || 'Unassigned'}</span>
                        </span>
                        <span className={styles.metaItem}>
                          <span className={styles.metaKey}>Created:</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                      <Link className={styles.viewLink} href={`/tickets/${ticket.id}`}>
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {user?.role !== Role.ADMIN && !userHasActiveTicket && showCreateModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowCreateModal(false)}
            role="presentation"
          >
            <div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-ticket-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div>
                  <div id="create-ticket-title" className={styles.modalTitle}>
                    Create new ticket
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => setShowCreateModal(false)}
                  aria-label="Close"
                  disabled={creating}
                >
                  ×
                </button>
              </div>

              <form className={styles.form} onSubmit={handleCreateTicket}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="subject">
                    Subject
                  </label>
                  <input
                    id="subject"
                    className={styles.input}
                    type="text"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    required
                    disabled={creating}
                    placeholder="Short summary of the issue"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    className={styles.textarea}
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    required
                    disabled={creating}
                    placeholder="Add details that can help resolve the issue faster"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="priority">
                    Priority
                  </label>
                  <select
                    id="priority"
                    className={styles.select}
                    value={newTicket.priority}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, priority: e.target.value as TicketPriority })
                    }
                    disabled={creating}
                  >
                    <option value={TicketPriority.LOW}>Low</option>
                    <option value={TicketPriority.MEDIUM}>Medium</option>
                    <option value={TicketPriority.HIGH}>High</option>
                    <option value={TicketPriority.URGENT}>Urgent</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="attachments">
                    Attachments (optional)
                  </label>
                  <input
                    id="attachments"
                    className={styles.fileInput}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    disabled={creating}
                    onChange={(e) => setNewTicketFiles(Array.from(e.target.files ?? []))}
                  />
                  <div className={styles.hintText}>
                    Allowed: PNG/JPEG/WEBP/PDF. Max 10MB per file.
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setShowCreateModal(false)}
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.primaryButton} disabled={creating}>
                    {creating ? 'Creating…' : 'Create ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
