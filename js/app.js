document.addEventListener('DOMContentLoaded', () => {
    // Initial load
    loadView('dashboard');
    
    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    // Global Modals - Initialize once
    setupModal('addMemberModal', 'openAddMemberModal', 'closeModalBtn', 'cancelModalBtn');
    setupModal('addStaffModal', 'openAddStaffModal', 'closeStaffModalBtn', 'cancelStaffModalBtn');
    setupModal('profileModal', null, 'closeProfileModalBtn', null);

    const addMemberForm = document.getElementById('addMemberForm');
    if(addMemberForm) {
        addMemberForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addMemberForm);
            try {
                const response = { json: async () => ({success: true, status: 'success', message: 'Acțiune simulată cu succes (Mod Demo)'}) };
                const result = await response.json();
                if(result.success) {
                    alert('Membru adăugat cu succes!');
                    document.getElementById('addMemberModal').classList.remove('active');
                    addMemberForm.reset();
                    loadView('members');
                } else alert('Eroare: ' + result.message);
            } catch (err) { console.error(err); }
        });
    }

    const addStaffForm = document.getElementById('addStaffForm');
    if(addStaffForm) {
        addStaffForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addStaffForm);
            try {
                const response = { json: async () => ({success: true, status: 'success', message: 'Acțiune simulată cu succes (Mod Demo)'}) };
                const result = await response.json();
                if(result.success) {
                    alert(result.message);
                    document.getElementById('addStaffModal').classList.remove('active');
                    addStaffForm.reset();
                    loadView('staff');
                } else alert('Eroare: ' + result.message);
            } catch (err) { console.error(err); }
        });
    }

    const bookSessionForm = document.getElementById('bookSessionForm');
    if(bookSessionForm) {
        bookSessionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(bookSessionForm);
            try {
                const response = { json: async () => ({success: true, status: 'success', message: 'Acțiune simulată cu succes (Mod Demo)'}) };
                const result = await response.json();
                if(result.success) {
                    alert(result.message);
                    document.getElementById('bookSessionModal').classList.remove('active');
                    bookSessionForm.reset();
                    if(window.staffCalendar) window.staffCalendar.refetchEvents();
                } else alert('Eroare: ' + result.message);
            } catch (err) { console.error(err); }
        });
    }
});

window.switchHRTab = function(tab) {
    document.querySelectorAll('.hr-tab').forEach(t => {
        t.style.borderBottom = 'none';
        t.style.color = 'var(--text-muted)';
    });
    const activeTab = window.event ? window.event.currentTarget : document.querySelector(`.hr-tab[onclick="switchHRTab('${tab}')"]`);
    if(activeTab) {
        activeTab.style.borderBottom = '2px solid #111827';
        activeTab.style.color = '#111827';
    }
    
    document.querySelectorAll('.hr-tab-content').forEach(c => c.style.display = 'none');
    const content = document.getElementById('hr-tab-' + tab);
    if(content) content.style.display = 'block';
    
    if(tab === 'payroll') window.calculatePayroll();
};

window.calculatePayroll = function() {
    const baseGrossEl = document.getElementById('baseGross');
    if(!baseGrossEl) return;
    
    const baseGross = parseFloat(baseGrossEl.value) || 0;
    const ptRate = parseFloat(document.getElementById('ptRate').value) || 0;
    const ptSessions = document.getElementById('ptSessions') ? (parseFloat(document.getElementById('ptSessions').value) || 0) : 0;
    const bonus = parseFloat(document.getElementById('bonus').value) || 0;
    const penalty = parseFloat(document.getElementById('penalty').value) || 0;
    
    const commission = ptRate * ptSessions;
    const totalGross = baseGross + commission + bonus - penalty;
    
    // RO Taxes
    const cas = totalGross * 0.25;
    const cass = totalGross * 0.10;
    const imp = (totalGross - cas - cass) * 0.10;
    const net = totalGross - cas - cass - imp;
    
    document.getElementById('calcGross').innerText = Math.max(0, totalGross).toFixed(0);
    document.getElementById('calcCas').innerText = Math.max(0, cas).toFixed(0);
    document.getElementById('calcCass').innerText = Math.max(0, cass).toFixed(0);
    document.getElementById('calcImp').innerText = Math.max(0, imp).toFixed(0);
    document.getElementById('calcNet').innerText = Math.max(0, net).toFixed(0) + ' RON';
};

window.loadView = async function(view, navElement = null) {
    const contentArea = document.getElementById('app-content');
    const pageTitle = document.getElementById('pageTitle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (navElement) {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => el.classList.remove('active'));
        navElement.classList.add('active');
        pageTitle.innerText = navElement.querySelector('span').innerText;

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        }
    }

    contentArea.classList.add('view-leave');
    
    setTimeout(async () => {
        try {
            const response = await fetch(`views/${view}.html`);
            const html = await response.text();
            
            contentArea.innerHTML = html;
            contentArea.classList.remove('view-leave');
            contentArea.classList.add('view-enter');
            
            setTimeout(() => contentArea.classList.remove('view-enter'), 300);
            
            bindViewEvents(view);
            
        } catch (e) {
            console.error("Failed to load view", e);
            contentArea.innerHTML = '<div style="color:red; text-align:center;">Failed to load content.</div>';
            contentArea.classList.remove('view-leave');
        }
    }, 200);
};

function bindViewEvents(view) {
    // Re-bind modal open buttons that are dynamic
    if (view === 'staff') {
        setupModal('addStaffModal', 'openAddStaffModal', 'closeStaffModalBtn', 'cancelStaffModalBtn');
        setupModal('bookSessionModal', 'openBookSessionModal', 'closeBookSessionModalBtn', 'cancelBookSessionModalBtn');
    }

    // Dropdowns
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);
        
        newToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if(menu !== newToggle.nextElementSibling) menu.classList.remove('show');
            });
            newToggle.nextElementSibling.classList.toggle('show');
        });
    });

    window.onclick = function(event) {
        if (!event.target.matches('.dropdown-toggle')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
        }
    };

    // Profile Buttons (Members and Billing)
    document.querySelectorAll('.profile-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const id = btn.dataset.id;
            const contentDiv = document.getElementById('profileModalContent');
            const modal = document.getElementById('profileModal');
            
            contentDiv.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fa-solid fa-circle-notch fa-spin fa-2x"></i></div>';
            modal.classList.add('active');
            
            try {
                const res = await fetch(`api/get_member_profile.php?id=${id}`);
                const data = await res.json();
                if(data.success) {
                    contentDiv.innerHTML = data.html;
                    const saveNotesBtn = document.getElementById('saveNotesBtn');
                    if(saveNotesBtn) {
                        saveNotesBtn.addEventListener('click', async () => {
                            const notes = document.getElementById('adminNotesText').value;
                            const fd = new FormData();
                            fd.append('id', id);
                            fd.append('notes', notes);
                            const noteRes = await fetch('api/update_notes.php', { method: 'POST', body: fd });
                            const noteData = await noteRes.json();
                            saveNotesBtn.innerText = noteData.message;
                            setTimeout(() => saveNotesBtn.innerText = 'Salvează Note', 2000);
                        });
                    }
                }
            } catch (e) { console.error(e); }
        });
    });

    if (view === 'dashboard') {
        const ctxElement = document.getElementById('ppChart');
        if (ctxElement && window.Chart) {
            try {
                const chartDataRaw = JSON.parse(ctxElement.dataset.chart);
                const labels = [...chartDataRaw.labels].reverse();
                const dataRev = [...chartDataRaw.revenue].reverse();
                const ctx = ctxElement.getContext('2d');
                
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, '#3b82f6');
                gradient.addColorStop(1, '#93c5fd');

                if (window.myRevenueChart) window.myRevenueChart.destroy();

                window.myRevenueChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Încasări (RON)',
                            data: dataRev,
                            backgroundColor: gradient,
                            borderRadius: 4,
                            barPercentage: 0.6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: '#111827',
                                padding: 12,
                                callbacks: { label: (ctx) => ctx.parsed.y + ' RON' }
                            }
                        },
                        scales: {
                            y: { display: false, beginAtZero: true },
                            x: { grid: { display: false }, border: { display: false } }
                        }
                    }
                });
            } catch(e) { console.error(e); }
        }
    }

    if (view === 'members') {
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('membersSort');
        const tableBody = document.getElementById('membersTableBody');
        let rows = Array.from(document.querySelectorAll('.member-row'));

        function applyMembersFilterAndSort() {
            const term = searchInput ? searchInput.value.toLowerCase() : '';
            const sortBy = sortSelect ? sortSelect.value : 'name-asc';

            rows.forEach(row => {
                row.style.display = row.dataset.search.includes(term) ? '' : 'none';
            });

            const visibleRows = rows.filter(row => row.style.display !== 'none');
            visibleRows.sort((a, b) => {
                if(sortBy.startsWith('name')) {
                    return sortBy === 'name-asc' ? a.dataset.name.localeCompare(b.dataset.name) : b.dataset.name.localeCompare(a.dataset.name);
                } else {
                    return sortBy === 'plan-asc' ? a.dataset.plan.localeCompare(b.dataset.plan) : b.dataset.plan.localeCompare(a.dataset.plan);
                }
            });

            if(tableBody) visibleRows.forEach(row => tableBody.appendChild(row));
        }

        if(searchInput) searchInput.addEventListener('input', applyMembersFilterAndSort);
        if(sortSelect) sortSelect.addEventListener('change', applyMembersFilterAndSort);

        // Individual Actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                let confirmMsg = '';
                let payload = { action, member_id: id };

                if (action === 'cancel') confirmMsg = 'Anulezi abonamentul?';
                else if (action === 'renew') confirmMsg = 'Reînnoiești abonamentul cu același pachet?';
                else if (action === 'upgrade') {
                    const memberships = JSON.parse(btn.dataset.memberships);
                    let options = memberships.map(m => `${m.id}: ${m.name} (${m.price} RON)`).join('\n');
                    const chosen = prompt(`Alege ID-ul noului abonament:\n${options}`);
                    if (!chosen) return;
                    payload.new_membership_id = chosen;
                    confirmMsg = 'Faci upgrade la noul abonament?';
                }

                if(confirm(confirmMsg)) {
                    try {
                        const response = { json: async () => ({success: true, status: 'success', message: 'Acțiune simulată cu succes (Mod Demo)'}) };
                        const result = await response.json();
                        alert(result.message);
                        if(result.success) loadView('members');
                    } catch(err) { console.error(err); }
                }
            });
        });

        // Bulk Actions
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        const memberCheckboxes = document.querySelectorAll('.member-checkbox');
        const bulkToolbar = document.getElementById('bulkActionsToolbar');
        const bulkCount = document.getElementById('bulkCount');
        const clearBulkBtn = document.getElementById('clearBulkSelection');
        const bulkCancelBtn = document.querySelector('.bulk-action-btn[data-action="cancel"]');

        function updateBulkToolbar() {
            if(!bulkToolbar) return;
            const selected = document.querySelectorAll('.member-checkbox:checked');
            if(selected.length > 0) {
                bulkToolbar.style.display = 'flex';
                if(bulkCount) bulkCount.innerText = selected.length;
                if(selectAllCheckbox) selectAllCheckbox.checked = selected.length === memberCheckboxes.length;
            } else {
                bulkToolbar.style.display = 'none';
                if(selectAllCheckbox) selectAllCheckbox.checked = false;
            }
        }

        if(selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                memberCheckboxes.forEach(cb => {
                    if(cb.closest('tr').style.display !== 'none') cb.checked = isChecked;
                });
                updateBulkToolbar();
            });
        }

        memberCheckboxes.forEach(cb => cb.addEventListener('change', updateBulkToolbar));

        if(clearBulkBtn) {
            clearBulkBtn.addEventListener('click', () => {
                memberCheckboxes.forEach(cb => cb.checked = false);
                updateBulkToolbar();
            });
        }

        if(bulkCancelBtn) {
            bulkCancelBtn.addEventListener('click', async () => {
                const selected = document.querySelectorAll('.member-checkbox:checked');
                if(selected.length === 0) return;
                
                if(confirm('Ești sigur că vrei să anulezi abonamentele pentru cei ' + selected.length + ' membri selectați?')) {
                    const ids = Array.from(selected).map(cb => cb.value);
                    try {
                        bulkCancelBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Se procesează...';
                        const response = { json: async () => ({success: true, status: 'success', message: 'Acțiune simulată cu succes (Mod Demo)'}) };
                        const result = await response.json();
                        alert(result.message);
                        if(result.success) loadView('members');
                        else bulkCancelBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Anulează Abonamentele';
                    } catch(err) {
                        console.error(err);
                        alert('Eroare.');
                        bulkCancelBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Anulează Abonamentele';
                    }
                }
            });
        }
    }

    if (view === 'billing') {
        const sortSelect = document.getElementById('billingSort');
        const filterSelect = document.getElementById('billingFilter');
        const tableBody = document.getElementById('billingTableBody');
        const rows = Array.from(document.querySelectorAll('.billing-row'));

        function applyBillingSortAndFilter() {
            const sortBy = sortSelect.value;
            const filterBy = filterSelect.value;

            rows.forEach(row => {
                row.style.display = (filterBy === 'all' || row.dataset.status === filterBy) ? '' : 'none';
            });

            const visibleRows = rows.filter(row => row.style.display !== 'none');
            visibleRows.sort((a, b) => {
                if (sortBy.startsWith('date')) {
                    const dateA = new Date(a.dataset.date).getTime();
                    const dateB = new Date(b.dataset.date).getTime();
                    return sortBy === 'date-desc' ? dateB - dateA : dateA - dateB;
                } else {
                    return sortBy === 'name-asc' ? a.dataset.name.localeCompare(b.dataset.name) : b.dataset.name.localeCompare(a.dataset.name);
                }
            });

            if(tableBody) visibleRows.forEach(row => tableBody.appendChild(row));
        }

        if(sortSelect) sortSelect.addEventListener('change', applyBillingSortAndFilter);
        if(filterSelect) filterSelect.addEventListener('change', applyBillingSortAndFilter);
    }

    if (view === 'staff') {
        const autoPayBtn = document.getElementById('autoPayBtn');
        if (autoPayBtn) {
            autoPayBtn.addEventListener('click', async () => {
                if(confirm('Ești sigur că vrei să generezi și să plătești automat toate salariile neplătite pe luna curentă?')) {
                    const originalText = autoPayBtn.innerHTML;
                    autoPayBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Se procesează...';
                    try {
                        const res = await fetch('api/pay_all_salaries.php', { method: 'POST' });
                        const data = await res.json();
                        alert(data.message);
                        loadView('staff');
                    } catch(err) {
                        console.error(err);
                        alert('Eroare de rețea.');
                        autoPayBtn.innerHTML = originalText;
                    }
                }
            });
        }

        const calendarEl = document.getElementById('staffCalendar');
        if (calendarEl && window.FullCalendar) {
            const calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'timeGridWeek',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                slotMinTime: '06:00:00',
                slotMaxTime: '22:00:00',
                events: 'api/get_appointments.php',
                height: 600,
                allDaySlot: false
            });
            calendar.render();
            window.staffCalendar = calendar;
        }

        const profileBtns = document.querySelectorAll('.profile-btn-staff');
        profileBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                const contentDiv = document.getElementById('profileModalContent');
                const modal = document.getElementById('profileModal');
                
                contentDiv.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fa-solid fa-circle-notch fa-spin fa-2x"></i></div>';
                modal.classList.add('active');
                
                try {
                    const res = await fetch(`api/get_staff_profile.php?id=${id}`);
                    const data = await res.json();
                    if(data.success) {
                        contentDiv.innerHTML = data.html;
                        const submitBtn = document.getElementById('submitPayrollBtn');
                        if(submitBtn) {
                            submitBtn.addEventListener('click', async () => {
                                if(!confirm('Înregistrezi plata acestui salariu?')) return;
                                const form = document.getElementById('payrollForm');
                                const fd = new FormData(form);
                                try {
                                    submitBtn.innerText = "Se procesează...";
                                    const res = await fetch('api/pay_salary.php', { method: 'POST', body: fd });
                                    const result = await res.json();
                                    alert(result.message);
                                    if(result.success) {
                                        loadView('staff');
                                        modal.classList.remove('active');
                                    } else {
                                        submitBtn.innerHTML = '<i class="fa-solid fa-money-check-dollar"></i> Înregistrează Plata';
                                    }
                                } catch(err) { console.error(err); }
                            });
                        }
                    }
                } catch (err) { console.error(err); }
            });
        });

        const searchInput = document.getElementById('staffSearchInput');
        const sortSelect = document.getElementById('staffSort');
        const tableBody = document.getElementById('staffTableBody');
        let rows = Array.from(document.querySelectorAll('.staff-row'));

        function applyStaffFilterAndSort() {
            const term = searchInput ? searchInput.value.toLowerCase() : '';
            const sortBy = sortSelect ? sortSelect.value : 'name-asc';
            rows.forEach(row => {
                row.style.display = row.dataset.search.includes(term) ? '' : 'none';
            });
            const visibleRows = rows.filter(row => row.style.display !== 'none');
            visibleRows.sort((a, b) => {
                if(sortBy.startsWith('name')) {
                    return sortBy === 'name-asc' ? a.dataset.name.localeCompare(b.dataset.name) : b.dataset.name.localeCompare(a.dataset.name);
                } else if(sortBy.startsWith('salary')) {
                    return sortBy === 'salary-asc' ? parseFloat(a.dataset.salary) - parseFloat(b.dataset.salary) : parseFloat(b.dataset.salary) - parseFloat(a.dataset.salary);
                }
                return 0;
            });
            if(tableBody) visibleRows.forEach(row => tableBody.appendChild(row));
        }

        if(searchInput) searchInput.addEventListener('input', applyStaffFilterAndSort);
        if(sortSelect) sortSelect.addEventListener('change', applyStaffFilterAndSort);
    }
}

function setupModal(modalId, openBtnId, closeBtnId, cancelBtnId) {
    const modal = document.getElementById(modalId);
    if(!modal) return;
    
    if(openBtnId) {
        const openBtn = document.getElementById(openBtnId);
        if(openBtn) {
            openBtn.onclick = () => modal.classList.add('active');
        }
    }
    
    if(closeBtnId) {
        const closeBtn = document.getElementById(closeBtnId);
        if(closeBtn) {
            closeBtn.onclick = () => modal.classList.remove('active');
        }
    }
    
    if(cancelBtnId) {
        const cancelBtn = document.getElementById(cancelBtnId);
        if(cancelBtn) {
            cancelBtn.onclick = () => modal.classList.remove('active');
        }
    }

    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove('active');
    };
}
