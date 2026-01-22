export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface Ticket {
  id: number;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdById: number;
  createdByUsername: string;
  assignedToId?: number;
  assignedToUsername?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  content: string;
  ticketId: number;
  userId: number;
  username: string;
  createdAt: string;
}

export interface Attachment {
  id: number;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedByUsername?: string;
}

export interface TicketRating {
  id: number;
  stars: number;
  feedback?: string;
  ratedByUsername?: string;
  createdAt: string;
  updatedAt: string;
}
