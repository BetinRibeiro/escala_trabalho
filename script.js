// Data storage
        let employees = JSON.parse(localStorage.getItem('employees')) || [];
        let scales = JSON.parse(localStorage.getItem('scales')) || [];
        let currentDate = new Date();
        
        // DOM Elements
        const views = {
            dashboard: document.getElementById('dashboardView'),
            employees: document.getElementById('employeesView'),
            scales: document.getElementById('scalesView'),
            reports: document.getElementById('reportsView')
        };
        
        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            // Load initial data
            loadEmployees();
            loadScales();
            updateEmployeeFilter();
            updateCalendar();
            updateEmployeeSummary();
            
            // Set current month display
            updateMonthDisplay();
            
            // Event listeners for navigation
            document.getElementById('showDashboard').addEventListener('click', () => showView('dashboard'));
            document.getElementById('showEmployees').addEventListener('click', () => showView('employees'));
            document.getElementById('showScales').addEventListener('click', () => showView('scales'));
            document.getElementById('showReports').addEventListener('click', () => showView('reports'));
            
            // Calendar navigation
            document.getElementById('prevMonth').addEventListener('click', prevMonth);
            document.getElementById('nextMonth').addEventListener('click', nextMonth);
            
            // Employee form
            document.getElementById('addEmployeeBtn').addEventListener('click', () => openEmployeeModal());
            document.getElementById('employeeForm').addEventListener('submit', saveEmployee);
            document.getElementById('cancelEmployee').addEventListener('click', closeEmployeeModal);
            document.getElementById('closeEmployeeModal').addEventListener('click', closeEmployeeModal);
            
            // Scale form
            document.getElementById('addScaleBtn').addEventListener('click', () => openScaleModal());
            document.getElementById('scaleForm').addEventListener('submit', saveScale);
            document.getElementById('cancelScale').addEventListener('click', closeScaleModal);
            document.getElementById('closeScaleModal').addEventListener('click', closeScaleModal);
            
            // Day details
            document.getElementById('closeDayDetails').addEventListener('click', closeDayDetailsModal);
            document.getElementById('closeDayDetailsModal').addEventListener('click', closeDayDetailsModal);
            
            // Reports
            document.getElementById('generateMonthlyReport').addEventListener('click', generateMonthlyReport);
            document.getElementById('generateEmployeeReport').addEventListener('click', generateEmployeeReport);
            document.getElementById('exportPdfBtn').addEventListener('click', exportToPdf);
            
            // Filter
            document.getElementById('employeeFilter').addEventListener('change', filterScales);
            
            // Show dashboard by default
            showView('dashboard');
        });
        
        // View management
        function showView(viewName) {
            // Hide all views
            Object.values(views).forEach(view => view.classList.add('hidden'));
            
            // Show the selected view
            views[viewName].classList.remove('hidden');
            
            // Update button styles
            const buttons = document.querySelectorAll('#showDashboard, #showEmployees, #showScales, #showReports');
            buttons.forEach(btn => {
                btn.classList.remove('bg-blue-100', 'text-blue-700');
                btn.classList.add('hover:bg-gray-100');
            });
            
            // Highlight the active button
            document.getElementById(`show${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`)
                .classList.add('bg-blue-100', 'text-blue-700');
                document.getElementById(`show${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`)
                .classList.remove('hover:bg-gray-100');
        }
        
        // Employee functions
        function loadEmployees() {
            const employeesList = document.getElementById('employeesList');
            employeesList.innerHTML = '';
            
            if (employees.length === 0) {
                employeesList.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-500">Nenhum funcionário cadastrado</td></tr>';
                return;
            }
            
            employees.forEach(employee => {
                const row = document.createElement('tr');
                row.className = 'border-b hover:bg-gray-50';
                row.innerHTML = `
                    <td class="p-3">${employee.name}</td>
                    <td class="p-3">${employee.position}</td>
                    <td class="p-3">${employee.registration}</td>
                    <td class="p-3">
                        <button onclick="editEmployee('${employee.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteEmployee('${employee.id}')" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                employeesList.appendChild(row);
            });
        }
        
        function openEmployeeModal(employeeId = null) {
            const modal = document.getElementById('employeeModal');
            const form = document.getElementById('employeeForm');
            
            if (employeeId) {
                // Edit mode
                const employee = employees.find(e => e.id === employeeId);
                if (employee) {
                    document.getElementById('employeeModalTitle').textContent = 'Editar Funcionário';
                    document.getElementById('employeeId').value = employee.id;
                    document.getElementById('employeeName').value = employee.name;
                    document.getElementById('employeePosition').value = employee.position;
                    document.getElementById('employeeRegistration').value = employee.registration;
                    document.getElementById('employeeDepartment').value = employee.department || '';
                }
            } else {
                // Add mode
                document.getElementById('employeeModalTitle').textContent = 'Novo Funcionário';
                form.reset();
                document.getElementById('employeeId').value = '';
            }
            
            modal.classList.remove('hidden');
        }
        
        function closeEmployeeModal() {
            document.getElementById('employeeModal').classList.add('hidden');
        }
        
        function saveEmployee(e) {
            e.preventDefault();
            
            const id = document.getElementById('employeeId').value;
            const name = document.getElementById('employeeName').value;
            const position = document.getElementById('employeePosition').value;
            const registration = document.getElementById('employeeRegistration').value;
            const department = document.getElementById('employeeDepartment').value;
            
            if (id) {
                // Update existing employee
                const index = employees.findIndex(e => e.id === id);
                if (index !== -1) {
                    employees[index] = { id, name, position, registration, department };
                }
            } else {
                // Add new employee
                const newId = generateId();
                employees.push({ id: newId, name, position, registration, department });
            }
            
            saveData();
            loadEmployees();
            updateEmployeeFilter();
            closeEmployeeModal();
        }
        
        function editEmployee(id) {
            openEmployeeModal(id);
        }
        
        function deleteEmployee(id) {
            if (confirm('Tem certeza que deseja excluir este funcionário?')) {
                // Check if employee has scales
                const hasScales = scales.some(scale => scale.employeeId === id);
                
                if (hasScales) {
                    alert('Este funcionário possui escalas cadastradas. Não é possível excluir.');
                    return;
                }
                
                employees = employees.filter(e => e.id !== id);
                saveData();
                loadEmployees();
                updateEmployeeFilter();
            }
        }
        
        // Scale functions
        function loadScales() {
            const scalesList = document.getElementById('scalesList');
            scalesList.innerHTML = '';
            
            if (scales.length === 0) {
                scalesList.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-500">Nenhuma escala cadastrada</td></tr>';
                return;
            }
            
            scales.forEach(scale => {
                const employee = employees.find(e => e.id === scale.employeeId);
                const startDate = new Date(scale.startDate);
                const endDate = new Date(scale.endDate);
                
                // Calculate hours
                const diffMs = endDate - startDate;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                
                const row = document.createElement('tr');
                row.className = 'border-b hover:bg-gray-50';
                row.innerHTML = `
                    <td class="p-3">${employee ? employee.name : 'Funcionário não encontrado'}</td>
                    <td class="p-3">${formatDateTime(startDate)}</td>
                    <td class="p-3">${formatDateTime(endDate)}</td>
                    <td class="p-3">${diffHours}h ${diffMinutes}m</td>
                    <td class="p-3">
                        <button onclick="editScale('${scale.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteScale('${scale.id}')" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                scalesList.appendChild(row);
            });
        }
        
        function openScaleModal(scaleId = null) {
            const modal = document.getElementById('scaleModal');
            const form = document.getElementById('scaleForm');
            const employeeSelect = document.getElementById('scaleEmployee');
            
            // Populate employee dropdown
            employeeSelect.innerHTML = '<option value="">Selecione um funcionário</option>';
            employees.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee.id;
                option.textContent = employee.name;
                employeeSelect.appendChild(option);
            });
            
            if (scaleId) {
                // Edit mode
                const scale = scales.find(s => s.id === scaleId);
                if (scale) {
                    document.getElementById('scaleModalTitle').textContent = 'Editar Escala';
                    document.getElementById('scaleId').value = scale.id;
                    document.getElementById('scaleEmployee').value = scale.employeeId;
                    
                    // Format dates for datetime-local input
                    const startDate = new Date(scale.startDate);
                    const endDate = new Date(scale.endDate);
                    
                    document.getElementById('scaleStartDate').value = formatDateTimeForInput(startDate);
                    document.getElementById('scaleEndDate').value = formatDateTimeForInput(endDate);
                    document.getElementById('scaleDescription').value = scale.description || '';
                }
            } else {
                // Add mode
                document.getElementById('scaleModalTitle').textContent = 'Nova Escala';
                form.reset();
                document.getElementById('scaleId').value = '';
                
                // Set default start time to next hour
                const now = new Date();
                now.setHours(now.getHours() + 1, 0, 0, 0);
                document.getElementById('scaleStartDate').value = formatDateTimeForInput(now);
                
                // Set default end time to start time + 8 hours
                const endTime = new Date(now);
                endTime.setHours(endTime.getHours() + 8);
                document.getElementById('scaleEndDate').value = formatDateTimeForInput(endTime);
            }
            
            modal.classList.remove('hidden');
        }
        
        function closeScaleModal() {
            document.getElementById('scaleModal').classList.add('hidden');
        }
        
        function saveScale(e) {
            e.preventDefault();
            
            const id = document.getElementById('scaleId').value;
            const employeeId = document.getElementById('scaleEmployee').value;
            const startDate = document.getElementById('scaleStartDate').value;
            const endDate = document.getElementById('scaleEndDate').value;
            const description = document.getElementById('scaleDescription').value;
            
            // Validate dates
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (end <= start) {
                alert('A data final deve ser posterior à data inicial');
                return;
            }
            
            // Check for overlapping scales for this employee
            const overlapping = scales.some(scale => {
                if (id && scale.id === id) return false; // Skip current scale when editing
                
                const scaleStart = new Date(scale.startDate);
                const scaleEnd = new Date(scale.endDate);
                
                return scale.employeeId === employeeId && 
                       ((start >= scaleStart && start < scaleEnd) || 
                        (end > scaleStart && end <= scaleEnd) ||
                        (start <= scaleStart && end >= scaleEnd));
            });
            
            if (overlapping) {
                alert('Este funcionário já possui uma escala neste período');
                return;
            }
            
            if (id) {
                // Update existing scale
                const index = scales.findIndex(s => s.id === id);
                if (index !== -1) {
                    scales[index] = { 
                        id, 
                        employeeId, 
                        startDate: start.toISOString(), 
                        endDate: end.toISOString(), 
                        description 
                    };
                }
            } else {
                // Add new scale
                const newId = generateId();
                scales.push({ 
                    id: newId, 
                    employeeId, 
                    startDate: start.toISOString(), 
                    endDate: end.toISOString(), 
                    description 
                });
            }
            
            saveData();
            loadScales();
            updateCalendar();
            updateEmployeeSummary();
            closeScaleModal();
        }
        
        function editScale(id) {
            openScaleModal(id);
        }
        
        function deleteScale(id) {
            if (confirm('Tem certeza que deseja excluir esta escala?')) {
                scales = scales.filter(s => s.id !== id);
                saveData();
                loadScales();
                updateCalendar();
                updateEmployeeSummary();
            }
        }
        
        // Calendar functions
        function updateMonthDisplay() {
            const options = { month: 'long', year: 'numeric' };
            document.getElementById('currentMonth').textContent = 
                currentDate.toLocaleDateString('pt-BR', options);
        }
        
        function prevMonth() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            updateMonthDisplay();
            updateCalendar();
            updateEmployeeSummary();
        }
        
        function nextMonth() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            updateMonthDisplay();
            updateCalendar();
            updateEmployeeSummary();
        }
        
        function updateCalendar() {
            const calendar = document.getElementById('calendar');
            
            // Clear existing calendar days (keep headers)
            while (calendar.children.length > 7) {
                calendar.removeChild(calendar.lastChild);
            }
            
            // Get first and last day of month
            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            
            // Get day of week for first day (0 = Sunday, 6 = Saturday)
            const firstDayOfWeek = firstDay.getDay();
            
            // Add empty cells for days before the first day of the month
            for (let i = 0; i < firstDayOfWeek; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'calendar-day border p-1 bg-gray-50';
                calendar.appendChild(emptyCell);
            }
            
            // Add cells for each day of the month
            for (let day = 1; day <= lastDay.getDate(); day++) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dateString = date.toISOString().split('T')[0];
                
                // Check if this date has any scales
                const dayScales = scales.filter(scale => {
                    const scaleDate = new Date(scale.startDate).toISOString().split('T')[0];
                    return scaleDate === dateString;
                });
                
                const cell = document.createElement('div');
                cell.className = `calendar-day border p-1 ${dayScales.length > 0 ? 'has-scale' : ''}`;
                cell.innerHTML = `
                    <div class="text-right font-medium">${day}</div>
                    ${dayScales.length > 0 ? 
                        `<div class="text-xs mt-1 text-blue-600 cursor-pointer" onclick="showDayDetails('${dateString}')">
                            ${dayScales.length} escala${dayScales.length > 1 ? 's' : ''}
                        </div>` : 
                        ''}
                `;
                
                calendar.appendChild(cell);
            }
        }
        
        function showDayDetails(dateString) {
            const modal = document.getElementById('dayDetailsModal');
            const title = document.getElementById('dayDetailsTitle');
            const content = document.getElementById('dayDetailsContent');
            
            const date = new Date(dateString);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            title.textContent = date.toLocaleDateString('pt-BR', options);
            
            // Filter scales for this day
            const dayScales = scales.filter(scale => {
                const scaleDate = new Date(scale.startDate).toISOString().split('T')[0];
                return scaleDate === dateString;
            });
            
            if (dayScales.length === 0) {
                content.innerHTML = '<p class="text-gray-500">Nenhuma escala cadastrada para este dia.</p>';
            } else {
                let html = '<div class="space-y-4">';
                
                dayScales.forEach(scale => {
                    const employee = employees.find(e => e.id === scale.employeeId);
                    const startDate = new Date(scale.startDate);
                    const endDate = new Date(scale.endDate);
                    
                    // Calculate duration
                    const diffMs = endDate - startDate;
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    
                    html += `
                        <div class="border-b pb-3">
                            <div class="flex justify-between items-start">
                                <h4 class="font-medium">${employee ? employee.name : 'Funcionário não encontrado'}</h4>
                                <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    ${diffHours}h ${diffMinutes}m
                                </span>
                            </div>
                            <div class="text-sm text-gray-600 mt-1">
                                ${formatDateTime(startDate)} - ${formatDateTime(endDate)}
                            </div>
                            ${scale.description ? `<p class="text-sm mt-2">${scale.description}</p>` : ''}
                        </div>
                    `;
                });
                
                html += '</div>';
                content.innerHTML = html;
            }
            
            modal.classList.remove('hidden');
        }
        
        function closeDayDetailsModal() {
            document.getElementById('dayDetailsModal').classList.add('hidden');
        }
        
        // Employee summary functions
        function updateEmployeeSummary() {
            const summaryTable = document.getElementById('employeeSummary');
            summaryTable.innerHTML = '';
            
            if (employees.length === 0) {
                summaryTable.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-500">Nenhum funcionário cadastrado</td></tr>';
                return;
            }
            
            // Get first and last day of current month
            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            
            employees.forEach(employee => {
                // Filter scales for this employee in current month
                const employeeScales = scales.filter(scale => {
                    if (scale.employeeId !== employee.id) return false;
                    
                    const scaleDate = new Date(scale.startDate);
                    return scaleDate >= firstDay && scaleDate <= lastDay;
                });
                
                // Calculate total hours and minutes
                let totalMs = 0;
                employeeScales.forEach(scale => {
                    const start = new Date(scale.startDate);
                    const end = new Date(scale.endDate);
                    totalMs += end - start;
                });
                
                const totalHours = Math.floor(totalMs / (1000 * 60 * 60));
                const totalMinutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
                
                const row = document.createElement('tr');
                row.className = 'border-b hover:bg-gray-50';
                row.innerHTML = `
                    <td class="p-3">${employee.name}</td>
                    <td class="p-3">${totalHours}h ${totalMinutes}m</td>
                    <td class="p-3">${employeeScales.length}</td>
                    <td class="p-3">
                        <button onclick="showEmployeeScales('${employee.id}')" class="text-blue-600 hover:text-blue-800">
                            <i class="fas fa-eye mr-1"></i> Ver
                        </button>
                    </td>
                `;
                summaryTable.appendChild(row);
            });
        }
        
        function showEmployeeScales(employeeId) {
            const employee = employees.find(e => e.id === employeeId);
            if (!employee) return;
            
            // Filter scales for this employee
            const employeeScales = scales.filter(scale => scale.employeeId === employeeId);
            
            // Show in scales view
            showView('scales');
            
            // Filter scales list
            const scalesList = document.getElementById('scalesList');
            scalesList.innerHTML = '';
            
            if (employeeScales.length === 0) {
                scalesList.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-500">Nenhuma escala cadastrada para este funcionário</td></tr>';
                return;
            }
            
            employeeScales.forEach(scale => {
                const startDate = new Date(scale.startDate);
                const endDate = new Date(scale.endDate);
                
                // Calculate hours
                const diffMs = endDate - startDate;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                
                const row = document.createElement('tr');
                row.className = 'border-b hover:bg-gray-50';
                row.innerHTML = `
                    <td class="p-3">${employee.name}</td>
                    <td class="p-3">${formatDateTime(startDate)}</td>
                    <td class="p-3">${formatDateTime(endDate)}</td>
                    <td class="p-3">${diffHours}h ${diffMinutes}m</td>
                    <td class="p-3">
                        <button onclick="editScale('${scale.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteScale('${scale.id}')" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                scalesList.appendChild(row);
            });
        }
        
        // Filter functions
        function updateEmployeeFilter() {
            const filter = document.getElementById('employeeFilter');
            const reportEmployee = document.getElementById('reportEmployee');
            
            // Clear existing options except the first one
            while (filter.children.length > 1) {
                filter.removeChild(filter.lastChild);
            }
            
            while (reportEmployee.children.length > 1) {
                reportEmployee.removeChild(reportEmployee.lastChild);
            }
            
            // Add employees to both selects
            employees.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee.id;
                option.textContent = employee.name;
                filter.appendChild(option.cloneNode(true));
                reportEmployee.appendChild(option);
            });
        }
        
        function filterScales() {
            const employeeId = document.getElementById('employeeFilter').value;
            
            if (!employeeId) {
                loadScales();
                updateCalendar();
                updateEmployeeSummary();
                return;
            }
            
            // Filter scales for selected employee
            const filteredScales = scales.filter(scale => scale.employeeId === employeeId);
            
            // Update scales list
            const scalesList = document.getElementById('scalesList');
            scalesList.innerHTML = '';
            
            if (filteredScales.length === 0) {
                scalesList.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-500">Nenhuma escala cadastrada para este funcionário</td></tr>';
                return;
            }
            
            filteredScales.forEach(scale => {
                const employee = employees.find(e => e.id === scale.employeeId);
                const startDate = new Date(scale.startDate);
                const endDate = new Date(scale.endDate);
                
                // Calculate hours
                const diffMs = endDate - startDate;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                
                const row = document.createElement('tr');
                row.className = 'border-b hover:bg-gray-50';
                row.innerHTML = `
                    <td class="p-3">${employee ? employee.name : 'Funcionário não encontrado'}</td>
                    <td class="p-3">${formatDateTime(startDate)}</td>
                    <td class="p-3">${formatDateTime(endDate)}</td>
                    <td class="p-3">${diffHours}h ${diffMinutes}m</td>
                    <td class="p-3">
                        <button onclick="editScale('${scale.id}')" class="text-blue-600 hover:text-blue-800 mr-2">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteScale('${scale.id}')" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                scalesList.appendChild(row);
            });
            
            // Update calendar to highlight filtered employee's scales
            updateCalendarForEmployee(employeeId);
        }
        
        function updateCalendarForEmployee(employeeId) {
            const calendar = document.getElementById('calendar');
            
            // Clear existing calendar days (keep headers)
            while (calendar.children.length > 7) {
                calendar.removeChild(calendar.lastChild);
            }
            
            // Get first and last day of month
            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            
            // Get day of week for first day (0 = Sunday, 6 = Saturday)
            const firstDayOfWeek = firstDay.getDay();
            
            // Add empty cells for days before the first day of the month
            for (let i = 0; i < firstDayOfWeek; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'calendar-day border p-1 bg-gray-50';
                calendar.appendChild(emptyCell);
            }
            
            // Add cells for each day of the month
            for (let day = 1; day <= lastDay.getDate(); day++) {
                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dateString = date.toISOString().split('T')[0];
                
                // Check if this date has any scales for the selected employee
                const dayScales = scales.filter(scale => {
                    if (scale.employeeId !== employeeId) return false;
                    const scaleDate = new Date(scale.startDate).toISOString().split('T')[0];
                    return scaleDate === dateString;
                });
                
                const cell = document.createElement('div');
                cell.className = `calendar-day border p-1 ${dayScales.length > 0 ? 'has-scale' : ''}`;
                cell.innerHTML = `
                    <div class="text-right font-medium">${day}</div>
                    ${dayScales.length > 0 ? 
                        `<div class="text-xs mt-1 text-blue-600 cursor-pointer" onclick="showDayDetails('${dateString}')">
                            ${dayScales.length} escala${dayScales.length > 1 ? 's' : ''}
                        </div>` : 
                        ''}
                `;
                
                calendar.appendChild(cell);
            }
        }
        
        // Report functions
        function generateMonthlyReport() {
            const monthInput = document.getElementById('reportMonth').value;
            
            if (!monthInput) {
                alert('Selecione um mês/ano para gerar o relatório');
                return;
            }
            
            const [year, month] = monthInput.split('-');
            const firstDay = new Date(year, month - 1, 1);
            const lastDay = new Date(year, month, 0);
            
            // Filter scales for selected month
            const monthScales = scales.filter(scale => {
                const scaleDate = new Date(scale.startDate);
                return scaleDate >= firstDay && scaleDate <= lastDay;
            });
            
            if (monthScales.length === 0) {
                document.getElementById('reportContent').textContent = 'Nenhuma escala cadastrada para o mês selecionado.';
                document.getElementById('reportResults').classList.remove('hidden');
                return;
            }
            
            // Group by employee
            const reportData = {};
            
            monthScales.forEach(scale => {
                if (!reportData[scale.employeeId]) {
                    const employee = employees.find(e => e.id === scale.employeeId);
                    reportData[scale.employeeId] = {
                        name: employee ? employee.name : 'Funcionário não encontrado',
                        scales: [],
                        totalHours: 0
                    };
                }
                
                const startDate = new Date(scale.startDate);
                const endDate = new Date(scale.endDate);
                const diffMs = endDate - startDate;
                const hours = diffMs / (1000 * 60 * 60);
                
                reportData[scale.employeeId].scales.push({
                    date: formatDate(startDate),
                    startTime: formatTime(startDate),
                    endTime: formatTime(endDate),
                    hours: hours.toFixed(2),
                    description: scale.description || ''
                });
                
                reportData[scale.employeeId].totalHours += hours;
            });
            
            // Generate report text
            let reportText = `Relatório Mensal - ${firstDay.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}\n\n`;
            reportText += `Total de escalas: ${monthScales.length}\n`;
            reportText += `Funcionários com escalas: ${Object.keys(reportData).length}\n\n`;
            
            for (const employeeId in reportData) {
                const employee = reportData[employeeId];
                reportText += `Funcionário: ${employee.name}\n`;
                reportText += `Total de horas: ${employee.totalHours.toFixed(2)}h\n`;
                reportText += `Escalas:\n`;
                
                employee.scales.forEach((scale, index) => {
                    reportText += `  ${index + 1}. ${scale.date} - ${scale.startTime} às ${scale.endTime} (${scale.hours}h)`;
                    if (scale.description) {
                        reportText += ` - ${scale.description}`;
                    }
                    reportText += '\n';
                });
                
                reportText += '\n';
            }
            
            document.getElementById('reportContent').textContent = reportText;
            document.getElementById('reportResults').classList.remove('hidden');
        }
        
        function generateEmployeeReport() {
            const employeeId = document.getElementById('reportEmployee').value;
            const startDateInput = document.getElementById('reportStartDate').value;
            const endDateInput = document.getElementById('reportEndDate').value;
            
            if (!employeeId) {
                alert('Selecione um funcionário para gerar o relatório');
                return;
            }
            
            if (!startDateInput || !endDateInput) {
                alert('Selecione um período para gerar o relatório');
                return;
            }
            
            const startDate = new Date(startDateInput);
            const endDate = new Date(endDateInput);
            
            if (endDate < startDate) {
                alert('A data final deve ser posterior à data inicial');
                return;
            }
            
            // Filter scales for selected employee and period
            const employeeScales = scales.filter(scale => {
                if (scale.employeeId !== employeeId) return false;
                const scaleDate = new Date(scale.startDate);
                return scaleDate >= startDate && scaleDate <= endDate;
            });
            
            if (employeeScales.length === 0) {
                document.getElementById('reportContent').textContent = 'Nenhuma escala cadastrada para o funcionário no período selecionado.';
                document.getElementById('reportResults').classList.remove('hidden');
                return;
            }
            
            const employee = employees.find(e => e.id === employeeId);
            
            // Calculate total hours
            let totalHours = 0;
            employeeScales.forEach(scale => {
                const start = new Date(scale.startDate);
                const end = new Date(scale.endDate);
                totalHours += (end - start) / (1000 * 60 * 60);
            });
            
            // Generate report text
            let reportText = `Relatório Individual\n\n`;
            reportText += `Funcionário: ${employee ? employee.name : 'Funcionário não encontrado'}\n`;
            reportText += `Período: ${formatDate(startDate)} a ${formatDate(endDate)}\n`;
            reportText += `Total de escalas: ${employeeScales.length}\n`;
            reportText += `Total de horas: ${totalHours.toFixed(2)}h\n\n`;
            reportText += `Detalhes das escalas:\n\n`;
            
            employeeScales.forEach((scale, index) => {
                const start = new Date(scale.startDate);
                const end = new Date(scale.endDate);
                const hours = (end - start) / (1000 * 60 * 60);
                
                reportText += `${index + 1}. ${formatDateTime(start)} - ${formatDateTime(end)} (${hours.toFixed(2)}h)\n`;
                if (scale.description) {
                    reportText += `   Descrição: ${scale.description}\n`;
                }
                reportText += '\n';
            });
            
            document.getElementById('reportContent').textContent = reportText;
            document.getElementById('reportResults').classList.remove('hidden');
        }
        
        function exportToPdf() {
            alert('Funcionalidade de exportação para PDF será implementada aqui.\nEm uma implementação real, você poderia usar bibliotecas como jsPDF ou html2pdf.js.');
        }
        
        // Helper functions
        function generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }
        
        function saveData() {
            localStorage.setItem('employees', JSON.stringify(employees));
            localStorage.setItem('scales', JSON.stringify(scales));
        }
        
        function formatDateTime(date) {
            const options = { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            };
            return date.toLocaleDateString('pt-BR', options);
        }
        
        function formatDate(date) {
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            return date.toLocaleDateString('pt-BR', options);
        }
        
        function formatTime(date) {
            const options = { hour: '2-digit', minute: '2-digit' };
            return date.toLocaleTimeString('pt-BR', options);
        }
        
        function formatDateTimeForInput(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        }



// Função para exportar os dados
function exportData() {
    const employees = localStorage.getItem('employees') || '[]';
    const scales = localStorage.getItem('scales') || '[]';

    const content = JSON.stringify({ employees: JSON.parse(employees), scales: JSON.parse(scales) }, null, 2);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'dados.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// Função para importar os dados
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.employees && data.scales) {
                localStorage.setItem('employees', JSON.stringify(data.employees));
                localStorage.setItem('scales', JSON.stringify(data.scales));
                alert('Dados importados com sucesso!');
                location.reload(); // Atualiza a página para refletir os dados importados
            } else {
                alert('Arquivo inválido.');
            }
        } catch (err) {
            alert('Erro ao importar os dados.');
        }
    };
    reader.readAsText(file);
}