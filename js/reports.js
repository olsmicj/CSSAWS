/**
 * Reports Module
 * Handles reporting functionality
 */

const ReportUI = (() => {
    // Initialize report event listeners
    const initEventListeners = () => {
        // Generate report button
        UI.elements.generateReportBtn.addEventListener('click', generateReport);
        
        // Export report button
        UI.elements.exportReportBtn.addEventListener('click', exportReport);
    };

    // Generate report
    const generateReport = () => {
        const reportType = UI.elements.reportType.value;
        const dateRange = UI.elements.reportDateRange.value;
        const filter = UI.elements.reportFilter.value;
        
        // Additional filters for custom date range
        const additionalFilters = {};
        
        if (dateRange === 'custom') {
            additionalFilters.startDate = UI.elements.reportStartDate.value;
            additionalFilters.endDate = UI.elements.reportEndDate.value;
            
            if (!additionalFilters.startDate || !additionalFilters.endDate) {
                UI.showNotification('Please select both start and end dates', 'error');
                return;
            }
        }
        
        // Generate report data
        const reportData = DataStore.generateReport(reportType, dateRange, additionalFilters);
        
        // Render report
        renderReport(reportType, reportData);
    };

    // Render report
    const renderReport = (reportType, data) => {
        const reportContainer = UI.elements.reportContainer;
        
        // Clear existing report
        reportContainer.innerHTML = '';
        
        // Create report based on type
        switch (reportType) {
            case 'ticket-summary':
                renderTicketSummaryReport(data, reportContainer);
                break;
            case 'system-status':
                renderSystemStatusReport(data, reportContainer);
                break;
            case 'resolution-time':
                renderResolutionTimeReport(data, reportContainer);
                break;
            default:
                reportContainer.textContent = 'Invalid report type';
        }
    };

    // Render ticket summary report
    const renderTicketSummaryReport = (data, container) => {
        // Create report header
        const header = document.createElement('h3');
        header.textContent = 'Ticket Summary Report';
        container.appendChild(header);
        
        // Create total tickets section
        const totalSection = document.createElement('div');
        totalSection.className = 'report-section';
        
        const totalHeader = document.createElement('h4');
        totalHeader.textContent = 'Total Tickets';
        
        const totalValue = document.createElement('div');
        totalValue.className = 'report-value';
        totalValue.textContent = data.totalTickets;
        
        totalSection.appendChild(totalHeader);
        totalSection.appendChild(totalValue);
        container.appendChild(totalSection);
        
        // Create status breakdown section
        const statusSection = document.createElement('div');
        statusSection.className = 'report-section';
        
        const statusHeader = document.createElement('h4');
        statusHeader.textContent = 'Tickets by Status';
        statusSection.appendChild(statusHeader);
        
        const statusChart = createPieChart(data.statusCounts, {
            open: '#1976d2',
            'in-progress': '#ff8f00',
            resolved: '#388e3c',
            closed: '#616161'
        });
        statusSection.appendChild(statusChart);
        
        const statusTable = createDataTable(data.statusCounts, 'Status', 'Count');
        statusSection.appendChild(statusTable);
        
        container.appendChild(statusSection);
        
        // Create priority breakdown section
        const prioritySection = document.createElement('div');
        prioritySection.className = 'report-section';
        
        const priorityHeader = document.createElement('h4');
        priorityHeader.textContent = 'Tickets by Priority';
        prioritySection.appendChild(priorityHeader);
        
        const priorityChart = createPieChart(data.priorityCounts, {
            low: '#2ecc71',
            medium: '#f39c12',
            high: '#e74c3c',
            critical: '#c0392b'
        });
        prioritySection.appendChild(priorityChart);
        
        const priorityTable = createDataTable(data.priorityCounts, 'Priority', 'Count');
        prioritySection.appendChild(priorityTable);
        
        container.appendChild(prioritySection);
        
        // Create system breakdown section
        const systemSection = document.createElement('div');
        systemSection.className = 'report-section';
        
        const systemHeader = document.createElement('h4');
        systemHeader.textContent = 'Tickets by System';
        systemSection.appendChild(systemHeader);
        
        // Convert system IDs to names
        const systemNames = {};
        Object.keys(data.systemCounts).forEach(systemId => {
            const system = DataStore.getSystemById(systemId);
            systemNames[system ? system.name : 'Unknown'] = data.systemCounts[systemId];
        });
        
        const systemTable = createDataTable(systemNames, 'System', 'Count');
        systemSection.appendChild(systemTable);
        
        container.appendChild(systemSection);
    };

    // Render system status report
    const renderSystemStatusReport = (data, container) => {
        // Create report header
        const header = document.createElement('h3');
        header.textContent = 'System Status Report';
        container.appendChild(header);
        
        // Create systems table
        const systemsTable = document.createElement('table');
        systemsTable.className = 'report-table';
        
        // Create table header
        const tableHeader = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['System', 'Current Status', 'Ticket Count'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        tableHeader.appendChild(headerRow);
        systemsTable.appendChild(tableHeader);
        
        // Create table body
        const tableBody = document.createElement('tbody');
        
        Object.values(data.systems).forEach(system => {
            const row = document.createElement('tr');
            
            const nameCell = document.createElement('td');
            nameCell.textContent = system.name;
            
            const statusCell = document.createElement('td');
            const statusIndicator = document.createElement('span');
            statusIndicator.className = `status-indicator ${getStatusColorClass(system.currentStatus)}`;
            statusCell.appendChild(statusIndicator);
            statusCell.appendChild(document.createTextNode(formatStatus(system.currentStatus)));
            
            const ticketCountCell = document.createElement('td');
            ticketCountCell.textContent = system.ticketCount;
            
            row.appendChild(nameCell);
            row.appendChild(statusCell);
            row.appendChild(ticketCountCell);
            
            // Add click event to show system tickets
            row.addEventListener('click', () => {
                // Toggle display of system tickets
                const existingDetails = tableBody.querySelector(`.system-tickets-${system.name.replace(/\s+/g, '-')}`);
                
                if (existingDetails) {
                    existingDetails.remove();
                } else {
                    const detailsRow = document.createElement('tr');
                    detailsRow.className = `system-tickets-${system.name.replace(/\s+/g, '-')}`;
                    
                    const detailsCell = document.createElement('td');
                    detailsCell.colSpan = 3;
                    
                    if (system.tickets.length === 0) {
                        detailsCell.textContent = 'No tickets for this system';
                    } else {
                        const ticketsList = document.createElement('ul');
                        ticketsList.className = 'system-tickets-list';
                        
                        system.tickets.forEach(ticket => {
                            const ticketItem = document.createElement('li');
                            ticketItem.innerHTML = `<strong>${ticket.id}</strong>: ${ticket.title} <span class="ticket-status status-${ticket.status}">${formatTicketStatus(ticket.status)}</span>`;
                            ticketsList.appendChild(ticketItem);
                        });
                        
                        detailsCell.appendChild(ticketsList);
                    }
                    
                    detailsRow.appendChild(detailsCell);
                    row.insertAdjacentElement('afterend', detailsRow);
                }
            });
            
            tableBody.appendChild(row);
        });
        
        systemsTable.appendChild(tableBody);
        container.appendChild(systemsTable);
    };

    // Render resolution time report
    const renderResolutionTimeReport = (data, container) => {
        // Create report header
        const header = document.createElement('h3');
        header.textContent = 'Resolution Time Analysis';
        container.appendChild(header);
        
        // Create total resolved tickets section
        const totalSection = document.createElement('div');
        totalSection.className = 'report-section';
        
        const totalHeader = document.createElement('h4');
        totalHeader.textContent = 'Total Resolved Tickets';
        
        const totalValue = document.createElement('div');
        totalValue.className = 'report-value';
        totalValue.textContent = data.totalResolvedTickets;
        
        totalSection.appendChild(totalHeader);
        totalSection.appendChild(totalValue);
        container.appendChild(totalSection);
        
        // Create average resolution time section
        const avgSection = document.createElement('div');
        avgSection.className = 'report-section';
        
        const avgHeader = document.createElement('h4');
        avgHeader.textContent = 'Average Resolution Time';
        
        const avgValue = document.createElement('div');
        avgValue.className = 'report-value';
        avgValue.textContent = UI.formatDuration(data.avgResolutionTime);
        
        avgSection.appendChild(avgHeader);
        avgSection.appendChild(avgValue);
        container.appendChild(avgSection);
        
        // Create resolution time by priority section
        const prioritySection = document.createElement('div');
        prioritySection.className = 'report-section';
        
        const priorityHeader = document.createElement('h4');
        priorityHeader.textContent = 'Resolution Time by Priority';
        prioritySection.appendChild(priorityHeader);
        
        // Create table for resolution times
        const priorityTable = document.createElement('table');
        priorityTable.className = 'report-table';
        
        // Create table header
        const tableHeader = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Priority', 'Average Resolution Time', 'Ticket Count'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        tableHeader.appendChild(headerRow);
        priorityTable.appendChild(tableHeader);
        
        // Create table body
        const tableBody = document.createElement('tbody');
        
        Object.keys(data.priorityResolutionTimes).forEach(priority => {
            const { average, count } = data.priorityResolutionTimes[priority];
            
            const row = document.createElement('tr');
            
            const priorityCell = document.createElement('td');
            priorityCell.textContent = formatPriority(priority);
            
            const avgTimeCell = document.createElement('td');
            avgTimeCell.textContent = UI.formatDuration(average);
            
            const countCell = document.createElement('td');
            countCell.textContent = count;
            
            row.appendChild(priorityCell);
            row.appendChild(avgTimeCell);
            row.appendChild(countCell);
            
            tableBody.appendChild(row);
        });
        
        priorityTable.appendChild(tableBody);
        prioritySection.appendChild(priorityTable);
        
        container.appendChild(prioritySection);
    };

    // Create pie chart
    const createPieChart = (data, colors) => {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        
        // In a real application, we would use a charting library like Chart.js
        // For this example, we'll create a simple representation
        const chart = document.createElement('div');
        chart.className = 'pie-chart';
        
        let total = 0;
        Object.values(data).forEach(value => {
            total += value;
        });
        
        let cumulativePercentage = 0;
        
        Object.keys(data).forEach(key => {
            const value = data[key];
            const percentage = (value / total) * 100;
            
            const slice = document.createElement('div');
            slice.className = 'pie-slice';
            slice.style.backgroundColor = colors[key] || '#ccc';
            slice.style.transform = `rotate(${cumulativePercentage * 3.6}deg)`;
            slice.style.clip = `rect(0, 100px, 100px, 50px)`;
            
            if (percentage > 50) {
                slice.style.clip = 'auto';
                const otherSlice = document.createElement('div');
                otherSlice.className = 'pie-slice';
                otherSlice.style.backgroundColor = colors[key] || '#ccc';
                otherSlice.style.transform = `rotate(${(cumulativePercentage + 50) * 3.6}deg)`;
                otherSlice.style.clip = `rect(0, 50px, 100px, 0)`;
                chart.appendChild(otherSlice);
            }
            
            chart.appendChild(slice);
            cumulativePercentage += percentage;
        });
        
        chartContainer.appendChild(chart);
        
        // Add legend
        const legend = document.createElement('div');
        legend.className = 'chart-legend';
        
        Object.keys(data).forEach(key => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            
            const colorBox = document.createElement('span');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = colors[key] || '#ccc';
            
            const label = document.createElement('span');
            label.className = 'legend-label';
            label.textContent = formatKey(key);
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legend.appendChild(legendItem);
        });
        
        chartContainer.appendChild(legend);
        
        return chartContainer;
    };

    // Create data table
    const createDataTable = (data, keyHeader, valueHeader) => {
        const table = document.createElement('table');
        table.className = 'report-table';
        
        // Create table header
        const tableHeader = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const keyHeaderCell = document.createElement('th');
        keyHeaderCell.textContent = keyHeader;
        
        const valueHeaderCell = document.createElement('th');
        valueHeaderCell.textContent = valueHeader;
        
        headerRow.appendChild(keyHeaderCell);
        headerRow.appendChild(valueHeaderCell);
        tableHeader.appendChild(headerRow);
        table.appendChild(tableHeader);
        
        // Create table body
        const tableBody = document.createElement('tbody');
        
        Object.keys(data).forEach(key => {
            const row = document.createElement('tr');
            
            const keyCell = document.createElement('td');
            keyCell.textContent = formatKey(key);
            
            const valueCell = document.createElement('td');
            valueCell.textContent = data[key];
            
            row.appendChild(keyCell);
            row.appendChild(valueCell);
            tableBody.appendChild(row);
        });
        
        table.appendChild(tableBody);
        
        return table;
    };

    // Export report
    const exportReport = () => {
        const reportContainer = UI.elements.reportContainer;
        const reportType = UI.elements.reportType.value;
        
        // In a real application, we would use a library to export to PDF or CSV
        // For this example, we'll just create a text representation
        
        let reportText = '';
        
        // Add report title
        switch (reportType) {
            case 'ticket-summary':
                reportText += 'Ticket Summary Report\n\n';
                break;
            case 'system-status':
                reportText += 'System Status Report\n\n';
                break;
            case 'resolution-time':
                reportText += 'Resolution Time Analysis\n\n';
                break;
            default:
                reportText += 'Report\n\n';
        }
        
        // Add report content (simplified)
        reportText += reportContainer.textContent;
        
        // Create a blob and download
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        UI.showNotification('Report exported successfully', 'success');
    };

    // Format key for display
    const formatKey = (key) => {
        switch (key) {
            case 'open':
                return 'Open';
            case 'in-progress':
                return 'In Progress';
            case 'resolved':
                return 'Resolved';
            case 'closed':
                return 'Closed';
            case 'low':
                return 'Low';
            case 'medium':
                return 'Medium';
            case 'high':
                return 'High';
            case 'critical':
                return 'Critical';
            default:
                return key;
        }
    };

    // Format ticket status
    const formatTicketStatus = (status) => {
        switch (status) {
            case 'open':
                return 'Open';
            case 'in-progress':
                return 'In Progress';
            case 'resolved':
                return 'Resolved';
            case 'closed':
                return 'Closed';
            default:
                return status;
        }
    };

    // Format priority
    const formatPriority = (priority) => {
        switch (priority) {
            case 'low':
                return 'Low';
            case 'medium':
                return 'Medium';
            case 'high':
                return 'High';
            case 'critical':
                return 'Critical';
            default:
                return priority;
        }
    };

    // Format system status
    const formatStatus = (status) => {
        switch (status) {
            case 'operational':
                return 'Operational';
            case 'degraded':
                return 'Degraded';
            case 'down':
                return 'Down';
            case 'unknown':
                return 'Unknown';
            default:
                return status;
        }
    };

    // Get status color class
    const getStatusColorClass = (status) => {
        switch (status) {
            case 'operational':
                return 'green';
            case 'degraded':
                return 'yellow';
            case 'down':
                return 'red';
            default:
                return 'gray';
        }
    };

    // Public API
    return {
        initEventListeners,
        generateReport,
        renderReport
    };
})();

// Initialize reports module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ReportUI.initEventListeners();
});
