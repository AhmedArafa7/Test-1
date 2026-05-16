// ─── Admin: User Summary ───
export interface UserSummary {
  userId: string;
  email: string;
  roles: string[];
  isActive: boolean;
  emailConfirmed: boolean;
  /* [BACKEND_SYNC_PENDING]: Not in current UserSummaryResponse */
  // displayName?: string;
  // createdOnUtc: string;
}

// ─── Admin: Agent ───
export interface AdminAgent {
  userId: string;
  email?: string;
  displayName?: string;
  agencyName?: string;
  licenseNumber?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  commissionRate: number;
}

// ─── Admin: Audit Log ───
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entityName: string;
  entityId: string;
  oldValues?: string;
  newValues?: string;
  ipAddress?: string;
  occurredOnUtc: string;
}

// ─── Admin: Domain Event Log ───
export interface DomainEventLog {
  id: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  occurredOnUtc: string;
  isPublished: boolean;
  publishedOnUtc?: string;
}

// ─── Admin: Payment ───
export interface PaymentAdmin {
  id: string;
  propertyId: string;
  propertyTitle: string;
  payerId: string;
  payeeId: string;
  amount: number;
  commission: number;
  netAmount: number;
  currency: string;
  purpose: string;
  status: string;
  latestGatewayReference?: string;
  latestTransactionStatus?: string;
  createdOnUtc: string;
}

// ─── Admin: Refund Request ───
export interface RefundRequestAdmin {
  id: string;
  paymentId: string;
  requestedBy: string;
  reason: string;
  amount: number;
  status: string;
  reviewedBy?: string;
  createdOnUtc: string;
  reviewedOnUtc?: string;
}

// ─── Admin: AI Search Request ───
export interface SearchRequestAdmin {
  id: string;
  userId: string;
  inputType: string;
  searchEngine: string;
  status: string;
  resultCount: number;
  correlationId?: string;
  createdAt: string;
  resolvedAt?: string;
  outboxEventCount: number;
}

// ─── Admin: Recommendation Request ───
export interface RecommendationRequestAdmin {
  id: string;
  requestedByUserId: string;
  sourceEntityType: string;
  sourceEntityId?: string;
  topN: number;
  status: string;
  correlationId?: string;
  requestedAt: string;
  resolvedAt?: string;
  outboxEventCount: number;
}

// ─── Admin Requests ───
export interface ToggleUserStatusRequest { isActive: boolean; }
export interface AssignRoleRequest { role: string; }
export interface ReviewRefundRequest { approve: boolean; }
