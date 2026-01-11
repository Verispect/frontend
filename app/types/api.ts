export type UUID = string; // UUIDs are strings in JSON
export type ISODateString = string; // Go time.Time serializes to ISO string

export interface Organization {
    id: UUID;
    name: string;
    settings: any; // json.RawMessage
    created_at: ISODateString;
    updated_at: ISODateString;
}

export type UserRole = "manager" | "inspector" | "cleaner" | "admin";

export interface User {
    id: UUID;
    org_id: UUID;
    email: string;
    role: UserRole;
    created_at: ISODateString;
    updated_at: ISODateString;
}

export type InspectionStatus = "IN_PROGRESS" | "PENDING_APPROVAL" | "VERIFIED";

export interface Inspection {
    id: UUID;
    org_id: UUID;
    inspector_id?: UUID; // pointer in Go -> optional/undefined in TS (or null)
    status: InspectionStatus;
    type: string;
    unit_metadata: any; // json.RawMessage
    created_at: ISODateString;
    updated_at: ISODateString;
}

export interface EvidenceItem {
    id: UUID;
    inspection_id: UUID;
    room?: string;
    description?: string;
    s3_key?: string;
    ai_metadata: any; // json.RawMessage
    created_at: ISODateString;
}

export type ReportStatus = "DRAFT" | "FINAL";

export interface Report {
    id: UUID;
    inspection_id: UUID;
    status: ReportStatus;
    s3_key?: string;
    content: any; // json.RawMessage
    created_at: ISODateString;
}

export type TaskStatus = "DRAFT" | "PENDING_PROOF" | "SUBMITTED" | "VERIFIED";
export type TaskTypeEnum = "CLEANING" | "MAINTENANCE";

export interface Task {
    id: UUID;
    org_id: UUID;
    inspection_id?: UUID;
    assigned_to?: UUID;
    status: TaskStatus;
    type: TaskTypeEnum;
    details: any; // json.RawMessage
    created_at: ISODateString;
    updated_at: ISODateString;
}

export type TaskEvidenceType = "BEFORE" | "AFTER";

export interface TaskEvidence {
    id: UUID;
    task_id: UUID;
    type: TaskEvidenceType;
    s3_key?: string;
    created_at: ISODateString;
}
