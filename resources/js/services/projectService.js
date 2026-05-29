import { router } from '@inertiajs/react';

export const projectService = {
    list(filters = {}, page = 1) {
        return router.get('/projects', { ...filters, page }, {
            preserveScroll: true,
        });
    },

    show(id) {
        return router.get(`/projects/${id}`);
    },

    create(data) {
        return router.post('/projects', data);
    },

    update(id, data) {
        return router.patch(`/projects/${id}`, data);
    },

    delete(id) {
        return router.delete(`/projects/${id}`);
    },

    changeStatus(id, statusId, reason = null, notes = null) {
        return router.patch(`/projects/${id}/status`, { status_id: statusId, reason, notes });
    },

    addNote(id, content) {
        return router.post(`/projects/${id}/notes`, { content });
    },

    uploadDocument(id, formData) {
        return router.post(`/projects/${id}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    downloadDocument(projectId, documentId) {
        window.location.href = `/projects/${projectId}/documents/${documentId}/download`;
    },

    deleteDocument(projectId, documentId) {
        return router.delete(`/projects/${projectId}/documents/${documentId}`);
    },

    getHistory(id) {
        return fetch(`/projects/${id}/history`)
            .then(res => res.json());
    },

    getRequirements(id) {
        return fetch(`/projects/${id}/requirements`)
            .then(res => res.json());
    },

    getStatistics() {
        return fetch('/projects/statistics')
            .then(res => res.json());
    },

    createMilestone(id, data) {
        return router.post(`/projects/${id}/milestones`, data);
    },

    updateMilestone(projectId, milestoneId, data) {
        return router.patch(`/projects/${projectId}/milestones/${milestoneId}`, data);
    },

    completeMilestone(projectId, milestoneId) {
        return router.post(`/projects/${projectId}/milestones/${milestoneId}/complete`);
    },

    getUpme(projectId) {
        return fetch(`/projects/${projectId}/upme`)
            .then(res => res.json());
    },

    updateUpme(projectId, data) {
        return router.put(`/projects/${projectId}/upme`, data);
    },
};
