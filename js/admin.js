/**
 * Admin Module
 * Handles admin-related functionality
 */

const AdminUI = (() => {
    // Initialize admin event listeners
    const initEventListeners = () => {
        // User form submission
        document.getElementById('user-form').addEventListener('submit', handleUserFormSubmit);
        
        // Settings form submission
        document.getElementById('settings-form').addEventListener('submit', handleSettingsFormSubmit);
        
        // Logout button
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
    };

    // Handle user form submission
    const handleUserFormSubmit = (e) => {
        e.preventDefault();
        
        const userForm = e.target;
        const userId = userForm.dataset.userId;
        
        // Get form data
        const userData = {
            username: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            password: document.getElementById('user-password').value,
            role: document.getElementById('user-role').value
        };
        
        if (userId) {
            // Update existing user
            DataStore.updateUser(userId, userData);
            UI.showNotification('User updated successfully', 'success');
        } else {
            // Create new user
            DataStore.createUser(userData);
            UI.showNotification('User created successfully', 'success');
        }
        
        // Update UI
        renderUsers();
        UI.hideUserForm();
    };

    // Handle settings form submission
    const handleSettingsFormSubmit = (e) => {
        e.preventDefault();
        
        // Get form data
        const settingsData = {
            companyName: document.getElementById('company-name').value,
            ticketPrefix: document.getElementById('ticket-prefix').value,
            autoRefresh: parseInt(document.getElementById('auto-refresh').value, 10),
            maxSystems: parseInt(document.getElementById('max-systems').value, 10),
            retainResolved: document.getElementById('retain-resolved').checked,
            archiveOld: document.getElementById('archive-old').checked,
            archiveDays: parseInt(document.getElementById('archive-days').value, 10) || 30
        };
        
        // Update settings
        DataStore.updateSettings(settingsData);
        
        // Update UI
        SystemUI.renderSystemStatus();
        
        UI.showNotification('Settings updated successfully', 'success');
        UI.hideModal(UI.elements.adminSettingsModal);
    };

    // Handle logout
    const handleLogout = () => {
        // In a real application, we would clear session data and redirect to login page
        // For this example, we'll just show a notification
        UI.showNotification('Logged out successfully', 'success');
        
        // Reset current user to viewer
        document.getElementById('current-user').textContent = 'Viewer';
        
        // Disable admin features
        document.getElementById('admin-btn').style.display = 'none';
    };

    // Render users
    const renderUsers = () => {
        const userList = UI.elements.userList;
        
        // Clear existing users
        userList.innerHTML = '';
        
        // Get users
        const users = DataStore.getUsers();
        
        // Check if no users
        if (users.length === 0) {
            const noUsers = document.createElement('div');
            noUsers.className = 'no-users';
            noUsers.textContent = 'No users found';
            userList.appendChild(noUsers);
            return;
        }
        
        // Render each user
        users.forEach(user => {
            const userItem = createUserElement(user);
            userList.appendChild(userItem);
        });
    };

    // Create user element
    const createUserElement = (user) => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.dataset.id = user.id;
        
        const userInfo = document.createElement('div');
        userInfo.className = 'user-item-info';
        
        const userName = document.createElement('div');
        userName.className = 'user-item-name';
        userName.textContent = user.username;
        
        const userEmail = document.createElement('div');
        userEmail.className = 'user-item-email';
        userEmail.textContent = user.email;
        
        const userRole = document.createElement('div');
        userRole.className = 'user-item-role';
        userRole.textContent = formatRole(user.role);
        
        userInfo.appendChild(userName);
        userInfo.appendChild(userEmail);
        userInfo.appendChild(userRole);
        
        const userActions = document.createElement('div');
        userActions.className = 'user-item-actions';
        
        const editBtn = document.createElement('i');
        editBtn.className = 'fas fa-edit action-icon';
        editBtn.title = 'Edit User';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            UI.showUserForm(user.id);
        });
        
        const deleteBtn = document.createElement('i');
        deleteBtn.className = 'fas fa-trash-alt action-icon';
        deleteBtn.title = 'Delete User';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
                DataStore.deleteUser(user.id);
                renderUsers();
                UI.showNotification('User deleted successfully', 'success');
            }
        });
        
        userActions.appendChild(editBtn);
        userActions.appendChild(deleteBtn);
        
        userItem.appendChild(userInfo);
        userItem.appendChild(userActions);
        
        return userItem;
    };

    // Load settings
    const loadSettings = () => {
        const settings = DataStore.getSettings();
        
        // Set form values
        document.getElementById('company-name').value = settings.companyName || '';
        document.getElementById('ticket-prefix').value = settings.ticketPrefix || 'TKT';
        document.getElementById('auto-refresh').value = settings.autoRefresh || 60;
        document.getElementById('max-systems').value = settings.maxSystems || 150;
        document.getElementById('retain-resolved').checked = settings.retainResolved !== false;
        document.getElementById('archive-old').checked = settings.archiveOld !== false;
        document.getElementById('archive-days').value = settings.archiveDays || 30;
        
        // Show/hide archive days input based on archive-old setting
        const archiveDaysContainer = document.getElementById('archive-days').parentElement;
        archiveDaysContainer.style.display = settings.archiveOld ? 'block' : 'none';
        
        // Add event listener to show/hide archive days input
        document.getElementById('archive-old').addEventListener('change', (e) => {
            archiveDaysContainer.style.display = e.target.checked ? 'block' : 'none';
        });
    };

    // Format role
    const formatRole = (role) => {
        switch (role) {
            case 'admin':
                return 'Administrator';
            case 'technician':
                return 'Technician';
            case 'viewer':
                return 'Viewer';
            default:
                return role;
        }
    };

    // Check if user is admin
    const isAdmin = () => {
        // In a real application, we would check session data
        // For this example, we'll just check the current user text
        return document.getElementById('current-user').textContent === 'Admin';
    };

    // Public API
    return {
        initEventListeners,
        renderUsers,
        loadSettings,
        isAdmin
    };
})();

// Initialize admin module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AdminUI.initEventListeners();
    AdminUI.renderUsers();
    AdminUI.loadSettings();
    
    // Show/hide admin button based on role
    if (AdminUI.isAdmin()) {
        document.getElementById('admin-btn').style.display = 'flex';
    } else {
        document.getElementById('admin-btn').style.display = 'none';
    }
});
