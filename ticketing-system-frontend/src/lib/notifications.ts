'use client';

import toast from 'react-hot-toast';
import { TicketStatus } from '@/types';

export function extractErrorMessage(error: any, fallback: string) {
  // Axios errors: error.response.data.{message,error}
  const axiosMsg = error?.response?.data?.message || error?.response?.data?.error;
  if (typeof axiosMsg === 'string' && axiosMsg.trim()) return axiosMsg;

  // Fetch wrapper errors: sometimes thrown as Error(JSON-string-body)
  const rawMsg = error?.message;
  if (typeof rawMsg === 'string' && rawMsg.trim()) {
    try {
      const parsed = JSON.parse(rawMsg);
      const parsedMsg = parsed?.message || parsed?.error;
      if (typeof parsedMsg === 'string' && parsedMsg.trim()) return parsedMsg;
    } catch {
      // ignore JSON parse failures
    }
    return rawMsg;
  }

  return fallback;
}

export function notifyError(error: any, fallback: string) {
  toast.error(extractErrorMessage(error, fallback));
}

export function notifyTicketCreated(ticketId: number) {
  toast.success(`Ticket #${ticketId} created`);
}

export function notifyTicketAssigned(ticketId: number, assignee?: string) {
  if (assignee) {
    toast.success(`Ticket #${ticketId} assigned to ${assignee}`);
    return;
  }
  toast.success(`Ticket #${ticketId} assigned`);
}

export function notifyTicketStatusChanged(ticketId: number, status: TicketStatus) {
  if (status === TicketStatus.RESOLVED) {
    toast.success(`Ticket #${ticketId} resolved`);
    return;
  }
  if (status === TicketStatus.CLOSED) {
    toast.success(`Ticket #${ticketId} closed`);
    return;
  }
  const label = status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  toast.success(`Ticket #${ticketId} updated: ${label}`);
}

