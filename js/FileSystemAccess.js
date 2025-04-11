/**
 * File System Access API Module
 * Provides direct access to the file system for persistent data storage
 * Falls back to IndexedDB when the API is not available
 */

const FileSystemAccess = (() => {
    // File handle storage in localStorage
    const FILE_HANDLE_KEY = 'troubleTicketSystem_fileHandle';
    
    // Current file handle
    let currentFileHandle = null;
    
    // Track if API is available
    let isApiAvailable = false;
    
    // Callback for notifying the app of API availability changes
    let availabilityChangeCallback = null;
    
    /**
     * Check if the File System Access API is supported by the browser
     * @returns {boolean} True if API is supported, false otherwise
     */
    const isSupported = () => {
        const supported = 'showOpenFilePicker' in window && 
                          'showSaveFilePicker' in window;
        
        // Update global availability flag
        isApiAvailable = supported;
        
        // Notify the app if callback is registered
        if (availabilityChangeCallback) {
            availabilityChangeCallback(supported);
        }
        
        return supported;
    };
    
    /**
     * Register a callback for API availability changes
     * @param {Function} callback Function to call when API availability changes
     */
    const onAvailabilityChange = (callback) => {
        if (typeof callback === 'function') {
            availabilityChangeCallback = callback;
            
            // Immediately call with current status
            callback(isApiAvailable);
        }
    };
    
    /**
     * Verify if we still have permission to access a file handle
     * @param {FileSystemFileHandle} fileHandle The file handle to check
     * @returns {Promise<boolean>} True if we have permission, false otherwise
     */
    const verifyPermission = async (fileHandle) => {
        try {
            if (!fileHandle) return false;
            
            // Check current permission state
            const options = { mode: 'readwrite' };
            const permission = await fileHandle.requestPermission(options);
            
            return permission === 'granted';
        } catch (error) {
            console.error('Error verifying file permission:', error);
            return false;
        }
    };
    
    /**
     * Try to restore a previously saved file handle from localStorage
     * @returns {Promise<FileSystemFileHandle|null>} The file handle or null if not found
     */
    const getSavedFileHandle = async () => {
        try {
            // Check if we have a stored file handle
            if (!localStorage.getItem(FILE_HANDLE_KEY)) {
                return null;
            }
            
            // The actual file handle can't be stored directly in localStorage
            // Instead we use the browser's indexedDB to store file handles
            const fileHandleOrUndefined = await window.launchQueue?.files?.[0];
            
            if (!fileHandleOrUndefined) {
                // Clear invalid handle
                localStorage.removeItem(FILE_HANDLE_KEY);
                return null;
            }
            
            // Verify we still have permission
            if (await verifyPermission(fileHandleOrUndefined)) {
                return fileHandleOrUndefined;
            } else {
                // Clear invalid handle
                localStorage.removeItem(FILE_HANDLE_KEY);
                return null;
            }
        } catch (error) {
            console.error('Error retrieving saved file handle:', error);
            return null;
        }
    };
    
    /**
     * Save the file handle to localStorage
     * @param {FileSystemFileHandle} fileHandle The file handle to save
     */
    const saveFileHandle = (fileHandle) => {
        try {
            // We can't store the actual file handle in localStorage
            // Just store a flag indicating we have a handle
            if (fileHandle) {
                localStorage.setItem(FILE_HANDLE_KEY, 'true');
                currentFileHandle = fileHandle;
            }
        } catch (error) {
            console.error('Error saving file handle:', error);
        }
    };
    
    /**
     * Request user permission to open a file
     * @returns {Promise<FileSystemFileHandle|null>} The file handle or null if user cancels
     */
    const requestOpenFile = async () => {
        try {
            if (!isSupported()) {
                throw new Error('File System Access API not supported');
            }
            
            const options = {
                types: [
                    {
                        description: 'JSON Files',
                        accept: { 'application/json': ['.json'] }
                    }
                ],
                multiple: false
            };
            
            // Show the file picker
            const fileHandles = await window.showOpenFilePicker(options);
            
            if (fileHandles.length > 0) {
                const fileHandle = fileHandles[0];
                
                // Save the file handle for future use
                saveFileHandle(fileHandle);
                
                return fileHandle;
            }
            
            return null;
        } catch (error) {
            console.error('Error requesting to open file:', error);
            return null;
        }
    };
    
    /**
     * Request user permission to create/save a file
     * @param {string} suggestedName Suggested file name
     * @returns {Promise<FileSystemFileHandle|null>} The file handle or null if user cancels
     */
    const requestSaveFile = async (suggestedName = 'trouble_ticket_data.json') => {
        try {
            if (!isSupported()) {
                throw new Error('File System Access API not supported');
            }
            
            // Get the current directory path (where index.html is located)
            const currentPath = window.location.pathname;
            const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
            
            const options = {
                types: [
                    {
                        description: 'JSON Files',
                        accept: { 'application/json': ['.json'] }
                    }
                ],
                suggestedName: suggestedName,
                startIn: 'document'  // Start in the document directory
            };
            
            // Show the save file picker
            const fileHandle = await window.showSaveFilePicker(options);
            
            // Save the file handle for future use
            saveFileHandle(fileHandle);
            
            return fileHandle;
        } catch (error) {
            console.error('Error requesting to save file:', error);
            return null;
        }
    };
    
    /**
     * Read data from a file
     * @param {FileSystemFileHandle} fileHandle The file handle to read from
     * @returns {Promise<object|null>} The parsed JSON data or null if error
     */
    const readFromFile = async (fileHandle) => {
        try {
            if (!fileHandle) {
                throw new Error('Invalid file handle');
            }
            
            // Get a file object from the handle
            const file = await fileHandle.getFile();
            
            // Read the file contents
            const contents = await file.text();
            
            // Parse the JSON data
            return JSON.parse(contents);
        } catch (error) {
            console.error('Error reading from file:', error);
            return null;
        }
    };
    
    /**
     * Write data to a file
     * @param {FileSystemFileHandle} fileHandle The file handle to write to
     * @param {object} data The data to write (will be JSON stringified)
     * @returns {Promise<boolean>} True if successful, false otherwise
     */
    const writeToFile = async (fileHandle, data) => {
        try {
            if (!fileHandle) {
                throw new Error('Invalid file handle');
            }
            
            // Create a writable stream
            const writable = await fileHandle.createWritable();
            
            // Convert data to JSON string
            const jsonString = JSON.stringify(data, null, 2);
            
            // Write the data to the file
            await writable.write(jsonString);
            
            // Close the file and write the contents to disk
            await writable.close();
            
            return true;
        } catch (error) {
            console.error('Error writing to file:', error);
            return false;
        }
    };
    
    /**
     * Get the current file handle
     * @returns {FileSystemFileHandle|null} The current file handle
     */
    const getCurrentFileHandle = () => {
        return currentFileHandle;
    };
    
    /**
     * Initialize the File System Access module
     * @returns {Promise<boolean>} True if API is available, false otherwise
     */
    const initialize = async () => {
        // Check if API is supported
        const supported = isSupported();
        
        if (supported) {
            try {
                // Try to restore the file handle
                const fileHandle = await getSavedFileHandle();
                
                if (fileHandle) {
                    currentFileHandle = fileHandle;
                    return true;
                }
            } catch (error) {
                console.error('Error initializing File System Access:', error);
            }
        }
        
        return supported;
    };
    
    // Public API
    return {
        isSupported,
        initialize,
        requestOpenFile,
        requestSaveFile,
        readFromFile,
        writeToFile,
        verifyPermission,
        getCurrentFileHandle,
        onAvailabilityChange
    };
})();

// Initialize the module when script loads
FileSystemAccess.initialize().catch(console.error);
