class ReportsManager {
    constructor() {
        this.reports = this.getInitialReports();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderReportsTable();
        this.setDefaultDateRange();
    }

    setupEventListeners() {
        document.getElementById('generateReportBtn').addEventListener('click', () => this.showReportGenerator());
        document.getElementById('applyDateRange').addEventListener('click', () => this.applyDateRange());
        document.getElementById('reportTypeFilter').addEventListener('change', () => this.filterReports());
        document.getElementById('searchReports').addEventListener('input', () => this.filterReports());

        // Quick range buttons
        document.querySelectorAll('.quick-range-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setQuickRange(parseInt(e.target.dataset.range)));
        });
    }

    setDefaultDateRange() {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        
        document.getElementById('endDate').value = today.toISOString().split('T')[0];
        document.getElementById('startDate').value = startOfYear.toISOString().split('T')[0];
    }

    setQuickRange(days) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        
        document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
        document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
        
        // Update active button
        document.querySelectorAll('.quick-range-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-range="${days}"]`).classList.add('active');
        
        this.applyDateRange();
    }

    applyDateRange() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (startDate && endDate) {
            this.showNotification(`Date range applied: ${this.formatDate(startDate)} to ${this.formatDate(endDate)}`, 'success');
            // In a real app, this would update all charts and metrics
        }
    }

    generateReport(type) {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!startDate || !endDate) {
            this.showNotification('Please select a date range first', 'error');
            return;
        }

        const reportData = {
            id: Date.now().toString(),
            name: `${this.getReportTypeName(type)} Report`,
            type: type,
            dateRange: `${this.formatDate(startDate)} to ${this.formatDate(endDate)}`,
            generatedOn: new Date().toISOString(),
            status: 'completed',
            startDate: startDate,
            endDate: endDate
        };

        this.reports.unshift(reportData);
        this.renderReportsTable();
        
        // Simulate report generation
        this.showNotification('Generating report...', 'info');
        setTimeout(() => {
            this.showNotification(`${reportData.name} generated successfully`, 'success');
        }, 2000);
    }

    getReportTypeName(type) {
        const names = {
            'sales': 'Sales',
            'financial': 'Financial',
            'inventory': 'Inventory',
            'customer': 'Customer'
        };
        return names[type] || 'Custom';
    }

    downloadReport(reportId) {
        const report = this.reports.find(r => r.id === reportId);
        if (report) {
            // Simulate download
            this.showNotification(`Downloading ${report.name}...`, 'info');
            
            // Create a simple CSV content for demo
            const csvContent = this.generateReportCSV(report);
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${report.name.replace(/\s+/g, '_')}_${report.id}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    }

    generateReportCSV(report) {
        const headers = ['Date', 'Description', 'Amount', 'Category'];
        const sampleData = [
            ['2025-12-01', 'Product Sale - Widget A', '1500.00', 'Sales'],
            ['2025-12-02', 'Office Supplies', '-250.00', 'Expenses'],
            ['2025-12-03', 'Service Revenue', '2200.00', 'Sales'],
            ['2025-12-04', 'Marketing Campaign', '-800.00', 'Marketing'],
            ['2025-12-05', 'Product Sale - Widget B', '1800.00', 'Sales']
        ];

        let csv = headers.join(',') + '\n';
        csv += sampleData.map(row => row.join(',')).join('\n');
        
        return csv;
    }

    viewReport(reportId) {
        const report = this.reports.find(r => r.id === reportId);
        if (report) {
            this.showNotification(`Opening ${report.name} in viewer`, 'info');
            // In a real app, this would open a detailed report view
        }
    }

    deleteReport(reportId) {
        if (confirm('Are you sure you want to delete this report?')) {
            this.reports = this.reports.filter(r => r.id !== reportId);
            this.renderReportsTable();
            this.showNotification('Report deleted successfully', 'success');
        }
    }

    renderReportsTable() {
        const tbody = document.getElementById('reportsTableBody');
        const filteredReports = this.getFilteredReports();
        
        tbody.innerHTML = filteredReports.map(report => `
            <tr>
                <td>${report.name}</td>
                <td><span class="report-type-badge ${report.type}">${this.getReportTypeName(report.type)}</span></td>
                <td>${report.dateRange}</td>
                <td>${this.formatDateTime(report.generatedOn)}</td>
                <td><span class="status-badge ${report.status}">${report.status}</span></td>
                <td>
                    <button class="btn-edit" onclick="reportsManager.viewReport('${report.id}')" title="View Report">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-edit" onclick="reportsManager.downloadReport('${report.id}')" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-delete" onclick="reportsManager.deleteReport('${report.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getFilteredReports() {
        const typeFilter = document.getElementById('reportTypeFilter').value;
        const searchTerm = document.getElementById('searchReports').value.toLowerCase();
        
        return this.reports.filter(report => {
            const matchesType = !typeFilter || report.type === typeFilter;
            const matchesSearch = !searchTerm || 
                report.name.toLowerCase().includes(searchTerm) ||
                report.type.toLowerCase().includes(searchTerm);
            return matchesType && matchesSearch;
        });
    }

    filterReports() {
        this.renderReportsTable();
    }

    showReportGenerator() {
        this.showNotification('Report generator would open here with more options', 'info');
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i> ${message}`;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    getInitialReports() {
        return [
            {
                id: '1',
                name: 'Monthly Sales Report',
                type: 'sales',
                dateRange: 'Nov 1, 2025 to Nov 30, 2025',
                generatedOn: '2025-12-01T09:00:00Z',
                status: 'completed'
            },
            {
                id: '2',
                name: 'Q4 Financial Report',
                type: 'financial',
                dateRange: 'Oct 1, 2025 to Dec 31, 2025',
                generatedOn: '2025-12-10T14:30:00Z',
                status: 'completed'
            },
            {
                id: '3',
                name: 'Year-End Inventory Report',
                type: 'inventory',
                dateRange: 'Jan 1, 2025 to Dec 31, 2025',
                generatedOn: '2025-12-11T11:15:00Z',
                status: 'completed'
            }
        ];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.reportsManager = new ReportsManager();
});