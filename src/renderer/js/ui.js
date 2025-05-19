// Creates and returns a new HTML element with optional class name and inner HTML content
export function createElement(tag, className, html) {
    const el = document.createElement(tag); // Create a new element (e.g., 'div', 'span', etc.)
    if (className) el.className = className; // Apply class name if provided
    if (html) el.innerHTML = html; // Set inner HTML content if provided
    return el; // Return the newly created element
}

// Clears all child elements and content from a container element
export function clearContainer(container) {
    container.innerHTML = ''; // Remove all HTML inside the specified container
}

// Converts a timestamp into a readable date and time string
export function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString(); // Format date using local settings
}
