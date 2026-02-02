import { client } from './client';
import type {
    Organization,
    User,
    Inspection,
    EvidenceItem,
    Report,
    Task,
    TaskEvidence,
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

export const getUsers = (orgId?: string) =>
    client<User[]>('/v1/users', { params: orgId ? { orgId } : undefined });

export const getUser = (id: string) =>
    client<User>(`/v1/users/${id}`);

export const createUser = (data: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password?: string }) =>
    client<User>('/v1/users', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const updateUser = (id: string, data: Partial<User>) =>
    client<User>(`/v1/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

export const deleteUser = (id: string) =>
    client<void>(`/v1/users/${id}`, {
        method: 'DELETE',
    });

// --- Inspections ---

export const getInspections = (orgId?: string) =>
    client<Inspection[]>('/v1/inspections', { params: orgId ? { orgId } : undefined });

export const getInspection = (id: string) =>
    client<Inspection>(`/v1/inspections/${id}`);

export const createInspection = (data: Omit<Inspection, 'id' | 'created_at' | 'updated_at'>) =>
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

export const getEvidenceItems = (inspectionId: string) =>
    client<EvidenceItem[]>('/v1/evidence_items', { params: { inspectionId } });

export const getEvidenceItem = (id: string) =>
    client<EvidenceItem>(`/v1/evidence_items/${id}`);

export const createEvidenceItem = (data: Omit<EvidenceItem, 'id' | 'created_at'>) =>
    client<EvidenceItem>('/v1/evidence_items', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const deleteEvidenceItem = (id: string) =>
    client<void>(`/v1/evidence_items/${id}`, {
        method: 'DELETE',
    });

// --- Reports ---

export const getReports = (inspectionId: string) =>
    client<Report[]>('/v1/reports', { params: { inspectionId } });

export const getReport = (id: string) =>
    client<Report>(`/v1/reports/${id}`);

export const createReport = (data: Omit<Report, 'id' | 'created_at'>) =>
    client<Report>('/v1/reports', {
        method: 'POST',
        body: JSON.stringify(data),
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

export const getTasks = (orgId: string) =>
    client<Task[]>('/v1/tasks', { params: { orgId } });

export const getTask = (id: string) =>
    client<Task>(`/v1/tasks/${id}`);

export const createTask = (data: Omit<Task, 'id' | 'created_at' | 'updated_at'>) =>
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

export const getTaskEvidence = (taskId: string) =>
    client<TaskEvidence[]>('/v1/task_evidence', { params: { taskId } });

export const getTaskEvidenceItem = (id: string) =>
    client<TaskEvidence>(`/v1/task_evidence/${id}`);

export const createTaskEvidence = (data: Omit<TaskEvidence, 'id' | 'created_at'>) =>
    client<TaskEvidence>('/v1/task_evidence', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const deleteTaskEvidence = (id: string) =>
    client<void>(`/v1/task_evidence/${id}`, {
        method: 'DELETE',
    });
