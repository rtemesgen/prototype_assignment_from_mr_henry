class StockManager {
    constructor() {
        this.stockItems = this.getInitialStock();
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderStockTable();
        this.updateOverview();
    }

    setupEventListeners() {
        document.getElementById('addItemBtn').addEventListener('click', () => this.showAddForm());
        document.getElementById('cancelStockBtn').addEventListener('click', () => this.hideForm());
        document.getElementById('stockForm').addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterStock());
        document.getElementById('searchStock').addEventListener('input', () => this.filterStock());
    }

    showAddForm() {
        document.getElementById('stockFormSection').style.display = 'block';
        document.querySelector('.sales-form-section h2').textContent = 'Add New Item';
        this.currentEditId = null;
    }

    hideForm() {
        document.getElementById('stockFormSection').style.display = 'none';
        document.getElementById('stockForm').reset();
    }

    handleSubmit(e) {
        e.preventDefault();
        const formData = {
            id: this.currentEditId || Date.now().toString(),
            name: document.getElementById('itemName').value,
            sku: document.getElementById('itemSku').value,
            category: document.getElementById('category').value,
            supplier: document.getElementById('supplier').value,
            quantity: parseInt(document.getElementById('quantity').value),
            minStock: parseInt(document.getElementById('minStock').value),
            costPrice: parseFloat(document.getElementById('costPrice').value),
            sellingPrice: parseFloat(document.getElementById('sellingPrice').value)
        };

        if (this.currentEditId) {
            const index = this.stockItems.findIndex(item => item.id === this.currentEditId);
            this.stockItems[index] = formData;
            this.showNotification('Item updated successfully', 'success');
        } else {
            this.stockItems.push(formData);
            this.showNotification('Item added successfully', 'success');
        }

        this.renderStockTable();
        this.updateOverview();
        this.hideForm();
    }

    editItem(id) {
        const item = this.stockItems.find(item => item.id === id);
        if (item) {
            this.currentEditId = id;
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemSku').value = item.sku;
            document.getElementById('category').value = item.category;
            document.getElementById('supplier').value = item.supplier;
            document.getElementById('quantity').value = item.quantity;
            document.getElementById('minStock').value = item.minStock;
            document.getElementById('costPrice').value = item.costPrice;
            document.getElementById('sellingPrice').value = item.sellingPrice;
            document.querySelector('.sales-form-section h2').textContent = 'Edit Item';
            document.getElementById('stockFormSection').style.display = 'block';
        }
    }

    deleteItem(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.stockItems = this.stockItems.filter(item => item.id !== id);
            this.renderStockTable();
            this.updateOverview();
            this.showNotification('Item deleted successfully', 'success');
        }
    }

    getStockStatus(item) {
        if (item.quantity === 0) return { class: 'out-of-stock', text: 'Out of Stock' };
        if (item.quantity <= item.minStock) return { class: 'low-stock', text: 'Low Stock' };
        return { class: 'in-stock', text: 'In Stock' };
    }

    renderStockTable() {
        const tbody = document.getElementById('stockTableBody');
        const filteredItems = this.getFilteredItems();
        
        tbody.innerHTML = filteredItems.map(item => {
            const status = this.getStockStatus(item);
            return `
                <tr>
                    <td>${item.sku}</td>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>${item.quantity}</td>
                    <td>${item.minStock}</td>
                    <td>$${item.costPrice.toFixed(2)}</td>
                    <td>$${item.sellingPrice.toFixed(2)}</td>
                    <td><span class="status-badge ${status.class}">${status.text}</span></td>
                    <td>
                        <button class="btn-edit" onclick="stockManager.editItem('${item.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-delete" onclick="stockManager.deleteItem('${item.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    getFilteredItems() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const searchTerm = document.getElementById('searchStock').value.toLowerCase();
        
        return this.stockItems.filter(item => {
            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            const matchesSearch = !searchTerm || 
                item.name.toLowerCase().includes(searchTerm) || 
                item.sku.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesSearch;
        });
    }

    filterStock() {
        this.renderStockTable();
    }

    updateOverview() {
        const totalItems = this.stockItems.reduce((sum, item) => sum + item.quantity, 0);
        const lowStockCount = this.stockItems.filter(item => item.quantity > 0 && item.quantity <= item.minStock).length;
        const outOfStockCount = this.stockItems.filter(item => item.quantity === 0).length;
        const stockValue = this.stockItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);

        document.getElementById('totalItems').textContent = totalItems.toLocaleString();
        document.getElementById('lowStockItems').textContent = lowStockCount;
        document.getElementById('outOfStockItems').textContent = outOfStockCount;
        document.getElementById('stockValue').textContent = `$${stockValue.toLocaleString()}`;
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

    getInitialStock() {
        return [
            { id: '1', name: 'Laptop Pro', sku: 'LPT-001', category: 'electronics', supplier: 'TechCorp', quantity: 25, minStock: 10, costPrice: 999.99, sellingPrice: 1299.99 },
            { id: '2', name: 'Wireless Mouse', sku: 'MSE-002', category: 'electronics', supplier: 'AccessoryPlus', quantity: 150, minStock: 50, costPrice: 19.99, sellingPrice: 39.99 },
            { id: '3', name: 'Office Chair', sku: 'CHR-003', category: 'home', supplier: 'FurnitureMax', quantity: 8, minStock: 15, costPrice: 199.99, sellingPrice: 399.99 },
            { id: '4', name: 'Running Shoes', sku: 'SHO-004', category: 'sports', supplier: 'SportGear', quantity: 0, minStock: 20, costPrice: 79.99, sellingPrice: 129.99 },
            { id: '5', name: 'Bluetooth Speaker', sku: 'SPK-005', category: 'electronics', supplier: 'AudioTech', quantity: 35, minStock: 25, costPrice: 49.99, sellingPrice: 89.99 }
        ];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.stockManager = new StockManager();
});