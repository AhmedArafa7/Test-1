export type RecurrenceType = 'None' | 'Daily' | 'Weekly';

export interface CreateAvailabilityRuleRequest {
  agentUserId: string;
  propertyId?: string | null;
  recurrenceType: RecurrenceType;
  dayOfWeek?: number;
  specificDate?: string;
  startTime: string;
  endTime: string;
  slotDuration: string;
}

export interface AvailabilityRuleDto {
  id: string;
  propertyId: string | null;
  recurrenceType: RecurrenceType;
  dayOfWeek?: number;
  specificDate?: string;
  startTime: string;
  endTime: string;
  slotDuration: string;
}

export interface TimeSlotDto {
  startTime: string;
  endTime: string;
}
