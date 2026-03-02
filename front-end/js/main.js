// Polyfill for localStorage when opening via file:// protocol
try {
    const test = window.localStorage.getItem('test');
} catch (e) {
    console.warn("localStorage is disabled (likely file:// protocol). Using in-memory fallback.");
    const memoryStorage = {};
    Object.defineProperty(window, 'localStorage', {
        value: {
            getItem: (key) => memoryStorage[key] || null,
            setItem: (key, value) => { memoryStorage[key] = String(value); },
            removeItem: (key) => { delete memoryStorage[key]; },
            clear: () => { Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]); }
        },
        configurable: true,
        enumerable: true,
        writable: true
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Top-Level Data Defs
    const defaultSchools = ['SUPMTI', 'EST', 'FST'];
    const defaultCourses = [
        'Modélisation statistique et analyse des données',
        'IA et data sciences appliquées aux projets informatique',
        'D.P.T. de communication en anglais',
        'D.P.T. de communication en français',
        'Développement et contrôle de logiciels',
        'Systèmes embarqués avancé et internet des objets',
        'Projet d’initiation',
        'Techniques de rédaction de projet',
        'Réseaux de communication intelligents'
    ];

    const profSubjectsMap = {
        'Mme A. BENGHABRIT': ['Modélisation statistique et analyse des données'],
        'Mr S. KRIOUILE': ['IA et data sciences appliquées aux projets informatique'],
        'Mr K. BENKADDOUR': ['D.P.T. de communication en anglais'],
        'Mme Z. BOULAGROUH': ['D.P.T. de communication en français'],
        'Mr Z. AIT EL MOUDEN': ['Développement et contrôle de logiciels'],
        'Mme H. EL KHOUKHI': ['Systèmes embarqués avancé et internet des objets', "Projet d'initiation"],
        'Mr N. BOUJIA': ['Techniques de rédaction de projet'],
        'Mme H. YAZIDI': ['Réseaux de communication intelligents']
    };

    //Login
    const loginForm = document.getElementById('login-form');
    const loginOverlay = document.getElementById('login-overlay');
    const appContainer = document.querySelector('.app-container');
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const welcomeRole = document.getElementById('welcome-role');
    const welcomeIcon = document.getElementById('welcome-icon');

    if (!loginForm) {
        console.error('Critical Error: Login form not found in DOM');
    } else {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Get username to determine role
            const usernameInput = loginForm.querySelector('input[type="text"]');
            const username = usernameInput ? usernameInput.value.toLowerCase() : '';

            // Determine Role
            let role = "Administrator";
            let roleIconClass = "bx bxs-user-badge";

            if (username.includes('prof')) {
                role = "Professor";
                roleIconClass = "bx bxs-graduation";
            }

            // Fake authentication animation
            const btn = loginForm.querySelector('button');
            const originalBtnText = btn.innerHTML;
            btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i>';
            btn.disabled = true;

            setTimeout(() => {
                // 1. Fade out Login
                loginOverlay.style.opacity = '0';

                setTimeout(() => {
                    loginOverlay.style.display = 'none';

                    // 2. Setup Welcome Screen
                    // Translate Role and Welcome Message
                    const lang = localStorage.getItem('language') || 'en';
                    welcomeRole.textContent = getTranslatedRole(role, lang);

                    const welcomeText = lang === 'fr' ? 'Bon retour,' : 'Welcome Back,';
                    document.getElementById('welcome-title').textContent = welcomeText;

                    welcomeIcon.className = roleIconClass;

                    // 3. Show Welcome Overlay
                    welcomeOverlay.style.display = 'flex';

                    // 4. Wait for animation sequence (approx 2s)
                    setTimeout(() => {
                        // 5. Fade out Welcome
                        welcomeOverlay.style.opacity = '0';
                        welcomeOverlay.style.transition = 'opacity 0.5s ease';

                        setTimeout(() => {
                            welcomeOverlay.style.display = 'none';

                            // 6. Show Dashboard
                            appContainer.style.display = 'flex';
                            appContainer.offsetHeight; // Reflow
                            appContainer.style.opacity = '1';

                            // Animate Stats
                            animateStats();
                        }, 500);
                    }, 500); // Duration of welcome screen check

                }, 500); // Duration of login fade out

            }, 1000); // Simulate network request
        });
    }



    // --- Welcome Animation Translation helper ---
    function getTranslatedRole(role, lang) {
        if (lang === 'fr') {
            if (role === 'Administrator') return 'Administrateur';
            if (role === 'Professor') return 'Professeur';
        }
        return role;
    }

    function animateStats() {
        const stats = document.querySelectorAll('.stat-value');
        stats.forEach(stat => {
            const value = stat.textContent;
            // Extract number and suffix (e.g., "12.5k" -> 12.5, "k")
            const match = value.match(/([\d\.]+)([kK\+]?)/);
            if (!match) return;

            const num = parseFloat(match[1]);
            const suffix = match[2] || '';
            const isFloat = match[1].includes('.');

            let start = 0;
            const duration = 2000;
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out quart
                const ease = 1 - Math.pow(1 - progress, 4);

                const current = start + (num - start) * ease;

                if (isFloat) {
                    stat.textContent = current.toFixed(1) + suffix;
                } else {
                    stat.textContent = Math.floor(current) + suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    stat.textContent = value; // Ensure final value is exact
                }
            }

            requestAnimationFrame(update);
        });
    }

    //Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');
    const pageHeader = document.getElementById('page-header');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));

            // Add active class to clicked
            item.classList.add('active');

            // Show target section
            const targetId = item.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);

            // Handle cases where section might not exist yet (placeholders)
            if (targetSection) {
                targetSection.classList.add('active');
                // Update header title
                if (pageHeader) pageHeader.textContent = item.textContent;
            } else {
                // Fallback for demo
                const dashboard = document.getElementById('dashboard');
                if (dashboard) dashboard.classList.add('active');
            }
        });
    });

    // --- PDF Scanner Logic ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const scanLine = document.getElementById('scan-line');
    const scanResult = document.getElementById('scan-result');
    const saveBtn = document.getElementById('btn-save-pdf');
    const recentUploadsGrid = document.getElementById('recent-uploads-grid');
    let currentFile = null;

    if (dropZone && fileInput) {
        // Trigger file input click
        dropZone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });
    }

    if (dropZone) {
        // Drag and Drop events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--primary)';
            dropZone.style.background = 'rgba(99, 102, 241, 0.1)';
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--border-glass)';
            dropZone.style.background = 'var(--bg-glass)';
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--border-glass)';
            dropZone.style.background = 'var(--bg-glass)';

            if (e.dataTransfer.files.length > 0) {
                handleFile(e.dataTransfer.files[0]);
            }
        });
    }

    async function handleFile(file) {
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file.');
            return;
        }
        currentFile = file;

        // Start Animation
        scanResult.style.display = 'none';
        scanLine.classList.add('active');

        // Fetch from backend
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://127.0.0.1:5000/extract', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            scanLine.classList.remove('active');
            showResults(data.metadata || {});

        } catch (err) {
            console.error(err);
            scanLine.classList.remove('active');
            showToast('Extraction failed: ' + err.message);
        }
    }

    function showResults(metadata) {
        // Populate extracted data
        document.getElementById('res-title').textContent = metadata.title || 'Unknown';
        document.getElementById('res-module').textContent = metadata.module || 'Unknown';
        document.getElementById('res-prof').textContent = metadata.prof || 'Unknown';
        document.getElementById('res-year').textContent = metadata.year || 'Unknown';

        const typeSelect = document.getElementById('res-type');
        if (typeSelect && metadata.type) {
            // Find option that matches type (e.g "Exam" -> value="Exam")
            const typeLower = metadata.type.toLowerCase();
            for (let i = 0; i < typeSelect.options.length; i++) {
                if (typeSelect.options[i].value.toLowerCase() === typeLower) {
                    typeSelect.selectedIndex = i;
                    break;
                }
            }
        }

        scanResult.style.display = 'block';
        scanResult.scrollIntoView({ behavior: 'smooth' });
    }

    // Save PDF Logic
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            // Collect data
            const title = document.getElementById('res-title').textContent;
            const module = document.getElementById('res-module').textContent;
            const prof = document.getElementById('res-prof').textContent;
            const type = document.getElementById('res-type').value;
            const scannedBy = "Admin"; // Default for now

            // Create new scan object
            const newScan = {
                id: Date.now(),
                title: title,
                professor: prof,
                course: module,
                type: type,
                scannedBy: scannedBy,
                date: new Date().toLocaleDateString()
            };

            // Add to recent scans
            const recentScans = JSON.parse(localStorage.getItem('recentScans')) || [];
            recentScans.unshift(newScan); // Add to top
            localStorage.setItem('recentScans', JSON.stringify(recentScans));

            // Update Dashboard
            renderRecentScans();

            // Also add to category grid (legacy support if needed, or just for visual feedback)
            if (typeof addToRecentUploads === 'function') {
                addToRecentUploads(title, type);
            }

            showToast('Document saved and classified!');

            // Reset scanner
            scanResult.style.display = 'none';
            fileInput.value = '';
        });
    }

    // --- Recent Scans Table Logic ---
    function renderRecentScans() {
        const tbody = document.getElementById('recent-scans-body');
        if (!tbody) return;

        let recentScans = JSON.parse(localStorage.getItem('recentScans')) || [];

        // Dynamic Filters Population
        const typeFilter = document.getElementById('filter-type');
        const profFilter = document.getElementById('filter-prof');
        const dateFilter = document.getElementById('filter-date');
        const searchInput = document.getElementById('search-scans');

        // Extract unique values
        const types = [...new Set(recentScans.map(s => s.type).filter(Boolean))];
        const profs = [...new Set(recentScans.map(s => s.professor).filter(Boolean))];
        const dates = [...new Set(recentScans.map(s => s.date).filter(Boolean))];

        // Helper to update options while keeping currently selected value
        const updateSelectOptions = (selectElem, optionsList, defaultLabel) => {
            if (!selectElem) return;
            const currentVal = selectElem.value;
            selectElem.innerHTML = `<option value="">${defaultLabel}</option>`;
            optionsList.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                if (opt === currentVal) option.selected = true;
                selectElem.appendChild(option);
            });
        };

        updateSelectOptions(typeFilter, types, 'Type');
        updateSelectOptions(profFilter, profs, 'Professor');
        updateSelectOptions(dateFilter, dates, 'Date');

        // Apply Filters
        if (typeFilter && typeFilter.value) {
            recentScans = recentScans.filter(s => s.type === typeFilter.value);
        }
        if (profFilter && profFilter.value) {
            recentScans = recentScans.filter(s => s.professor === profFilter.value);
        }
        if (dateFilter && dateFilter.value) {
            recentScans = recentScans.filter(s => s.date === dateFilter.value);
        }
        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            recentScans = recentScans.filter(s =>
                (s.title && s.title.toLowerCase().includes(searchTerm)) ||
                (s.course && s.course.toLowerCase().includes(searchTerm)) ||
                (s.professor && s.professor.toLowerCase().includes(searchTerm))
            );
        }

        tbody.innerHTML = ''; // Clear current rows

        if (recentScans.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No documents found.</td></tr>';
            return;
        }

        recentScans.forEach(scan => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid var(--border-light)';
            row.innerHTML = `
                <td style="padding: 1rem;"><input type="checkbox"></td>
                <td style="padding: 1rem; font-weight: 600;">${scan.title}</td>
                <td style="padding: 1rem;">${scan.professor}</td>
                <td style="padding: 1rem;">${scan.course}</td>
                <td style="padding: 1rem;">${scan.type}</td>
                <td style="padding: 1rem;"><span style="background: #D1FAE5; color: #065F46; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem;">${scan.scannedBy}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    // Bind event listeners for filters
    const filterRefs = ['filter-type', 'filter-prof', 'filter-date'];
    filterRefs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', renderRecentScans);
    });
    const searchScansEl = document.getElementById('search-scans');
    if (searchScansEl) searchScansEl.addEventListener('input', renderRecentScans);



    // --- Render Professors Grid Dynamically with CRUD ---
    // Initialize Professors Data in LocalStorage if empty
    let storedProfs = JSON.parse(localStorage.getItem('professorsData')) || [];

    // Force reset of mock data to apply the new order and roles if it matches old default
    // Or just check if specific changes are needed. 
    // For simplicity, if we detect the old order or roles, we might want to re-init, 
    // but to be safe for a "reset" we can just re-define the default block.
    // However, if the user already has data in localStorage, this won't run.
    // We might need to force update for this session or ask user to clear. 
    // Since this is a dev task, I will force update the list if the first item is not Kriouile.

    const defaultProfs = [
        { id: 2, name: 'Mr S. KRIOUILE', role: 'Professor', email: 's.kriouile@supmti.edu', subject: 'IA et data sciences appliquées aux projets informatique', filiere: 'Ingénierie des Systèmes Informatiques', year: '5ème année' },
        { id: 1, name: 'Mme A. BENGHABRIT', role: 'Professor', email: 'a.benghabrit@supmti.edu', subject: 'Modélisation statistique et analyse des données', filiere: 'Ingénierie des Systèmes Informatiques', year: '4ème année' },
        { id: 3, name: 'Mr K. BENKADDOUR', role: 'Professor', email: 'k.benkaddour@supmti.edu', subject: 'D.P.T. de communication en anglais', filiere: 'Ingénierie des Systèmes Informatiques', year: '1ère année' },
        { id: 4, name: 'Mme Z. BOULAGROUH', role: 'Professor', email: 'z.boulagrouh@supmti.edu', subject: 'D.P.T. de communication en français', filiere: 'Ingénierie des Systèmes Informatiques', year: '2ème année' },
        { id: 5, name: 'Mr Z. AIT EL MOUDEN', role: 'Professor', email: 'z.aitelmouden@supmti.edu', subject: 'Développement et contrôle de logiciels', filiere: 'Ingénierie des Systèmes Informatiques', year: '3ème année' },
        { id: 6, name: 'Mme H. EL KHOUKHI', role: 'Professor', email: 'h.elkhoukhi@supmti.edu', subject: 'Systèmes embarqués avancé et internet des objets, Projet d’initiation', filiere: 'Ingénierie des Systèmes Informatiques', year: '4ème année' },
        { id: 7, name: 'Mr N. BOUJIA', role: 'Professor', email: 'n.boujia@supmti.edu', subject: 'Techniques de rédaction de projet', filiere: 'Ingénierie des Systèmes Informatiques', year: '1ère année' },
        { id: 8, name: 'Mme H. YAZIDI', role: 'Professor', email: 'h.yazidi@supmti.edu', subject: 'Réseaux de communication intelligents', filiere: 'Ingénierie des Systèmes Informatiques', year: '3ème année' }
    ];

    if (storedProfs.length === 0 || storedProfs[0].name !== 'Mr S. KRIOUILE' || storedProfs.length < 8) {
        storedProfs = defaultProfs;
        localStorage.setItem('professorsData', JSON.stringify(storedProfs));
    }

    function renderProfessors() {
        const grid = document.querySelector('.professors-grid');
        if (!grid) return;

        grid.innerHTML = ''; // Clear existing
        const profs = JSON.parse(localStorage.getItem('professorsData')) || [];

        profs.forEach(p => {
            const initials = p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            // Highlight Logic
            // const isMainProf = p.name.includes('KRIOUILE');
            // const mainProfClass = isMainProf ? 'main-prof' : '';

            const card = document.createElement('div');
            card.className = `stat-card`; // Removed ${mainProfClass}
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.alignItems = 'center';
            card.style.textAlign = 'center';
            card.style.padding = '2rem';
            card.style.position = 'relative'; // For absolute positioning of actions

            card.innerHTML = `
                <div class="card-actions">
                    <button class="action-btn" onclick="window.editProfessor(${p.id})"><i class='bx bx-edit-alt'></i></button>
                    <button class="action-btn delete" onclick="window.deleteProfessor(${p.id})"><i class='bx bx-trash'></i></button>
                </div>

                <div class="avatar large"
                    style="width: 80px; height: 80px; font-size: 2rem; margin-bottom: 1rem; background: var(--primary); color: white;">
                    ${initials}</div>
                <h3 style="margin-bottom: 0.2rem; font-size: 1.1rem;">${p.name}</h3>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.2rem;">${p.subject || 'Computer Science Dept.'}</p>
                <p style="color: var(--primary); font-size: 0.85rem; font-weight: 500; margin-bottom: 1rem;">${p.filiere || 'N/A'} - ${p.year || 'N/A'}</p>

                <div class="roles-tags"
                    style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin-bottom: 1.5rem;">
                    <span style="background: #E0E7FF; color: #3730A3; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 500;">${p.role}</span>
                </div>

                <div style="width: 100%; border-top: 1px solid var(--border-light); padding-top: 1rem; margin-top: auto;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.5rem; justify-content: center;">
                        <i class='bx bx-envelope'></i> ${p.email}
                    </div>
                </div>

                <button class="btn btn-secondary" style="width: 100%; margin-top: 1rem;" onclick="window.viewProfessorProfile(${p.id})">View Profile</button>
            `;
            grid.appendChild(card);
        });
    }

    // Expose functions to window explicitly
    window.deleteProfessor = function (id) {
        if (confirm('Are you sure you want to delete this professor?')) {
            let profs = JSON.parse(localStorage.getItem('professorsData')) || [];
            profs = profs.filter(p => p.id !== id);
            localStorage.setItem('professorsData', JSON.stringify(profs));
            renderProfessors();
        }
    };

    window.editProfessor = function (id) {
        const profs = JSON.parse(localStorage.getItem('professorsData')) || [];
        const p = profs.find(prof => prof.id === id);
        if (p) {
            document.getElementById('prof-id').value = p.id;
            document.getElementById('prof-name').value = p.name;
            document.getElementById('prof-email').value = p.email;
            document.getElementById('prof-role').value = p.role;
            document.getElementById('prof-subject').value = p.subject || '';
            document.getElementById('prof-filiere').value = p.filiere || '';
            document.getElementById('prof-year').value = p.year || '';
            document.getElementById('prof-modal-title').textContent = 'Edit Professor';

            const modal = document.getElementById('professor-modal');
            modal.classList.add('active');
        }
    };

    // Wire up Add Button and Modal reliably
    const btnAddProf = document.getElementById('btn-add-prof');
    if (btnAddProf) {
        btnAddProf.addEventListener('click', () => {
            openAddProfModal();
        });
    }

    function openAddProfModal() {
        document.getElementById('professor-form').reset();
        document.getElementById('prof-id').value = ''; // Mode Add
        document.getElementById('prof-modal-title').textContent = 'Add Professor';
        document.getElementById('professor-modal').classList.add('active');
    }

    // Close Modal Logic
    const closeProfModalBtn = document.querySelector('.close-prof-modal');
    const closeProfModalBtnSec = document.querySelector('.close-prof-modal-btn');
    const profModal = document.getElementById('professor-modal');

    if (closeProfModalBtn) closeProfModalBtn.onclick = () => profModal.classList.remove('active');
    if (closeProfModalBtnSec) closeProfModalBtnSec.onclick = () => profModal.classList.remove('active');

    // Form Submit
    const profForm = document.getElementById('professor-form');
    if (profForm) {
        profForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('prof-id').value;
            const name = document.getElementById('prof-name').value;
            const email = document.getElementById('prof-email').value;
            const role = document.getElementById('prof-role').value;
            const subject = document.getElementById('prof-subject').value;
            const filiere = document.getElementById('prof-filiere').value;
            const year = document.getElementById('prof-year').value;

            let profs = JSON.parse(localStorage.getItem('professorsData')) || [];

            if (id) {
                // Edit
                const index = profs.findIndex(p => p.id == id);
                if (index > -1) {
                    profs[index] = { ...profs[index], name, email, role, subject, filiere, year };
                }
            } else {
                // Add
                const newId = profs.length > 0 ? Math.max(...profs.map(p => p.id)) + 1 : 1;
                profs.push({ id: newId, name, email, role, subject, filiere, year });
            }

            localStorage.setItem('professorsData', JSON.stringify(profs));
            renderProfessors();
            profModal.classList.remove('active');
        });
    }

    // Initial Render
    renderRecentScans();
    renderProfessors();



    // --- Language Translation Logic ---
    const translations = {
        en: {
            welcome_back: "Welcome Back",
            username_placeholder: "Username",
            password_placeholder: "Password",
            login_btn: "LOGIN",
            forgot_password: "FORGOT YOUR PASSWORD?",
            nav_dashboard: "Dashboard",
            nav_scanner: "Scanner",
            nav_professors: "Professors",
            nav_documents: "Documents",
            nav_library: "Library",
            nav_settings: "Settings",
            header_dashboard: "Dashboard",
            recent_activity_title: "Past Scanned Documents",
            stat_total_docs: "Total Documents",
            stat_docs_growth: "+12% this month",
            stat_active_profs: "Active Professors",
            stat_profs_active: "Currently Active",
            stat_courses: "Courses",
            stat_semester: "This Semester",
            stat_storage: "Storage Used",
            filter_type: "Type",
            filter_professor: "Professor",
            filter_date: "Date",
            search_placeholder: "Search",
            col_doc_name: "Document Name",
            col_professor: "Professor",
            col_course: "Course",
            col_type: "Type",
            col_scanned_by: "Scanned By",
            scanner_title: "PDF Scanner",
            scanner_subtitle: "Upload a document to automatically classify it.",
            drag_drop_title: "Drag & Drop PDF here",
            drag_drop_subtitle: "or click to browse",
            analysis_complete: "Analysis Complete",
            res_title: "Title",
            res_module: "Module",
            res_prof: "Professor",
            res_year: "Year",
            res_doc_type: "Document Type",
            type_exam: "Exam Paper",
            type_attestation: "Attestation",
            type_course: "Course Note",
            type_lab: "Lab Report",
            btn_save_classify: "Auto Classify & Save",
            profs_title: "Professors Directory",
            profs_subtitle: "Faculty members and their roles.",
            btn_add_prof: "Add Professor",
            dept_cs: "Computer Science Dept.",
            role_head: "Head of Department",
            role_prof: "Professor",
            btn_view_profile: "View Profile",
            docs_title: "Documents Center",
            docs_subtitle: "Request attestations or search for exam papers.",
            cat_att_scolaire: "Attestation Scolaire",
            desc_att_scolaire: "Proof of enrollment",
            cat_att_reussite: "Attestation de Réussite",
            desc_att_reussite: "Proof of success",
            cat_exams: "Exams & Papers",
            desc_exams: "Past exams and resources",
            filter_title: "Filter Documents",
            btn_search_docs: "Search Documents",
            results_title: "Results",
            results_placeholder: "Select a category and apply filters to see results.",
            library_title: "Library & Resources",
            library_content: "Content for Library view...",
            settings_title: "Settings",
            settings_subtitle: "Manage your preferences and account settings",
            set_account: "Account",
            set_prof_vis: "Profile Visibility",
            set_prof_vis_desc: "Make your profile visible to other students",
            set_2fa: "Two-Factor Authentication",
            set_2fa_desc: "Add an extra layer of security",
            set_appearance: "Appearance",
            set_dark_mode: "Dark Mode",
            set_dark_mode_desc: "Switch between light and dark themes",
            set_compact: "Compact View",
            set_compact_desc: "Show more content on the screen",
            set_notif: "Notifications",
            set_email_notif: "Email Notifications",
            set_email_notif_desc: "Receive daily summaries",
            set_push_notif: "Push Notifications",
            set_push_notif_desc: "Get real-time updates",
            set_branding: "School",
            set_custom_logo: "Custom Logo",
            set_custom_logo_desc: "Upload a logo to replace the text",
            btn_upload: "Upload",
            btn_remove: "Remove",
            modal_edit_profile: "Edit Profile",
            label_fullname: "Full Name",
            label_email: "Email",
            label_role: "Role",
            btn_cancel: "Cancel",
            btn_save_changes: "Save Changes",
            exam_gen_title: "Exam Generator",
            label_upload_pdf: "Upload PDF for Extraction",
            label_questions: "Questions (Paste/Edit content)",
            btn_download_pdf: "Download PDF",
            label_note: "Note :"
        },
        fr: {
            welcome_back: "Bon retour",
            username_placeholder: "Nom d'utilisateur",
            password_placeholder: "Mot de passe",
            login_btn: "CONNEXION",
            forgot_password: "MOT DE PASSE OUBLIÉ ?",
            nav_dashboard: "Tableau de bord",
            nav_scanner: "Scanner",
            nav_professors: "Professeurs",
            nav_documents: "Documents",
            nav_library: "Bibliothèque",
            nav_settings: "Paramètres",
            header_dashboard: "Tableau de bord",
            recent_activity_title: "Documents Scannés (Historique)",
            stat_total_docs: "Total Documents",
            stat_docs_growth: "+12% ce mois-ci",
            stat_active_profs: "Professeurs Actifs",
            stat_profs_active: "Actuellement Actifs",
            stat_courses: "Cours",
            stat_semester: "Ce Semestre",
            stat_storage: "Stockage Utilisé",
            filter_type: "Type",
            filter_professor: "Professeur",
            filter_date: "Date",
            search_placeholder: "Rechercher",
            col_doc_name: "Nom du Document",
            col_professor: "Professeur",
            col_course: "Cours",
            col_type: "Type",
            col_scanned_by: "Scanné Par",
            scanner_title: "Scanner PDF",
            scanner_subtitle: "Téléchargez un document pour le classer automatiquement.",
            drag_drop_title: "Glisser-déposer PDF ici",
            drag_drop_subtitle: "ou cliquez pour parcourir",
            analysis_complete: "Analyse Terminée",
            res_title: "Titre",
            res_module: "Module",
            res_prof: "Professeur",
            res_year: "Année",
            res_doc_type: "Type de Document",
            type_exam: "Examen",
            type_attestation: "Attestation",
            type_course: "Note de Cours",
            type_lab: "Rapport de Labo",
            btn_save_classify: "Classer & Enregistrer",
            profs_title: "Annuaire des Professeurs",
            profs_subtitle: "Membres du corps professoral et leurs rôles.",
            btn_add_prof: "Ajouter Professeur",
            dept_cs: "Dépt. Informatique",
            role_head: "Chef de Département",
            role_prof: "Professeur",
            btn_view_profile: "Voir Profil",
            docs_title: "Centre de Documents",
            docs_subtitle: "Demander des attestations ou rechercher des examens.",
            cat_att_scolaire: "Attestation Scolaire",
            desc_att_scolaire: "Preuve d'inscription",
            cat_att_reussite: "Attestation de Réussite",
            desc_att_reussite: "Preuve de réussite",
            cat_exams: "Examens & Devoirs",
            desc_exams: "Anciens examens et ressources",
            filter_title: "Filtrer Documents",
            btn_search_docs: "Rechercher Documents",
            results_title: "Résultats",
            results_placeholder: "Sélectionnez une catégorie et appliquez des filtres pour voir les résultats.",
            library_title: "Bibliothèque & Ressources",
            library_content: "Contenu pour la vue Bibliothèque...",
            settings_title: "Paramètres",
            settings_subtitle: "Gérer vos préférences et paramètres de compte",
            set_account: "Compte",
            set_prof_vis: "Visibilité du Profil",
            set_prof_vis_desc: "Rendre votre profil visible aux autres étudiants",
            set_2fa: "Authentification à Deux Facteurs",
            set_2fa_desc: "Ajouter une couche de sécurité supplémentaire",
            set_appearance: "Apparence",
            set_dark_mode: "Mode Sombre",
            set_dark_mode_desc: "Basculer entre thèmes clair et sombre",
            set_compact: "Vue Compacte",
            set_compact_desc: "Afficher plus de contenu à l'écran",
            set_notif: "Notifications",
            set_email_notif: "Notifications Email",
            set_email_notif_desc: "Recevoir des résumés quotidiens",
            set_push_notif: "Notifications Push",
            set_push_notif_desc: "Obtenir des mises à jour en temps réel",
            set_branding: "École",
            set_custom_logo: "Logo Personnalisé",
            set_custom_logo_desc: "Télécharger un logo pour remplacer le texte",
            btn_upload: "Télécharger",
            btn_remove: "Supprimer",
            modal_edit_profile: "Modifier Profil",
            label_fullname: "Nom Complet",
            label_email: "Email",
            label_role: "Rôle",
            btn_cancel: "Annuler",
            btn_save_changes: "Enregistrer Changements",
            exam_gen_title: "Générateur d'Examen",
            label_upload_pdf: "Télécharger un PDF",
            label_questions: "Questions (Coller/Modifier le contenu)",
            btn_download_pdf: "Télécharger le PDF",
            label_note: "Note :"
        }
    };

    const langToggle = document.getElementById('lang-toggle');
    let currentLang = localStorage.getItem('language') || 'en';

    function updateLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('language', lang);

        if (langToggle) langToggle.textContent = lang.toUpperCase();

        // Update login toggle text
        const loginLangText = document.getElementById('login-lang-text');
        if (loginLangText) loginLangText.textContent = lang.toUpperCase();

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translations[lang][key]) {
                element.placeholder = translations[lang][key];
            }
        });
    }

    if (langToggle) {
        langToggle.style.cursor = 'pointer';
        langToggle.addEventListener('click', () => {
            const newLang = currentLang === 'en' ? 'fr' : 'en';
            updateLanguage(newLang);
        });
    }

    const loginLangToggle = document.getElementById('login-lang-toggle');
    if (loginLangToggle) {
        loginLangToggle.addEventListener('click', () => {
            const newLang = currentLang === 'en' ? 'fr' : 'en';
            updateLanguage(newLang);
        });
    }

    // Initialize Language
    updateLanguage(currentLang);

    // --- Toast Notification ---
    function showToast(message) {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-message');

        toastMsg.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // --- Welcome Animation Translation helper ---
    function getTranslatedRole(role, lang) {
        if (lang === 'fr') {
            if (role === 'Administrator') return 'Administrateur';
            if (role === 'Professor') return 'Professeur';
        }
        return role;
    }

    // --- Fake Data for Categories ---
    const categoriesGrid = document.querySelector('.categories-grid');
    // if (categoriesGrid) ... (Code removed to keep only 3 categories)

    // --- Profile Logic ---
    const profileBtn = document.getElementById('profile-btn');
    const profileModal = document.getElementById('profile-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
    const profileEditForm = document.getElementById('profile-edit-form');
    const navAvatar = document.getElementById('nav-avatar');
    const modalAvatar = document.getElementById('modal-avatar');
    const profileNameInput = document.getElementById('profile-name');

    // Open Modal
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            profileModal.classList.add('active');
        });
    }

    // Close Modal
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            profileModal.classList.remove('active');
        });
    });

    document.querySelectorAll('.close-view-prof-modal, .close-view-prof-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('view-prof-modal').classList.remove('active');
        });
    });

    // Handle generic modal closures on background click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // Close on outside click
    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            profileModal.classList.remove('active');
        }
    });

    // Handle Profile Update
    if (profileEditForm) {
        profileEditForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Update Name
            const newName = profileNameInput.value;
            const initials = newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            // Update UI
            navAvatar.textContent = initials;
            modalAvatar.textContent = initials;

            showToast('Profile updated successfully');
            profileModal.classList.remove('active');
        });
    }

    // --- Settings Logic ---
    const settingsIconBtn = document.getElementById('settings-icon-btn');


    // --- Exam Generator Logic ---
    // 1. Live Preview
    const examInputs = {
        course: document.getElementById('exam-course'),
        prof: document.getElementById('exam-prof'),
        date: document.getElementById('exam-date'),
        duration: document.getElementById('exam-duration'),
        type: document.getElementById('exam-type-select'),
        content: document.getElementById('exam-content'),
        filiere: document.getElementById('exam-filiere')
    };

    // Initialize Exam Generator Professor and Course Dropdowns
    if (examInputs.prof && examInputs.course) {
        // Populate Professor
        Object.keys(profSubjectsMap).forEach(prof => {
            const opt = document.createElement('option');
            opt.value = prof;
            opt.textContent = prof;
            examInputs.prof.appendChild(opt);
        });

        // Add Event Listener to dynamically filter the Course dropdown
        examInputs.prof.addEventListener('change', (e) => {
            const selectedProf = e.target.value;
            // Clear current course options except the first placeholder
            examInputs.course.innerHTML = '<option value="" disabled selected>Select Course</option>';

            if (selectedProf && profSubjectsMap[selectedProf]) {
                profSubjectsMap[selectedProf].forEach(sub => {
                    const opt = document.createElement('option');
                    opt.value = sub;
                    opt.textContent = sub;
                    examInputs.course.appendChild(opt);
                });
            } else {
                // Failsafe: Populate all if no prof selected (should not happen due to disabled option)
                const allSubjects = new Set();
                Object.values(profSubjectsMap).forEach(subjects => subjects.forEach(s => allSubjects.add(s)));
                allSubjects.forEach(sub => {
                    const opt = document.createElement('option');
                    opt.value = sub;
                    opt.textContent = sub;
                    examInputs.course.appendChild(opt);
                });
            }
        });

        // Trigger change to populate courses on load
        examInputs.prof.dispatchEvent(new Event('change'));
    }

    const previewElements = {
        logoLeftCont: document.getElementById('header-logo-left-container'),
        logoLeftImg: document.getElementById('header-logo-left-img'),
        logoCenterCont: document.getElementById('header-logo-center-container'),
        logoCenterDefault: document.getElementById('default-center-logo'),
        logoCenterImg: document.getElementById('header-logo-center-img'),
        logoRightCont: document.getElementById('header-logo-right-container'),
        logoRightDefault: document.getElementById('default-right-text'),
        logoRightImg: document.getElementById('header-logo-right-img'),
        filiere: document.getElementById('preview-filiere'),
        date: document.getElementById('preview-date'),
        duration: document.getElementById('preview-duration'),
        title: document.getElementById('preview-title')
    };

    const logoToggle = document.getElementById('exam-include-logo');
    if (logoToggle) {
        logoToggle.addEventListener('change', (e) => {
            const visibilityStr = e.target.checked ? 'visible' : 'hidden';
            if (previewElements.logoLeftCont) previewElements.logoLeftCont.style.visibility = visibilityStr;
            if (previewElements.logoCenterCont) previewElements.logoCenterCont.style.visibility = visibilityStr;
            if (previewElements.logoRightCont) previewElements.logoRightCont.style.visibility = visibilityStr;
        });
    }

    // Generic Event Listener for all inputs
    Object.keys(examInputs).forEach(key => {
        const input = examInputs[key];
        if (input) {
            input.addEventListener('input', () => {
                const val = input.value;

                // Map specific inputs to the new layout
                if (key === 'content') {
                    paginateExam(val);
                } else if (key === 'type' && previewElements.title) {
                    // Update title with exam type + course
                    const courseVal = examInputs.course ? examInputs.course.value : '';
                    previewElements.title.textContent = `${val || '...'} en ${courseVal || '...'}`;
                } else if (key === 'course' && previewElements.title) {
                    const typeVal = examInputs.type ? examInputs.type.value : '';
                    previewElements.title.textContent = `${typeVal || '...'} en ${val || '...'}`;
                } else if (key === 'prof') {
                    if (previewElements.prof) previewElements.prof.textContent = val || '...';
                    document.querySelectorAll('.footer-prof-name').forEach(el => el.textContent = val ? 'Prof. ' + val : '...');
                } else if (previewElements[key]) {
                    previewElements[key].textContent = val || '...';
                }

                // For Prof, School, etc. they might not be visible in this specific header template, 
                // but we keep the data bound just in case.
            });
        }
    });

    const A4_MAX_BODY_BOTTOM = 1030; // Max Y coordinate for content on an A4 page (1122px) before footer

    function paginateExam(text) {
        const container = document.getElementById('exam-pages-container');
        const firstPage = document.getElementById('exam-page-1');
        const firstBody = firstPage.querySelector('.exam-body');

        if (!container || !firstPage || !firstBody) return;

        // Reset first page content
        firstBody.innerHTML = '';

        // Remove subsequent pages
        while (container.children.length > 1) {
            container.removeChild(container.lastChild);
        }

        const profSelect = document.getElementById('exam-prof');
        const profName = profSelect && profSelect.value ? profSelect.value : '';
        const profText = profName ? 'Prof. ' + profName : '';

        // Ensure we have a footer in the first page if it doesn't exist
        if (!firstPage.querySelector('.exam-footer')) {
            const footer = document.createElement('div');
            footer.className = 'exam-footer';
            footer.innerHTML = `<span class="footer-prof-name" contenteditable="true" spellcheck="false">${profText || '...'}</span><span class="page-number">Page 1/1</span>`;
            firstPage.appendChild(footer);
        } else {
            const firstFooterProf = firstPage.querySelector('.footer-prof-name');
            if (firstFooterProf) {
                firstFooterProf.setAttribute('contenteditable', 'true');
                firstFooterProf.setAttribute('spellcheck', 'false');
                if (!firstFooterProf.textContent.trim() || firstFooterProf.textContent.trim() === 'Nom du Professeur') {
                    firstFooterProf.textContent = profText || '...';
                }
            }
        }

        let currentPage = firstPage;
        let currentBody = firstBody;
        let pageNum = 1;

        function createNewPage() {
            pageNum++;
            currentPage = document.createElement('div');
            currentPage.className = 'a4-paper current-page';
            currentPage.id = `exam-page-${pageNum}`;

            currentBody = document.createElement('div');
            currentBody.className = 'exam-body';
            currentBody.style.marginTop = '20mm'; // padding top since there's no header

            const footer = document.createElement('div');
            footer.className = 'exam-footer';
            footer.innerHTML = `<span class="footer-prof-name" contenteditable="true" spellcheck="false">${profText || '...'}</span><span class="page-number">Page ${pageNum}</span>`;

            currentPage.appendChild(currentBody);
            currentPage.appendChild(footer);
            container.appendChild(currentPage);
        }

        const paragraphs = text.split('\n');

        for (let i = 0; i < paragraphs.length; i++) {
            const pText = paragraphs[i].trim();
            if (!pText) {
                currentBody.appendChild(document.createElement('br'));
                continue;
            }

            let p = document.createElement('p');
            currentBody.appendChild(p);

            const words = pText.split(' ');
            let currentLineText = [];

            for (let j = 0; j < words.length; j++) {
                currentLineText.push(words[j]);
                p.innerHTML = currentLineText.join(' ');

                // Check if page overflows
                if (currentBody.offsetTop + currentBody.offsetHeight > A4_MAX_BODY_BOTTOM) {
                    // Prevent infinite loop if a single word is incredibly tall
                    if (currentLineText.length === 1) {
                        createNewPage();
                        p = document.createElement('p');
                        currentBody.appendChild(p);
                        p.innerHTML = currentLineText.join(' ');
                        continue;
                    }

                    // Remove the word that caused overflow
                    currentLineText.pop();
                    p.innerHTML = currentLineText.join(' ');

                    // Create new page for the remaining text
                    createNewPage();
                    p = document.createElement('p');
                    currentBody.appendChild(p);

                    // Start next line with the overflowed word
                    currentLineText = [words[j]];
                    p.innerHTML = currentLineText.join(' ');
                }
            }
        }

        // Update total pages in footers
        const allFooters = container.querySelectorAll('.page-number');
        allFooters.forEach((f, idx) => {
            f.textContent = `Page ${idx + 1}/${pageNum}`;
        });
    }

    // 3. API Upload for Extraction
    const examUploadInput = document.getElementById('exam-upload-input');
    const uploadStatus = document.getElementById('upload-status');

    if (examUploadInput) {
        examUploadInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Pre-fill the filename input with the uploaded file's name (without extension if possible)
            const filenameInput = document.getElementById('exam-filename');
            if (filenameInput) {
                let baseName = file.name;
                if (baseName.toLowerCase().endsWith('.pdf')) {
                    baseName = baseName.substring(0, baseName.length - 4);
                }
                filenameInput.value = baseName;
            }

            // Show loading
            if (uploadStatus) {
                uploadStatus.textContent = 'Uploading and extracting text...';
                uploadStatus.style.color = 'var(--warning)';
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                // Adjust port if your Flask runs elsewhere
                const response = await fetch('http://127.0.0.1:5000/extract', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Server returned ${response.status} `);
                }

                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                // Success
                examInputs.content.value = data.text;
                // Trigger input event to update preview
                examInputs.content.dispatchEvent(new Event('input'));

                if (uploadStatus) {
                    uploadStatus.textContent = 'Extraction complete!';
                    uploadStatus.style.color = 'var(--success)';
                }
                showToast('Text extracted successfully!');

            } catch (err) {
                console.error(err);
                if (uploadStatus) {
                    uploadStatus.textContent = 'Error: ' + err.message;
                    uploadStatus.style.color = 'var(--danger)';
                }
                showToast('Extraction failed');
            }
        });
    }

    // 2. PDF Download
    const downloadPdfBtn = document.getElementById('btn-download-pdf');

    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            const element = document.getElementById('exam-pages-container'); // Wrapper with all pages
            const filenameInput = document.getElementById('exam-filename');
            let exportFilename = 'exam_paper.pdf';
            if (filenameInput && filenameInput.value.trim() !== '') {
                exportFilename = filenameInput.value.trim();
                if (!exportFilename.toLowerCase().endsWith('.pdf')) {
                    exportFilename += '.pdf';
                }
            }

            const opt = {
                margin: 0,
                filename: exportFilename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 }, // Higher scale for better quality
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css', 'legacy'] } // Rely purely on CSS page breaks to avoid the initial blank page
            };

            // Loading state
            const originalText = downloadPdfBtn.innerHTML;
            downloadPdfBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Generating...';
            downloadPdfBtn.disabled = true;

            // Generate
            document.body.classList.add('pdf-exporting');
            html2pdf().set(opt).from(element).save().then(() => {
                // Reset button
                document.body.classList.remove('pdf-exporting');
                downloadPdfBtn.innerHTML = originalText;
                downloadPdfBtn.disabled = false;
                showToast('Exam PDF Downloaded successfully!');
            }).catch(err => {
                document.body.classList.remove('pdf-exporting');
                downloadPdfBtn.innerHTML = originalText;
                downloadPdfBtn.disabled = false;
                console.error(err);
                showToast('Exam PDF Download Failed');
            });
        });
    }
    const settingsNavItem = document.querySelector('[data-target="settings"]');

    function openSettings() {
        // Trigger click on nav item to handle class switching
        if (settingsNavItem) {
            settingsNavItem.click();
        }
    }

    if (settingsIconBtn) {
        settingsIconBtn.addEventListener('click', openSettings);
    }

    // Settings Toggles
    const toggles = document.querySelectorAll('.switch input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const settingName = e.target.closest('.settings-item').querySelector('h4').textContent;
            const status = e.target.checked ? 'enabled' : 'disabled';
            showToast(`${settingName} ${status} `);

            // Theme Toggle Specific Logic
            if (e.target.id === 'theme-toggle') {
                // Here we would implement actual theme switching
                // For now just a toast
                if (e.target.checked) {
                    document.body.style.background = '#111827';
                    document.body.style.color = '#F9FAFB';
                    // This is a very basic dark mode simulation
                    // In a real app, we would toggle a class on the body
                } else {
                    document.body.style.background = '';
                    document.body.style.color = '';
                }
            }
        });
    });

    // --- Multi-Logo Management Logic ---
    let savedLogos = JSON.parse(localStorage.getItem('savedLogos')) || [];

    // UI Elements
    const logoModal = document.getElementById('logo-mgmt-modal');
    const closeLogoBtns = document.querySelectorAll('.close-logo-modal');
    const savedLogosList = document.getElementById('saved-logos-list');
    const newLogoName = document.getElementById('new-logo-name');
    const newLogoFile = document.getElementById('new-logo-file');
    const newLogoPreviewCont = document.getElementById('new-logo-preview-container');
    const newLogoPreviewImg = document.getElementById('new-logo-preview');
    const newLogoFilename = document.getElementById('new-logo-filename');
    const btnSaveNewLogo = document.getElementById('btn-save-new-logo');

    // (Moved selectLeft, selectCenter, selectRight inside populateLogoDropdowns)

    window.openLogoManagementModal = function () {
        renderSavedLogos();
        if (logoModal) logoModal.classList.add('active');
    };

    if (closeLogoBtns) {
        closeLogoBtns.forEach(btn => btn.addEventListener('click', () => {
            if (logoModal) logoModal.classList.remove('active');
        }));
    }

    // Handle File Selection for New Logo
    let currentNewLogoBase64 = null;
    if (newLogoFile) {
        newLogoFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                newLogoFilename.textContent = file.name;
                const reader = new FileReader();
                reader.onload = (e) => {
                    currentNewLogoBase64 = e.target.result;
                    newLogoPreviewImg.src = currentNewLogoBase64;
                    newLogoPreviewCont.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Save New Logo
    if (btnSaveNewLogo) {
        btnSaveNewLogo.addEventListener('click', () => {
            const name = newLogoName.value.trim();
            if (!name) {
                showToast('Please enter a name for the logo');
                return;
            }
            if (!currentNewLogoBase64) {
                showToast('Please select an image file');
                return;
            }

            const newLogo = {
                id: 'logo_' + Date.now(),
                name: name,
                data: currentNewLogoBase64
            };

            savedLogos.push(newLogo);
            localStorage.setItem('savedLogos', JSON.stringify(savedLogos));

            // Reset fields
            newLogoName.value = '';
            newLogoFile.value = '';
            currentNewLogoBase64 = null;
            newLogoPreviewCont.style.display = 'none';

            renderSavedLogos();
            populateLogoDropdowns();
            showToast('Logo saved successfully');
        });
    }

    function renderSavedLogos() {
        if (!savedLogosList) return;
        savedLogosList.innerHTML = '';
        savedLogos.forEach(logo => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${logo.data}" style="height: 30px; width: 40px; object-fit: contain; border: 1px solid #ccc; border-radius: 4px;">
                    <span>${logo.name}</span>
                </div>
                <button class="btn-icon-small" style="color: var(--danger);" onclick="deleteLogo('${logo.id}')">
                    <i class='bx bx-trash'></i>
                </button>
            `;
            savedLogosList.appendChild(li);
        });
    }

    window.deleteLogo = function (id) {
        if (confirm('Are you sure you want to delete this logo?')) {
            savedLogos = savedLogos.filter(l => l.id !== id);
            localStorage.setItem('savedLogos', JSON.stringify(savedLogos));
            renderSavedLogos();
            populateLogoDropdowns();
        }
    };

    function populateLogoDropdowns() {
        const selectLeft = document.getElementById('exam-logo-left');
        const selectCenter = document.getElementById('exam-logo-center');
        const selectRight = document.getElementById('exam-logo-right');

        if (!selectLeft || !selectCenter || !selectRight) return;

        // Save current selections
        const currLeft = selectLeft.value;
        const currCenter = selectCenter.value;
        const currRight = selectRight.value;

        // Build options
        let optionsHTML = savedLogos.map(l => `<option value="${l.id}">${l.name}</option>`).join('');

        selectLeft.innerHTML = `<option value="">Left: None</option>` + optionsHTML;
        selectCenter.innerHTML = `<option value="">Center: None</option><option value="default">Center: Default SUPMTI</option>` + optionsHTML;
        selectRight.innerHTML = `<option value="">Right: None</option><option value="default">Right: Default Text</option>` + optionsHTML;

        // Restore selections if they still exist
        if (currLeft && selectLeft.querySelector(`option[value="${currLeft}"]`)) selectLeft.value = currLeft;
        if (currCenter && selectCenter.querySelector(`option[value="${currCenter}"]`)) selectCenter.value = currCenter;
        if (currRight && selectRight.querySelector(`option[value="${currRight}"]`)) selectRight.value = currRight;

        // Trigger updates
        if (selectLeft) selectLeft.dispatchEvent(new Event('change', { bubbles: true }));
        if (selectCenter) selectCenter.dispatchEvent(new Event('change', { bubbles: true }));
        if (selectRight) selectRight.dispatchEvent(new Event('change', { bubbles: true }));
    }

    window.viewProfessorProfile = function (id) {
        const profs = JSON.parse(localStorage.getItem('professorsData')) || [];
        const p = profs.find(prof => prof.id === id);
        if (p) {
            const initials = p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            document.getElementById('view-prof-avatar').textContent = initials;
            document.getElementById('view-prof-name').textContent = p.name;
            document.getElementById('view-prof-role').textContent = p.role;
            document.getElementById('view-prof-email').textContent = p.email;
            document.getElementById('view-prof-subject').textContent = p.subject || 'Computer Science Dept.';
            document.getElementById('view-prof-filiere').textContent = p.filiere || 'N/A';
            document.getElementById('view-prof-year').textContent = p.year || 'N/A';

            document.getElementById('view-prof-modal').classList.add('active');
        }
    };

    // --- Filter Dropdowns ---
    // Handle Dropdown Changes to Update Preview
    function getLogoData(id) {
        const logo = savedLogos.find(l => l.id === id);
        return logo ? logo.data : null;
    }

    // Attach event listeners using delegation on the modal body, 
    // since the select elements are now dynamically scoped or exist in the modal.
    if (logoModal) {
        logoModal.addEventListener('change', (e) => {
            const val = e.target.value;

            if (e.target.id === 'exam-logo-left') {
                if (!val) {
                    previewElements.logoLeftImg.style.display = 'none';
                } else {
                    const data = getLogoData(val);
                    if (data) {
                        previewElements.logoLeftImg.src = data;
                        previewElements.logoLeftImg.style.display = 'block';
                    }
                }
            }

            if (e.target.id === 'exam-logo-center') {
                if (val === 'default') {
                    previewElements.logoCenterDefault.style.display = 'flex';
                    previewElements.logoCenterImg.style.display = 'none';
                } else if (!val) {
                    previewElements.logoCenterDefault.style.display = 'none';
                    previewElements.logoCenterImg.style.display = 'none';
                } else {
                    const data = getLogoData(val);
                    if (data) {
                        previewElements.logoCenterDefault.style.display = 'none';
                        previewElements.logoCenterImg.src = data;
                        previewElements.logoCenterImg.style.display = 'block';
                    }
                }
            }

            if (e.target.id === 'exam-logo-right') {
                if (val === 'default') {
                    previewElements.logoRightDefault.style.display = 'block';
                    previewElements.logoRightImg.style.display = 'none';
                } else if (!val) {
                    previewElements.logoRightDefault.style.display = 'none';
                    previewElements.logoRightImg.style.display = 'none';
                } else {
                    const data = getLogoData(val);
                    if (data) {
                        previewElements.logoRightDefault.style.display = 'none';
                        previewElements.logoRightImg.src = data;
                        previewElements.logoRightImg.style.display = 'block';
                    }
                }
            }
        });
    }

    // Initial populate
    populateLogoDropdowns();
    populateExamDropdowns();

    function populateExamDropdowns() {
        const profSelect = document.getElementById('exam-prof');
        const courseSelect = document.getElementById('exam-course');

        // Professors logic
        if (profSelect) {
            profSelect.innerHTML = '<option value="" disabled selected>Select Professor</option>';
            const profs = JSON.parse(localStorage.getItem('professorsData')) || [];
            if (profs.length === 0) {
                // Fallback default mock
                const defaultProfs = ['Mr S. KRIOUILE', 'Mme A. BENGHABRIT', 'Mr K. BENKADDOUR', 'Mme Z. BOULAGROUH', 'Mr Z. AIT EL MOUDEN', 'Mme H. EL KHOUKHI', 'Mr N. BOUJIA', 'Mme H. YAZIDI'];
                defaultProfs.forEach(p => {
                    const opt = document.createElement('option'); opt.value = p; opt.textContent = p; profSelect.appendChild(opt);
                });
            } else {
                profs.forEach(p => {
                    const opt = document.createElement('option'); opt.value = p.name; opt.textContent = p.name; profSelect.appendChild(opt);
                });
            }
        }

        // Courses logic
        if (courseSelect) {
            courseSelect.innerHTML = '<option value="" disabled selected>Select Course</option>';
            const courses = JSON.parse(localStorage.getItem('coursesData')) || [
                'Modélisation statistique et analyse des données',
                'IA et data sciences appliquées aux projets informatique',
                'D.P.T. de communication en anglais',
                'D.P.T. de communication en français',
                'Développement et contrôle de logiciels',
                'Systèmes embarqués avancé et internet des objets',
                'Projet d’initiation',
                'Techniques de rédaction de projet',
                'Réseaux de communication intelligents'
            ];
            courses.forEach(c => {
                const opt = document.createElement('option'); opt.value = c; opt.textContent = c; courseSelect.appendChild(opt);
            });
        }
    }

    // --- Documents Section Logic (Library) ---
    const searchYear = document.getElementById('search-year');
    const searchProf = document.getElementById('search-prof');
    const searchSubject = document.getElementById('search-subject');
    const docFilterForm = document.getElementById('doc-filter-form');
    const resultsContainer = document.getElementById('results-container');
    const docResultsArea = document.getElementById('doc-results');

    // Initialize Professor Dropdown
    if (searchProf) {
        Object.keys(profSubjectsMap).forEach(prof => {
            const opt = document.createElement('option');
            opt.value = prof;
            opt.textContent = prof;
            searchProf.appendChild(opt);
        });

        // Dependent Logic for Subjects
        searchProf.addEventListener('change', (e) => {
            const selectedProf = e.target.value;
            searchSubject.innerHTML = '<option value="">All</option>'; // Reset

            if (selectedProf && profSubjectsMap[selectedProf]) {
                profSubjectsMap[selectedProf].forEach(sub => {
                    const opt = document.createElement('option');
                    opt.value = sub;
                    opt.textContent = sub;
                    searchSubject.appendChild(opt);
                });
            } else if (!selectedProf) {
                // If "All" is selected for professor, populate all subjects
                const allSubjects = new Set();
                Object.values(profSubjectsMap).forEach(subjects => subjects.forEach(s => allSubjects.add(s)));
                allSubjects.forEach(sub => {
                    const opt = document.createElement('option');
                    opt.value = sub;
                    opt.textContent = sub;
                    searchSubject.appendChild(opt);
                });
            }
        });

        // Trigger once to populate all subjects initially
        searchProf.dispatchEvent(new Event('change'));
    }

    // Load Exams from LocalStorage
    function getLibraryExams() {
        return JSON.parse(localStorage.getItem('libraryExams')) || [];
    }

    function saveToLibrary(examData) {
        const exams = getLibraryExams();
        // Check if editing an existing exam
        const existingIndex = exams.findIndex(e => e.id === examData.id);
        if (existingIndex > -1) {
            exams[existingIndex] = examData;
        } else {
            // New exam, just add
            examData.id = 'exam_' + Date.now();
            exams.push(examData);
        }
        localStorage.setItem('libraryExams', JSON.stringify(exams));
    }

    // Save Exam Button Logic
    const btnSaveExam = document.getElementById('btn-save-exam');
    if (btnSaveExam) {
        btnSaveExam.addEventListener('click', () => {
            const currentExamId = examInputs.content.dataset.currentExamId || null;

            // Validation: Ensure all fields are selected
            const missingFields = [];
            if (!examInputs.course || !examInputs.course.value) missingFields.push("Course");
            if (!examInputs.filiere || !examInputs.filiere.value) missingFields.push("Filière");
            if (!examInputs.type || !examInputs.type.value) missingFields.push("Document Type");
            if (!examInputs.prof || !examInputs.prof.value) missingFields.push("Professor");
            if (!examInputs.date || !examInputs.date.value) missingFields.push("Year (A.U.)");
            if (!examInputs.duration || !examInputs.duration.value) missingFields.push("Duration");

            const errorDiv = document.getElementById('exam-save-error');

            if (missingFields.length > 0) {
                if (errorDiv) {
                    errorDiv.innerHTML = `<strong><i class='bx bx-error-circle'></i> Please select the following required fields before saving:</strong><ul style="margin-top: 0.5rem; margin-bottom: 0; padding-left: 1.5rem;"><li>${missingFields.join('</li><li>')}</li></ul>`;
                    errorDiv.style.display = 'block';
                }
                return;
            }

            if (errorDiv) {
                errorDiv.style.display = 'none';
            }

            // Generate a generic title if none exists
            const courseName = examInputs.course ? examInputs.course.value : 'Untitled Course';
            const typeName = examInputs.type ? examInputs.type.value : 'Exam';
            const defaultTitle = `${typeName} - ${courseName}`;

            const examData = {
                id: currentExamId,
                title: defaultTitle,
                course: examInputs.course ? examInputs.course.value : '',
                date: examInputs.date ? examInputs.date.value : '',
                duration: examInputs.duration ? examInputs.duration.value : '',
                type: examInputs.type ? examInputs.type.value : '',
                filiere: examInputs.filiere ? examInputs.filiere.value : '',
                prof: examInputs.prof ? examInputs.prof.value : '',
                content: examInputs.content ? examInputs.content.value : '',
                savedAt: new Date().toISOString()
            };

            saveToLibrary(examData);
            examInputs.content.dataset.currentExamId = examData.id; // Mark as saved/editing
            showToast('Exam saved to Library!');
        });
    }

    // Render Search Results
    function renderExams(exams) {
        if (!resultsContainer) return;

        if (exams.length === 0) {
            resultsContainer.innerHTML = `
                <i class='bx bx-file-blank' style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <p>No documents found matching your filters.</p>
            `;
            return;
        }

        let html = '<div style="display: grid; gap: 1rem;">';
        exams.forEach(exam => {
            const dateStr = new Date(exam.savedAt).toLocaleDateString();
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-light); text-align: left;">
                    <div>
                        <h4 style="margin-bottom: 0.5rem; color: var(--primary);">${exam.title || 'Untitled Exam'}</h4>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                            <span><i class='bx bx-book' ></i> ${exam.course || 'N/A'}</span>
                            <span><i class='bx bxs-graduation' ></i> ${exam.filiere || 'N/A'}</span>
                            <span><i class='bx bx-user' ></i> ${exam.prof || 'N/A'}</span>
                            <span><i class='bx bx-calendar' ></i> ${exam.date || 'N/A'}</span>
                            <span><i class='bx bx-time-five' ></i> ${exam.duration || 'N/A'}</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-direction: column;">
                        <button class="btn btn-primary btn-edit-exam" data-id="${exam.id}" style="padding: 0.5rem 1rem;"><i class='bx bx-edit'></i> Open</button>
                        <button class="btn btn-secondary btn-copy-exam" data-id="${exam.id}" style="padding: 0.5rem 1rem; border-color: var(--border-light); background: transparent; color: var(--text-main);"><i class='bx bx-copy'></i> Duplicate</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        resultsContainer.innerHTML = html;

        // Attach edit listeners
        document.querySelectorAll('.btn-edit-exam').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const examToEdit = getLibraryExams().find(x => x.id === id);
                if (examToEdit) {
                    loadExamIntoGenerator(examToEdit);
                }
            });
        });

        // Attach duplicate listeners
        document.querySelectorAll('.btn-copy-exam').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const examToCopy = getLibraryExams().find(x => x.id === id);
                if (examToCopy) {
                    const clonedExam = { ...examToCopy };
                    clonedExam.id = null; // Forces new ID creation in saveToLibrary
                    clonedExam.title = clonedExam.title + " (Copy)";
                    clonedExam.savedAt = new Date().toISOString();
                    saveToLibrary(clonedExam);

                    showToast('Exam Duplicated!');
                    // Refresh the current list by triggering search submit
                    if (docFilterForm) {
                        docFilterForm.dispatchEvent(new Event('submit', { cancelable: true }));
                    } else {
                        renderExams(getLibraryExams());
                    }
                }
            });
        });
    }

    // Load exam back into generator
    function loadExamIntoGenerator(exam) {
        // Switch view to generator
        document.querySelectorAll('.view-section').forEach(sec => sec.style.display = 'none');
        document.querySelectorAll('.nav-items li').forEach(li => li.classList.remove('active'));

        const genSection = document.getElementById('exam-generator');
        if (genSection) genSection.style.display = 'block';
        const genNavBtn = document.querySelector('a[onclick*="exam-generator"]');
        if (genNavBtn && genNavBtn.parentElement) {
            genNavBtn.parentElement.classList.add('active');
        }

        // Show editor, hide upload
        const uploadStage = document.getElementById('exam-upload-stage');
        const editorStage = document.getElementById('exam-editor-stage');
        if (uploadStage) uploadStage.style.display = 'none';
        if (editorStage) {
            editorStage.style.display = 'flex';
            editorStage.style.opacity = '1';
        }

        // Repopulate fields mapping directly to `examInputs`
        if (examInputs.course) examInputs.course.value = exam.course || '';
        if (examInputs.date) examInputs.date.value = exam.date || '2025/2026';
        if (examInputs.duration) examInputs.duration.value = exam.duration || '';
        if (examInputs.type) examInputs.type.value = exam.type || '';
        if (examInputs.filiere) examInputs.filiere.value = exam.filiere || '';
        if (examInputs.prof) examInputs.prof.value = exam.prof || '';
        if (examInputs.content) {
            examInputs.content.value = exam.content || '';
            examInputs.content.dataset.currentExamId = exam.id;
        }

        // Trigger input events to update preview
        Object.values(examInputs).forEach(input => {
            if (input && input.value) {
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true })); // For selects
            }
        });

        // Update smart back button
        const returnText = document.getElementById('btn-return-text');
        if (returnText) returnText.textContent = 'Back to Library';

        showToast('Exam loaded into Generator');
    }

    // Search Form Submit
    if (docFilterForm) {
        docFilterForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const selectedYear = searchYear.value;
            const selectedProf = searchProf.value;
            const selectedSubject = searchSubject.value;

            const allExams = getLibraryExams();
            const filteredExams = allExams.filter(exam => {
                const matchYear = selectedYear ? exam.date === selectedYear : true;
                const matchProf = selectedProf ? exam.prof === selectedProf : true;
                const matchSubj = selectedSubject ? exam.course === selectedSubject : true;
                return matchYear && matchProf && matchSubj;
            });

            renderExams(filteredExams);
            docResultsArea.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- Data Management Logic (Schools & Courses) ---

    function getData(type) {
        const key = type === 'school' ? 'schoolsData' : 'coursesData';
        const defaults = type === 'school' ? defaultSchools : defaultCourses;
        return JSON.parse(localStorage.getItem(key)) || defaults;
    }

    function saveData(type, data) {
        const key = type === 'school' ? 'schoolsData' : 'coursesData';
        localStorage.setItem(key, JSON.stringify(data));
        // Refresh dropdowns if viewing exam generator
        populateExamDropdowns();
    }

    // Modal Logic
    const dataModal = document.getElementById('data-modal');
    const closeDataModalBtn = document.querySelector('.close-data-modal');
    const dataList = document.getElementById('data-list');
    const newDataInput = document.getElementById('new-data-input');
    const addDataBtn = document.getElementById('add-data-btn');
    let currentDataType = null;

    window.openDataModal = function (type) {
        currentDataType = type;
        document.getElementById('data-modal-title').textContent = type === 'school' ? 'Manage Schools' : 'Manage Courses';
        newDataInput.value = '';
        renderDataList();
        if (dataModal) dataModal.style.display = 'flex';
    };

    if (closeDataModalBtn) {
        closeDataModalBtn.onclick = () => {
            if (dataModal) dataModal.style.display = 'none';
        };
    }

    function renderDataList() {
        if (!dataList || !currentDataType) return;
        dataList.innerHTML = '';
        const data = getData(currentDataType);

        data.forEach((item, index) => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.padding = '0.5rem';
            li.style.borderBottom = '1px solid var(--border-light)';

            li.innerHTML = `
                    < span > ${item}</span >
                        <button class="btn-icon-small" style="color: var(--danger);" onclick="deleteDataItem(${index})">
                            <i class='bx bx-trash'></i>
                        </button>
                `;
            dataList.appendChild(li);
        });
    }

    window.deleteDataItem = function (index) {
        const data = getData(currentDataType);
        data.splice(index, 1);
        saveData(currentDataType, data);
        renderDataList();
    };

    if (addDataBtn) {
        addDataBtn.addEventListener('click', () => {
            const val = newDataInput.value.trim();
            if (val) {
                const data = getData(currentDataType);
                if (!data.includes(val)) {
                    data.push(val);
                    saveData(currentDataType, data);
                    renderDataList();
                    newDataInput.value = '';
                } else {
                    showToast('Item already exists');
                }
            }
        });
    }


    // --- Exam Generator Integration ---

    // 1. Populate Dropdowns
    function populateExamDropdowns() {
        const courseSelect = document.getElementById('exam-course');
        const profSelect = document.getElementById('exam-prof');

        if (courseSelect) {
            const courses = getData('course');
            courseSelect.innerHTML = '<option value="" disabled selected>Select Course</option>';
            courses.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.textContent = c;
                courseSelect.appendChild(opt);
            });
        }

        if (profSelect) {
            const profs = JSON.parse(localStorage.getItem('professorsData')) || [];
            profSelect.innerHTML = '<option value="" disabled selected>Select Professor</option>';
            profs.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.name; // Use name for preview
                opt.textContent = p.name;
                profSelect.appendChild(opt);
            });
        }
    }

    // Call on load
    populateExamDropdowns();

    // 2. Initial Upload Logic
    const initialUploadInput = document.getElementById('initial-upload-input');
    const uploadStage = document.getElementById('exam-upload-stage');
    const editorStage = document.getElementById('exam-editor-stage');
    const examContent = document.getElementById('exam-content');
    const btnReturnPrev = document.getElementById('btn-return-prev');

    // Function to handle the actual upload and extraction
    async function handleExamUpload(file) {
        if (!file) return;

        // Show loading state (you might want a better UI for this)
        showToast('Uploading and processing...');

        // Add visual loading indicator to upload stage if visible
        const uploadBtn = document.querySelector('#exam-upload-stage .btn-primary');
        const originalText = uploadBtn ? uploadBtn.innerHTML : '';
        if (uploadBtn) {
            uploadBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Processing...';
            uploadBtn.disabled = true;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://127.0.0.1:5000/extract', {
                method: 'POST',
                body: formData
            });

            const data = await response.json().catch(() => ({ error: 'Failed to parse server response' }));

            if (!response.ok) {
                throw new Error(data.error || `Server responded with status ${response.status}`);
            }
            if (data.error) throw new Error(data.error);

            // Switch Views
            if (uploadStage) uploadStage.style.display = 'none';
            if (editorStage) {
                editorStage.style.display = 'flex';
                // Trigger resize or reflow if needed
            }

            // Success
            if (examContent) {
                examContent.dataset.currentExamId = ''; // Clear ID so back button knows it's a new upload
                examContent.value = data.text;
                // Dispatch input event to update preview
                // It's critical this happens AFTER display:flex so scrollHeight>0
                examContent.dispatchEvent(new Event('input'));
            }

            // Update smart back button
            const returnText = document.getElementById('btn-return-text');
            if (returnText) returnText.textContent = 'Back to Upload';

            showToast('Exam extracted successfully!');

        } catch (err) {
            console.error(err);
            showToast('Error: ' + err.message);
        } finally {
            if (uploadBtn) {
                uploadBtn.innerHTML = originalText;
                uploadBtn.disabled = false;
            }
        }
    }

    if (initialUploadInput) {
        initialUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            handleExamUpload(file);
        });
    }

    if (btnReturnPrev) {
        btnReturnPrev.addEventListener('click', () => {
            const isEditing = !!(examInputs.content && examInputs.content.dataset.currentExamId);
            if (isEditing) {
                // If editing a saved exam from the library, clicking back returns you there
                const docNav = document.querySelector('.nav-item[data-target="documents"]');
                if (docNav) docNav.click();
            } else {
                // If it's a new upload, clicking back discards the process and takes you to upload
                if (confirm('This will discard your current unsaved exam. Continue?')) {
                    if (editorStage) editorStage.style.display = 'none';
                    if (uploadStage) uploadStage.style.display = 'flex';
                    examInputs.content.value = '';
                }
            }
        });
    }

});
