/**
 * SkillPath AI — API Client & Authentication Layer
 */
(function (window) {
    "use strict";

    const BASE_URL = "http://localhost:8080";
    const TOKEN_KEY = "skillpath_jwt";
    const USER_KEY = "skillpath_user";

    const auth = {
        getToken() {
            return localStorage.getItem(TOKEN_KEY);
        },
        getUser() {
            try {
                const u = localStorage.getItem(USER_KEY);
                return u ? JSON.parse(u) : null;
            } catch (e) {
                return null;
            }
        },
        setSession(token, user) {
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        },
        clearSession() {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        },
        isAuthenticated() {
            return !!this.getToken();
        },
        isAdmin() {
            const u = this.getUser();
            return u && (u.role === "ADMIN" || u.role === "ROLE_ADMIN");
        },
        isStudent() {
            const u = this.getUser();
            return u && (u.role === "STUDENT" || u.role === "ROLE_STUDENT");
        }
    };

    async function request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(options.headers || {})
        };

        const token = auth.getToken();
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
            config.body = JSON.stringify(config.body);
        }

        const response = await fetch(url, config);

        if (response.status === 401) {
            auth.clearSession();
            if (window.SkillPathEvents) {
                window.SkillPathEvents.emit("auth:unauthorized");
            }
        }

        if (!response.ok) {
            let errMsg = `Error ${response.status}: ${response.statusText}`;
            try {
                const errJson = await response.json();
                errMsg = errJson.message || errJson.error || JSON.stringify(errJson);
            } catch (e) { }
            const err = new Error(errMsg);
            err.status = response.status;
            throw err;
        }

        if (response.status === 204) {
            return null;
        }

        return await response.json();
    }

    window.SkillPathAPI = {
        auth,
        login: (email, password) => request("/api/auth/login", { method: "POST", body: { email, password } }),
        register: (payload) => request("/api/auth/register", { method: "POST", body: payload }),
        getMe: () => request("/api/auth/me"),

        // Public / Student APIs
        getCareers: () => request("/api/careers"),
        getCareerSkills: (id) => request(`/api/careers/${id}/skills`),
        getSkills: (category) => request(`/api/skills${category && category !== "All" ? `?category=${encodeURIComponent(category)}` : ""}`),
        getResources: (category) => request(`/api/resources${category && category !== "All" ? `?category=${encodeURIComponent(category)}` : ""}`),
        getStudents: () => request("/api/students"),
        getStudentProfile: (id) => request(`/api/students/${id}`),
        getStudentRoadmap: (id, careerId) => request(`/api/students/${id}/roadmap${careerId ? `?careerId=${careerId}` : ""}`),
        updateMilestoneProgress: (studentId, milestoneId, status, notes) =>
            request(`/api/students/${studentId}/milestones/${milestoneId}`, { method: "PUT", body: { status, notes } }),
        addStudentSkill: (studentId, skillId, proficiencyLevel, verified) =>
            request(`/api/students/${studentId}/skills`, { method: "POST", body: { skillId, proficiencyLevel, verified } }),
        removeStudentSkill: (studentId, skillId) =>
            request(`/api/students/${studentId}/skills/${skillId}`, { method: "DELETE" }),
        getGapAnalysis: (studentId, careerId) =>
            request(`/api/students/${studentId}/gap-analysis${careerId ? `?careerId=${careerId}` : ""}`),
        getAssessmentQuestions: (skillId) => request(`/api/assessments/skill/${skillId}`),
        evaluateAssessment: (payload) => request("/api/assessments/evaluate", { method: "POST", body: payload }),

        // Admin APIs (Protected by ROLE_ADMIN)
        getAdminStats: () => request("/api/admin/stats"),
        adminCreateStudent: (payload) => request("/api/admin/students", { method: "POST", body: payload }),
        adminDeleteStudent: (id) => request(`/api/admin/students/${id}`, { method: "DELETE" }),
        adminCreateCareer: (payload) => request("/api/careers", { method: "POST", body: payload }),
        adminUpdateCareer: (id, payload) => request(`/api/careers/${id}`, { method: "PUT", body: payload }),
        adminDeleteCareer: (id) => request(`/api/careers/${id}`, { method: "DELETE" }),
        adminCreateSkill: (payload) => request("/api/skills", { method: "POST", body: payload }),
        adminUpdateSkill: (id, payload) => request(`/api/skills/${id}`, { method: "PUT", body: payload }),
        adminDeleteSkill: (id) => request(`/api/skills/${id}`, { method: "DELETE" }),
        adminGetResources: () => request("/api/admin/resources"),
        adminCreateResource: (payload) => request("/api/admin/resources", { method: "POST", body: payload }),
        adminUpdateResource: (id, payload) => request(`/api/admin/resources/${id}`, { method: "PUT", body: payload }),
        adminDeleteResource: (id) => request(`/api/admin/resources/${id}`, { method: "DELETE" }),
        adminGetStages: () => request("/api/admin/stages"),
        adminCreateStage: (payload) => request("/api/admin/stages", { method: "POST", body: payload }),
        adminUpdateStage: (id, payload) => request(`/api/admin/stages/${id}`, { method: "PUT", body: payload }),
        adminDeleteStage: (id) => request(`/api/admin/stages/${id}`, { method: "DELETE" }),
        adminGetMilestones: () => request("/api/admin/milestones"),
        adminCreateMilestone: (payload) => request("/api/admin/milestones", { method: "POST", body: payload }),
        adminUpdateMilestone: (id, payload) => request(`/api/admin/milestones/${id}`, { method: "PUT", body: payload }),
        adminDeleteMilestone: (id) => request(`/api/admin/milestones/${id}`, { method: "DELETE" })
    };
})(window);
