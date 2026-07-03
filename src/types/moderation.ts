export type ReportStatus = "Pending" | "Reviewed" | "Resolved" | "Dismissed";
export type ReportType = "Review" | "MarketplaceListing" | "Verification" | "User";

export interface Report {
  id: string;
  reporterId: string;
  reportedEntityId: string; // The ID of the review, listing, or user
  type: ReportType;
  reason: string;
  details?: string;
  status: ReportStatus;
  moderationNotes?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface MarketplaceReport extends Report {
  type: "MarketplaceListing";
  listingId: string;
}
