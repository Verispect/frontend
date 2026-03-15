import { client, clientWithStatus } from './client';
import type {
    Organization,
    User,
    UserRole,
    Inspection,
    EvidenceItem,
    Report,
    Task,
    TaskEvidence,
    ImageAnalysisResponse,
} from '~/types/api';

// --- Organizations ---

export const getOrganizations = () =>
    client<Organization[]>('/v1/organizations');

export const getOrganization = (id: string) =>
    client<Organization>(`/v1/organizations/${id}`);

export const createOrganization = (data: Omit<Organization, 'id' | 'created_at' | 'updated_at'>) =>
    client<Organization>('/v1/organizations', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const updateOrganization = (id: string, data: Partial<Organization>) =>
    client<Organization>(`/v1/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

export const deleteOrganization = (id: string) =>
    client<void>(`/v1/organizations/${id}`, {
        method: 'DELETE',
    });

// --- Users ---

export const getUsers = (role?: UserRole) =>
    client<User[]>('/v1/users', {
        params: { ...(role && { role }) } as Record<string, string>,
    }).then((users) =>
        role && users
            ? users.filter((u) => u.role === role)
            : users
    );

export const getUser = (id: string) =>
    client<User>(`/v1/users/${id}`);

export const createUser = (data: Omit<User, 'id' | 'created_at' | 'updated_at' | 'org_id'> & { password?: string }) =>
    client<User>('/v1/users', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const updateUser = (id: string, data: Partial<User>) =>
    client<User>(`/v1/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

export type SignUpResult = { user: User; isNewUser: boolean };

export const signUpUser = (body?: { role?: UserRole }) =>
    clientWithStatus<User>(`/v1/users/signup`, {
        method: 'POST',
        ...(body && Object.keys(body).length > 0 ? { body: JSON.stringify(body) } : {}),
    }).then(({ data, status }) => ({ user: data, isNewUser: status === 201 }));

// --- Inspections ---

export const getInspections = () =>
    client<Inspection[]>('/v1/inspections');

export const getInspection = (id: string) =>
    client<Inspection>(`/v1/inspections/${id}`);

export const createInspection = (data: Omit<Inspection, 'id' | 'created_at' | 'updated_at' | 'org_id'>) =>
    client<Inspection>('/v1/inspections', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const updateInspection = (id: string, data: Partial<Inspection>) =>
    client<Inspection>(`/v1/inspections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

export const deleteInspection = (id: string) =>
    client<void>(`/v1/inspections/${id}`, {
        method: 'DELETE',
    });

// --- Evidence Items ---

export const getEvidenceItems = (inspection_id: string) =>
    client<EvidenceItem[]>('/v1/evidence_items', { params: { inspection_id } });

export const getEvidenceItem = (id: string) =>
    client<EvidenceItem>(`/v1/evidence_items/${id}`);

/** Create evidence item with multipart form (image required). Use createEvidenceItemFormData. */
export const createEvidenceItem = (formData: FormData) =>
    client<EvidenceItem>('/v1/evidence_items', {
        method: 'POST',
        body: formData,
    });

export const deleteEvidenceItem = (id: string) =>
    client<void>(`/v1/evidence_items/${id}`, {
        method: 'DELETE',
    });

// --- Reports ---

export const getReports = (inspection_id: string) =>
    client<Report[]>('/v1/reports', { params: { inspection_id } });

export const getReport = (id: string) =>
    client<Report>(`/v1/reports/${id}`);

export const createReport = (data: Omit<Report, 'id' | 'created_at'>) =>
    client<Report>('/v1/reports', {
        method: 'POST',
        body: JSON.stringify(data),
    });

/** Create report with multipart form (optional image). */
export const createReportFormData = (formData: FormData) =>
    client<Report>('/v1/reports', {
        method: 'POST',
        body: formData,
    });

export const updateReport = (id: string, data: Partial<Report>) =>
    client<Report>(`/v1/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

export const deleteReport = (id: string) =>
    client<void>(`/v1/reports/${id}`, {
        method: 'DELETE',
    });

// --- Tasks ---

export const getTasks = () =>
    client<Task[]>('/v1/tasks');

export const getTask = (id: string) =>
    client<Task>(`/v1/tasks/${id}`);

export const createTask = (data: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'org_id'>) =>
    client<Task>('/v1/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const updateTask = (id: string, data: Partial<Task>) =>
    client<Task>(`/v1/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

export const deleteTask = (id: string) =>
    client<void>(`/v1/tasks/${id}`, {
        method: 'DELETE',
    });

// --- Task Evidence ---

export const getTaskEvidence = (task_id: string) =>
    client<TaskEvidence[]>('/v1/task_evidence', { params: { task_id } });

export const getTaskEvidenceItem = (id: string) =>
    client<TaskEvidence>(`/v1/task_evidence/${id}`);

export const createTaskEvidence = (data: Omit<TaskEvidence, 'id' | 'created_at'>) =>
    client<TaskEvidence>('/v1/task_evidence', {
        method: 'POST',
        body: JSON.stringify(data),
    });

/** Create task evidence with file upload (multipart). FormData must include: image (File), task_id, type (BEFORE|AFTER). */
export const createTaskEvidenceFormData = (formData: FormData) =>
    client<TaskEvidence>('/v1/task_evidence', {
        method: 'POST',
        body: formData,
    });

export const deleteTaskEvidence = (id: string) =>
    client<void>(`/v1/task_evidence/${id}`, {
        method: 'DELETE',
    });

// --- Waiting list ---

export const joinWaitingList = (email: string) =>
    client<{ id: string; email: string; created_at: string }>('/v1/waiting_list', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });

// --- Book demo ---

export const bookDemo = (email: string) =>
    client<void>('/v1/book_demo', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });

// --- Image analysis ---

export const analyzeImage = (formData: FormData) =>
    client<ImageAnalysisResponse>('/v1/image-analysis', {
        method: 'POST',
        body: formData,
    });
