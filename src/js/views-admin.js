/**
 * SkillPath AI — Admin Management Views (Full CRUD Operations Studio)
 */
(function (window) {
    "use strict";

    const { el, showToast, confirmDialog, showModal, closeModal } = window.SkillPathUI;
    const api = window.SkillPathAPI;

    let activeAdminSubtab = "students"; // 'students' | 'careers' | 'skills' | 'resources' | 'milestones'

    async function renderDashboard(container) {
        container.innerHTML = "";

        if (!api.auth.isAdmin()) {
            const lockBanner = el("div", { className: "hero-banner", attrs: { style: "text-align: center;" } }, [
                el("span", { className: "badge badge-red", text: "Security Enforcement" }),
                el("h1", { className: "hero-title", text: "Administrator Authorization Required", attrs: { style: "margin-top: 0.5rem;" } }),
                el("p", { className: "hero-desc", text: "Protected administrative CRUD endpoints require the ROLE_ADMIN claim. Please log in with system administrator credentials to access platform governance controls.", attrs: { style: "margin: 0.5rem auto 1.5rem auto;" } }),
                el("button", {
                    className: "btn btn-primary",
                    text: "🛡️ Sign In as System Administrator",
                    events: {
                        click: () => {
                            window.SkillPathUI.showAuthModal("login", () => renderDashboard(container));
                        }
                    }
                })
            ]);
            container.appendChild(lockBanner);
            return;
        }

        const loader = el("div", { className: "card", attrs: { style: "padding: 2rem; text-align: center; color: var(--slate-300);" }, text: "Fetching system administrative statistics..." });
        container.appendChild(loader);

        try {
            const stats = await api.getAdminStats();
            container.innerHTML = "";

            // 1. Admin Header
            const header = el("div", { className: "hero-banner" }, [
                el("div", { attrs: { style: "display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;" } }, [
                    el("div", {}, [
                        el("span", { className: "badge badge-purple", text: "Administrator Control Plane" }),
                        el("h1", { className: "hero-title", text: "Platform Administration Studio" }),
                        el("p", { className: "hero-desc", text: "Manage student accounts, career tracks, required skill levels, learning resources, and roadmap milestones with secure CRUD APIs." })
                    ]),
                    el("div", { attrs: { style: "display: flex; gap: 0.75rem;" } }, [
                        el("button", {
                            className: "btn btn-secondary",
                            text: "🔄 Refresh Metrics",
                            events: { click: () => renderDashboard(container) }
                        })
                    ])
                ])
            ]);
            container.appendChild(header);

            // 2. Statistics KPI Cards
            const statsGrid = el("div", { className: "stats-grid" }, [
                el("div", { className: "stat-card" }, [
                    el("div", { className: "stat-icon-wrap", text: "🎓" }),
                    el("div", { className: "stat-content" }, [
                        el("div", { className: "stat-number", text: stats.totalStudents || 0 }),
                        el("div", { className: "stat-label", text: "Total Enrolled Students" })
                    ])
                ]),
                el("div", { className: "stat-card" }, [
                    el("div", { className: "stat-icon-wrap", text: "💼" }),
                    el("div", { className: "stat-content" }, [
                        el("div", { className: "stat-number", text: stats.totalCareers || 0 }),
                        el("div", { className: "stat-label", text: "Career Roles" })
                    ])
                ]),
                el("div", { className: "stat-card" }, [
                    el("div", { className: "stat-icon-wrap", text: "⚡" }),
                    el("div", { className: "stat-content" }, [
                        el("div", { className: "stat-number", text: stats.totalSkills || 0 }),
                        el("div", { className: "stat-label", text: "Skills in Catalog" })
                    ])
                ]),
                el("div", { className: "stat-card" }, [
                    el("div", { className: "stat-icon-wrap", text: "📚" }),
                    el("div", { className: "stat-content" }, [
                        el("div", { className: "stat-number", text: stats.totalResources || 0 }),
                        el("div", { className: "stat-label", text: "Learning Resources" })
                    ])
                ]),
                el("div", { className: "stat-card" }, [
                    el("div", { className: "stat-icon-wrap", text: "🎯" }),
                    el("div", { className: "stat-content" }, [
                        el("div", { className: "stat-number", text: stats.totalMilestones || 0 }),
                        el("div", { className: "stat-label", text: "Roadmap Milestones" })
                    ])
                ])
            ]);
            container.appendChild(statsGrid);

            // 3. Sub-tabs Navigation
            const tabs = [
                { id: "students", label: "🎓 Students & Accounts" },
                { id: "careers", label: "💼 Career Tracks" },
                { id: "skills", label: "⚡ Skills Catalog" },
                { id: "resources", label: "📚 Learning Resources" },
                { id: "milestones", label: "🎯 Roadmap Milestones" }
            ];

            const tabsBar = el("div", { className: "subtabs-bar" },
                tabs.map((t) =>
                    el("button", {
                        className: `subtab-btn ${activeAdminSubtab === t.id ? "active" : ""}`,
                        text: t.label,
                        events: {
                            click: () => {
                                activeAdminSubtab = t.id;
                                renderDashboard(container);
                            }
                        }
                    })
                )
            );
            container.appendChild(tabsBar);

            // 4. Tab Content Pane
            const contentPane = el("div", { id: "admin-tab-pane" });
            container.appendChild(contentPane);

            switch (activeAdminSubtab) {
                case "students":
                    await renderStudentsCrud(contentPane, () => renderDashboard(container));
                    break;
                case "careers":
                    await renderCareersCrud(contentPane, () => renderDashboard(container));
                    break;
                case "skills":
                    await renderSkillsCrud(contentPane, () => renderDashboard(container));
                    break;
                case "resources":
                    await renderResourcesCrud(contentPane, () => renderDashboard(container));
                    break;
                case "milestones":
                    await renderMilestonesCrud(contentPane, () => renderDashboard(container));
                    break;
            }

        } catch (err) {
            container.innerHTML = "";
            container.appendChild(el("div", { className: "card", attrs: { style: "padding: 2rem; color: #f87171;" }, text: err.message }));
        }
    }

    // ==========================================
    // 1. Students CRUD
    // ==========================================
    async function renderStudentsCrud(pane, reload) {
        pane.innerHTML = "";
        const students = await api.getStudents();
        const careers = await api.getCareers();
        const careerMap = {};
        careers.forEach((c) => (careerMap[c.id] = c.title));

        const card = el("div", { className: "card" }, [
            el("div", { className: "card-header" }, [
                el("h3", { className: "card-title", text: "Student Accounts & Profiles" }),
                el("button", {
                    className: "btn btn-primary btn-sm",
                    text: "+ Enroll New Student",
                    events: {
                        click: () => showCreateStudentModal(careers, reload)
                    }
                })
            ]),
            el("div", { className: "card-body" }, [
                el("div", { className: "table-responsive" }, [
                    el("table", { className: "custom-table" }, [
                        el("thead", {}, [
                            el("tr", {}, [
                                el("th", { text: "ID" }),
                                el("th", { text: "Student Name" }),
                                el("th", { text: "Email Address" }),
                                el("th", { text: "University / Institute" }),
                                el("th", { text: "Major" }),
                                el("th", { text: "Target Track" }),
                                el("th", { text: "Actions" })
                            ])
                        ]),
                        el("tbody", {},
                            students.map((s) =>
                                el("tr", {}, [
                                    el("td", { text: `#${s.id}` }),
                                    el("td", { text: s.name, attrs: { style: "font-weight: 700; color: var(--white);" } }),
                                    el("td", { text: s.email }),
                                    el("td", { text: s.university }),
                                    el("td", { text: `${s.major} (${s.yearOfStudy})` }),
                                    el("td", { text: careerMap[s.targetCareerId] || "Undecided" }),
                                    el("td", {}, [
                                        el("button", {
                                            className: "btn btn-danger btn-sm",
                                            text: "Delete",
                                            events: {
                                                click: () => {
                                                    confirmDialog("Delete Student", `Delete student account for "${s.name}"? This cascades to all skill competencies and milestone records.`, async () => {
                                                        try {
                                                            await api.adminDeleteStudent(s.id);
                                                            showToast(`Deleted student ${s.name}`, "success");
                                                            reload();
                                                        } catch (e) {
                                                            showToast(e.message, "error");
                                                        }
                                                    });
                                                }
                                            }
                                        })
                                    ])
                                ])
                            )
                        )
                    ])
                ])
            ])
        ]);
        pane.appendChild(card);
    }

    function showCreateStudentModal(careers, reload) {
        const nameInput = el("input", { className: "form-input", attrs: { placeholder: "Student Full Name" } });
        const emailInput = el("input", { className: "form-input", attrs: { type: "email", placeholder: "student@university.edu" } });
        const pwdInput = el("input", { className: "form-input", attrs: { type: "password", placeholder: "Temporary Password" } });
        const uniInput = el("input", { className: "form-input", attrs: { placeholder: "University / College" } });
        const majorInput = el("input", { className: "form-input", attrs: { placeholder: "Major (e.g. Computer Science)" } });
        const careerSelect = el("select", { className: "form-select" },
            careers.map((c) => el("option", { text: c.title, attrs: { value: c.id } }))
        );

        const body = el("div", { attrs: { style: "display: flex; flex-direction: column; gap: 0.85rem;" } }, [
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Full Name" }), nameInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Email Address" }), emailInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Initial Password" }), pwdInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "University" }), uniInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Major" }), majorInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Target Career" }), careerSelect])
        ]);

        const buttons = [
            el("button", { className: "btn btn-secondary", text: "Cancel", events: { click: closeModal } }),
            el("button", {
                className: "btn btn-primary",
                text: "Create Student",
                events: {
                    click: async () => {
                        try {
                            await api.adminCreateStudent({
                                name: nameInput.value.trim(),
                                email: emailInput.value.trim(),
                                password: pwdInput.value || "Student@123",
                                university: uniInput.value.trim() || "Institute of Technology",
                                major: majorInput.value.trim() || "Computer Science",
                                yearOfStudy: "1st Year",
                                targetCareerId: parseInt(careerSelect.value)
                            });
                            showToast("Student created successfully!", "success");
                            closeModal();
                            reload();
                        } catch (err) {
                            showToast(err.message, "error");
                        }
                    }
                }
            })
        ];

        showModal("Enroll New Student Account", body, buttons);
    }

    // ==========================================
    // 2. Careers CRUD
    // ==========================================
    async function renderCareersCrud(pane, reload) {
        pane.innerHTML = "";
        const careers = await api.getCareers();

        const card = el("div", { className: "card" }, [
            el("div", { className: "card-header" }, [
                el("h3", { className: "card-title", text: "Career Tracks & Descriptions" }),
                el("button", {
                    className: "btn btn-primary btn-sm",
                    text: "+ New Career Role",
                    events: {
                        click: () => showCareerModal(null, reload)
                    }
                })
            ]),
            el("div", { className: "card-body" }, [
                el("div", { className: "table-responsive" }, [
                    el("table", { className: "custom-table" }, [
                        el("thead", {}, [
                            el("tr", {}, [
                                el("th", { text: "ID" }),
                                el("th", { text: "Title" }),
                                el("th", { text: "Category" }),
                                el("th", { text: "Salary Potential" }),
                                el("th", { text: "Market Demand" }),
                                el("th", { text: "Actions" })
                            ])
                        ]),
                        el("tbody", {},
                            careers.map((c) =>
                                el("tr", {}, [
                                    el("td", { text: `#${c.id}` }),
                                    el("td", { text: c.title, attrs: { style: "font-weight: 700; color: var(--white);" } }),
                                    el("td", { text: c.category }),
                                    el("td", { text: c.salaryRange }),
                                    el("td", {}, [el("span", { className: "badge badge-green", text: c.demandLevel })]),
                                    el("td", {}, [
                                        el("button", {
                                            className: "btn btn-secondary btn-sm",
                                            attrs: { style: "margin-right: 0.4rem;" },
                                            text: "Edit",
                                            events: { click: () => showCareerModal(c, reload) }
                                        }),
                                        el("button", {
                                            className: "btn btn-danger btn-sm",
                                            text: "Delete",
                                            events: {
                                                click: () => {
                                                    confirmDialog("Delete Career Track", `Delete "${c.title}"?`, async () => {
                                                        try {
                                                            await api.adminDeleteCareer(c.id);
                                                            showToast(`Deleted career ${c.title}`, "success");
                                                            reload();
                                                        } catch (e) {
                                                            showToast(e.message, "error");
                                                        }
                                                    });
                                                }
                                            }
                                        })
                                    ])
                                ])
                            )
                        )
                    ])
                ])
            ])
        ]);
        pane.appendChild(card);
    }

    function showCareerModal(career, reload) {
        const isEdit = !!career;
        const titleInput = el("input", { className: "form-input", attrs: { value: career ? career.title : "", placeholder: "Career Title" } });
        const catInput = el("input", { className: "form-input", attrs: { value: career ? career.category : "Software Development", placeholder: "Category" } });
        const salaryInput = el("input", { className: "form-input", attrs: { value: career ? career.salaryRange : "$90,000 - $140,000", placeholder: "Salary Range" } });
        const demandInput = el("input", { className: "form-input", attrs: { value: career ? career.demandLevel : "High", placeholder: "Demand Level" } });
        const descInput = el("textarea", { className: "form-textarea", attrs: { rows: "3", placeholder: "Overview description..." }, text: career ? career.description : "" });

        const body = el("div", { attrs: { style: "display: flex; flex-direction: column; gap: 0.85rem;" } }, [
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Role Title" }), titleInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Category" }), catInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Salary Range" }), salaryInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Demand Level" }), demandInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Description" }), descInput])
        ]);

        const buttons = [
            el("button", { className: "btn btn-secondary", text: "Cancel", events: { click: closeModal } }),
            el("button", {
                className: "btn btn-primary",
                text: isEdit ? "Update Track" : "Create Track",
                events: {
                    click: async () => {
                        const payload = {
                            title: titleInput.value.trim(),
                            category: catInput.value.trim(),
                            salaryRange: salaryInput.value.trim(),
                            demandLevel: demandInput.value.trim(),
                            description: descInput.value.trim()
                        };
                        try {
                            if (isEdit) {
                                await api.adminUpdateCareer(career.id, payload);
                                showToast("Updated career track!", "success");
                            } else {
                                await api.adminCreateCareer(payload);
                                showToast("Created new career track!", "success");
                            }
                            closeModal();
                            reload();
                        } catch (err) {
                            showToast(err.message, "error");
                        }
                    }
                }
            })
        ];

        showModal(isEdit ? "Edit Career Track" : "New Career Track", body, buttons);
    }

    // ==========================================
    // 3. Skills CRUD
    // ==========================================
    async function renderSkillsCrud(pane, reload) {
        pane.innerHTML = "";
        const skills = await api.getSkills();

        const card = el("div", { className: "card" }, [
            el("div", { className: "card-header" }, [
                el("h3", { className: "card-title", text: "Skills & Proficiency Levels" }),
                el("button", {
                    className: "btn btn-primary btn-sm",
                    text: "+ Add New Skill",
                    events: {
                        click: () => showSkillModal(null, reload)
                    }
                })
            ]),
            el("div", { className: "card-body" }, [
                el("div", { className: "table-responsive" }, [
                    el("table", { className: "custom-table" }, [
                        el("thead", {}, [
                            el("tr", {}, [
                                el("th", { text: "ID" }),
                                el("th", { text: "Icon" }),
                                el("th", { text: "Skill Name" }),
                                el("th", { text: "Category" }),
                                el("th", { text: "Actions" })
                            ])
                        ]),
                        el("tbody", {},
                            skills.map((s) =>
                                el("tr", {}, [
                                    el("td", { text: `#${s.id}` }),
                                    el("td", { text: s.icon || "⚡", attrs: { style: "font-size: 1.2rem;" } }),
                                    el("td", { text: s.name, attrs: { style: "font-weight: 700; color: var(--white);" } }),
                                    el("td", { text: s.category }),
                                    el("td", {}, [
                                        el("button", {
                                            className: "btn btn-secondary btn-sm",
                                            attrs: { style: "margin-right: 0.4rem;" },
                                            text: "Edit",
                                            events: { click: () => showSkillModal(s, reload) }
                                        }),
                                        el("button", {
                                            className: "btn btn-danger btn-sm",
                                            text: "Delete",
                                            events: {
                                                click: () => {
                                                    confirmDialog("Delete Skill", `Delete skill "${s.name}"?`, async () => {
                                                        try {
                                                            await api.adminDeleteSkill(s.id);
                                                            showToast(`Deleted skill ${s.name}`, "success");
                                                            reload();
                                                        } catch (e) {
                                                            showToast(e.message, "error");
                                                        }
                                                    });
                                                }
                                            }
                                        })
                                    ])
                                ])
                            )
                        )
                    ])
                ])
            ])
        ]);
        pane.appendChild(card);
    }

    function showSkillModal(skill, reload) {
        const isEdit = !!skill;
        const nameInput = el("input", { className: "form-input", attrs: { value: skill ? skill.name : "", placeholder: "Skill Name" } });
        const catInput = el("input", { className: "form-input", attrs: { value: skill ? skill.category : "Technical", placeholder: "Category" } });
        const iconInput = el("input", { className: "form-input", attrs: { value: skill ? skill.icon : "⚡", placeholder: "Emoji Icon (e.g. ☕, 🐍)" } });
        const descInput = el("textarea", { className: "form-textarea", attrs: { rows: "3", placeholder: "Competency description..." }, text: skill ? skill.description : "" });

        const body = el("div", { attrs: { style: "display: flex; flex-direction: column; gap: 0.85rem;" } }, [
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Skill Name" }), nameInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Category" }), catInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Icon" }), iconInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Description" }), descInput])
        ]);

        const buttons = [
            el("button", { className: "btn btn-secondary", text: "Cancel", events: { click: closeModal } }),
            el("button", {
                className: "btn btn-primary",
                text: isEdit ? "Update Skill" : "Create Skill",
                events: {
                    click: async () => {
                        const payload = {
                            name: nameInput.value.trim(),
                            category: catInput.value.trim(),
                            icon: iconInput.value.trim(),
                            description: descInput.value.trim()
                        };
                        try {
                            if (isEdit) {
                                await api.adminUpdateSkill(skill.id, payload);
                                showToast("Updated skill!", "success");
                            } else {
                                await api.adminCreateSkill(payload);
                                showToast("Created skill!", "success");
                            }
                            closeModal();
                            reload();
                        } catch (err) {
                            showToast(err.message, "error");
                        }
                    }
                }
            })
        ];

        showModal(isEdit ? "Edit Skill" : "Add New Skill", body, buttons);
    }

    // ==========================================
    // 4. Learning Resources CRUD
    // ==========================================
    async function renderResourcesCrud(pane, reload) {
        pane.innerHTML = "";
        const resources = await api.adminGetResources();

        const card = el("div", { className: "card" }, [
            el("div", { className: "card-header" }, [
                el("h3", { className: "card-title", text: "Learning Resources & Course Links" }),
                el("button", {
                    className: "btn btn-primary btn-sm",
                    text: "+ Add Resource Link",
                    events: {
                        click: () => showResourceModal(null, reload)
                    }
                })
            ]),
            el("div", { className: "card-body" }, [
                el("div", { className: "table-responsive" }, [
                    el("table", { className: "custom-table" }, [
                        el("thead", {}, [
                            el("tr", {}, [
                                el("th", { text: "ID" }),
                                el("th", { text: "Title" }),
                                el("th", { text: "Category" }),
                                el("th", { text: "Type" }),
                                el("th", { text: "Provider" }),
                                el("th", { text: "Difficulty" }),
                                el("th", { text: "Actions" })
                            ])
                        ]),
                        el("tbody", {},
                            resources.map((r) =>
                                el("tr", {}, [
                                    el("td", { text: `#${r.id}` }),
                                    el("td", { text: r.title, attrs: { style: "font-weight: 700; color: var(--white);" } }),
                                    el("td", { text: r.category }),
                                    el("td", {}, [el("span", { className: "badge badge-blue", text: r.resourceType })]),
                                    el("td", { text: r.provider }),
                                    el("td", {}, [el("span", { className: "badge badge-green", text: r.difficulty })]),
                                    el("td", {}, [
                                        el("button", {
                                            className: "btn btn-secondary btn-sm",
                                            attrs: { style: "margin-right: 0.4rem;" },
                                            text: "Edit",
                                            events: { click: () => showResourceModal(r, reload) }
                                        }),
                                        el("button", {
                                            className: "btn btn-danger btn-sm",
                                            text: "Delete",
                                            events: {
                                                click: () => {
                                                    confirmDialog("Delete Resource", `Delete "${r.title}"?`, async () => {
                                                        try {
                                                            await api.adminDeleteResource(r.id);
                                                            showToast(`Deleted resource ${r.title}`, "success");
                                                            reload();
                                                        } catch (e) {
                                                            showToast(e.message, "error");
                                                        }
                                                    });
                                                }
                                            }
                                        })
                                    ])
                                ])
                            )
                        )
                    ])
                ])
            ])
        ]);
        pane.appendChild(card);
    }

    function showResourceModal(res, reload) {
        const isEdit = !!res;
        const titleInput = el("input", { className: "form-input", attrs: { value: res ? res.title : "", placeholder: "Resource Title" } });
        const catInput = el("input", { className: "form-input", attrs: { value: res ? res.category : "Full Stack", placeholder: "Category" } });
        const typeSelect = el("select", { className: "form-select" }, [
            el("option", { text: "Course", attrs: { value: "Course", selected: res && res.resourceType === "Course" ? "true" : "" } }),
            el("option", { text: "Documentation", attrs: { value: "Documentation", selected: res && res.resourceType === "Documentation" ? "true" : "" } }),
            el("option", { text: "Interactive Lab", attrs: { value: "Interactive Lab", selected: res && res.resourceType === "Interactive Lab" ? "true" : "" } }),
            el("option", { text: "Video Tutorial", attrs: { value: "Video Tutorial", selected: res && res.resourceType === "Video Tutorial" ? "true" : "" } })
        ]);
        const providerInput = el("input", { className: "form-input", attrs: { value: res ? res.provider : "Coursera / Official Docs", placeholder: "Provider" } });
        const diffSelect = el("select", { className: "form-select" }, [
            el("option", { text: "Beginner", attrs: { value: "Beginner", selected: res && res.difficulty === "Beginner" ? "true" : "" } }),
            el("option", { text: "Intermediate", attrs: { value: "Intermediate", selected: res && res.difficulty === "Intermediate" ? "true" : "" } }),
            el("option", { text: "Advanced", attrs: { value: "Advanced", selected: res && res.difficulty === "Advanced" ? "true" : "" } })
        ]);
        const urlInput = el("input", { className: "form-input", attrs: { value: res ? res.url : "https://", placeholder: "https://..." } });

        const body = el("div", { attrs: { style: "display: flex; flex-direction: column; gap: 0.85rem;" } }, [
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Title" }), titleInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Category" }), catInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Type" }), typeSelect]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Provider" }), providerInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Difficulty" }), diffSelect]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Resource Link URL" }), urlInput])
        ]);

        const buttons = [
            el("button", { className: "btn btn-secondary", text: "Cancel", events: { click: closeModal } }),
            el("button", {
                className: "btn btn-primary",
                text: isEdit ? "Update Resource" : "Create Resource",
                events: {
                    click: async () => {
                        const payload = {
                            title: titleInput.value.trim(),
                            category: catInput.value.trim(),
                            resourceType: typeSelect.value,
                            provider: providerInput.value.trim(),
                            difficulty: diffSelect.value,
                            url: urlInput.value.trim(),
                            description: titleInput.value.trim()
                        };
                        try {
                            if (isEdit) {
                                await api.adminUpdateResource(res.id, payload);
                                showToast("Updated resource!", "success");
                            } else {
                                await api.adminCreateResource(payload);
                                showToast("Created resource!", "success");
                            }
                            closeModal();
                            reload();
                        } catch (err) {
                            showToast(err.message, "error");
                        }
                    }
                }
            })
        ];

        showModal(isEdit ? "Edit Resource" : "Add Learning Resource", body, buttons);
    }

    // ==========================================
    // 5. Milestones & Roadmap Stages CRUD
    // ==========================================
    async function renderMilestonesCrud(pane, reload) {
        pane.innerHTML = "";
        const milestones = await api.adminGetMilestones();
        const stages = await api.adminGetStages();

        const card = el("div", { className: "card" }, [
            el("div", { className: "card-header" }, [
                el("h3", { className: "card-title", text: "Roadmap Milestones & Weekly Tasks" }),
                el("button", {
                    className: "btn btn-primary btn-sm",
                    text: "+ New Milestone",
                    events: {
                        click: () => showMilestoneModal(null, stages, reload)
                    }
                })
            ]),
            el("div", { className: "card-body" }, [
                el("div", { className: "table-responsive" }, [
                    el("table", { className: "custom-table" }, [
                        el("thead", {}, [
                            el("tr", {}, [
                                el("th", { text: "ID" }),
                                el("th", { text: "Stage" }),
                                el("th", { text: "Seq" }),
                                el("th", { text: "Milestone Title" }),
                                el("th", { text: "Est. Hours" }),
                                el("th", { text: "Deliverable" }),
                                el("th", { text: "Actions" })
                            ])
                        ]),
                        el("tbody", {},
                            milestones.map((m) =>
                                el("tr", {}, [
                                    el("td", { text: `#${m.id}` }),
                                    el("td", { text: m.stageTitle }),
                                    el("td", { text: `#${m.sequenceOrder}` }),
                                    el("td", { text: m.title, attrs: { style: "font-weight: 700; color: var(--white);" } }),
                                    el("td", {}, [el("span", { className: "badge badge-amber", text: `~${m.estimatedHours}h` })]),
                                    el("td", { text: m.deliverable || "N/A" }),
                                    el("td", {}, [
                                        el("button", {
                                            className: "btn btn-danger btn-sm",
                                            text: "Delete",
                                            events: {
                                                click: () => {
                                                    confirmDialog("Delete Milestone", `Delete milestone "${m.title}"?`, async () => {
                                                        try {
                                                            await api.adminDeleteMilestone(m.id);
                                                            showToast(`Deleted milestone ${m.title}`, "success");
                                                            reload();
                                                        } catch (e) {
                                                            showToast(e.message, "error");
                                                        }
                                                    });
                                                }
                                            }
                                        })
                                    ])
                                ])
                            )
                        )
                    ])
                ])
            ])
        ]);
        pane.appendChild(card);
    }

    function showMilestoneModal(milestone, stages, reload) {
        const stageSelect = el("select", { className: "form-select" },
            stages.map((s) => el("option", { text: `${s.careerTitle} - Stage ${s.stageNumber}: ${s.title}`, attrs: { value: s.id } }))
        );
        const seqInput = el("input", { className: "form-input", attrs: { type: "number", value: "1", min: "1" } });
        const titleInput = el("input", { className: "form-input", attrs: { placeholder: "Milestone Title" } });
        const descInput = el("textarea", { className: "form-textarea", attrs: { rows: "3", placeholder: "What to learn & achieve..." } });
        const linksInput = el("input", { className: "form-input", attrs: { placeholder: "https://documentation-or-guide.com" } });
        const delivInput = el("input", { className: "form-input", attrs: { placeholder: "GitHub repo / deployed API / report" } });
        const hoursInput = el("input", { className: "form-input", attrs: { type: "number", value: "10", min: "1" } });

        const body = el("div", { attrs: { style: "display: flex; flex-direction: column; gap: 0.85rem;" } }, [
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Parent Stage" }), stageSelect]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Sequence Order" }), seqInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Title" }), titleInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Description" }), descInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Resource Link" }), linksInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Deliverable Note" }), delivInput]),
            el("div", { className: "form-group" }, [el("label", { className: "form-label", text: "Estimated Hours" }), hoursInput])
        ]);

        const buttons = [
            el("button", { className: "btn btn-secondary", text: "Cancel", events: { click: closeModal } }),
            el("button", {
                className: "btn btn-primary",
                text: "Create Milestone",
                events: {
                    click: async () => {
                        const payload = {
                            stageId: parseInt(stageSelect.value),
                            sequenceOrder: parseInt(seqInput.value),
                            title: titleInput.value.trim(),
                            description: descInput.value.trim(),
                            resourceLinks: linksInput.value.trim(),
                            deliverable: delivInput.value.trim(),
                            estimatedHours: parseInt(hoursInput.value)
                        };
                        try {
                            await api.adminCreateMilestone(payload);
                            showToast("Milestone created successfully!", "success");
                            closeModal();
                            reload();
                        } catch (err) {
                            showToast(err.message, "error");
                        }
                    }
                }
            })
        ];

        showModal("New Roadmap Milestone", body, buttons);
    }

    window.SkillPathAdminViews = {
        renderDashboard
    };
})(window);
