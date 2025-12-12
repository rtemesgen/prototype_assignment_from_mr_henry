class InvoiceManager {
    constructor() {
        this.invoices = this.getInitialInvoices();
        this.currentEditId = null;
        this.invoiceCounter = 1005;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderInvoicesTable();
        this.setDefaultDates();
    }

    setupEventListeners() {
        document.getElementById('createInvoiceBtn').addEventListener('click', () => this.showCreateForm());
        document.getElementById('cancelInvoiceBtn').addEventListener('click', () => this.hideForm());
        document.getElementById('invoiceForm').addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('addItemBtn').addEventListener('click', () => this.addInvoiceItem());
        document.getElementById('statusFilter').addEventListener('change', () => this.filterInvoices());
        document.getElementById('searchInvoices').addEventListener('input', () => this.filterInvoices());
        
        // Setup initial item calculation
        this.setupItemCalculations();
    }

    setupItemCalculations() {
        const itemsContainer = document.getElementById('invoiceItems');
        itemsContainer.addEventListener('input', (e) => {
            if (e.target.classList.contains('item-quantity') || e.target.classList.contains('item-price')) {
                this.updateItemTotal(e.target.closest('.invoice-item-row'));
                this.updateInvoiceTotals();
            }
        });
        
        itemsContainer.addEventListener('click', (e) => {
            if (e.target.closest('.btn-remove-item')) {
                this.removeInvoiceItem(e.target.closest('.invoice-item-row'));
            }
        });
    }

    showCreateForm() {
        document.getElementById('invoiceFormSection').style.display = 'block';
        document.querySelector('.sales-form-section h2').textContent = 'Create New Invoice';
        this.currentEditId = null;
    }

    hideForm() {
        document.getElementById('invoiceFormSection').style.display = 'none';
        document.getElementById('invoiceForm').reset();
        this.resetInvoiceItems();
        this.setDefaultDates();
    }

    setDefaultDates() {
        const today = new Date();
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + 30);
        
        document.getElementById('invoiceDate').value = today.toISOString().split('T')[0];
        document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
    }

    addInvoiceItem() {
        const itemsContainer = document.getElementById('invoiceItems');
        const itemRow = document.createElement('div');
        itemRow.className = 'invoice-item-row';
        itemRow.innerHTML = `
            <div class="form-group">
                <label>Item Description</label>
                <input type="text" class="item-description" placeholder="Item description" required>
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" class="item-quantity" placeholder="1" min="1" required>
            </div>
            <div class="form-group">
                <label>Unit Price</label>
                <input type="number" class="item-price" placeholder="0.00" step="0.01" min="0" required>
            </div>
            <div class="form-group">
                <label>Total</label>
                <input type="text" class="item-total" readonly>
            </div>
            <button type="button" class="btn-remove-item"><i class="fas fa-times"></i></button>
        `;
        itemsContainer.appendChild(itemRow);
    }

    removeInvoiceItem(itemRow) {
        if (document.querySelectorAll('.invoice-item-row').length > 1) {
            itemRow.remove();
            this.updateInvoiceTotals();
        }
    }

    updateItemTotal(itemRow) {
        const quantity = parseFloat(itemRow.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(itemRow.querySelector('.item-price').value) || 0;
        const total = quantity * price;
        itemRow.querySelector('.item-total').value = `$${total.toFixed(2)}`;
    }

    updateInvoiceTotals() {
        const itemRows = document.querySelectorAll('.invoice-item-row');
        let subtotal = 0;
        
        itemRows.forEach(row => {
            const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            subtotal += quantity * price;
        });
        
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;
        
        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('taxAmount').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('finalTotal').textContent = `$${total.toFixed(2)}`;
    }

    resetInvoiceItems() {
        const itemsContainer = document.getElementById('invoiceItems');
        itemsContainer.innerHTML = `
            <div class="invoice-item-row">
                <div class="form-group">
                    <label>Item Description</label>
                    <input type="text" class="item-description" placeholder="Item description" required>
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" class="item-quantity" placeholder="1" min="1" required>
                </div>
                <div class="form-group">
                    <label>Unit Price</label>
                    <input type="number" class="item-price" placeholder="0.00" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label>Total</label>
                    <input type="text" class="item-total" readonly>
                </div>
                <button type="button" class="btn-remove-item"><i class="fas fa-times"></i></button>
            </div>
        `;
        this.updateInvoiceTotals();
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const items = [];
        document.querySelectorAll('.invoice-item-row').forEach(row => {
            const description = row.querySelector('.item-description').value;
            const quantity = parseInt(row.querySelector('.item-quantity').value);
            const price = parseFloat(row.querySelector('.item-price').value);
            if (description && quantity && price) {
                items.push({ description, quantity, price, total: quantity * price });
            }
        });

        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.1;
        const total = subtotal + tax;

        const invoiceData = {
            id: this.currentEditId || Date.now().toString(),
            number: `INV-${this.invoiceCounter++}`,
            clientName: document.getElementById('clientName').value,
            clientEmail: document.getElementById('clientEmail').value,
            invoiceDate: document.getElementById('invoiceDate').value,
            dueDate: document.getElementById('dueDate').value,
            description: document.getElementById('description').value,
            items: items,
            subtotal: subtotal,
            tax: tax,
            total: total,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        if (this.currentEditId) {
            const index = this.invoices.findIndex(inv => inv.id === this.currentEditId);
            this.invoices[index] = invoiceData;
            this.showNotification('Invoice updated successfully', 'success');
        } else {
            this.invoices.unshift(invoiceData);
            this.showNotification('Invoice created successfully', 'success');
        }

        this.renderInvoicesTable();
        this.hideForm();
    }

    getInvoiceStatus(invoice) {
        const today = new Date();
        const dueDate = new Date(invoice.dueDate);
        
        if (invoice.status === 'paid') return { class: 'paid', text: 'Paid' };
        if (dueDate < today) return { class: 'overdue', text: 'Overdue' };
        return { class: 'pending', text: 'Pending' };
    }

    markAsPaid(invoiceId) {
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
            invoice.status = 'paid';
            invoice.paidDate = new Date().toISOString();
            this.renderInvoicesTable();
            this.showNotification('Invoice marked as paid', 'success');
        }
    }

    deleteInvoice(invoiceId) {
        if (confirm('Are you sure you want to delete this invoice?')) {
            this.invoices = this.invoices.filter(inv => inv.id !== invoiceId);
            this.renderInvoicesTable();
            this.showNotification('Invoice deleted successfully', 'success');
        }
    }

    renderInvoicesTable() {
        const tbody = document.getElementById('invoicesTableBody');
        const filteredInvoices = this.getFilteredInvoices();
        
        tbody.innerHTML = filteredInvoices.map(invoice => {
            const status = this.getInvoiceStatus(invoice);
            return `
                <tr>
                    <td>${invoice.number}</td>
                    <td>${invoice.clientName}</td>
                    <td>${this.formatDate(invoice.invoiceDate)}</td>
                    <td>${this.formatDate(invoice.dueDate)}</td>
                    <td>$${invoice.total.toFixed(2)}</td>
                    <td><span class="status-badge ${status.class}">${status.text}</span></td>
                    <td>
                        ${invoice.status !== 'paid' ? 
                            `<button class="btn-edit" onclick="invoiceManager.markAsPaid('${invoice.id}')" title="Mark as Paid">
                                <i class="fas fa-check"></i>
                            </button>` : ''}
                        <button class="btn-edit" onclick="invoiceManager.viewInvoice('${invoice.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-delete" onclick="invoiceManager.deleteInvoice('${invoice.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    getFilteredInvoices() {
        const statusFilter = document.getElementById('statusFilter').value;
        const searchTerm = document.getElementById('searchInvoices').value.toLowerCase();
        
        return this.invoices.filter(invoice => {
            const status = this.getInvoiceStatus(invoice);
            const matchesStatus = !statusFilter || status.class === statusFilter;
            const matchesSearch = !searchTerm || 
                invoice.number.toLowerCase().includes(searchTerm) ||
                invoice.clientName.toLowerCase().includes(searchTerm);
            return matchesStatus && matchesSearch;
        });
    }

    filterInvoices() {
        this.renderInvoicesTable();
    }

    viewInvoice(invoiceId) {
        const invoice = this.invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
            this.showNotification('Invoice viewer would open here', 'info');
            // In a real app, this would open a detailed invoice view or PDF
        }
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

    getInitialInvoices() {
        return [
            {
                id: '1',
                number: 'INV-1001',
                clientName: 'ABC Corporation',
                clientEmail: 'billing@abc-corp.com',
                invoiceDate: '2025-12-01',
                dueDate: '2025-12-31',
                description: 'Web development services',
                total: 2500.00,
                status: 'paid'
            },
            {
                id: '2',
                number: 'INV-1002',
                clientName: 'XYZ Enterprises',
                clientEmail: 'finance@xyz-ent.com',
                invoiceDate: '2025-12-05',
                dueDate: '2026-01-05',
                description: 'Consulting services',
                total: 1800.00,
                status: 'pending'
            },
            {
                id: '3',
                number: 'INV-1003',
                clientName: 'Tech Solutions LLC',
                clientEmail: 'accounts@techsol.com',
                invoiceDate: '2025-11-20',
                dueDate: '2025-12-10',
                description: 'Software licensing',
                total: 3200.00,
                status: 'pending'
            }
        ];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.invoiceManager = new InvoiceManager();
});