class SupportManager {
    constructor() {
        this.tickets = this.getInitialTickets();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTicketsTable();
    }

    setupEventListeners() {
        document.getElementById('contactSupportBtn').addEventListener('click', () => this.contactSupport());
        document.getElementById('newTicketBtn').addEventListener('click', () => this.createNewTicket());
        document.getElementById('ticketStatusFilter').addEventListener('change', () => this.filterTickets());
    }

    openSection(section) {
        const sectionNames = {
            'documentation': 'Documentation Center',
            'video-tutorials': 'Video Tutorials',
            'faq': 'Frequently Asked Questions',
            'live-chat': 'Live Chat Support',
            'tickets': 'Support Tickets',
            'system-status': 'System Status Dashboard'
        };

        this.showNotification(`Opening ${sectionNames[section]}...`, 'info');
        
        // In a real app, this would navigate to the specific section
        if (section === 'live-chat') {
            this.startLiveChat();
        } else if (section === 'system-status') {
            this.showSystemStatus();
        }
    }

    openArticle(articleId) {
        const articles = {
            'setup': 'Initial Setup Guide',
            'first-steps': 'Your First Steps with Smart Record Keeper',
            'navigation': 'Navigating the Dashboard',
            'add-sale': 'How to Add Sales Records',
            'track-inventory': 'Inventory Tracking Best Practices',
            'generate-reports': 'Generating and Exporting Reports',
            'profile': 'Managing Your User Profile',
            'security': 'Security Settings and Best Practices',
            'notifications': 'Setting Up Notification Preferences',
            'login-issues': 'Troubleshooting Login Problems',
            'performance': 'Resolving Performance Issues',
            'data-recovery': 'Data Backup and Recovery'
        };

        const articleTitle = articles[articleId];
        if (articleTitle) {
            this.showNotification(`Opening article: ${articleTitle}`, 'info');
            // In a real app, this would open the specific help article
        }
    }

    contactSupport() {
        this.showNotification('Opening contact support form...', 'info');
        // In a real app, this would open a contact form or initiate contact
    }

    createNewTicket() {
        const ticketData = {
            id: `TK-${Date.now()}`,
            subject: 'New Support Request',
            category: 'General',
            priority: 'medium',
            status: 'open',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            description: 'Support ticket created from dashboard'
        };

        this.tickets.unshift(ticketData);
        this.renderTicketsTable();
        this.showNotification('New support ticket created successfully', 'success');
    }

    startLiveChat() {
        this.showNotification('Connecting you to live chat...', 'info');
        setTimeout(() => {
            this.showNotification('Live chat is not available in demo mode', 'info');
        }, 2000);
    }

    showSystemStatus() {
        const statusModal = document.createElement('div');
        statusModal.className = 'status-modal';
        statusModal.innerHTML = `
            <div class="status-modal-content">
                <div class="status-header">
                    <h2>System Status</h2>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="system-services">
                    <div class="service-status">
                        <div class="service-indicator operational"></div>
                        <div class="service-info">
                            <h4>Application Server</h4>
                            <p>Operational - 99.9% uptime</p>
                        </div>
                    </div>
                    <div class="service-status">
                        <div class="service-indicator operational"></div>
                        <div class="service-info">
                            <h4>Database Services</h4>
                            <p>Operational - All queries processing normally</p>
                        </div>
                    </div>
                    <div class="service-status">
                        <div class="service-indicator operational"></div>
                        <div class="service-info">
                            <h4>File Storage</h4>
                            <p>Operational - Backup systems active</p>
                        </div>
                    </div>
                    <div class="service-status">
                        <div class="service-indicator maintenance"></div>
                        <div class="service-info">
                            <h4>Email Services</h4>
                            <p>Scheduled Maintenance - Dec 15, 2:00 AM EST</p>
                        </div>
                    </div>
                </div>
                <div class="status-footer">
                    <p>Last updated: ${new Date().toLocaleString()}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(statusModal);
        setTimeout(() => statusModal.classList.add('show'), 100);
    }

    viewTicket(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (ticket) {
            this.showNotification(`Opening ticket ${ticket.id}: ${ticket.subject}`, 'info');
            // In a real app, this would open the detailed ticket view
        }
    }

    updateTicketStatus(ticketId, newStatus) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (ticket) {
            ticket.status = newStatus;
            ticket.lastUpdated = new Date().toISOString();
            this.renderTicketsTable();
            this.showNotification(`Ticket ${ticketId} status updated to ${newStatus}`, 'success');
        }
    }

    renderTicketsTable() {
        const tbody = document.getElementById('ticketsTableBody');
        const filteredTickets = this.getFilteredTickets();
        
        tbody.innerHTML = filteredTickets.map(ticket => {
            const priorityClass = this.getPriorityClass(ticket.priority);
            const statusClass = this.getStatusClass(ticket.status);
            
            return `
                <tr>
                    <td><strong>${ticket.id}</strong></td>
                    <td>${ticket.subject}</td>
                    <td>${ticket.category}</td>
                    <td><span class="priority-badge ${priorityClass}">${ticket.priority.toUpperCase()}</span></td>
                    <td><span class="status-badge ${statusClass}">${this.formatStatus(ticket.status)}</span></td>
                    <td>${this.formatDate(ticket.lastUpdated)}</td>
                    <td>
                        <button class="btn-edit" onclick="supportManager.viewTicket('${ticket.id}')" title="View Ticket">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${ticket.status === 'open' ? 
                            `<button class="btn-edit" onclick="supportManager.updateTicketStatus('${ticket.id}', 'resolved')" title="Mark Resolved">
                                <i class="fas fa-check"></i>
                            </button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    }

    getFilteredTickets() {
        const statusFilter = document.getElementById('ticketStatusFilter').value;
        
        return this.tickets.filter(ticket => {
            return !statusFilter || ticket.status === statusFilter;
        });
    }

    filterTickets() {
        this.renderTicketsTable();
    }

    getPriorityClass(priority) {
        const classes = {
            'low': 'priority-low',
            'medium': 'priority-medium',
            'high': 'priority-high',
            'urgent': 'priority-urgent'
        };
        return classes[priority] || 'priority-medium';
    }

    getStatusClass(status) {
        const classes = {
            'open': 'status-open',
            'in-progress': 'status-in-progress',
            'resolved': 'status-resolved',
            'closed': 'status-closed'
        };
        return classes[status] || 'status-open';
    }

    formatStatus(status) {
        return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
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

    getInitialTickets() {
        return [
            {
                id: 'TK-1001',
                subject: 'Unable to generate sales report',
                category: 'Reports',
                priority: 'high',
                status: 'open',
                createdAt: '2025-12-10T09:00:00Z',
                lastUpdated: '2025-12-12T10:30:00Z',
                description: 'Getting error when trying to generate monthly sales report'
            },
            {
                id: 'TK-1002',
                subject: 'Inventory count discrepancy',
                category: 'Inventory',
                priority: 'medium',
                status: 'in-progress',
                createdAt: '2025-12-08T14:15:00Z',
                lastUpdated: '2025-12-11T16:45:00Z',
                description: 'Physical count does not match system inventory'
            },
            {
                id: 'TK-1003',
                subject: 'Login issues on mobile device',
                category: 'Technical',
                priority: 'low',
                status: 'resolved',
                createdAt: '2025-12-05T11:30:00Z',
                lastUpdated: '2025-12-06T09:15:00Z',
                description: 'Cannot login using mobile browser'
            }
        ];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.supportManager = new SupportManager();
});