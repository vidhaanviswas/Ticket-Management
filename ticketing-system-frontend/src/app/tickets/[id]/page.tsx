'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ticketAPI, commentAPI } from '@/lib/api';
import { notifyError, notifyTicketStatusChanged } from '@/lib/notifications';
import { Ticket, TicketStatus, TicketPriority, Comment, Attachment, TicketRating, Role } from '@/types';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import styles from './page.module.css';

export default function TicketDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const ticketId = parseInt(params.id as string);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingComment, setAddingComment] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [rating, setRating] = useState<TicketRating | null>(null);
  const [ratingStars, setRatingStars] = useState<number>(0);
  const [ratingFeedback, setRatingFeedback] = useState<string>('');
  const [savingRating, setSavingRating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && ticketId) {
      loadTicket();
      loadComments();
      loadAttachments();
      loadRating();
    }
  }, [user, ticketId]);

  const loadTicket = async () => {
    try {
      const data = await ticketAPI.getById(ticketId);
      setTicket(data);
    } catch (error) {
      console.error('Failed to load ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await commentAPI.getByTicket(ticketId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const loadAttachments = async () => {
    try {
      const data = await ticketAPI.getAttachments(ticketId);
      setAttachments(data);
    } catch (error) {
      console.error('Failed to load attachments:', error);
    }
  };

  const loadRating = async () => {
    try {
      const data = await ticketAPI.getRating(ticketId);
      setRating(data);
      setRatingStars(data?.stars ?? 0);
      setRatingFeedback(data?.feedback ?? '');
    } catch (error: any) {
      // rating not required to exist
      if (error?.response?.status === 404) {
        setRating(null);
        setRatingStars(0);
        setRatingFeedback('');
        return;
      }
      console.error('Failed to load rating:', error);
    }
  };

  const handleSaveRating = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingRating(true);
      const saved = await ticketAPI.upsertRating(ticketId, {
        stars: ratingStars,
        feedback: ratingFeedback.trim() ? ratingFeedback : undefined,
      });
      setRating(saved);
    } catch (error: any) {
      console.error('Failed to save rating:', error);
      const message =
        error?.response?.data?.message || error?.response?.data?.error || 'Failed to save rating';
      alert(message);
    } finally {
      setSavingRating(false);
    }
  };

  const handleUploadAttachments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newFiles.length === 0) return;
    try {
      setUploadingFiles(true);
      await ticketAPI.uploadAttachments(ticketId, newFiles);
      setNewFiles([]);
      await loadAttachments();
    } catch (error) {
      console.error('Failed to upload attachments:', error);
      let message = 'Failed to upload attachments';
      try {
        // When using fetch-based API, errors may be JSON string bodies.
        const raw = (error as any)?.message as string | undefined;
        if (raw) {
          const parsed = JSON.parse(raw);
          message = parsed?.message || parsed?.error || raw;
        }
      } catch {
        message = (error as any)?.message || message;
      }
      alert(message);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleDownloadAttachment = async (a: Attachment) => {
    try {
      const blob = await ticketAPI.downloadAttachment(ticketId, a.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = a.originalFilename || 'attachment';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download attachment:', error);
      let message = 'Failed to download attachment';
      try {
        const raw = (error as any)?.message as string | undefined;
        if (raw) {
          const parsed = JSON.parse(raw);
          message = parsed?.message || parsed?.error || raw;
        }
      } catch {
        message = (error as any)?.message || message;
      }
      alert(message);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setAddingComment(true);
      await commentAPI.create(ticketId, newComment);
      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
      const message =
        (error as any)?.response?.data?.message ||
        (error as any)?.response?.data?.error ||
        'Failed to add comment';
      alert(message);
    } finally {
      setAddingComment(false);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    try {
      await ticketAPI.updateStatus(ticketId, status);
      await loadTicket();
      notifyTicketStatusChanged(ticketId, status);
    } catch (error) {
      console.error('Failed to update status:', error);
      notifyError(error, 'Failed to update status');
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

  if (authLoading || loading || !ticket) {
    return (
      <div className={styles.shell}>
        <Navbar />
        <main className={styles.page}>
          <div className={styles.container}>
            <div className={styles.topRow}>
              <div className={[styles.skeleton, styles.skelBack].join(' ')} />
            </div>

            <div className={styles.card}>
              <div className={styles.hero}>
                <div className={styles.heroTop}>
                  <div className={styles.titleBlock}>
                    <div className={[styles.skeleton, styles.skelTitle].join(' ')} />
                    <div className={[styles.skeleton, styles.skelSubtitle].join(' ')} />
                  </div>

                  <div className={styles.pills} aria-label="Ticket metadata">
                    <span className={[styles.skeleton, styles.skelPill].join(' ')} />
                    <span className={[styles.skeleton, styles.skelPill].join(' ')} />
                  </div>

                  <div className={styles.statusControl}>
                    <div className={[styles.skeleton, styles.skelLabel].join(' ')} />
                    <div className={[styles.skeleton, styles.skelSelect].join(' ')} />
                  </div>
                </div>

                <div className={styles.split}>
                  <div>
                    <div className={[styles.skeleton, styles.skelSectionTitle].join(' ')} />
                    <div className={styles.skelLines}>
                      <div className={[styles.skeleton, styles.skelLine].join(' ')} />
                      <div className={[styles.skeleton, styles.skelLine].join(' ')} />
                      <div className={[styles.skeleton, styles.skelLineShort].join(' ')} />
                    </div>
                  </div>

                  <div>
                    <div className={[styles.skeleton, styles.skelSectionTitle].join(' ')} />
                    <div className={styles.detailsGrid}>
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} className={styles.detailItem}>
                          <div className={[styles.skeleton, styles.skelKey].join(' ')} />
                          <div className={[styles.skeleton, styles.skelVal].join(' ')} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.attachmentsWrap}>
              <div className={styles.card}>
                <div className={styles.attachmentsHeader}>
                  <div className={[styles.skeleton, styles.skelSectionTitle].join(' ')} />
                  <div className={[styles.skeleton, styles.skelHint].join(' ')} />
                </div>
                <div className={styles.attachmentsList}>
                  {[1, 2].map((n) => (
                    <div key={n} className={styles.attachmentRow}>
                      <div className={styles.attachmentInfo}>
                        <div className={[styles.skeleton, styles.skelAttachmentName].join(' ')} />
                        <div className={[styles.skeleton, styles.skelAttachmentMeta].join(' ')} />
                      </div>
                      <div className={[styles.skeleton, styles.skelButton].join(' ')} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.ratingWrap}>
              <div className={styles.card}>
                <div className={[styles.skeleton, styles.skelSectionTitle].join(' ')} />
                <div className={styles.skelLines} style={{ marginTop: 10 }}>
                  <div className={[styles.skeleton, styles.skelLine].join(' ')} />
                  <div className={[styles.skeleton, styles.skelLineShort].join(' ')} />
                </div>
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
          <div className={styles.topRow}>
            <Link className={styles.backLink} href="/tickets">
              ← Back to tickets
            </Link>
          </div>

          <div className={styles.card}>
            <div className={styles.hero}>
              <div className={styles.heroTop}>
                <div className={styles.titleBlock}>
                  <div className={styles.title}>{ticket.subject}</div>
                  <div className={styles.subtitle}>Ticket #{ticket.id}</div>
                </div>

                <div className={styles.pills} aria-label="Ticket metadata">
                  <span
                    className={[styles.pill, priorityPillClass(ticket.priority)].filter(Boolean).join(' ')}
                    title="Priority"
                  >
                    {formatEnumLabel(ticket.priority)}
                  </span>
                  <span
                    className={[styles.pill, statusPillClass(ticket.status)].filter(Boolean).join(' ')}
                    title="Status"
                  >
                    {formatEnumLabel(ticket.status)}
                  </span>
                </div>

                {(user?.role === 'ADMIN' ||
                  (user?.role === 'SUPPORT_AGENT' && ticket.assignedToId === user?.id)) && (
                  <div className={styles.statusControl}>
                    <label className={styles.label} htmlFor="status">
                      Update status
                    </label>
                    <select
                      id="status"
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                      className={styles.select}
                    >
                      <option value={TicketStatus.OPEN}>Open</option>
                      <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                      <option value={TicketStatus.RESOLVED}>Resolved</option>
                      <option value={TicketStatus.CLOSED}>Closed</option>
                    </select>
                  </div>
                )}
              </div>

              <div className={styles.split}>
                <div>
                  <div className={styles.sectionTitle}>Description</div>
                  <div className={styles.description}>{ticket.description}</div>
                </div>

                <div>
                  <div className={styles.sectionTitle}>Details</div>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <div className={styles.detailKey}>Created by</div>
                      <div className={styles.detailVal}>{ticket.createdByUsername}</div>
                    </div>
                    <div className={styles.detailItem}>
                      <div className={styles.detailKey}>Assigned to</div>
                      <div className={styles.detailVal}>
                        {ticket.assignedToUsername || 'Unassigned'}
                      </div>
                    </div>
                    <div className={styles.detailItem}>
                      <div className={styles.detailKey}>Created</div>
                      <div className={styles.detailVal}>
                        {new Date(ticket.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className={styles.detailItem}>
                      <div className={styles.detailKey}>Last updated</div>
                      <div className={styles.detailVal}>
                        {new Date(ticket.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.attachmentsWrap}>
            <div className={styles.card}>
              <div className={styles.attachmentsHeader}>
                <div className={styles.sectionTitle}>Attachments</div>
                <div className={styles.hintText}>
                  Allowed: PNG/JPEG/WEBP/PDF • Max 10MB per file
                </div>
              </div>

              {ticket.status === TicketStatus.CLOSED && user?.role !== Role.ADMIN ? (
                <div className={styles.noteText}>
                  This ticket is closed. Uploading attachments is disabled.
                </div>
              ) : (
                <form className={styles.commentForm} onSubmit={handleUploadAttachments}>
                  <label className={styles.label} htmlFor="attachments">
                    Upload files
                  </label>
                  <input
                    id="attachments"
                    className={styles.fileInput}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    disabled={uploadingFiles}
                    onChange={(e) => setNewFiles(Array.from(e.target.files ?? []))}
                  />
                  <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={uploadingFiles || newFiles.length === 0}
                  >
                    {uploadingFiles ? 'Uploading…' : 'Upload'}
                  </button>
                </form>
              )}

              {attachments.length === 0 ? (
                <div className={styles.emptyState}>No attachments yet.</div>
              ) : (
                <div className={styles.attachmentsList}>
                  {attachments.map((a) => (
                    <div key={a.id} className={styles.attachmentRow}>
                      <div className={styles.attachmentInfo}>
                        <div className={styles.attachmentName} title={a.originalFilename}>
                          {a.originalFilename}
                        </div>
                        <div className={styles.attachmentMeta}>
                          {formatBytes(a.sizeBytes)} • {a.contentType}
                          {a.uploadedByUsername ? ` • by ${a.uploadedByUsername}` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.downloadButton}
                        onClick={() => handleDownloadAttachment(a)}
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.ratingWrap}>
            <div className={styles.card}>
              <div className={styles.sectionTitle}>Resolution rating</div>

              {ticket.status !== TicketStatus.CLOSED ? (
                <div className={styles.noteText}>Ratings are available once the ticket is closed.</div>
              ) : user?.role === Role.USER ? (
                rating ? (
                  <>
                    <div className={styles.starsRow} aria-label="Your rating">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={[styles.starButton, n <= rating.stars ? styles.starActive : ''].join(' ')}
                          disabled
                          aria-label={`${n} star${n === 1 ? '' : 's'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <div className={styles.hintText}>Submitted: {rating.stars}/5</div>
                    {rating.feedback ? (
                      <div className={styles.noteText} style={{ whiteSpace: 'pre-wrap' }}>
                        {rating.feedback}
                      </div>
                    ) : (
                      <div className={styles.noteText}>No feedback provided.</div>
                    )}
                    <div className={styles.noteText}>Thanks for providing your valuable feedback.</div>
                  </>
                ) : (
                  <form className={styles.commentForm} onSubmit={handleSaveRating}>
                    <label className={styles.label}>Stars (1–5)</label>
                    <div className={styles.starsRow} aria-label="Star rating">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={[styles.starButton, n <= ratingStars ? styles.starActive : ''].join(' ')}
                          onClick={() => setRatingStars(n)}
                          aria-label={`${n} star${n === 1 ? '' : 's'}`}
                          disabled={savingRating}
                        >
                          ★
                        </button>
                      ))}
                    </div>

                    <label className={styles.label} htmlFor="rating-feedback">
                      Feedback (optional)
                    </label>
                    <textarea
                      id="rating-feedback"
                      className={styles.textarea}
                      value={ratingFeedback}
                      onChange={(e) => setRatingFeedback(e.target.value)}
                      placeholder="What went well? What could be improved?"
                      disabled={savingRating}
                    />

                    <button
                      type="submit"
                      className={styles.primaryButton}
                      disabled={savingRating || ratingStars < 1}
                    >
                      {savingRating ? 'Saving…' : 'Submit rating'}
                    </button>
                  </form>
                )
              ) : user?.role === Role.SUPPORT_AGENT && ticket.assignedToId === user?.id ? (
                rating ? (
                  <>
                    <div className={styles.starsRow} aria-label="User rating">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={[styles.starButton, n <= rating.stars ? styles.starActive : ''].join(' ')}
                          disabled
                          aria-label={`${n} star${n === 1 ? '' : 's'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <div className={styles.hintText}>
                      Rated {rating.stars}/5{rating.ratedByUsername ? ` • by ${rating.ratedByUsername}` : ''}
                    </div>
                    <div className={styles.noteText}>
                      Feedback is visible to admins.
                    </div>
                  </>
                ) : (
                  <div className={styles.noteText}>No rating submitted yet.</div>
                )
              ) : user?.role === Role.ADMIN ? (
                rating ? (
                  <>
                    <div className={styles.starsRow} aria-label="User rating">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={[styles.starButton, n <= rating.stars ? styles.starActive : ''].join(' ')}
                          disabled
                          aria-label={`${n} star${n === 1 ? '' : 's'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <div className={styles.hintText}>
                      Rated {rating.stars}/5
                      {rating.ratedByUsername ? ` • by ${rating.ratedByUsername}` : ''}
                      {rating.updatedAt ? ` • updated ${new Date(rating.updatedAt).toLocaleString()}` : ''}
                    </div>

                    {rating.feedback ? (
                      <div className={styles.noteText} style={{ whiteSpace: 'pre-wrap' }}>
                        {rating.feedback}
                      </div>
                    ) : (
                      <div className={styles.noteText}>No feedback provided.</div>
                    )}
                  </>
                ) : (
                  <div className={styles.noteText}>No rating submitted yet.</div>
                )
              ) : (
                <div className={styles.noteText}>
                  Ratings can be submitted by the ticket creator once the ticket is closed.
                </div>
              )}
            </div>
          </div>

          {(() => {
            const isClosed = ticket.status === TicketStatus.CLOSED;
            const canAddComment = !isClosed || user?.role === Role.ADMIN;
            const shouldShowCommentsSection = canAddComment || comments.length > 0;

            if (!shouldShowCommentsSection) return null;

            return (
              <div className={styles.commentsWrap}>
                <div className={styles.card}>
                  <div className={styles.sectionTitle}>Comments</div>

                  {canAddComment && (
                    <form className={styles.commentForm} onSubmit={handleAddComment}>
                      <label className={styles.label} htmlFor="comment">
                        Add a comment
                      </label>
                      <textarea
                        id="comment"
                        className={styles.textarea}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share an update, ask a question, or add more details…"
                        required
                        disabled={addingComment}
                      />
                      <button type="submit" className={styles.primaryButton} disabled={addingComment}>
                        {addingComment ? 'Adding…' : 'Add comment'}
                      </button>
                    </form>
                  )}

                  {comments.length === 0 ? (
                    canAddComment ? <div className={styles.emptyState}>No comments yet.</div> : null
                  ) : (
                    <div className={styles.commentList}>
                      {comments.map((comment) => (
                        <div key={comment.id} className={styles.commentCard}>
                          <div className={styles.commentHeader}>
                            <div className={styles.commentAuthor}>{comment.username}</div>
                            <div className={styles.commentDate}>
                              {new Date(comment.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className={styles.commentBody}>{comment.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
}
