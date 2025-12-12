// Smart Record Keeper - JavaScript Application
class RecordKeeper {
    constructor() {
        this.currentView = 'login';
        this.isLoggedIn = false;
        this.records = this.getInitialRecords();
        this.currentEditId = null;
        
        this.init();
    }

    // Initialize the application
    init() {
        this.setupEventListeners();
        this.showPage('loginPage');
        this.updateStats();
        this.initializeSalesData();
        this.setupTabNavigation();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout buttons
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
        document.getElementById('logoutBtn2').addEventListener('click', () => {
            this.handleLogout();
        });

        // Navigation buttons
        document.getElementById('addRecordBtn').addEventListener('click', () => {
            this.showAddRecordModal();
        });
        document.getElementById('viewRecordsBtn').addEventListener('click', () => {
            this.showRecordsPage();
        });
        document.getElementById('backToDashboard').addEventListener('click', () => {
            this.showDashboard();
        });
        document.getElementById('addRecordFromList').addEventListener('click', () => {
            this.showAddRecordModal();
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideModal();
        });
        document.getElementById('cancelRecord').addEventListener('click', () => {
            this.hideModal();
        });

        // Record form
        document.getElementById('recordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRecordSubmit();
        });

        // Category change for amount field visibility
        document.getElementById('recordCategory').addEventListener('change', (e) => {
            this.toggleAmountField(e.target.value);
        });

        // Search and filter
        document.getElementById('searchRecords').addEventListener('input', (e) => {
            this.filterRecords();
        });
        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.filterRecords();
        });

        // Click outside modal to close
        document.getElementById('recordModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideModal();
            }
        });

    }

    // Initial sample records
    getInitialRecords() {
        return [
            {
                id: '1',
                category: 'sales',
                title: 'Product Sale - Widget A',
                description: 'Sold 10 units of Widget A to ABC Corp',
                amount: 1500,
                date: '2025-12-08',
                createdAt: '2025-12-08T10:30:00Z',
            },
            {
                id: '2',
                category: 'expenses',
                title: 'Office Supplies',
                description: 'Purchased printer paper and ink cartridges',
                amount: 150,
                date: '2025-12-07',
                createdAt: '2025-12-07T14:20:00Z',
            },
            {
                id: '3',
                category: 'customer-info',
                title: 'New Customer - XYZ Ltd',
                description: 'Contact: John Smith, Email: john@xyz.com, Phone: (555) 123-4567',
                date: '2025-12-06',
                createdAt: '2025-12-06T09:15:00Z',
            },
            {
                id: '4',
                category: 'personal-notes',
                title: 'Meeting Notes',
                description: 'Discussed Q1 strategy and marketing plans',
                date: '2025-12-05',
                createdAt: '2025-12-05T16:45:00Z',
            },
            {
                id: '5',
                category: 'sales',
                title: 'Service Contract',
                description: 'Annual maintenance contract with DEF Company',
                amount: 3000,
                date: '2025-12-04',
                createdAt: '2025-12-04T11:00:00Z',
            },
        ];
    }

    // Page management
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.add('hidden');
        });

        // Show selected page
        document.getElementById(pageId).classList.remove('hidden');
    }

    // Login functionality
    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username.trim() && password.trim()) {
            this.isLoggedIn = true;
            this.showDashboard();
            
            // Clear form
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        } else {
            alert('Please enter both username and password');
        }
    }

    // Logout functionality
    handleLogout() {
        this.isLoggedIn = false;
        this.currentView = 'login';
        this.showPage('loginPage');
    }

    // Show dashboard
    showDashboard() {
        this.currentView = 'dashboard';
        this.showPage('dashboardPage');
        this.updateStats();
        
        // Setup sidebar navigation after dashboard is shown
        setTimeout(() => {
            this.setupSidebarNavigation();
            this.setupTabNavigation();
        }, 100);
    }

    // Show records page
    showRecordsPage() {
        this.currentView = 'records';
        this.showPage('recordsPage');
        this.renderRecords();
    }

    // Update dashboard statistics
    updateStats() {
        const totalRecords = this.records.length;
        const salesRecords = this.records.filter(r => r.category === 'sales').length;
        const expensesRecords = this.records.filter(r => r.category === 'expenses').length;
        
        const totalRevenue = this.records
            .filter(r => r.category === 'sales')
            .reduce((sum, r) => sum + (r.amount || 0), 0);
        
        const totalExpenses = this.records
            .filter(r => r.category === 'expenses')
            .reduce((sum, r) => sum + (r.amount || 0), 0);

        const netRevenue = totalRevenue - totalExpenses;

        document.getElementById('totalRecords').textContent = totalRecords;
        document.getElementById('salesCount').textContent = salesRecords;
        document.getElementById('expensesCount').textContent = expensesRecords;
        document.getElementById('totalRevenue').textContent = `$${netRevenue.toLocaleString()}`;
    }

    // Show add record modal
    showAddRecordModal() {
        this.currentEditId = null;
        document.getElementById('modalTitle').textContent = 'Add New Record';
        this.resetForm();
        this.showModal();
    }

    // Show edit record modal
    showEditRecordModal(recordId) {
        this.currentEditId = recordId;
        const record = this.records.find(r => r.id === recordId);
        
        if (record) {
            document.getElementById('modalTitle').textContent = 'Edit Record';
            this.populateForm(record);
            this.showModal();
        }
    }

    // Show modal
    showModal() {
        document.getElementById('recordModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Hide modal
    hideModal() {
        document.getElementById('recordModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.resetForm();
    }

    // Reset form
    resetForm() {
        document.getElementById('recordForm').reset();
        document.getElementById('recordDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('recordCategory').value = 'sales';
        this.toggleAmountField('sales');
    }

    // Populate form with record data
    populateForm(record) {
        document.getElementById('recordCategory').value = record.category;
        document.getElementById('recordTitle').value = record.title;
        document.getElementById('recordDescription').value = record.description;
        document.getElementById('recordAmount').value = record.amount || '';
        document.getElementById('recordDate').value = record.date;
        this.toggleAmountField(record.category);
    }

    // Toggle amount field visibility
    toggleAmountField(category) {
        const amountGroup = document.getElementById('amountGroup');
        const amountInput = document.getElementById('recordAmount');
        
        if (category === 'sales' || category === 'expenses') {
            amountGroup.style.display = 'block';
            amountInput.required = true;
        } else {
            amountGroup.style.display = 'none';
            amountInput.required = false;
            amountInput.value = '';
        }
    }

    // Handle record form submission
    handleRecordSubmit() {
        const category = document.getElementById('recordCategory').value;
        const title = document.getElementById('recordTitle').value.trim();
        const description = document.getElementById('recordDescription').value.trim();
        const amount = document.getElementById('recordAmount').value;
        const date = document.getElementById('recordDate').value;

        if (!title || !description || !date) {
            alert('Please fill in all required fields');
            return;
        }

        const recordData = {
            category,
            title,
            description,
            date,
            amount: amount ? parseFloat(amount) : undefined
        };

        if (this.currentEditId) {
            this.updateRecord(this.currentEditId, recordData);
        } else {
            this.addRecord(recordData);
        }

        this.hideModal();
        this.updateStats();
        
        if (this.currentView === 'records') {
            this.renderRecords();
        }
    }

    // Add new record
    addRecord(recordData) {
        const newRecord = {
            id: Date.now().toString(),
            ...recordData,
            createdAt: new Date().toISOString()
        };

        this.records.unshift(newRecord);
    }

    // Update existing record
    updateRecord(id, recordData) {
        const index = this.records.findIndex(r => r.id === id);
        if (index !== -1) {
            this.records[index] = {
                ...this.records[index],
                ...recordData
            };
        }
    }

    // Delete record
    deleteRecord(id) {
        if (confirm('Are you sure you want to delete this record?')) {
            this.records = this.records.filter(r => r.id !== id);
            this.renderRecords();
            this.updateStats();
        }
    }

    // Render records list
    renderRecords() {
        const recordsList = document.getElementById('recordsList');
        const searchTerm = document.getElementById('searchRecords').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;

        let filteredRecords = this.records;

        // Apply search filter
        if (searchTerm) {
            filteredRecords = filteredRecords.filter(record => 
                record.title.toLowerCase().includes(searchTerm) ||
                record.description.toLowerCase().includes(searchTerm)
            );
        }

        // Apply category filter
        if (categoryFilter) {
            filteredRecords = filteredRecords.filter(record => 
                record.category === categoryFilter
            );
        }

        if (filteredRecords.length === 0) {
            recordsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No records found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }

        recordsList.innerHTML = filteredRecords.map(record => this.renderRecordItem(record)).join('');

        // Add event listeners to record actions
        recordsList.querySelectorAll('.edit-record').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recordId = e.target.closest('.record-item').dataset.id;
                this.showEditRecordModal(recordId);
            });
        });

        recordsList.querySelectorAll('.delete-record').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recordId = e.target.closest('.record-item').dataset.id;
                this.deleteRecord(recordId);
            });
        });
    }

    // Render individual record item
    renderRecordItem(record) {
        const formattedDate = new Date(record.date).toLocaleDateString();
        const categoryClass = `category-${record.category}`;
        const categoryLabel = record.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

        let amountDisplay = '';
        if (record.amount !== undefined) {
            const amountClass = record.category === 'sales' ? 'positive' : 'negative';
            const sign = record.category === 'sales' ? '+' : '-';
            amountDisplay = `<span class="record-amount ${amountClass}">${sign}$${record.amount.toLocaleString()}</span>`;
        }

        return `
            <div class="record-item ${categoryClass}" data-id="${record.id}">
                <div class="record-header">
                    <h3 class="record-title">${record.title}</h3>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span class="record-category">${categoryLabel}</span>
                        <button class="btn-close edit-record" title="Edit record">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-close delete-record" title="Delete record">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="record-description">${record.description}</p>
                <div class="record-footer">
                    <span class="record-date">${formattedDate}</span>
                    ${amountDisplay}
                </div>
            </div>
        `;
    }

    // Filter records based on search and category
    filterRecords() {
        if (this.currentView === 'records') {
            this.renderRecords();
        }
    }

    // Initialize sales data for the new dashboard
    initializeSalesData() {
        this.salesData = {
            now: [
                {
                    clientName: 'John Smith',
                    productId: 'PRD-001',
                    unit: '5',
                    amount: '$2,500',
                    date: '2025-12-12'
                },
                {
                    clientName: 'Sarah Johnson',
                    productId: 'PRD-002',
                    unit: '3',
                    amount: '$1,800',
                    date: '2025-12-11'
                },
                {
                    clientName: 'Mike Davis',
                    productId: 'PRD-003',
                    unit: '2',
                    amount: '$1,200',
                    date: '2025-12-10'
                }
            ],
            delivered: [
                {
                    clientName: 'Lisa Wilson',
                    productId: 'PRD-001',
                    unit: '4',
                    amount: '$2,000',
                    date: '2025-12-08'
                },
                {
                    clientName: 'Tom Brown',
                    productId: 'PRD-004',
                    unit: '6',
                    amount: '$3,600',
                    date: '2025-12-07'
                }
            ],
            cancelled: [
                {
                    clientName: 'Anna Taylor',
                    productId: 'PRD-002',
                    unit: '2',
                    amount: '$1,200',
                    date: '2025-12-06'
                }
            ]
        };
        
        this.currentSalesTab = 'now';
        this.renderSalesTable();
    }

    // Setup tab navigation for sales section
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchSalesTab(tabName);
            });
        });
    }

    // Switch between sales tabs
    switchSalesTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update current tab and render table
        this.currentSalesTab = tabName;
        this.renderSalesTable();
    }

    // Render sales table based on current tab
    renderSalesTable() {
        const tableBody = document.getElementById('salesTableBody');
        if (!tableBody) return;
        
        const data = this.salesData[this.currentSalesTab] || [];
        
        tableBody.innerHTML = data.map(sale => `
            <tr>
                <td>${sale.clientName}</td>
                <td>${sale.productId}</td>
                <td>${sale.unit}</td>
                <td>${sale.amount}</td>
                <td>${sale.date}</td>
            </tr>
        `).join('');
    }

    // Setup sidebar navigation event listeners
    setupSidebarNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        console.log('Setting up navigation, found links:', navLinks.length);
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Navigation clicked!');
                
                // Get the navigation item text
                const navText = link.querySelector('span:last-child').textContent.trim();
                console.log('Navigation text:', navText);
                
                // Remove active class from all nav items
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add active class to clicked item
                link.parentElement.classList.add('active');
                
                // Handle navigation based on the clicked item
                this.handleNavigation(navText);
            });
        });
    }

    // Handle navigation to different sections
    handleNavigation(section) {
        const mainContent = document.querySelector('.main-content');
        
        switch(section.toLowerCase()) {
            case 'accounts':
                this.showAccountsSection();
                break;
            case 'sales track':
                this.showSalesTrackSection();
                break;
            case 'stock':
                this.showStockSection();
                break;
            case 'invoices':
                this.showInvoicesSection();
                break;
            case 'task schedule':
                this.showTaskScheduleSection();
                break;
            case 'communication':
                this.showCommunicationSection();
                break;
            case 'report':
                this.showReportSection();
                break;
            case 'support':
                this.showSupportSection();
                break;
            default:
                this.showDefaultDashboard();
        }
    }

    // Show Accounts section
    showAccountsSection() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="section-header">
                <h1>Accounts Management</h1>
                <p>Manage customer accounts and financial records</p>
            </div>
            <div class="accounts-grid">
                <div class="account-card">
                    <h3>Total Accounts</h3>
                    <p class="account-number">156</p>
                </div>
                <div class="account-card">
                    <h3>Active Accounts</h3>
                    <p class="account-number">142</p>
                </div>
                <div class="account-card">
                    <h3>Pending</h3>
                    <p class="account-number">14</p>
                </div>
            </div>
            <div class="account-actions">
                <button class="action-btn">Add New Account</button>
                <button class="action-btn">Import Accounts</button>
                <button class="action-btn">Export Data</button>
            </div>
        `;
    }

    // Show Sales Track section
    showSalesTrackSection() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="section-header">
                <h1>Sales Tracking</h1>
                <p>Monitor and analyze sales performance</p>
            </div>
            <div class="sales-metrics">
                <div class="metric-card">
                    <h3>Today's Sales</h3>
                    <p class="metric-value">$12,450</p>
                </div>
                <div class="metric-card">
                    <h3>This Month</h3>
                    <p class="metric-value">$245,670</p>
                </div>
                <div class="metric-card">
                    <h3>Growth Rate</h3>
                    <p class="metric-value">+15.3%</p>
                </div>
            </div>
            <div class="sales-chart-placeholder">
                <p>Sales Chart Visualization</p>
            </div>
        `;
    }

    // Show Stock section
    showStockSection() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="section-header">
                <h1>Stock Management</h1>
                <p>Track inventory and stock levels</p>
            </div>
            <div class="stock-overview">
                <div class="stock-card">
                    <h3>Total Items</h3>
                    <p class="stock-number">1,247</p>
                </div>
                <div class="stock-card">
                    <h3>Low Stock</h3>
                    <p class="stock-number warning">23</p>
                </div>
                <div class="stock-card">
                    <h3>Out of Stock</h3>
                    <p class="stock-number danger">5</p>
                </div>
            </div>
            <div class="stock-actions">
                <button class="action-btn">Add New Item</button>
                <button class="action-btn">Stock Report</button>
                <button class="action-btn">Reorder Alerts</button>
            </div>
        `;
    }

    // Show Invoices section
    showInvoicesSection() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="section-header">
                <h1>Invoice Management</h1>
                <p>Create and manage invoices</p>
            </div>
            <div class="invoice-stats">
                <div class="invoice-card">
                    <h3>Total Invoices</h3>
                    <p class="invoice-number">342</p>
                </div>
                <div class="invoice-card">
                    <h3>Paid</h3>
                    <p class="invoice-number">298</p>
                </div>
                <div class="invoice-card">
                    <h3>Outstanding</h3>
                    <p class="invoice-number">44</p>
                </div>
            </div>
            <div class="invoice-actions">
                <button class="action-btn">Create Invoice</button>
                <button class="action-btn">View All</button>
                <button class="action-btn">Payment Reminders</button>
            </div>
        `;
    }

    // Show Task Schedule section
    showTaskScheduleSection() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="section-header">
                <h1>Task Schedule</h1>
                <p>Manage tasks and appointments</p>
            </div>
            <div class="schedule-overview">
                <div class="schedule-card">
                    <h3>Today's Tasks</h3>
                    <p class="schedule-number">8</p>
                </div>
                <div class="schedule-card">
                    <h3>This Week</h3>
                    <p class="schedule-number">24</p>
                </div>
                <div class="schedule-card">
                    <h3>Overdue</h3>
                    <p class="schedule-number warning">3</p>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn">Add Task</button>
                <button class="action-btn">View Calendar</button>
                <button class="action-btn">Set Reminder</button>
            </div>
        `;
    }

    // Show Communication section
    showCommunicationSection() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="section-header">
                <h1>Communication Center</h1>
                <p>Manage messages and notifications</p>
            </div>
            <div class="communication-stats">
                <div class="comm-card">
                    <h3>Unread Messages</h3>
                    <p class="comm-number">12</p>
                </div>
                <div class="comm-card">
                    <h3>Recent Calls</h3>
                    <p class="comm-number">5</p>
                </div>
                <div class="comm-card">
                    <h3>Notifications</h3>
                    <p class="comm-number">18</p>
                </div>
            </div>
            <div class="comm-actions">
                <button class="action-btn">Send Message</button>
                <button class="action-btn">View Inbox</button>
                <button class="action-btn">Call Log</button>
            </div>
        `;
    }

    // Show Report section
    showReportSection() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="section-header">
                <h1>Reports & Analytics</h1>
                <p>Generate and view business reports</p>
            </div>
            <div class="report-types">
                <div class="report-card">
                    <h3>Sales Report</h3>
                    <p>Monthly sales analysis</p>
                    <button class="report-btn">Generate</button>
                </div>
                <div class="report-card">
                    <h3>Financial Report</h3>
                    <p>Revenue and expenses</p>
                    <button class="report-btn">Generate</button>
                </div>
                <div class="report-card">
                    <h3>Customer Report</h3>
                    <p>Customer analytics</p>
                    <button class="report-btn">Generate</button>
                </div>
            </div>
        `;
    }

    // Show Support section
    showSupportSection() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <div class="section-header">
                <h1>Support Center</h1>
                <p>Get help and technical support</p>
            </div>
            <div class="support-options">
                <div class="support-card">
                    <h3>Documentation</h3>
                    <p>User guides and tutorials</p>
                    <button class="support-btn">View Docs</button>
                </div>
                <div class="support-card">
                    <h3>Contact Support</h3>
                    <p>Get help from our team</p>
                    <button class="support-btn">Contact</button>
                </div>
                <div class="support-card">
                    <h3>FAQ</h3>
                    <p>Frequently asked questions</p>
                    <button class="support-btn">View FAQ</button>
                </div>
            </div>
        `;
    }

    // Show default dashboard (original content)
    showDefaultDashboard() {
        const mainContent = document.querySelector('.main-content');
        mainContent.innerHTML = `
            <!-- Search Bar -->
            <div class="search-section">
                <input type="text" class="main-search" placeholder="Search...">
            </div>
            
            <!-- Dashboard Cards -->
            <div class="dashboard-cards">
                <div class="dashboard-card"></div>
                <div class="dashboard-card"></div>
            </div>
            
            <!-- Recent Sales List -->
            <div class="sales-section">
                <h2>Recent sale list</h2>
                
                <!-- Tab Navigation -->
                <div class="sales-tabs">
                    <button class="tab-btn active" data-tab="now">Now</button>
                    <button class="tab-btn" data-tab="delivered">Delivered</button>
                    <button class="tab-btn" data-tab="cancelled">Cancelled</button>
                </div>
                
                <!-- Sales Table -->
                <div class="sales-table-container">
                    <table class="sales-table">
                        <thead>
                            <tr>
                                <th>Client name</th>
                                <th>Product ID</th>
                                <th>Unit</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody id="salesTableBody">
                            <!-- Sales data will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Re-initialize sales functionality
        this.setupTabNavigation();
        this.renderSalesTable();
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.recordKeeper = new RecordKeeper();
});

// Utility functions for date formatting and validation
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Export for potential future use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecordKeeper;
}