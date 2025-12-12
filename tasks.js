class TaskManager {
    constructor() {
        this.tasks = this.getInitialTasks();
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTasksTable();
        this.setDefaultDates();
    }

    setupEventListeners() {
        document.getElementById('addTaskBtn').addEventListener('click', () => this.showAddForm());
        document.getElementById('cancelTaskBtn').addEventListener('click', () => this.hideForm());
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('statusFilter').addEventListener('change', () => this.filterTasks());
        document.getElementById('priorityFilter').addEventListener('change', () => this.filterTasks());
        document.getElementById('searchTasks').addEventListener('input', () => this.filterTasks());
    }

    showAddForm() {
        document.getElementById('taskFormSection').style.display = 'block';
        document.querySelector('.sales-form-section h2').textContent = 'Add New Task';
        this.currentEditId = null;
    }

    hideForm() {
        document.getElementById('taskFormSection').style.display = 'none';
        document.getElementById('taskForm').reset();
        this.setDefaultDates();
    }

    setDefaultDates() {
        const today = new Date();
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + 7);
        
        document.getElementById('startDate').value = today.toISOString().split('T')[0];
        document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const taskData = {
            id: this.currentEditId || Date.now().toString(),
            title: document.getElementById('taskTitle').value,
            priority: document.getElementById('taskPriority').value,
            assignedTo: document.getElementById('assignedTo').value,
            category: document.getElementById('taskCategory').value,
            startDate: document.getElementById('startDate').value,
            dueDate: document.getElementById('dueDate').value,
            description: document.getElementById('taskDescription').value,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        if (this.currentEditId) {
            const index = this.tasks.findIndex(task => task.id === this.currentEditId);
            this.tasks[index] = {...this.tasks[index], ...taskData};
            this.showNotification('Task updated successfully', 'success');
        } else {
            this.tasks.unshift(taskData);
            this.showNotification('Task created successfully', 'success');
        }

        this.renderTasksTable();
        this.hideForm();
    }

    updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            if (newStatus === 'completed') {
                task.completedAt = new Date().toISOString();
            }
            this.renderTasksTable();
            this.showNotification(`Task marked as ${newStatus}`, 'success');
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.currentEditId = taskId;
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('assignedTo').value = task.assignedTo;
            document.getElementById('taskCategory').value = task.category;
            document.getElementById('startDate').value = task.startDate;
            document.getElementById('dueDate').value = task.dueDate;
            document.getElementById('taskDescription').value = task.description;
            document.querySelector('.sales-form-section h2').textContent = 'Edit Task';
            document.getElementById('taskFormSection').style.display = 'block';
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.renderTasksTable();
            this.showNotification('Task deleted successfully', 'success');
        }
    }

    getTaskStatus(task) {
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        
        if (task.status === 'completed') return { class: 'completed', text: 'Completed' };
        if (task.status === 'in-progress') return { class: 'in-progress', text: 'In Progress' };
        if (dueDate < today && task.status !== 'completed') return { class: 'overdue', text: 'Overdue' };
        return { class: 'pending', text: 'Pending' };
    }

    getPriorityClass(priority) {
        const classes = {
            'urgent': 'priority-urgent',
            'high': 'priority-high',
            'medium': 'priority-medium',
            'low': 'priority-low'
        };
        return classes[priority] || 'priority-medium';
    }

    renderTasksTable() {
        const tbody = document.getElementById('tasksTableBody');
        const filteredTasks = this.getFilteredTasks();
        
        tbody.innerHTML = filteredTasks.map(task => {
            const status = this.getTaskStatus(task);
            const priorityClass = this.getPriorityClass(task.priority);
            
            return `
                <tr>
                    <td>
                        <div class="task-title">${task.title}</div>
                        <div class="task-description">${task.description.substring(0, 50)}...</div>
                    </td>
                    <td>${task.assignedTo}</td>
                    <td><span class="priority-badge ${priorityClass}">${task.priority.toUpperCase()}</span></td>
                    <td>${task.category}</td>
                    <td>${this.formatDate(task.dueDate)}</td>
                    <td><span class="status-badge ${status.class}">${status.text}</span></td>
                    <td>
                        ${task.status === 'pending' ? 
                            `<button class="btn-edit" onclick="taskManager.updateTaskStatus('${task.id}', 'in-progress')" title="Start Task">
                                <i class="fas fa-play"></i>
                            </button>` : ''}
                        ${task.status === 'in-progress' ? 
                            `<button class="btn-edit" onclick="taskManager.updateTaskStatus('${task.id}', 'completed')" title="Complete Task">
                                <i class="fas fa-check"></i>
                            </button>` : ''}
                        <button class="btn-edit" onclick="taskManager.editTask('${task.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="taskManager.deleteTask('${task.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    getFilteredTasks() {
        const statusFilter = document.getElementById('statusFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        const searchTerm = document.getElementById('searchTasks').value.toLowerCase();
        
        return this.tasks.filter(task => {
            const status = this.getTaskStatus(task);
            const matchesStatus = !statusFilter || status.class === statusFilter;
            const matchesPriority = !priorityFilter || task.priority === priorityFilter;
            const matchesSearch = !searchTerm || 
                task.title.toLowerCase().includes(searchTerm) ||
                task.description.toLowerCase().includes(searchTerm) ||
                task.assignedTo.toLowerCase().includes(searchTerm);
            
            return matchesStatus && matchesPriority && matchesSearch;
        });
    }

    filterTasks() {
        this.renderTasksTable();
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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

    getInitialTasks() {
        return [
            {
                id: '1',
                title: 'Update inventory system',
                priority: 'high',
                assignedTo: 'John Smith',
                category: 'development',
                startDate: '2025-12-10',
                dueDate: '2025-12-15',
                description: 'Update the inventory management system with new features',
                status: 'in-progress'
            },
            {
                id: '2',
                title: 'Prepare monthly sales report',
                priority: 'medium',
                assignedTo: 'Sarah Johnson',
                category: 'sales',
                startDate: '2025-12-12',
                dueDate: '2025-12-20',
                description: 'Compile and analyze monthly sales data for presentation',
                status: 'pending'
            },
            {
                id: '3',
                title: 'Customer follow-up calls',
                priority: 'urgent',
                assignedTo: 'Mike Davis',
                category: 'support',
                startDate: '2025-12-08',
                dueDate: '2025-12-10',
                description: 'Follow up with customers who had support tickets',
                status: 'overdue'
            }
        ];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});