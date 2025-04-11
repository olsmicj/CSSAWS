/**
 * Dashboard Module
 * Handles the analytics dashboard, charts, and metrics using SVG-based charts
 */

const DashboardUI = (() => {
    // Chart instances
    let charts = {
        ticketStatus: null,
        areaSupervisor: null,
        systemHealth: null,
        trend: null
    };
    
    // Dashboard state
    let dashboardState = {
        visible: true,
        activeWidgets: ['ticket-overview', 'area-supervisor', 'resolution-time', 'system-health', 'ticket-trend', 'metrics'],
        currentPreset: 'admin'
    };

    // Define different dashboard presets
    const presets = {
        admin: {
            widgets: ['ticket-overview', 'area-supervisor', 'resolution-time', 'system-health', 'ticket-trend', 'metrics'],
            layout: {
                'ticket-overview': { column: 1, row: 1 },
                'area-supervisor': { column: 2, row: 1 },
                'resolution-time': { column: 3, row: 1 },
                'system-health': { column: 1, row: 2 },
                'ticket-trend': { column: '2 / span 2', row: 2 },
                'metrics': { column: '1 / span 3', row: 3 }
            }
        },
        technician: {
            widgets: ['ticket-overview', 'area-supervisor', 'system-health', 'metrics'],
            layout: {
                'ticket-overview': { column: 1, row: 1 },
                'area-supervisor': { column: 2, row: 1 },
                'system-health': { column: 3, row: 1 },
                'metrics': { column: '1 / span 3', row: 2 }
            }
        },
        viewer: {
            widgets: ['ticket-overview', 'system-health', 'metrics'],
            layout: {
                'ticket-overview': { column: 1, row: 1 },
                'system-health': { column: 2, row: 1 },
                'metrics': { column: 3, row: 1 }
            }
        }
    };

    // Initialize dashboard
    const initialize = () => {
        // Add dashboard elements to DOM if needed
        
    // Set up dashboard toggle buttons
    document.getElementById('toggle-dashboard-btn').addEventListener('click', toggleDashboard);
    document.getElementById('toggle-dashboard-main').addEventListener('click', toggleDashboard);
    
    // Set up dashboard preset selector
        document.getElementById('dashboard-preset').addEventListener('change', (e) => {
            applyPreset(e.target.value);
        });
        
        // Set up customize dashboard button
        document.getElementById('customize-dashboard-btn').addEventListener('click', showCustomizeModal);
        
        // Load stored dashboard state from localStorage if exists
        const storedState = localStorage.getItem('dashboardState');
        if (storedState) {
            dashboardState = JSON.parse(storedState);
            applyDashboardState();
        } else {
            // Apply default preset
            applyPreset('admin');
        }
        
        // Initial dashboard update
        updateDashboard();
    };

    // Apply dashboard preset
    const applyPreset = (presetName) => {
        if (!presets[presetName]) return;
        
        dashboardState.currentPreset = presetName;
        dashboardState.activeWidgets = [...presets[presetName].widgets];
        
        applyDashboardState();
        saveDashboardState();
        updateDashboard();
    };

    // Apply dashboard state to UI
    const applyDashboardState = () => {
        // Update dashboard visibility
        const dashboardContainer = document.getElementById('dashboard');
        dashboardContainer.style.display = dashboardState.visible ? 'block' : 'none';
        
        // Update toggle button text
        const toggleBtn = document.getElementById('toggle-dashboard-btn');
        toggleBtn.textContent = dashboardState.visible ? 'Hide Dashboard' : 'Show Dashboard';
        
        // Update preset selector
        document.getElementById('dashboard-preset').value = dashboardState.currentPreset;
        
        // Show/hide widgets based on active widgets
        const allWidgets = document.querySelectorAll('.widget');
        allWidgets.forEach(widget => {
            const widgetId = widget.id.replace('widget-', '');
            widget.style.display = dashboardState.activeWidgets.includes(widgetId) ? 'block' : 'none';
        });
        
        // Apply layout from preset
        const dashboardWidgets = document.querySelector('.dashboard-widgets');
        const currentPreset = presets[dashboardState.currentPreset];
        
        dashboardState.activeWidgets.forEach(widgetId => {
            const widget = document.getElementById(`widget-${widgetId}`);
            if (widget && currentPreset.layout[widgetId]) {
                const layout = currentPreset.layout[widgetId];
                widget.style.gridColumn = layout.column;
                widget.style.gridRow = layout.row;
            }
        });
    };

    // Save dashboard state to localStorage
    const saveDashboardState = () => {
        localStorage.setItem('dashboardState', JSON.stringify(dashboardState));
    };

    // Toggle dashboard visibility
    const toggleDashboard = () => {
        dashboardState.visible = !dashboardState.visible;
        applyDashboardState();
        saveDashboardState();
    };

    // Show customize dashboard modal
    const showCustomizeModal = () => {
        // Create modal if it doesn't exist
        let modal = document.getElementById('dashboard-customize-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'dashboard-customize-modal';
            modal.className = 'modal dashboard-customize-modal';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            modalContent.innerHTML = `
                <span class="close-modal">&times;</span>
                <h2>Customize Dashboard</h2>
                <h3>Widgets</h3>
                <div class="widget-options">
                    <div class="widget-option">
                        <input type="checkbox" id="widget-option-ticket-overview" value="ticket-overview">
                        <label for="widget-option-ticket-overview">Ticket Overview</label>
                    </div>
                    <div class="widget-option">
                        <input type="checkbox" id="widget-option-area-supervisor" value="area-supervisor">
                        <label for="widget-option-area-supervisor">Area Supervisor Distribution</label>
                    </div>
                    <div class="widget-option">
                        <input type="checkbox" id="widget-option-resolution-time" value="resolution-time">
                        <label for="widget-option-resolution-time">Resolution Time</label>
                    </div>
                    <div class="widget-option">
                        <input type="checkbox" id="widget-option-system-health" value="system-health">
                        <label for="widget-option-system-health">System Health</label>
                    </div>
                    <div class="widget-option">
                        <input type="checkbox" id="widget-option-ticket-trend" value="ticket-trend">
                        <label for="widget-option-ticket-trend">Ticket Trend</label>
                    </div>
                    <div class="widget-option">
                        <input type="checkbox" id="widget-option-metrics" value="metrics">
                        <label for="widget-option-metrics">Key Metrics</label>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="secondary-btn" id="reset-dashboard">Reset to Default</button>
                    <button type="button" class="primary-btn" id="save-dashboard">Save Changes</button>
                </div>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // Add event listeners
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
            
            // Reset dashboard button
            modal.querySelector('#reset-dashboard').addEventListener('click', () => {
                applyPreset('admin');
                modal.style.display = 'none';
            });
            
            // Save changes button
            modal.querySelector('#save-dashboard').addEventListener('click', () => {
                saveCustomization();
                modal.style.display = 'none';
            });
        }
        
        // Update checkboxes based on current state
        dashboardState.activeWidgets.forEach(widgetId => {
            const checkbox = modal.querySelector(`#widget-option-${widgetId}`);
            if (checkbox) checkbox.checked = true;
        });
        
        // Show modal
        modal.style.display = 'block';
    };

    // Save dashboard customization
    const saveCustomization = () => {
        const modal = document.getElementById('dashboard-customize-modal');
        const checkboxes = modal.querySelectorAll('.widget-option input[type="checkbox"]');
        
        // Update active widgets based on checkboxes
        dashboardState.activeWidgets = [];
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                dashboardState.activeWidgets.push(checkbox.value);
            }
        });
        
        // Create a custom preset
        dashboardState.currentPreset = 'custom';
        
        // Apply changes and save state
        applyDashboardState();
        saveDashboardState();
        updateDashboard();
    };

    // Update dashboard data and charts
    const updateDashboard = async () => {
        try {
            // Access directly from FileManager to get current data
            const allData = FileManager.getAllData();
            const tickets = allData?.tickets || [];
            const systems = allData?.systems || [];
            
            console.log('Dashboard update - Tickets:', tickets.length, 'Systems:', systems.length);
            
            if (dashboardState.visible) {
                if (tickets.length > 0) {
                    updateTicketStatusChart(tickets);
                    updateAreaSupervisorChart(tickets);
                    updateResolutionTimeChart(tickets);
                    updateMetrics(tickets);
                }
                
                if (systems.length > 0) {
                    updateSystemHealthChart(systems);
                }
                
                if (tickets.length > 0) {
                    updateTicketTrendChart(tickets);
                }
            }
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    };

    // Update ticket status chart
    const updateTicketStatusChart = (tickets) => {
        // Return if widget is not active
        if (!dashboardState.activeWidgets.includes('ticket-overview')) return;
        
        // Count tickets by status
        const statusCounts = {
            'open': 0,
            'in-progress': 0,
            'resolved': 0,
            'closed': 0
        };
        
        tickets.forEach(ticket => {
            statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
        });
        
        // Prepare data for chart
        const chartData = [
            { label: 'Open', value: statusCounts.open },
            { label: 'In Progress', value: statusCounts['in-progress'] },
            { label: 'Resolved', value: statusCounts.resolved },
            { label: 'Closed', value: statusCounts.closed }
        ];
        
        // Create or update chart
        if (!charts.ticketStatus) {
            charts.ticketStatus = new SVGCharts.PieChart('ticket-status-chart', {
                isDonut: true,
                colors: ['#1976d2', '#ff8f00', '#388e3c', '#616161']
            });
        }
        
        // Render chart
        charts.ticketStatus.render(chartData);
    };

    // Update area supervisor chart
    const updateAreaSupervisorChart = (tickets) => {
        // Return if widget is not active
        if (!dashboardState.activeWidgets.includes('area-supervisor')) return;
        
        // Count tickets by area supervisor
        const supervisorCounts = {};
        
        tickets.forEach(ticket => {
            const supervisor = ticket.areaSupervisor || 'Unassigned';
            supervisorCounts[supervisor] = (supervisorCounts[supervisor] || 0) + 1;
        });
        
        // Get top 6 supervisors by ticket count
        const topSupervisors = Object.keys(supervisorCounts)
            .sort((a, b) => supervisorCounts[b] - supervisorCounts[a])
            .slice(0, 6);
        
        // Prepare data for chart
        const chartData = topSupervisors.map(supervisor => ({
            label: supervisor,
            value: supervisorCounts[supervisor]
        }));
        
        // Add "Others" category if there are more than 6 supervisors
        if (Object.keys(supervisorCounts).length > 6) {
            const othersCount = Object.keys(supervisorCounts)
                .filter(supervisor => !topSupervisors.includes(supervisor))
                .reduce((sum, supervisor) => sum + supervisorCounts[supervisor], 0);
            
            if (othersCount > 0) {
                chartData.push({ label: 'Others', value: othersCount });
            }
        }
        
        // Create or update chart
        if (!charts.areaSupervisor) {
            charts.areaSupervisor = new SVGCharts.PieChart('supervisor-chart', {
                colors: ['#3498db', '#9b59b6', '#e74c3c', '#f1c40f', '#2ecc71', '#1abc9c', '#95a5a6']
            });
        }
        
        // Render chart
        charts.areaSupervisor.render(chartData);
    };

    // Update resolution time chart
    const updateResolutionTimeChart = (tickets) => {
        // Return if widget is not active
        if (!dashboardState.activeWidgets.includes('resolution-time')) return;
        
        // Calculate average resolution time by priority
        const resolutionTimes = {
            'low': [],
            'medium': [],
            'high': [],
            'critical': []
        };
        
        tickets.forEach(ticket => {
            if (ticket.resolvedAt && ticket.status === 'resolved') {
                const createdTime = new Date(ticket.createdAt).getTime();
                const resolvedTime = new Date(ticket.resolvedAt).getTime();
                const resolutionTime = resolvedTime - createdTime;
                
                // Convert to hours
                const resolutionHours = resolutionTime / (1000 * 60 * 60);
                resolutionTimes[ticket.priority].push(resolutionHours);
            }
        });
        
        // Calculate averages
        const avgResolutionTimes = {
            'low': 0,
            'medium': 0,
            'high': 0,
            'critical': 0
        };
        
        Object.keys(resolutionTimes).forEach(priority => {
            if (resolutionTimes[priority].length > 0) {
                const sum = resolutionTimes[priority].reduce((a, b) => a + b, 0);
                avgResolutionTimes[priority] = sum / resolutionTimes[priority].length;
            }
        });
        
        // Prepare data for chart
        const chartData = [
            { label: 'Low', value: avgResolutionTimes.low },
            { label: 'Medium', value: avgResolutionTimes.medium },
            { label: 'High', value: avgResolutionTimes.high },
            { label: 'Critical', value: avgResolutionTimes.critical }
        ];
        
        // Create or update chart
        if (!charts.resolution) {
            charts.resolution = new SVGCharts.BarChart('resolution-chart', {
                colors: ['#2ecc71', '#f39c12', '#e74c3c', '#c0392b'],
                yAxisLabel: 'Hours'
            });
        }
        
        // Render chart
        charts.resolution.render(chartData);
    };

    // Update system health chart
    const updateSystemHealthChart = (systems) => {
        // Return if widget is not active
        if (!dashboardState.activeWidgets.includes('system-health')) return;
        
        // Count systems by status
        const statusCounts = {
            'operational': 0,
            'degraded': 0,
            'down': 0,
            'unknown': 0
        };
        
        systems.forEach(system => {
            statusCounts[system.status] = (statusCounts[system.status] || 0) + 1;
        });
        
        // Prepare data for chart
        const chartData = [
            { label: 'Operational', value: statusCounts.operational },
            { label: 'Degraded', value: statusCounts.degraded },
            { label: 'Down', value: statusCounts.down },
            { label: 'Unknown', value: statusCounts.unknown }
        ];
        
        // Create or update chart
        if (!charts.systemHealth) {
            charts.systemHealth = new SVGCharts.PieChart('system-health-chart', {
                isDonut: true,
                colors: ['#2ecc71', '#f39c12', '#e74c3c', '#95a5a6']
            });
        }
        
        // Render chart
        charts.systemHealth.render(chartData);
    };

    // Update ticket trend chart
    const updateTicketTrendChart = (tickets) => {
        // Return if widget is not active
        if (!dashboardState.activeWidgets.includes('ticket-trend')) return;
        
        // Get dates for the last 30 days
        const dates = [];
        const today = new Date();
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        
        // Count tickets created each day
        const ticketCounts = {};
        dates.forEach(date => {
            ticketCounts[date] = 0;
        });
        
        tickets.forEach(ticket => {
            const createdDate = new Date(ticket.createdAt).toISOString().split('T')[0];
            if (ticketCounts[createdDate] !== undefined) {
                ticketCounts[createdDate]++;
            }
        });
        
        // Prepare data for chart
        const chartData = dates.map(date => {
            return {
                label: date,
                value: ticketCounts[date]
            };
        });
        
        // Create or update chart
        if (!charts.trend) {
            charts.trend = new SVGCharts.LineChart('trend-chart', {
                lineColor: '#3498db',
                fillColor: 'rgba(52, 152, 219, 0.1)',
                xAxisLabels: dates,
                maxLabels: 10
            });
        }
        
        // Render chart
        charts.trend.render(chartData);
    };

    // Update metrics
    const updateMetrics = (tickets) => {
        // Return if widget is not active
        if (!dashboardState.activeWidgets.includes('metrics')) return;
        
        // Calculate metrics
        
        // Open tickets
        const openTickets = tickets.filter(ticket => ticket.status === 'open' || ticket.status === 'in-progress').length;
        document.getElementById('metric-open').textContent = openTickets;
        
        // Average resolution time
        const resolvedTickets = tickets.filter(ticket => ticket.resolvedAt);
        let totalResolutionTime = 0;
        
        resolvedTickets.forEach(ticket => {
            const createdTime = new Date(ticket.createdAt).getTime();
            const resolvedTime = new Date(ticket.resolvedAt).getTime();
            totalResolutionTime += resolvedTime - createdTime;
        });
        
        const avgResolutionTime = resolvedTickets.length > 0 
            ? totalResolutionTime / resolvedTickets.length 
            : 0;
        
        // Convert to hours
        const avgResolutionHours = Math.round(avgResolutionTime / (1000 * 60 * 60));
        document.getElementById('metric-avg-resolution').textContent = `${avgResolutionHours}h`;
        
        // Critical issues
        const criticalTickets = tickets.filter(
            ticket => ticket.priority === 'critical' && 
            (ticket.status === 'open' || ticket.status === 'in-progress')
        ).length;
        document.getElementById('metric-critical').textContent = criticalTickets;
        
        // Resolved today
        const today = new Date().toISOString().split('T')[0];
        const resolvedToday = tickets.filter(ticket => {
            if (!ticket.resolvedAt) return false;
            const resolvedDate = new Date(ticket.resolvedAt).toISOString().split('T')[0];
            return resolvedDate === today;
        }).length;
        document.getElementById('metric-resolved').textContent = resolvedToday;
    };

    // Public API
    return {
        initialize,
        updateDashboard,
        applyPreset,
        toggleDashboard
    };
})();

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    DashboardUI.initialize();
});
