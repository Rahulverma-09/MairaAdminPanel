/**
 * Maira Jewels Admin - Dashboard Controller with Interactive Charts
 */

let salesTrendChartInstance = null;
let categoryPieChartInstance = null;

function initCharts() {
    if (typeof Chart === 'undefined') return;

    // Set global Chart.js defaults
    Chart.defaults.font.family = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";
    Chart.defaults.color = '#7c746b';

    // 1. Sales & Revenue Trend Line/Area Chart
    const trendCtx = document.getElementById('salesTrendChart');
    if (trendCtx) {
        if (salesTrendChartInstance) {
            salesTrendChartInstance.destroy();
        }

        const ctx = trendCtx.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 260);
        gradient.addColorStop(0, 'rgba(201, 169, 110, 0.35)');
        gradient.addColorStop(0.8, 'rgba(201, 169, 110, 0.03)');
        gradient.addColorStop(1, 'rgba(201, 169, 110, 0)');

        salesTrendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                datasets: [{
                    label: 'Revenue ($)',
                    data: [12450, 15800, 14200, 18900, 21500, 19800, 24600, 28450],
                    borderColor: '#c9a96e',
                    borderWidth: 2.5,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.38,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#c9a96e',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#c9a96e',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1e1b18',
                        titleColor: '#ffffff',
                        bodyColor: '#f5eedf',
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function (context) {
                                return 'Revenue: $' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#8c827a',
                            font: { size: 12, weight: '500' }
                        }
                    },
                    y: {
                        grid: {
                            color: '#f2ede4',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#8c827a',
                            font: { size: 11 },
                            callback: function (value) {
                                return '$' + (value >= 1000 ? (value / 1000) + 'k' : value);
                            }
                        }
                    }
                }
            }
        });
    }

    // 2. Sales by Category Doughnut / Pie Chart
    const pieCtx = document.getElementById('categoryPieChart');
    if (pieCtx) {
        if (categoryPieChartInstance) {
            categoryPieChartInstance.destroy();
        }

        const ctx = pieCtx.getContext('2d');

        categoryPieChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Rings', 'Necklaces', 'Bracelets', 'Earrings'],
                datasets: [{
                    data: [45, 25, 18, 12],
                    backgroundColor: [
                        '#c9a96e', // Champagne Gold
                        '#a8894f', // Warm Bronze
                        '#059669', // Emerald
                        '#2563eb'  // Indigo Sapphire
                    ],
                    borderWidth: 3,
                    borderColor: '#ffffff',
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 12,
                                weight: '600'
                            },
                            color: '#2b2723'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e1b18',
                        titleColor: '#ffffff',
                        bodyColor: '#f5eedf',
                        padding: 10,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                const val = context.parsed;
                                return ` ${context.label}: ${val}% of total sales`;
                            }
                        }
                    }
                }
            }
        });
    }
}

function renderDashboard() {
    const products = Storage.getProducts();
    const categories = Storage.getCategories();
    const orders = Storage.getOrders();
    const payments = Storage.getPayments();
    const messages = Storage.getMessages();
    const faqs = Storage.getFaqs();

    // Stats
    const statProducts = document.getElementById('stat-products');
    const statCategories = document.getElementById('stat-categories');
    const statOrders = document.getElementById('stat-orders');
    const statPayments = document.getElementById('stat-payments');
    const statMessages = document.getElementById('stat-messages');
    const statFaqs = document.getElementById('stat-faqs');

    if (statProducts) statProducts.textContent = products.length;
    if (statCategories) statCategories.textContent = categories.length;
    if (statOrders) statOrders.textContent = orders.length;
    if (statPayments) statPayments.textContent = payments.length;
    if (statMessages) statMessages.textContent = messages.length;
    if (statFaqs) statFaqs.textContent = faqs.length;

    // Recent orders
    const recentOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const recentOrdersTable = document.getElementById('recent-orders-table');
    if (recentOrdersTable) {
        if (recentOrders.length === 0) {
            recentOrdersTable.innerHTML = '<tr><td colspan="5" class="empty-state">No orders yet</td></tr>';
        } else {
            recentOrdersTable.innerHTML = recentOrders.map(order => `
                <tr>
                    <td><span class="order-code">${escapeHtml(order.id)}</span></td>
                    <td><strong>${escapeHtml(order.customer.name)}</strong></td>
                    <td><strong style="color: var(--color-charcoal); font-weight: 700;">${formatPrice(order.total)}</strong></td>
                    <td>${getStatusBadge(order.status)}</td>
                    <td style="color: var(--color-muted); font-size: 0.82rem;">${formatDate(order.date)}</td>
                </tr>
            `).join('');
        }
    }

    // Recent messages
    const recentMessages = [...messages].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
    const recentMessagesList = document.getElementById('recent-messages-list');
    if (recentMessagesList) {
        if (recentMessages.length === 0) {
            recentMessagesList.innerHTML = '<div class="empty-state">No messages yet</div>';
        } else {
            recentMessagesList.innerHTML = recentMessages.map(msg => `
                <div class="message-item" data-message-id="${msg.id}">
                    <div class="message-item__name">
                        <span>${escapeHtml(msg.name)}</span>
                        ${msg.status === 'new' ? '<span class="status-badge status-badge--new"><span class="status-dot"></span>NEW</span>' : ''}
                    </div>
                    <div class="message-item__subject">${escapeHtml(msg.subject)}</div>
                    <div class="message-item__date">${formatDate(msg.date)}</div>
                </div>
            `).join('');

            recentMessagesList.querySelectorAll('.message-item').forEach(item => {
                item.addEventListener('click', () => {
                    window.location.href = 'contact.html';
                });
            });
        }
    }

    // Initialize Interactive Charts
    initCharts();
}

document.addEventListener('DOMContentLoaded', () => {
    initLayout('dashboard');
    renderDashboard();
});
