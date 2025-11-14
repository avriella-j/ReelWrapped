// ReelWrapped JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.textContent.toLowerCase().replace(' ', '-');
            showTab(tabName);
        });
    });

    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', filterContent);
    }

    // Sort functionality
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', sortContent);
    }

    // Follow/Unfollow buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('follow-btn') || e.target.classList.contains('unfollow-btn')) {
            handleFollow(e.target);
        }
    });

    // User link clicks on mutuals page
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('user-link')) {
            const userId = e.target.dataset.userId;
            if (userId) {
                window.location.href = `/user/${userId}`;
            }
        }
    });

    // Modal functionality
    const editBtn = document.querySelector('.profile-info .btn');
    if (editBtn && editBtn.textContent.includes('Edit')) {
        editBtn.addEventListener('click', showEditModal);
    }

    // File upload validation
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', validateFile);
    });

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', validateForm);
    });

    // Hashtag button functionality
    const hashtagButtons = document.querySelectorAll('.hashtag-btn');
    hashtagButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });

    // Initialize selected hashtags from user data
    initializeSelectedHashtags();
});

function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active class to clicked button
    event.target.classList.add('active');
}

function filterContent() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';

    const cards = document.querySelectorAll('.user-card');
    cards.forEach(card => {
        const name = card.querySelector('h3')?.textContent.toLowerCase() || '';

        const matchesSearch = name.includes(searchTerm);

        if (matchesSearch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function sortContent() {
    const sortValue = document.getElementById('sort-select')?.value || 'match';
    const container = document.getElementById('mutuals-container');

    if (!container) return;

    const cards = Array.from(container.children);

    cards.sort((a, b) => {
        if (sortValue === 'alphabetical') {
            const nameA = a.querySelector('h3')?.textContent || '';
            const nameB = b.querySelector('h3')?.textContent || '';
            return nameA.localeCompare(nameB);
        } else if (sortValue === 'followers') {
            const followersA = parseInt(a.querySelector('.stat')?.textContent.match(/\d+/) || 0);
            const followersB = parseInt(b.querySelector('.stat')?.textContent.match(/\d+/) || 0);
            return followersB - followersA;
        } else {
            // Match (default) - sort by match percentage
            const matchA = parseInt(a.querySelector('.match-score')?.textContent.match(/\d+/) || 0);
            const matchB = parseInt(b.querySelector('.match-score')?.textContent.match(/\d+/) || 0);
            return matchB - matchA;
        }
    });

    cards.forEach(card => container.appendChild(card));
}

async function handleFollow(button) {
    const userId = button.dataset.userId;
    const hashtagName = button.dataset.hashtagName;
    const songName = button.dataset.songName;
    let isFollowing = button.dataset.following === 'true';
    let action, url;

    if (userId) {
        // User follow/unfollow
        action = isFollowing ? 'unfollow' : 'follow';
        url = `/mutuals/${action}/${userId}`;
    } else if (hashtagName) {
        // Hashtag follow/unfollow
        action = isFollowing ? 'unfollow' : 'follow';
        url = `/hashtag/${action}/${hashtagName}`;
    } else if (songName) {
        // Music follow/unfollow
        action = isFollowing ? 'unfollow' : 'follow';
        url = `/music/${action}/${encodeURIComponent(songName)}`;
    } else {
        showAlert('Invalid follow action', 'error');
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success) {
            if (isFollowing) {
                button.textContent = 'Follow';
                button.classList.remove('btn-secondary');
                button.classList.add('btn-primary');
                button.dataset.following = 'false';
                button.classList.remove('unfollow-btn');
                button.classList.add('follow-btn');
            } else {
                button.textContent = 'Unfollow';
                button.classList.remove('btn-primary');
                button.classList.add('btn-secondary');
                button.dataset.following = 'true';
                button.classList.remove('follow-btn');
                button.classList.add('unfollow-btn');
            }
            showAlert(data.message, 'success');
        } else {
            showAlert(data.message, 'error');
        }
    } catch (error) {
        showAlert('An error occurred', 'error');
    }
}

function showEditModal() {
    const modal = document.getElementById('edit-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function submitEditForm() {
    const form = document.getElementById('edit-form');
    const formData = new FormData(form);

    // Add bio field to form data
    const bioTextarea = document.getElementById('edit-bio');
    if (bioTextarea) {
        formData.append('bio', bioTextarea.value);
    }

    // Add selected hashtags to form data
    const selectedHashtags = [];
    const hashtagButtons = document.querySelectorAll('.hashtag-btn.selected');
    hashtagButtons.forEach(btn => {
        selectedHashtags.push(btn.dataset.hashtag);
    });
    formData.append('hashtags', selectedHashtags.join(','));

    fetch('/profile', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        // Reload the page to show updated profile
        window.location.reload();
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('An error occurred while updating profile', 'error');
    });

    return false; // Prevent default form submission
}

function validateFile(event) {
    const file = event.target.files[0];
    const inputName = event.target.name;

    if (file) {
        if (inputName === 'profile_image') {
            // Validate profile image files
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

            if (!allowedExtensions.includes(fileExtension)) {
                showAlert('Only image files (JPG, PNG, GIF, WebP) are allowed for profile pictures', 'error');
                event.target.value = '';
            } else if (file.size > 5 * 1024 * 1024) { // 5MB for images
                showAlert('Image file size must be less than 5MB', 'error');
                event.target.value = '';
            } else {
                showAlert('Profile image selected successfully', 'success');
            }
        } else if (inputName === 'activity_log') {
            // Validate activity log files (ZIP only)
            if (!file.name.toLowerCase().endsWith('.zip')) {
                showAlert('Only .zip files are allowed for activity logs', 'error');
                event.target.value = '';
            } else if (file.size > 16 * 1024 * 1024) { // 16MB
                showAlert('File size must be less than 16MB', 'error');
                event.target.value = '';
            } else {
                showAlert('Activity log selected successfully', 'success');
            }
        }
    }
}

function validateForm(event) {
    const form = event.target;
    const requiredFields = form.querySelectorAll('input[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            field.style.borderColor = '#ddd';
        }
    });

    // Email validation
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            emailField.style.borderColor = '#dc3545';
            isValid = false;
        }
    }

    // Password confirmation
    const password = form.querySelector('input[name="password"]');
    const confirmPassword = form.querySelector('input[name="confirm_password"]');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
        confirmPassword.style.borderColor = '#dc3545';
        isValid = false;
    }

    if (!isValid) {
        event.preventDefault();
        showAlert('Please fill in all required fields correctly', 'error');
    }
}

function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alertDiv, container.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('edit-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

function closeUploadModal() {
    const modal = document.getElementById('upload-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function initializeSelectedHashtags() {
    // Get user's current hashtags from the profile display
    const profileHashtags = document.querySelectorAll('.profile-hashtags .hashtag-tag');
    const userHashtags = Array.from(profileHashtags).map(tag => tag.textContent.trim());

    // Select the corresponding buttons in the edit modal
    const hashtagButtons = document.querySelectorAll('.hashtag-btn');
    hashtagButtons.forEach(btn => {
        const hashtag = btn.dataset.hashtag;
        if (userHashtags.includes(hashtag)) {
            btn.classList.add('selected');
        }
    });
}

// Followers and Following Modal Functions
function showFollowersModal() {
    const modal = document.getElementById('followers-modal');
    const list = document.getElementById('followers-list');

    if (modal && list) {
        // Clear previous content
        list.innerHTML = '<div class="loading">Loading...</div>';

        // Fetch followers data
        fetch('/api/followers/' + getCurrentUserId())
            .then(response => response.json())
            .then(data => {
                list.innerHTML = '';
                if (data.length === 0) {
                    list.innerHTML = '<p>No followers yet.</p>';
                } else {
                    data.forEach(user => {
                        const userItem = createUserListItem(user);
                        list.appendChild(userItem);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading followers:', error);
                list.innerHTML = '<p>Error loading followers.</p>';
            });

        modal.style.display = 'block';
    }
}

function showFollowingModal() {
    const modal = document.getElementById('following-modal');
    const list = document.getElementById('following-list');

    if (modal && list) {
        // Clear previous content
        list.innerHTML = '<div class="loading">Loading...</div>';

        // Fetch following data
        fetch('/api/following/' + getCurrentUserId())
            .then(response => response.json())
            .then(data => {
                list.innerHTML = '';
                if (data.length === 0) {
                    list.innerHTML = '<p>Not following anyone yet.</p>';
                } else {
                    data.forEach(user => {
                        const userItem = createUserListItem(user);
                        list.appendChild(userItem);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading following:', error);
                list.innerHTML = '<p>Error loading following.</p>';
            });

        modal.style.display = 'block';
    }
}

function closeFollowersModal() {
    const modal = document.getElementById('followers-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeFollowingModal() {
    const modal = document.getElementById('following-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function createUserListItem(user) {
    const item = document.createElement('div');
    item.className = 'user-list-item';

    if (user.type === 'hashtag') {
        item.innerHTML = `
            <div class="hashtag-list-icon">
                <span class="hashtag-symbol">#</span>
            </div>
            <div class="user-list-info">
                <h4><a href="/hashtag/${user.username}" style="text-decoration: none; color: inherit;">#${user.username}</a></h4>
                <p>Hashtag</p>
            </div>
        `;
    } else if (user.type === 'music') {
        item.innerHTML = `
            <div class="music-list-icon">
                <span class="music-symbol">♪</span>
            </div>
            <div class="user-list-info">
                <h4><a href="/music/${encodeURIComponent(user.username)}" style="text-decoration: none; color: inherit;">${user.username}</a></h4>
                <p>Music</p>
            </div>
        `;
    } else {
        item.innerHTML = `
            <img src="${user.profile_image_url}" alt="${user.username}" class="user-list-avatar">
            <div class="user-list-info">
                <h4><a href="/user/${user.id}" style="text-decoration: none; color: inherit;">${user.username}</a></h4>
                <p>Click to view profile</p>
            </div>
        `;
    }

    return item;
}

function getCurrentUserId() {
    // Extract user ID from a hidden element or global variable
    // Look for a data attribute on the body or a global variable set by the server
    const userIdElement = document.querySelector('[data-current-user-id]');
    if (userIdElement) {
        return userIdElement.dataset.currentUserId;
    }
    // Fallback: assume it's the current user's profile
    return 'current';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const editModal = document.getElementById('edit-modal');
    const followersModal = document.getElementById('followers-modal');
    const followingModal = document.getElementById('following-modal');

    if (event.target === editModal) {
        editModal.style.display = 'none';
    }
    if (event.target === followersModal) {
        followersModal.style.display = 'none';
    }
    if (event.target === followingModal) {
        followingModal.style.display = 'none';
    }
}
