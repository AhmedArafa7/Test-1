export type RecurrenceType = 'None' | 'Daily' | 'Weekly';

export interface CreateAvailabilityRuleRequest {
  agentUserId: string;
  propertyId?: string;
  recurrenceType: RecurrenceType;
  dayOfWeek?: number;
  specificDate?: string;
  startTime: string;
  endTime: string;
  slotDuration: string;
}

export interface AvailabilityRuleDto {
  id: string;
  propertyId?: string;
  recurrenceType: RecurrenceType;
  dayOfWeek?: number;
  specificDate?: string;
  startTime: string;
  endTime: string;
  slotDuration: string;
}
