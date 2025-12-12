class CommunicationManager {
    constructor() {
        this.conversations = this.getInitialConversations();
        this.callLog = this.getInitialCallLog();
        this.notifications = this.getInitialNotifications();
        this.activeConversation = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderConversationList();
        this.renderCallLog();
        this.renderNotifications();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Message functionality
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('newMessage').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Notification filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterNotifications(e.target.dataset.filter));
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
        document.getElementById(`${tabName}Tab`).style.display = 'block';
    }

    renderConversationList() {
        const list = document.getElementById('conversationList');
        list.innerHTML = this.conversations.map(conv => `
            <div class="conversation-item ${conv.unread ? 'unread' : ''}" onclick="communicationManager.selectConversation('${conv.id}')">
                <div class="contact-avatar"></div>
                <div class="conversation-preview">
                    <h4>${conv.name}</h4>
                    <p>${conv.lastMessage.text}</p>
                    <span class="message-time">${this.formatTime(conv.lastMessage.time)}</span>
                    ${conv.unread ? '<span class="unread-badge"></span>' : ''}
                </div>
            </div>
        `).join('');
    }

    selectConversation(conversationId) {
        this.activeConversation = this.conversations.find(c => c.id === conversationId);
        if (this.activeConversation) {
            // Mark as read
            this.activeConversation.unread = false;
            
            // Update header
            document.getElementById('contactName').textContent = this.activeConversation.name;
            document.getElementById('contactStatus').textContent = 'Online';
            
            // Show messages
            this.renderMessages();
            
            // Show input
            document.getElementById('messageInput').style.display = 'flex';
            
            // Update conversation list
            this.renderConversationList();
        }
    }

    renderMessages() {
        const messageBody = document.getElementById('messageBody');
        if (!this.activeConversation) return;

        messageBody.innerHTML = this.activeConversation.messages.map(msg => `
            <div class="message ${msg.sender === 'me' ? 'sent' : 'received'}">
                <div class="message-bubble">
                    <p>${msg.text}</p>
                    <span class="message-timestamp">${this.formatTime(msg.time)}</span>
                </div>
            </div>
        `).join('');

        messageBody.scrollTop = messageBody.scrollHeight;
    }

    sendMessage() {
        const input = document.getElementById('newMessage');
        const messageText = input.value.trim();
        
        if (messageText && this.activeConversation) {
            const newMessage = {
                id: Date.now().toString(),
                text: messageText,
                time: new Date().toISOString(),
                sender: 'me'
            };

            this.activeConversation.messages.push(newMessage);
            this.activeConversation.lastMessage = newMessage;
            
            input.value = '';
            this.renderMessages();
            this.renderConversationList();
            
            this.showNotification('Message sent', 'success');
        }
    }

    renderCallLog() {
        const tbody = document.getElementById('callLogBody');
        tbody.innerHTML = this.callLog.map(call => `
            <tr>
                <td>
                    <div class="contact-info">
                        <strong>${call.contact}</strong>
                        <br><small>${call.phone}</small>
                    </div>
                </td>
                <td><span class="call-type ${call.type}">${call.type}</span></td>
                <td>${call.duration}</td>
                <td>${this.formatDateTime(call.dateTime)}</td>
                <td><span class="call-status ${call.status}">${call.status}</span></td>
                <td>
                    <button class="btn-edit" onclick="communicationManager.callContact('${call.contact}')" title="Call Back">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button class="btn-edit" onclick="communicationManager.messageContact('${call.contact}')" title="Send Message">
                        <i class="fas fa-comment"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderNotifications() {
        const container = document.getElementById('notificationsList');
        container.innerHTML = this.notifications.map(notif => `
            <div class="notification-item ${notif.read ? '' : 'unread'}" data-type="${notif.type}">
                <div class="notification-icon ${notif.type}">
                    <i class="fas fa-${this.getNotificationIcon(notif.type)}"></i>
                </div>
                <div class="notification-content">
                    <h4>${notif.title}</h4>
                    <p>${notif.message}</p>
                    <span class="notification-time">${this.formatTime(notif.time)}</span>
                </div>
                <button class="notification-close" onclick="communicationManager.dismissNotification('${notif.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    filterNotifications(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        const notifications = document.querySelectorAll('.notification-item');
        notifications.forEach(notif => {
            if (filter === 'all' || notif.dataset.type === filter) {
                notif.style.display = 'flex';
            } else {
                notif.style.display = 'none';
            }
        });
    }

    dismissNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.renderNotifications();
    }

    getNotificationIcon(type) {
        const icons = {
            'system': 'cog',
            'sales': 'chart-line',
            'tasks': 'tasks'
        };
        return icons[type] || 'bell';
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    formatDateTime(timestamp) {
        return new Date(timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    callContact(contact) {
        this.showNotification(`Calling ${contact}...`, 'info');
    }

    messageContact(contact) {
        this.showNotification(`Opening message to ${contact}`, 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'info'}"></i> ${message}`;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    getInitialConversations() {
        return [
            {
                id: '1',
                name: 'John Smith',
                lastMessage: { text: 'Thanks for the quick response!', time: '2025-12-12T10:30:00Z' },
                unread: true,
                messages: [
                    { id: '1', text: 'Hello, I need help with my order', time: '2025-12-12T10:15:00Z', sender: 'contact' },
                    { id: '2', text: 'Sure, I can help you with that', time: '2025-12-12T10:16:00Z', sender: 'me' },
                    { id: '3', text: 'Thanks for the quick response!', time: '2025-12-12T10:30:00Z', sender: 'contact' }
                ]
            },
            {
                id: '2',
                name: 'Sarah Johnson',
                lastMessage: { text: 'The invoice looks good', time: '2025-12-12T09:45:00Z' },
                unread: false,
                messages: [
                    { id: '1', text: 'Can you send me the invoice?', time: '2025-12-12T09:30:00Z', sender: 'contact' },
                    { id: '2', text: 'Sure, sending it now', time: '2025-12-12T09:35:00Z', sender: 'me' },
                    { id: '3', text: 'The invoice looks good', time: '2025-12-12T09:45:00Z', sender: 'contact' }
                ]
            }
        ];
    }

    getInitialCallLog() {
        return [
            {
                contact: 'John Smith',
                phone: '+1 (555) 123-4567',
                type: 'incoming',
                duration: '5:32',
                dateTime: '2025-12-12T10:15:00Z',
                status: 'completed'
            },
            {
                contact: 'Sarah Johnson',
                phone: '+1 (555) 234-5678',
                type: 'outgoing',
                duration: '12:45',
                dateTime: '2025-12-12T09:30:00Z',
                status: 'completed'
            },
            {
                contact: 'Mike Davis',
                phone: '+1 (555) 345-6789',
                type: 'missed',
                duration: '0:00',
                dateTime: '2025-12-12T08:45:00Z',
                status: 'missed'
            }
        ];
    }

    getInitialNotifications() {
        return [
            {
                id: '1',
                type: 'system',
                title: 'System Backup Complete',
                message: 'Daily backup completed successfully at 2:00 AM',
                time: '2025-12-12T02:00:00Z',
                read: false
            },
            {
                id: '2',
                type: 'sales',
                title: 'New Sale Recorded',
                message: 'Sale of $2,500 recorded for ABC Corporation',
                time: '2025-12-12T10:30:00Z',
                read: false
            },
            {
                id: '3',
                type: 'tasks',
                title: 'Task Due Soon',
                message: 'Update inventory system task is due in 2 days',
                time: '2025-12-12T08:00:00Z',
                read: true
            }
        ];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.communicationManager = new CommunicationManager();
});