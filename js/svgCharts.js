/**
 * SVG Charts Module
 * Custom SVG-based chart implementation with no external dependencies
 */

const SVGCharts = (() => {
    // Base chart class with common functionality
    class ChartBase {
        constructor(containerId, options = {}) {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                console.error(`Chart container with ID "${containerId}" not found`);
                return;
            }
            
            this.container.innerHTML = '';
            this.options = Object.assign({
                width: this.container.clientWidth || 300,
                height: 250,
                colors: ['#1976d2', '#ff8f00', '#388e3c', '#616161', '#e74c3c', '#9b59b6', '#f1c40f', '#34495e']
            }, options);
            
            // Create SVG element
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svg.setAttribute('width', this.options.width);
            this.svg.setAttribute('height', this.options.height);
            this.svg.setAttribute('class', 'chart-svg');
            this.container.appendChild(this.svg);
        }
        
        // Clear the chart
        clear() {
            if (this.svg) {
                this.svg.innerHTML = '';
            }
        }
        
        // Render empty state
        renderEmptyState() {
            this.clear();
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', this.options.width / 2);
            text.setAttribute('y', this.options.height / 2);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#666');
            text.textContent = 'No data available';
            this.svg.appendChild(text);
        }
    }
    
    // Pie Chart (also handles donut charts)
    class PieChart extends ChartBase {
        constructor(containerId, options = {}) {
            super(containerId, options);
            this.options.isDonut = options.isDonut || false;
            this.options.innerRadius = options.isDonut ? 0.6 : 0;
        }
        
        render(data) {
            if (!this.svg) return;
            this.clear();
            
            if (!data || !data.length || !data.some(d => d.value > 0)) {
                this.renderEmptyState();
                return;
            }
            
            const total = data.reduce((sum, d) => sum + d.value, 0);
            const centerX = this.options.width / 2;
            const centerY = this.options.height / 2;
            const radius = Math.min(centerX, centerY) * 0.8;
            
            // Create group for chart elements
            const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            chartGroup.setAttribute('transform', `translate(${centerX}, ${centerY})`);
            this.svg.appendChild(chartGroup);
            
            // Create pie slices
            let startAngle = 0;
            data.forEach((item, index) => {
                if (item.value <= 0) return;
                
                const sliceAngle = 2 * Math.PI * (item.value / total);
                const endAngle = startAngle + sliceAngle;
                
                // Calculate path
                const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
                
                // Start point on outer edge
                const startX = radius * Math.cos(startAngle);
                const startY = radius * Math.sin(startAngle);
                
                // End point on outer edge
                const endX = radius * Math.cos(endAngle);
                const endY = radius * Math.sin(endAngle);
                
                // Create path data
                let pathData;
                
                if (this.options.isDonut) {
                    const innerRadius = radius * this.options.innerRadius;
                    // Inner arc end point
                    const innerStartX = innerRadius * Math.cos(endAngle);
                    const innerStartY = innerRadius * Math.sin(endAngle);
                    
                    // Inner arc start point
                    const innerEndX = innerRadius * Math.cos(startAngle);
                    const innerEndY = innerRadius * Math.sin(startAngle);
                    
                    // Path for donut slice
                    pathData = [
                        `M ${startX} ${startY}`,
                        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                        `L ${innerStartX} ${innerStartY}`,
                        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerEndX} ${innerEndY}`,
                        'Z'
                    ].join(' ');
                } else {
                    // Path for regular pie slice
                    pathData = [
                        `M ${startX} ${startY}`,
                        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                        'L 0 0',
                        'Z'
                    ].join(' ');
                }
                
                // Create the path element
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', pathData);
                path.setAttribute('fill', this.options.colors[index % this.options.colors.length]);
                path.setAttribute('stroke', '#fff');
                path.setAttribute('stroke-width', '1');
                chartGroup.appendChild(path);
                
                // Add hover effect
                path.addEventListener('mouseover', () => {
                    path.setAttribute('opacity', '0.8');
                });
                path.addEventListener('mouseout', () => {
                    path.setAttribute('opacity', '1');
                });
                
                // Label for large enough slices
                if (sliceAngle > 0.2) {
                    const labelRadius = this.options.isDonut 
                        ? radius * (1 + this.options.innerRadius) / 2 
                        : radius * 0.6;
                    
                    const labelAngle = startAngle + sliceAngle / 2;
                    const labelX = labelRadius * Math.cos(labelAngle);
                    const labelY = labelRadius * Math.sin(labelAngle);
                    
                    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    text.setAttribute('x', labelX);
                    text.setAttribute('y', labelY);
                    text.setAttribute('text-anchor', 'middle');
                    text.setAttribute('dominant-baseline', 'middle');
                    text.setAttribute('fill', '#fff');
                    text.setAttribute('font-size', '12px');
                    text.textContent = item.label;
                    chartGroup.appendChild(text);
                }
                
                startAngle = endAngle;
            });
            
            // Add legend
            this.renderLegend(data);
        }
        
        renderLegend(data) {
            const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            legendGroup.setAttribute('transform', `translate(10, ${this.options.height - 30})`);
            
            data.forEach((item, index) => {
                const x = index * 80;
                
                // Legend color box
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', x);
                rect.setAttribute('y', 0);
                rect.setAttribute('width', 10);
                rect.setAttribute('height', 10);
                rect.setAttribute('fill', this.options.colors[index % this.options.colors.length]);
                legendGroup.appendChild(rect);
                
                // Legend text
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x + 15);
                text.setAttribute('y', 9);
                text.setAttribute('font-size', '10px');
                text.setAttribute('fill', '#333');
                text.textContent = item.label;
                legendGroup.appendChild(text);
            });
            
            this.svg.appendChild(legendGroup);
        }
    }
    
    // Bar Chart
    class BarChart extends ChartBase {
        constructor(containerId, options = {}) {
            super(containerId, options);
            this.options.yAxisLabel = options.yAxisLabel || '';
            this.options.barPadding = options.barPadding || 0.2;
            this.options.labelRotation = options.labelRotation || 0;
        }
        
        render(data) {
            if (!this.svg) return;
            this.clear();
            
            if (!data || !data.length || !data.some(d => d.value > 0)) {
                this.renderEmptyState();
                return;
            }
            
            const margin = {top: 20, right: 20, bottom: 40, left: 40};
            const width = this.options.width - margin.left - margin.right;
            const height = this.options.height - margin.top - margin.bottom;
            
            // Create chart group
            const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
            this.svg.appendChild(chartGroup);
            
            // Calculate scales
            const maxValue = Math.max(...data.map(d => d.value)) * 1.1; // Add 10% padding
            const barWidth = width / data.length * (1 - this.options.barPadding);
            
            // Draw axes
            this.drawAxes(chartGroup, width, height, maxValue);
            
            // Draw bars
            data.forEach((item, index) => {
                const x = index * (width / data.length) + (width / data.length - barWidth) / 2;
                const barHeight = (item.value / maxValue) * height;
                const y = height - barHeight;
                
                // Bar rectangle
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', x);
                rect.setAttribute('y', y);
                rect.setAttribute('width', barWidth);
                rect.setAttribute('height', barHeight);
                rect.setAttribute('fill', this.options.colors[index % this.options.colors.length]);
                
                // Hover effect
                rect.addEventListener('mouseover', () => {
                    rect.setAttribute('opacity', '0.8');
                });
                rect.addEventListener('mouseout', () => {
                    rect.setAttribute('opacity', '1');
                });
                
                chartGroup.appendChild(rect);
                
                // Value label
                if (item.value > 0) {
                    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    text.setAttribute('x', x + barWidth / 2);
                    text.setAttribute('y', y - 5);
                    text.setAttribute('text-anchor', 'middle');
                    text.setAttribute('font-size', '10px');
                    text.setAttribute('fill', '#333');
                    text.textContent = item.value.toFixed(1);
                    chartGroup.appendChild(text);
                }
                
                // Bar label
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', x + barWidth / 2);
                label.setAttribute('y', height + 15);
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('font-size', '10px');
                label.setAttribute('fill', '#333');
                label.textContent = item.label;
                
                if (this.options.labelRotation) {
                    label.setAttribute('transform', 
                        `rotate(${this.options.labelRotation}, ${x + barWidth / 2}, ${height + 15})`);
                    label.setAttribute('text-anchor', 'end');
                }
                
                chartGroup.appendChild(label);
            });
        }
        
        drawAxes(chartGroup, width, height, maxValue) {
            // X axis
            const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            xAxis.setAttribute('x1', 0);
            xAxis.setAttribute('y1', height);
            xAxis.setAttribute('x2', width);
            xAxis.setAttribute('y2', height);
            xAxis.setAttribute('stroke', '#333');
            xAxis.setAttribute('stroke-width', '1');
            chartGroup.appendChild(xAxis);
            
            // Y axis
            const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            yAxis.setAttribute('x1', 0);
            yAxis.setAttribute('y1', 0);
            yAxis.setAttribute('x2', 0);
            yAxis.setAttribute('y2', height);
            yAxis.setAttribute('stroke', '#333');
            yAxis.setAttribute('stroke-width', '1');
            chartGroup.appendChild(yAxis);
            
            // Y axis ticks
            const numTicks = 5;
            for (let i = 0; i <= numTicks; i++) {
                const yPos = height - (i / numTicks) * height;
                const value = (i / numTicks) * maxValue;
                
                // Tick mark
                const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                tick.setAttribute('x1', -5);
                tick.setAttribute('y1', yPos);
                tick.setAttribute('x2', 0);
                tick.setAttribute('y2', yPos);
                tick.setAttribute('stroke', '#333');
                chartGroup.appendChild(tick);
                
                // Tick label
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', -8);
                label.setAttribute('y', yPos);
                label.setAttribute('text-anchor', 'end');
                label.setAttribute('dominant-baseline', 'middle');
                label.setAttribute('font-size', '9px');
                label.setAttribute('fill', '#333');
                label.textContent = value.toFixed(value < 10 ? 1 : 0);
                chartGroup.appendChild(label);
            }
            
            // Y axis label
            if (this.options.yAxisLabel) {
                const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                yLabel.setAttribute('transform', `translate(-30, ${height/2}) rotate(-90)`);
                yLabel.setAttribute('text-anchor', 'middle');
                yLabel.setAttribute('font-size', '11px');
                yLabel.setAttribute('fill', '#333');
                yLabel.textContent = this.options.yAxisLabel;
                chartGroup.appendChild(yLabel);
            }
        }
    }
    
    // Line Chart
    class LineChart extends ChartBase {
        constructor(containerId, options = {}) {
            super(containerId, options);
            this.options.lineColor = options.lineColor || '#3498db';
            this.options.fillColor = options.fillColor || 'rgba(52, 152, 219, 0.1)';
            this.options.showDots = options.showDots !== undefined ? options.showDots : true;
            this.options.xAxisLabels = options.xAxisLabels || [];
            this.options.maxLabels = options.maxLabels || 7;
            this.options.yAxisLabel = options.yAxisLabel || '';
        }
        
        render(data) {
            if (!this.svg) return;
            this.clear();
            
            if (!data || !data.length) {
                this.renderEmptyState();
                return;
            }
            
            const margin = {top: 20, right: 20, bottom: 40, left: 40};
            const width = this.options.width - margin.left - margin.right;
            const height = this.options.height - margin.top - margin.bottom;
            
            // Create chart group
            const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
            this.svg.appendChild(chartGroup);
            
            // Calculate scales
            const maxValue = Math.max(...data.map(d => d.value)) * 1.1; // Add 10% padding
            
            // Draw axes
            this.drawAxes(chartGroup, width, height, maxValue, data);
            
            // Create points for the line
            const points = data.map((d, i) => {
                const x = (i / (data.length - 1)) * width;
                const y = height - (d.value / maxValue) * height;
                return [x, y];
            });
            
            // Draw area fill if needed
            if (this.options.fillColor) {
                const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const pathData = [
                    `M ${points[0][0]} ${points[0][1]}`,
                    ...points.slice(1).map(p => `L ${p[0]} ${p[1]}`),
                    `L ${points[points.length-1][0]} ${height}`,
                    `L ${points[0][0]} ${height}`,
                    'Z'
                ].join(' ');
                
                areaPath.setAttribute('d', pathData);
                areaPath.setAttribute('fill', this.options.fillColor);
                areaPath.setAttribute('stroke', 'none');
                chartGroup.appendChild(areaPath);
            }
            
            // Draw line
            const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const lineData = [
                `M ${points[0][0]} ${points[0][1]}`,
                ...points.slice(1).map(p => `L ${p[0]} ${p[1]}`)
            ].join(' ');
            
            linePath.setAttribute('d', lineData);
            linePath.setAttribute('fill', 'none');
            linePath.setAttribute('stroke', this.options.lineColor);
            linePath.setAttribute('stroke-width', '2');
            chartGroup.appendChild(linePath);
            
            // Draw dots
            if (this.options.showDots) {
                points.forEach(([x, y], i) => {
                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('cx', x);
                    circle.setAttribute('cy', y);
                    circle.setAttribute('r', '3');
                    circle.setAttribute('fill', this.options.lineColor);
                    circle.setAttribute('stroke', '#fff');
                    circle.setAttribute('stroke-width', '1');
                    chartGroup.appendChild(circle);
                    
                    // Add hover effect
                    circle.addEventListener('mouseover', () => {
                        circle.setAttribute('r', '5');
                    });
                    circle.addEventListener('mouseout', () => {
                        circle.setAttribute('r', '3');
                    });
                });
            }
        }
        
        drawAxes(chartGroup, width, height, maxValue, data) {
            // X axis
            const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            xAxis.setAttribute('x1', 0);
            xAxis.setAttribute('y1', height);
            xAxis.setAttribute('x2', width);
            xAxis.setAttribute('y2', height);
            xAxis.setAttribute('stroke', '#333');
            xAxis.setAttribute('stroke-width', '1');
            chartGroup.appendChild(xAxis);
            
            // Y axis
            const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            yAxis.setAttribute('x1', 0);
            yAxis.setAttribute('y1', 0);
            yAxis.setAttribute('x2', 0);
            yAxis.setAttribute('y2', height);
            yAxis.setAttribute('stroke', '#333');
            yAxis.setAttribute('stroke-width', '1');
            chartGroup.appendChild(yAxis);
            
            // Y axis ticks
            const numTicks = 5;
            for (let i = 0; i <= numTicks; i++) {
                const yPos = height - (i / numTicks) * height;
                const value = (i / numTicks) * maxValue;
                
                // Tick mark
                const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                tick.setAttribute('x1', -5);
                tick.setAttribute('y1', yPos);
                tick.setAttribute('x2', 0);
                tick.setAttribute('y2', yPos);
                tick.setAttribute('stroke', '#333');
                chartGroup.appendChild(tick);
                
                // Tick label
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', -8);
                label.setAttribute('y', yPos);
                label.setAttribute('text-anchor', 'end');
                label.setAttribute('dominant-baseline', 'middle');
                label.setAttribute('font-size', '9px');
                label.setAttribute('fill', '#333');
                label.textContent = value.toFixed(value < 10 ? 1 : 0);
                chartGroup.appendChild(label);
            }
            
            // X axis labels
            const labelStep = Math.max(1, Math.ceil(data.length / this.options.maxLabels));
            for (let i = 0; i < data.length; i += labelStep) {
                const x = (i / (data.length - 1)) * width;
                
                // Tick mark
                const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                tick.setAttribute('x1', x);
                tick.setAttribute('y1', height);
                tick.setAttribute('x2', x);
                tick.setAttribute('y2', height + 5);
                tick.setAttribute('stroke', '#333');
                chartGroup.appendChild(tick);
                
                // Use provided labels if available, otherwise use from data
                const labelText = this.options.xAxisLabels[i] || data[i].label || '';
                if (labelText) {
                    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    label.setAttribute('x', x);
                    label.setAttribute('y', height + 15);
                    label.setAttribute('text-anchor', 'middle');
                    label.setAttribute('font-size', '9px');
                    label.setAttribute('fill', '#333');
                    
                    // Show date in short format (MM/DD)
                    const shortLabel = labelText.includes('-') ? 
                        labelText.split('-').slice(1).join('/') : 
                        labelText;
                    
                    label.textContent = shortLabel;
                    
                    // Rotate label for better readability
                    label.setAttribute('transform', `rotate(45, ${x}, ${height + 15})`);
                    label.setAttribute('text-anchor', 'start');
                    
                    chartGroup.appendChild(label);
                }
            }
            
            // Y axis label
            if (this.options.yAxisLabel) {
                const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                yLabel.setAttribute('transform', `translate(-30, ${height/2}) rotate(-90)`);
                yLabel.setAttribute('text-anchor', 'middle');
                yLabel.setAttribute('font-size', '11px');
                yLabel.setAttribute('fill', '#333');
                yLabel.textContent = this.options.yAxisLabel;
                chartGroup.appendChild(yLabel);
            }
        }
    }
    
    // Return public API
    return {
        PieChart,
        BarChart,
        LineChart
    };
})();
