/**
 * SkillPath AI — UI Components & Modal Engine
 */
(function (window) {
    "use strict";

    const listeners = {};
    window.SkillPathEvents = {
        on(event, fn) {
            if (!listeners[event]) listeners[event] = [];
            listeners[event].push(fn);
        },
        emit(event, data) {
            if (listeners[event]) listeners[event].forEach((fn) => fn(data));
        }
    };

    function el(tag, options = {}, children = []) {
        const element = document.createElement(tag);
        if (options.className) element.className = options.className;
        if (options.id) element.id = options.id;
        if (options.text !== undefined) element.textContent = options.text;
        if (options.html !== undefined) element.innerHTML = options.html;
        if (options.attrs) {
            Object.entries(options.attrs).forEach(([k, v]) => element.setAttribute(k, v));
        }
        if (options.events) {
            Object.entries(options.events).forEach(([k, v]) => element.addEventListener(k, v));
        }
        children.forEach((child) => {
            if (child) element.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
        });
        return element;
    }

    function showToast(message, type = "info") {
        let container = document.getElementById("toast-container");
        if (!container) {
            container = el("div", { id: "toast-container", className: "toast-container" });
            document.body.appendChild(container);
        }

        const icons = { success: "✓", error: "✕", info: "ℹ" };
        const toast = el(
            "div",
            { className: `toast toast-${type}` },
            [
                el("span", {
                    text: icons[type] || "•",
                    attrs: { style: "font-weight: 800; font-size: 1.1rem;" }
                }),
                el("div", { text: message, attrs: { style: "flex: 1; font-size: 0.88rem; font-weight: 500;" } })
            ]
        );

        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(20px)";
            toast.style.transition = "all 0.3s ease";
            setTimeout(() => toast.remove(), 300);
        }, 3800);
    }

    function showModal(title, bodyContent, footerButtons = []) {
        closeModal();

        const overlay = el("div", { className: "modal-overlay", id: "active-modal-overlay" }, [
            el("div", { className: "modal-dialog" }, [
                el("div", { className: "modal-header" }, [
                    el("h3", { className: "modal-title", text: title }),
                    el("button", { className: "modal-close", text: "×", events: { click: closeModal } })
                ]),
                el("div", { className: "modal-body" }, [bodyContent]),
                el("div", { className: "modal-footer" }, footerButtons)
            ])
        ]);

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeModal();
        });

        document.body.appendChild(overlay);
    }

    function closeModal() {
        const existing = document.getElementById("active-modal-overlay");
        if (existing) existing.remove();
    }

    function confirmDialog(title, message, onConfirm) {
        const body = el("p", { text: message, attrs: { style: "color: var(--slate-300); line-height: 1.6;" } });
        const buttons = [
            el("button", { className: "btn btn-secondary", text: "Cancel", events: { click: closeModal } }),
            el("button", {
                className: "btn btn-danger",
                text: "Confirm Action",
                events: {
                    click: async () => {
                        closeModal();
                        await onConfirm();
                    }
                }
            })
        ];
        showModal(title, body, buttons);
    }

    function showAuthModal(initialTab = "login", onSuccess) {
        let currentTab = initialTab;

        const modalBody = el("div", { attrs: { style: "display: flex; flex-direction: column; gap: 1.25rem;" } });

        function renderTabs() {
            modalBody.innerHTML = "";

            const tabBar = el("div", { className: "subtabs-bar" }, [
                el("button", {
                    className: `subtab-btn ${currentTab === "login" ? "active" : ""}`,
                    text: "Student / Admin Login",
                    events: { click: () => { currentTab = "login"; renderTabs(); } }
                }),
                el("button", {
                    className: `subtab-btn ${currentTab === "register" ? "active" : ""}`,
                    text: "Student Registration",
                    events: { click: () => { currentTab = "register"; renderTabs(); } }
                })
            ]);

            const formWrap = el("div");

            if (currentTab === "login") {
                const emailInput = el("input", {
                    className: "form-input",
                    attrs: { type: "email", placeholder: "you@university.edu or admin@skillpath.ai", required: "true" }
                });
                const pwdInput = el("input", {
                    className: "form-input",
                    attrs: { type: "password", placeholder: "••••••••", required: "true" }
                });

                const quickFillWrap = el("div", { attrs: { style: "display: flex; gap: 0.5rem; flex-wrap: wrap;" } }, [
                    el("button", {
                        className: "btn btn-secondary btn-sm",
                        text: "Demo Student (Aarav)",
                        events: {
                            click: () => {
                                emailInput.value = "aarav.sharma@university.edu";
                                pwdInput.value = "Student@123";
                            }
                        }
                    }),
                    el("button", {
                        className: "btn btn-secondary btn-sm",
                        text: "Demo Admin (admin@skillpath.ai)",
                        events: {
                            click: () => {
                                emailInput.value = "admin@skillpath.ai";
                                pwdInput.value = "Admin@123";
                            }
                        }
                    })
                ]);

                const loginForm = el("form", {
                    events: {
                        submit: async (e) => {
                            e.preventDefault();
                            try {
                                const res = await window.SkillPathAPI.login(emailInput.value.trim(), pwdInput.value);
                                window.SkillPathAPI.auth.setSession(res.token, {
                                    id: res.userId,
                                    name: res.name,
                                    email: res.email,
                                    role: res.role,
                                    studentId: res.studentId
                                });
                                showToast(`Welcome back, ${res.name}! (${res.role})`, "success");
                                closeModal();
                                if (onSuccess) onSuccess(res);
                                window.SkillPathEvents.emit("auth:change");
                            } catch (err) {
                                showToast(err.message, "error");
                            }
                        }
                    }
                }, [
                    el("div", { className: "form-group", attrs: { style: "margin-bottom: 1rem;" } }, [
                        el("label", { className: "form-label", text: "Email Address" }),
                        emailInput
                    ]),
                    el("div", { className: "form-group", attrs: { style: "margin-bottom: 1rem;" } }, [
                        el("label", { className: "form-label", text: "Password" }),
                        pwdInput
                    ]),
                    el("div", { className: "form-group", attrs: { style: "margin-bottom: 1.25rem;" } }, [
                        el("label", { className: "form-label", text: "Quick Demo Credentials" }),
                        quickFillWrap
                    ]),
                    el("button", { className: "btn btn-primary", attrs: { type: "submit", style: "width: 100%; justify-content: center;" }, text: "Sign In Securely" })
                ]);

                formWrap.appendChild(loginForm);
            } else {
                const nameInput = el("input", { className: "form-input", attrs: { placeholder: "Full Name", required: "true" } });
                const emailInput = el("input", { className: "form-input", attrs: { type: "email", placeholder: "email@domain.edu", required: "true" } });
                const pwdInput = el("input", { className: "form-input", attrs: { type: "password", placeholder: "Minimum 6 characters", required: "true" } });
                const uniInput = el("input", { className: "form-input", attrs: { placeholder: "University / Institute" } });
                const majorInput = el("input", { className: "form-input", attrs: { placeholder: "Major (e.g. Computer Science)" } });
                const yearSelect = el("select", { className: "form-select" }, [
                    el("option", { text: "1st Year", attrs: { value: "1st Year" } }),
                    el("option", { text: "2nd Year", attrs: { value: "2nd Year" } }),
                    el("option", { text: "3rd Year", attrs: { value: "3rd Year", selected: "true" } }),
                    el("option", { text: "Final Year", attrs: { value: "Final Year" } })
                ]);

                const regForm = el("form", {
                    events: {
                        submit: async (e) => {
                            e.preventDefault();
                            try {
                                const res = await window.SkillPathAPI.register({
                                    name: nameInput.value.trim(),
                                    email: emailInput.value.trim(),
                                    password: pwdInput.value,
                                    university: uniInput.value.trim() || "National University",
                                    major: majorInput.value.trim() || "Computer Science",
                                    yearOfStudy: yearSelect.value,
                                    targetCareerId: 1
                                });
                                window.SkillPathAPI.auth.setSession(res.token, {
                                    id: res.userId,
                                    name: res.name,
                                    email: res.email,
                                    role: res.role,
                                    studentId: res.studentId
                                });
                                showToast(`Account created successfully! Welcome, ${res.name}`, "success");
                                closeModal();
                                if (onSuccess) onSuccess(res);
                                window.SkillPathEvents.emit("auth:change");
                            } catch (err) {
                                showToast(err.message, "error");
                            }
                        }
                    }
                }, [
                    el("div", { className: "form-group", attrs: { style: "margin-bottom: 0.85rem;" } }, [
                        el("label", { className: "form-label", text: "Full Name" }),
                        nameInput
                    ]),
                    el("div", { className: "form-group", attrs: { style: "margin-bottom: 0.85rem;" } }, [
                        el("label", { className: "form-label", text: "Email Address" }),
                        emailInput
                    ]),
                    el("div", { className: "form-group", attrs: { style: "margin-bottom: 0.85rem;" } }, [
                        el("label", { className: "form-label", text: "Password" }),
                        pwdInput
                    ]),
                    el("div", { className: "form-group", attrs: { style: "margin-bottom: 0.85rem;" } }, [
                        el("label", { className: "form-label", text: "University / Institute" }),
                        uniInput
                    ]),
                    el("div", { className: "form-group", attrs: { style: "margin-bottom: 0.85rem;" } }, [
                        el("label", { className: "form-label", text: "Academic Major" }),
                        majorInput
                    ]),
                    el("div", { className: "form-group", attrs: { style: "margin-bottom: 1.25rem;" } }, [
                        el("label", { className: "form-label", text: "Year of Study" }),
                        yearSelect
                    ]),
                    el("button", { className: "btn btn-primary", attrs: { type: "submit", style: "width: 100%; justify-content: center;" }, text: "Register as Student" })
                ]);

                formWrap.appendChild(regForm);
            }

            modalBody.appendChild(tabBar);
            modalBody.appendChild(formWrap);
        }

        renderTabs();
        showModal("Account Access", modalBody);
    }

    window.SkillPathUI = {
        el,
        showToast,
        showModal,
        closeModal,
        confirmDialog,
        showAuthModal
    };
})(window);
