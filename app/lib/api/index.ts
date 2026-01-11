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
    client<Organization[]>('/organizations');

export const getOrganization = (id: string) =>
    client<Organization>(`/organizations/${id}`);

export const createOrganization = (data: Omit<Organization, 'id' | 'created_at' | 'updated_at'>) =>
    client<Organization>('/organizations', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const updateOrganization = (id: string, data: Partial<Organization>) =>
    client<Organization>(`/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

export const deleteOrganization = (id: string) =>
    client<void>(`/organizations/${id}`, {
        method: 'DELETE',
    });

// --- Users ---

export const getUsers = (orgId?: string) =>
    client<User[]>('/users', { params: orgId ? { orgId } : undefined });

export const getUser = (id: string) =>
    client<User>(`/users/${id}`);

export const createUser = (data: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password?: string }) =>
    client<User>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const updateUser = (id: string, data: Partial<User>) =>
    client<User>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

export const deleteUser = (id: string) =>
    client<void>(`/users/${id}`, {
        method: 'DELETE',
    });

// --- Inspections ---

export const getInspections = (orgId?: string) =>
    client<Inspection[]>('/inspections', { params: orgId ? { orgId } : undefined });

export const getInspection = (id: string) =>
    client<Inspection>(`/inspections/${id}`);

export const createInspection = (data: Omit<Inspection, 'id' | 'created_at' | 'updated_at'>) =>
    client<Inspection>('/inspections', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const updateInspection = (id: string, data: Partial<Inspection>) =>
    client<Inspection>(`/inspections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

export const deleteInspection = (id: string) =>
    client<void>(`/inspections/${id}`, {
        method: 'DELETE',
    });

// --- Evidence Items ---

export const getEvidenceItems = (inspectionId: string) =>
    client<EvidenceItem[]>('/evidence-items', { params: { inspectionId } });

export const getEvidenceItem = (id: string) =>
    client<EvidenceItem>(`/evidence-items/${id}`);

export const createEvidenceItem = (data: Omit<EvidenceItem, 'id' | 'created_at'>) =>
    client<EvidenceItem>('/evidence-items', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const deleteEvidenceItem = (id: string) =>
    client<void>(`/evidence-items/${id}`, {
        method: 'DELETE',
    });

// --- Reports ---

export const getReports = (inspectionId: string) =>
    client<Report[]>('/reports', { params: { inspectionId } });

export const getReport = (id: string) =>
    client<Report>(`/reports/${id}`);

export const createReport = (data: Omit<Report, 'id' | 'created_at'>) =>
    client<Report>('/reports', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const updateReport = (id: string, data: Partial<Report>) =>
    client<Report>(`/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

export const deleteReport = (id: string) =>
    client<void>(`/reports/${id}`, {
        method: 'DELETE',
    });

// --- Tasks ---

export const getTasks = (orgId: string) =>
    client<Task[]>('/tasks', { params: { orgId } });

export const getTask = (id: string) =>
    client<Task>(`/tasks/${id}`);

export const createTask = (data: Omit<Task, 'id' | 'created_at' | 'updated_at'>) =>
    client<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const updateTask = (id: string, data: Partial<Task>) =>
    client<Task>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

export const deleteTask = (id: string) =>
    client<void>(`/tasks/${id}`, {
        method: 'DELETE',
    });

// --- Task Evidence ---

export const getTaskEvidence = (taskId: string) =>
    client<TaskEvidence[]>('/task-evidence', { params: { taskId } });

export const getTaskEvidenceItem = (id: string) =>
    client<TaskEvidence>(`/task-evidence/${id}`);

export const createTaskEvidence = (data: Omit<TaskEvidence, 'id' | 'created_at'>) =>
    client<TaskEvidence>('/task-evidence', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const deleteTaskEvidence = (id: string) =>
    client<void>(`/task-evidence/${id}`, {
        method: 'DELETE',
    });
