// Sales Management JavaScript
class SalesManager {
    constructor() {
        this.inventory = this.getInitialInventory();
        this.sales = this.getInitialSales();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderInventory();
        this.renderSalesTable();
        this.setDefaultDate();
        this.calculateTotal();
    }

    setupEventListeners() {
        // Form calculations
        document.getElementById('quantity').addEventListener('input', () => this.calculateTotal());
        document.getElementById('unitPrice').addEventListener('input', () => this.calculateTotal());

        // Form submission
        document.getElementById('salesForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSaleSubmission();
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.clearForm();
        });

        // Export button
        document.getElementById('exportSalesBtn').addEventListener('click', () => {
            this.exportSales();
        });
    }

    calculateTotal() {
        const quantity = parseFloat(document.getElementById('quantity').value) || 0;
        const unitPrice = parseFloat(document.getElementById('unitPrice').value) || 0;
        const total = quantity * unitPrice;
        
        document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('saleDate').value = today;
    }

    handleSaleSubmission() {
        const formData = {
            id: Date.now().toString(),
            itemName: document.getElementById('itemName').value,
            category: document.getElementById('itemCategory').value,
            quantity: parseInt(document.getElementById('quantity').value),
            unitPrice: parseFloat(document.getElementById('unitPrice').value),
            customerName: document.getElementById('customerName').value,
            saleDate: document.getElementById('saleDate').value,
            description: document.getElementById('description').value,
            total: parseFloat(document.getElementById('quantity').value) * parseFloat(document.getElementById('unitPrice').value)
        };

        // Add to sales list
        this.sales.unshift(formData);
        
        // Update inventory (decrease quantity)
        this.updateInventory(formData.itemName, formData.quantity);
        
        // Refresh displays
        this.renderSalesTable();
        this.renderInventory();
        
        // Clear form
        this.clearForm();
        
        // Show success message
        this.showNotification('Sale recorded successfully!', 'success');
    }

    updateInventory(itemName, soldQuantity) {
        const item = this.inventory.find(item => item.name.toLowerCase() === itemName.toLowerCase());
        if (item) {
            item.quantity = Math.max(0, item.quantity - soldQuantity);
        }
    }

    clearForm() {
        document.getElementById('salesForm').reset();
        this.setDefaultDate();
        document.getElementById('totalAmount').textContent = '$0.00';
    }

    renderInventory() {
        const inventoryGrid = document.getElementById('inventoryGrid');
        
        inventoryGrid.innerHTML = this.inventory.map(item => {
            const stockStatus = item.quantity < 10 ? 'low-stock' : 'in-stock';
            return `
                <div class="inventory-item ${stockStatus}">
                    <div class="item-header">
                        <h4>${item.name}</h4>
                        <span class="category-badge">${item.category}</span>
                    </div>
                    <div class="item-details">
                        <p class="quantity">Qty: ${item.quantity}</p>
                        <p class="price">$${item.price.toFixed(2)}</p>
                    </div>
                    <div class="stock-status">
                        ${item.quantity < 10 ? '<i class="fas fa-exclamation-triangle"></i> Low Stock' : '<i class="fas fa-check-circle"></i> In Stock'}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderSalesTable() {
        const tableBody = document.getElementById('salesTableBody');
        
        tableBody.innerHTML = this.sales.map(sale => `
            <tr>
                <td>${this.formatDate(sale.saleDate)}</td>
                <td>${sale.itemName}</td>
                <td>${sale.customerName}</td>
                <td>${sale.quantity}</td>
                <td>$${sale.unitPrice.toFixed(2)}</td>
                <td>$${sale.total.toFixed(2)}</td>
                <td>
                    <button class="btn-edit" onclick="salesManager.editSale('${sale.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="salesManager.deleteSale('${sale.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    editSale(saleId) {
        const sale = this.sales.find(s => s.id === saleId);
        if (sale) {
            // Populate form with sale data
            document.getElementById('itemName').value = sale.itemName;
            document.getElementById('itemCategory').value = sale.category;
            document.getElementById('quantity').value = sale.quantity;
            document.getElementById('unitPrice').value = sale.unitPrice;
            document.getElementById('customerName').value = sale.customerName;
            document.getElementById('saleDate').value = sale.saleDate;
            document.getElementById('description').value = sale.description || '';
            
            // Remove from sales list (will be re-added when saved)
            this.sales = this.sales.filter(s => s.id !== saleId);
            this.renderSalesTable();
            
            this.calculateTotal();
            this.showNotification('Sale loaded for editing', 'info');
        }
    }

    deleteSale(saleId) {
        if (confirm('Are you sure you want to delete this sale?')) {
            this.sales = this.sales.filter(s => s.id !== saleId);
            this.renderSalesTable();
            this.showNotification('Sale deleted successfully', 'success');
        }
    }

    exportSales() {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Date,Item,Customer,Quantity,Unit Price,Total\n"
            + this.sales.map(sale => 
                `${sale.saleDate},${sale.itemName},${sale.customerName},${sale.quantity},${sale.unitPrice},${sale.total}`
            ).join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sales_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Sales exported successfully', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getInitialInventory() {
        return [
            { id: 1, name: 'Laptop Pro', category: 'electronics', quantity: 25, price: 1299.99 },
            { id: 2, name: 'Wireless Headphones', category: 'electronics', quantity: 50, price: 199.99 },
            { id: 3, name: 'Smart Watch', category: 'electronics', quantity: 8, price: 299.99 },
            { id: 4, name: 'Gaming Chair', category: 'home', quantity: 15, price: 399.99 },
            { id: 5, name: 'Desk Lamp', category: 'home', quantity: 30, price: 79.99 },
            { id: 6, name: 'Coffee Maker', category: 'home', quantity: 5, price: 149.99 },
            { id: 7, name: 'Running Shoes', category: 'sports', quantity: 20, price: 129.99 },
            { id: 8, name: 'Yoga Mat', category: 'sports', quantity: 12, price: 49.99 }
        ];
    }

    getInitialSales() {
        return [
            {
                id: '1',
                itemName: 'Laptop Pro',
                category: 'electronics',
                quantity: 2,
                unitPrice: 1299.99,
                customerName: 'John Smith',
                saleDate: '2025-12-12',
                description: 'Corporate bulk order',
                total: 2599.98
            },
            {
                id: '2',
                itemName: 'Wireless Headphones',
                category: 'electronics',
                quantity: 3,
                unitPrice: 199.99,
                customerName: 'Sarah Johnson',
                saleDate: '2025-12-11',
                description: '',
                total: 599.97
            },
            {
                id: '3',
                itemName: 'Gaming Chair',
                category: 'home',
                quantity: 1,
                unitPrice: 399.99,
                customerName: 'Mike Davis',
                saleDate: '2025-12-10',
                description: 'Home office setup',
                total: 399.99
            }
        ];
    }
}

// Initialize the sales manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.salesManager = new SalesManager();
});