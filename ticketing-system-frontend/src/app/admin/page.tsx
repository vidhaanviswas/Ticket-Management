'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminAPI, userAPI } from '@/lib/api';
import { User, Role, Ticket, TicketStatus } from '@/types';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import styles from './page.module.css';

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'tickets'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [savingUser, setSavingUser] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: Role.USER,
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin())) {
      router.push('/dashboard');
    }
  }, [user, authLoading, isAdmin, router]);

  useEffect(() => {
    if (user && isAdmin()) {
      if (activeTab === 'users') {
        loadUsers();
      } else {
        loadTickets();
      }
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (!showUserModal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [showUserModal]);

  const loadUsers = async () => {
    try {
      const data = await adminAPI.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      const data = await adminAPI.getAllTickets();
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingUser(true);
      await adminAPI.createUser(userForm);
      setShowUserModal(false);
      setUserForm({ username: '', email: '', password: '', role: Role.USER });
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create user');
    } finally {
      setSavingUser(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setSavingUser(true);
      await adminAPI.updateUser(editingUser.id, userForm);
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ username: '', email: '', password: '', role: Role.USER });
      loadUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update user');
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      loadUsers();
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowUserModal(true);
  };

  const handleStatusChange = async (ticketId: number, status: TicketStatus) => {
    try {
      await adminAPI.forceUpdateStatus(ticketId, status);
      loadTickets();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const admins = users.filter((u) => u.role === Role.ADMIN).length;
    const agents = users.filter((u) => u.role === Role.SUPPORT_AGENT).length;
    const totalTickets = tickets.length;
    const openTickets = tickets.filter((t) => t.status === TicketStatus.OPEN).length;
    return { totalUsers, admins, agents, totalTickets, openTickets };
  }, [users, tickets]);

  if (authLoading || loading) {
    return (
      <div className={styles.shell}>
        <Navbar />
        <main className={styles.page}>
          <div className={styles.container}>
            <div className={styles.header}>
              <div className={styles.heading}>
                <h1 className={styles.title}>Admin Panel</h1>
                <p className={styles.subtitle}>Loading admin data…</p>
              </div>
            </div>
            <div className={styles.emptyState}>Just a moment…</div>
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
              <h1 className={styles.title}>Admin Panel</h1>
              <p className={styles.subtitle}>
                Manage users and oversee tickets across the system.
              </p>
            </div>
            <div className={styles.tabs} role="tablist" aria-label="Admin sections">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'users'}
                className={[styles.tab, activeTab === 'users' ? styles.tabActive : ''].join(' ')}
                onClick={() => setActiveTab('users')}
              >
                Users
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'tickets'}
                className={[styles.tab, activeTab === 'tickets' ? styles.tabActive : ''].join(' ')}
                onClick={() => setActiveTab('tickets')}
              >
                Tickets
              </button>
            </div>
          </div>

          {activeTab === 'users' && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Users</div>
                <div className={styles.sectionMeta}>
                  {stats.totalUsers} total • {stats.admins} admin • {stats.agents} agents
                </div>
                <button
                  className={styles.primaryButton}
                  onClick={() => {
                    setEditingUser(null);
                    setUserForm({ username: '', email: '', password: '', role: Role.USER });
                    setShowUserModal(true);
                  }}
                >
                  Add user
                </button>
              </div>

              <div className={styles.card}>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5}>
                            <div className={styles.emptyState}>No users found.</div>
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.username}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>
                              <div className={styles.rowActions}>
                                <button
                                  type="button"
                                  className={[styles.secondaryButton, styles.tinyButton].join(' ')}
                                  onClick={() => handleEditUser(u)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className={[styles.dangerButton, styles.tinyButton].join(' ')}
                                  onClick={() => handleDeleteUser(u.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'tickets' && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Tickets</div>
                <div className={styles.sectionMeta}>
                  {stats.totalTickets} total • {stats.openTickets} open
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Created By</th>
                        <th>Assigned To</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.length === 0 ? (
                        <tr>
                          <td colSpan={8}>
                            <div className={styles.emptyState}>No tickets found.</div>
                          </td>
                        </tr>
                      ) : (
                        tickets.map((ticket) => (
                          <tr key={ticket.id}>
                            <td>{ticket.id}</td>
                            <td>{ticket.subject}</td>
                            <td>{ticket.priority}</td>
                            <td>
                              <select
                                className={styles.select}
                                value={ticket.status}
                                onChange={(e) =>
                                  handleStatusChange(ticket.id, e.target.value as TicketStatus)
                                }
                              >
                                <option value={TicketStatus.OPEN}>Open</option>
                                <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                                <option value={TicketStatus.RESOLVED}>Resolved</option>
                                <option value={TicketStatus.CLOSED}>Closed</option>
                              </select>
                            </td>
                            <td>{ticket.createdByUsername}</td>
                            <td>{ticket.assignedToUsername || 'Unassigned'}</td>
                            <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                            <td>
                              <Link
                                href={`/tickets/${ticket.id}`}
                                className={[
                                  styles.secondaryButton,
                                  styles.tinyButton,
                                  styles.linkButton,
                                ].join(' ')}
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </div>

        {showUserModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => {
              if (savingUser) return;
              setShowUserModal(false);
              setEditingUser(null);
            }}
            role="presentation"
          >
            <div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="user-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div id="user-modal-title" className={styles.modalTitle}>
                  {editingUser ? 'Edit user' : 'Create user'}
                </div>
                <button
                  type="button"
                  className={styles.modalClose}
                  aria-label="Close"
                  onClick={() => {
                    if (savingUser) return;
                    setShowUserModal(false);
                    setEditingUser(null);
                  }}
                >
                  ×
                </button>
              </div>

              <form
                className={styles.form}
                onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
              >
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="username">
                    Username
                  </label>
                  <input
                    id="username"
                    className={styles.input}
                    type="text"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    required
                    disabled={savingUser}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    className={styles.input}
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                    disabled={savingUser}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="password">
                    Password {editingUser && '(leave empty to keep current)'}
                  </label>
                  <input
                    id="password"
                    className={styles.input}
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required={!editingUser}
                    disabled={savingUser}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="role">
                    Role
                  </label>
                  <select
                    id="role"
                    className={styles.selectBig}
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as Role })}
                    disabled={savingUser}
                  >
                    <option value={Role.USER}>User</option>
                    <option value={Role.SUPPORT_AGENT}>Support Agent</option>
                    <option value={Role.ADMIN}>Admin</option>
                  </select>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      if (savingUser) return;
                      setShowUserModal(false);
                      setEditingUser(null);
                    }}
                    disabled={savingUser}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.primaryButton} disabled={savingUser}>
                    {savingUser ? 'Saving…' : editingUser ? 'Update' : 'Create'}
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
