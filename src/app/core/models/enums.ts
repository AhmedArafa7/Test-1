// ─── Property Enums ───
export enum PropertyType { Apartment = 'Apartment', Villa = 'Villa', Office = 'Office', Land = 'Land' }
export enum ListingType { Sale = 'Sale', Rent = 'Rent' }
export enum PropertyStatus { Available = 'Available', Reserved = 'Reserved', Sold = 'Sold', Rented = 'Rented' }
export enum FurnishingStatus { Unfurnished = 'Unfurnished', SemiFurnished = 'SemiFurnished', FullyFurnished = 'FullyFurnished' }
export enum ViewType { Sea = 'Sea', Garden = 'Garden', Street = 'Street', City = 'City' }

// ─── Booking Enums ───
export enum BookingStatus { Pending = 'Pending', Confirmed = 'Confirmed', Cancelled = 'Cancelled' }

// ─── Payment Enums ───
export enum PaymentStatus { Pending = 'Pending', Escrow = 'Escrow', Completed = 'Completed', Refunded = 'Refunded', Failed = 'Failed' }
export enum PaymentPurpose { Deposit = 'Deposit', FullPayment = 'FullPayment', Rent = 'Rent', Commission = 'Commission' }
export enum RefundStatus { Pending = 'Pending', Approved = 'Approved', Rejected = 'Rejected', Processed = 'Processed' }

// ─── AI Enums ───
export enum SearchInputType { Text = 'Text', Voice = 'Voice', Image = 'Image' }
export enum SearchEngine { Keyword = 'Keyword', Vector = 'Vector', Hybrid = 'Hybrid' }
export enum RequestStatus { Pending = 'Pending', Completed = 'Completed', Failed = 'Failed' }

// ─── Notification Enums ───
export enum NotificationType { NewMessage = 'NewMessage', PaymentUpdate = 'PaymentUpdate', PropertyMatch = 'PropertyMatch', BookingUpdate = 'BookingUpdate' }

// ─── User Enums ───
export enum ContactMethod { Email = 'Email', Phone = 'Phone', WhatsApp = 'WhatsApp' }
export enum UserRole { Buyer = 'Buyer', Agent = 'Agent', Admin = 'Admin' }
