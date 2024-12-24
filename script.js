let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
tasks = tasks.map(task => ({...task, subtasks: task.subtasks || [], notes: task.notes || []}));
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { name: 'personal', color: 'green' },
    { name: 'work', color: 'blue' },
    { name: 'shopping', color: 'orange' },
    { name: 'other', color: 'purple' }
];

let currentFilter = 'all';
const BASE_URL = window.location.origin + window.location.pathname;

function showConfirmDialog(message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    messageEl.textContent = message;
    modal.classList.remove('hidden');

    document.getElementById('confirmCancel').onclick = () => {
        modal.classList.add('hidden');
    };

    document.getElementById('confirmOk').onclick = () => {
        modal.classList.add('hidden');
        onConfirm();
    };
}

function showPromptDialog(title, task, onConfirm) {
    const modal = document.getElementById('promptModal');
    const titleEl = document.getElementById('promptTitle');
    const input = document.getElementById('promptInput');
    const description = document.getElementById('promptDescription');
    
    titleEl.textContent = title;
    input.value = task.text;
    description.value = task.description || '';
    modal.classList.remove('hidden');

    document.getElementById('promptCancel').onclick = () => {
        modal.classList.add('hidden');
    };

    document.getElementById('promptOk').onclick = () => {
        const value = input.value.trim();
        if (value) {
            modal.classList.add('hidden');
            onConfirm(value, description.value.trim());
        }
    };

    input.focus();
}

function addTask() {
    const input = document.getElementById('taskInput');
    const description = document.getElementById('taskDescription');
    const priority = document.getElementById('prioritySelect').value;
    const category = document.getElementById('categorySelect').value;
    const deadline = document.getElementById('deadlineInput').value;
    const duration = document.getElementById('durationInput').value;
    const recurring = document.getElementById('recurringSelect').value;
    const task = input.value.trim();
    
    if (task) {
        tasks.push({ 
            text: task,
            description: description.value.trim(), 
            completed: false,
            completedDate: null,
            priority: priority,
            category: category,
            deadline: deadline,
            duration: duration,
            favorite: false,
            createdAt: new Date().toISOString(),
            subtasks: [],
            notes: [],
            recurring: recurring,
            lastRecurrence: recurring !== 'none' ? new Date().toISOString() : null
        });
        saveTasks();
        renderTasks();
        input.value = '';
        description.value = '';
        document.getElementById('deadlineInput').value = '';
        document.getElementById('durationInput').value = '';
    }
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    tasks[index].completedDate = tasks[index].completed ? new Date().toISOString() : null;
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    showConfirmDialog('Are you sure you want to delete this task?', () => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    });
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

function formatDeadline(deadline) {
    if (!deadline) return '';
    const date = new Date(deadline);
    return date.toLocaleDateString();
}

function isDeadlineNear(deadline) {
    if (!deadline) return false;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
}

function sortTasks(tasks, method) {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    const categoryOrder = { work: 1, personal: 2, shopping: 3, other: 4 };

    switch (method) {
        case 'favorite':
            return [...tasks].sort((a, b) => {
                if (a.favorite === b.favorite) return 0;
                return a.favorite ? -1 : 1;
            });
        case 'deadline':
            return [...tasks].sort((a, b) => {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline) - new Date(b.deadline);
            });
        case 'priority':
            return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        case 'category':
            return [...tasks].sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category]);
        default:
            return tasks;
    }
}

function editTask(index) {
    const task = tasks[index];
    showPromptDialog('Edit Task', task, (newText, newDescription) => {
        tasks[index].text = newText;
        tasks[index].description = newDescription;
        saveTasks();
        renderTasks();
    });
}

function searchTasks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredTasks = tasks.filter(task => 
        task.text.toLowerCase().includes(searchTerm) ||
        task.category.toLowerCase().includes(searchTerm)
    );
    renderTaskList(filteredTasks);
}

function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const totalSubtasks = tasks.reduce((acc, task) => acc + task.subtasks.length, 0);
    const completedSubtasks = tasks.reduce((acc, task) => 
        acc + task.subtasks.filter(st => st.completed).length, 0);
    const pending = total - completed;

    document.getElementById('totalTasks').textContent = `${total} (${totalSubtasks} subtasks)`;
    document.getElementById('completedTasks').textContent = `${completed} (${completedSubtasks} subtasks)`;
    document.getElementById('pendingTasks').textContent = `${pending} (${totalSubtasks - completedSubtasks} subtasks)`;
}

function filterTasks(tasksToFilter) {
    if (currentFilter === 'all') return tasksToFilter;
    return tasksToFilter.filter(task => task.category === currentFilter);
}

function openFilterModal() {
    document.getElementById('filterModal').classList.remove('hidden');
    renderExistingFilters();
}

function closeFilterModal() {
    document.getElementById('filterModal').classList.add('hidden');
}

function renderExistingFilters() {
    const container = document.getElementById('existingFilters');
    container.innerHTML = categories.map((category, index) => `
        <div class="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div class="flex items-center gap-2">
                <span class="capitalize px-2 py-1 rounded-full text-xs font-medium" 
                    style="background-color: ${category.color}25; color: ${category.color}">${category.name}</span>
                <input type="color" value="${category.color}" 
                    onchange="updateCategoryColor(${index}, this.value)" 
                    class="w-6 h-6 cursor-pointer">
            </div>
            <button onclick="deleteCategory(${index})" class="text-red-600 hover:text-red-800">Delete</button>
        </div>
    `).join('');
    
    updateCategoryDropdowns();
}

function updateCategoryColor(index, color) {
    categories[index].color = color;
    saveCategories();
    renderExistingFilters();
    renderTasks();
}

function addNewFilter() {
    const name = document.getElementById('newFilterName').value.trim().toLowerCase();
    const color = document.getElementById('newFilterColor').value;
    
    if (name && !categories.find(c => c.name === name)) {
        categories.push({ name, color });
        saveCategories();
        renderExistingFilters();
        renderFilterButtons();
        document.getElementById('newFilterName').value = '';
    }
}

function deleteCategory(index) {
    showConfirmDialog('Are you sure you want to delete this category? Tasks in this category will not be deleted.', () => {
        categories.splice(index, 1);
        saveCategories();
        renderExistingFilters();
        renderFilterButtons();
    });
}

function updateCategoryDropdowns() {
    const dropdowns = ['categorySelect'];
    const options = categories.map(cat => 
        `<option value="${cat.name}">${cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}</option>`
    ).join('');
    
    dropdowns.forEach(id => {
        const dropdown = document.getElementById(id);
        if (dropdown) {
            dropdown.innerHTML = options;
        }
    });
}

function renderFilterButtons() {
    const container = document.getElementById('filterButtons');
    container.innerHTML = categories.map(category => `
        <button class="filter-btn px-4 py-2 rounded-xl bg-white/80 hover:bg-indigo-50 transition capitalize text-sm font-medium" 
                data-category="${category.name}">${category.name}</button>
    `).join('');
    
    initializeFilters();
}

function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const allButton = document.querySelector('[data-category="all"]');
    
    filterButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-indigo-600', 'text-white', 'hover:bg-indigo-700');
        btn.classList.add('bg-white/80', 'hover:bg-indigo-50');
    });
    
    const activeButton = currentFilter === 'all' ? allButton : 
        document.querySelector(`[data-category="${currentFilter}"]`);
    
    if (activeButton) {
        activeButton.classList.remove('bg-white/80', 'hover:bg-indigo-50');
        activeButton.classList.add('active', 'bg-indigo-600', 'text-white', 'hover:bg-indigo-700');
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => {
                b.classList.remove('active', 'bg-indigo-600', 'text-white', 'hover:bg-indigo-700');
                b.classList.add('bg-white/80', 'hover:bg-indigo-50');
            });
            btn.classList.remove('bg-white/80', 'hover:bg-indigo-50');
            btn.classList.add('active', 'bg-indigo-600', 'text-white', 'hover:bg-indigo-700');
            currentFilter = btn.dataset.category;
            renderTasks();
        });
    });
}

function renderTaskList(tasksToRender) {
    const taskList = document.getElementById('taskList');
    const sortMethod = document.getElementById('sortSelect').value;
    taskList.innerHTML = '';
    
    const filteredTasks = filterTasks(tasksToRender || tasks);
    const sortedTasks = sortTasks(filteredTasks, sortMethod);
    
    sortedTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.dataset.taskIndex = index;
        const priorityColors = {
            high: 'border-red-500',
            medium: 'border-yellow-500',
            low: 'border-green-500'
        };
        
        const taskCategory = categories.find(c => c.name === task.category) || { name: task.category, color: '#666666' };
        const categoryStyle = `background-color: ${taskCategory.color}25; color: ${taskCategory.color}`;
        
        li.className = `flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border-l-4 ${priorityColors[task.priority]}`;
        if (task.completed) li.classList.add('opacity-75');
        
        const deadlineClass = isDeadlineNear(task.deadline) ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
        const deadlineText = task.deadline ? 
            `<span class="px-2 py-1 rounded-full text-xs font-medium ${deadlineClass}">${formatDeadline(task.deadline)}</span>` : '';
        
        const favoriteClass = task.favorite ? 'text-yellow-500' : 'text-gray-300';
        
        const subtasksHtml = `
            <div class="mt-4 pl-8">
                <div class="space-y-2">
                    ${task.subtasks.map((subtask, subtaskIndex) => `
                        <div class="flex items-center gap-2 p-2 bg-gray-50/50 rounded-lg hover:bg-gray-50 transition group">
                            <input type="checkbox" 
                                ${subtask.completed ? 'checked' : ''} 
                                onclick="toggleSubtask(${index}, ${subtaskIndex})"
                                class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                            <span class="flex-1 text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}">${subtask.text}</span>
                            <button onclick="deleteSubtask(${index}, ${subtaskIndex})" 
                                class="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-3 flex items-center gap-2">
                    <div class="relative flex-1">
                        <input type="text" 
                            id="subtask-input-${index}" 
                            placeholder="Add a subtask..." 
                            class="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white/80">
                        <i class="fas fa-plus absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
                    </div>
                    <button onclick="addSubtask(${index})" 
                        class="px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition flex items-center gap-2">
                        <i class="fas fa-plus text-xs"></i>
                        Add
                    </button>
                </div>
            </div>
        `;

        const notesHtml = `
            <div class="mt-4 pl-8">
                <div class="space-y-2">
                    ${task.notes.map((note, noteIndex) => `
                        <div class="flex items-center gap-2 p-2 bg-yellow-50/50 rounded-lg hover:bg-yellow-50 transition group">
                            <div class="flex-1">
                                <p class="text-sm text-gray-700">${note.text}</p>
                                <p class="text-xs text-gray-500">${new Date(note.createdAt).toLocaleString()}</p>
                            </div>
                            <button onclick="deleteNote(${index}, ${noteIndex})" 
                                class="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-3 flex items-center gap-2">
                    <div class="relative flex-1">
                        <input type="text" 
                            id="note-input-${index}" 
                            placeholder="Add a note..." 
                            class="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white/80">
                        <i class="fas fa-sticky-note absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
                    </div>
                    <button onclick="addNote(${index})" 
                        class="px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition flex items-center gap-2">
                        <i class="fas fa-plus text-xs"></i>
                        Add Note
                    </button>
                </div>
            </div>
        `;

        const recurringText = task.recurring && task.recurring !== 'none' ? 
            `<span class="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">↻ ${task.recurring}</span>` : '';

        li.innerHTML = `
            <div class="w-full">
                <div class="flex items-center gap-3">
                    <button class="drag-handle cursor-move text-gray-400 hover:text-gray-600 px-1">
                        <i class="fas fa-grip-vertical"></i>
                    </button>
                    <button onclick="toggleFavorite(${index})" class="text-xl ${favoriteClass} hover:text-yellow-500 transition">
                        <i class="fas fa-star"></i>
                    </button>
                    <span class="px-2 py-1 rounded-full text-xs font-medium" style="${categoryStyle}">${task.category}</span>
                    ${deadlineText}
                    ${recurringText}
                    <span class="flex-1 cursor-pointer ${task.completed ? 'line-through text-gray-500' : ''} hover:bg-gray-100 p-2 rounded transition-colors" 
                        onclick="toggleTask(${index})" 
                        title="Click to mark as ${task.completed ? 'incomplete' : 'complete'}">${task.text}</span>
                    <button onclick="showShareModal(${index})" class="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button onclick="editTask(${index})" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">Edit</button>
                    <button onclick="deleteTask(${index})" class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition">Delete</button>
                </div>
                ${task.description ? `
                    <div class="mt-2 text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                        ${task.description.replace(/\n/g, '<br>')}
                    </div>
                ` : ''}
                ${subtasksHtml}
                ${notesHtml}
            </div>
        `;
        taskList.appendChild(li);
    });
    
    updateStatistics();
}

function renderTasks() {
    renderTaskList();
}

function exportTasks() {
    const data = {
        tasks: tasks,
        categories: categories
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taskara-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importTasks(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.tasks && Array.isArray(data.tasks)) {
                    showConfirmDialog('This will replace all your current tasks and categories. Continue?', () => {
                        tasks = data.tasks;
                        if (data.categories && Array.isArray(data.categories)) {
                            categories = data.categories;
                        }
                        saveTasks();
                        saveCategories();
                        renderTasks();
                        renderFilterButtons();
                        input.value = '';
                    });
                }
            } catch (error) {
                alert('Invalid file format');
            }
        };
        reader.readAsText(file);
    }
}

function exportToCalendar() {
    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Taskara//Tasks Calendar//EN'
    ];

    tasks.forEach(task => {
        if (task.deadline) {
            const deadline = new Date(task.deadline);
            const duration = task.duration || 'PT1H';
            
            icsContent.push('BEGIN:VEVENT');
            icsContent.push(`DTSTART:${formatDateToICS(deadline)}`);
            icsContent.push(`DURATION:${duration}`);
            icsContent.push(`SUMMARY:${task.text}`);
            icsContent.push(`DESCRIPTION:${task.description || ''}`);
            icsContent.push(`CATEGORIES:${task.category}`);
            icsContent.push('END:VEVENT');
        }
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taskara-calendar.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function formatDateToICS(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function toggleFavorite(index) {
    tasks[index].favorite = !tasks[index].favorite;
    saveTasks();
    renderTasks();
}

function addSubtask(parentIndex) {
    const input = document.getElementById(`subtask-input-${parentIndex}`);
    const subtaskText = input.value.trim();
    
    if (subtaskText) {
        tasks[parentIndex].subtasks.push({
            text: subtaskText,
            completed: false,
            completedDate: null
        });
        saveTasks();
        renderTasks();
        input.value = '';
    }
}

function toggleSubtask(taskIndex, subtaskIndex) {
    const subtask = tasks[taskIndex].subtasks[subtaskIndex];
    subtask.completed = !subtask.completed;
    subtask.completedDate = subtask.completed ? new Date().toISOString() : null;
    
    const allSubtasksCompleted = tasks[taskIndex].subtasks.every(st => st.completed);
    if (allSubtasksCompleted) {
        tasks[taskIndex].completed = true;
        tasks[taskIndex].completedDate = new Date().toISOString();
    } else {
        tasks[taskIndex].completed = false;
        tasks[taskIndex].completedDate = null;
    }
    
    saveTasks();
    renderTasks();
}

function deleteSubtask(taskIndex, subtaskIndex) {
    showConfirmDialog('Are you sure you want to delete this subtask?', () => {
        tasks[taskIndex].subtasks.splice(subtaskIndex, 1);
        saveTasks();
        renderTasks();
    });
}

function addNote(taskIndex) {
    const input = document.getElementById(`note-input-${taskIndex}`);
    const noteText = input.value.trim();
    
    if (noteText) {
        tasks[taskIndex].notes.push({
            text: noteText,
            createdAt: new Date().toISOString()
        });
        saveTasks();
        renderTasks();
        input.value = '';
    }
}

function deleteNote(taskIndex, noteIndex) {
    showConfirmDialog('Are you sure you want to delete this note?', () => {
        tasks[taskIndex].notes.splice(noteIndex, 1);
        saveTasks();
        renderTasks();
    });
}

function checkRecurringTasks() {
    const today = new Date();
    
    tasks.forEach(task => {
        if (!task.recurring || task.recurring === 'none') return;
        
        const lastRecurrence = new Date(task.lastRecurrence);
        let shouldCreateNew = false;
        
        switch(task.recurring) {
            case 'daily':
                shouldCreateNew = today.getDate() !== lastRecurrence.getDate();
                break;
            case 'weekly':
                const weekDiff = Math.floor((today - lastRecurrence) / (1000 * 60 * 60 * 24 * 7));
                shouldCreateNew = weekDiff >= 1;
                break;
            case 'monthly':
                shouldCreateNew = today.getMonth() !== lastRecurrence.getMonth();
                break;
        }
        
        if (shouldCreateNew && !task.completed) {
            const newTask = {...task};
            newTask.completed = false;
            newTask.completedDate = null;
            newTask.createdAt = new Date().toISOString();
            newTask.lastRecurrence = new Date().toISOString();
            newTask.subtasks = newTask.subtasks.map(st => ({...st, completed: false, completedDate: null}));
            
            if (task.deadline) {
                const newDeadline = new Date(task.deadline);
                switch(task.recurring) {
                    case 'daily':
                        newDeadline.setDate(newDeadline.getDate() + 1);
                        break;
                    case 'weekly':
                        newDeadline.setDate(newDeadline.getDate() + 7);
                        break;
                    case 'monthly':
                        newDeadline.setMonth(newDeadline.getMonth() + 1);
                        break;
                }
                newTask.deadline = newDeadline.toISOString().split('T')[0];
            }
            
            tasks.push(newTask);
            task.lastRecurrence = new Date().toISOString();
        }
    });
    
    saveTasks();
    renderTasks();
}

function initializeDragAndDrop() {
    const taskList = document.getElementById('taskList');
    new Sortable(taskList, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'bg-gray-100',
        onEnd: function(evt) {
            const taskArray = Array.from(taskList.children);
            const newTasks = [];
            
            taskArray.forEach(li => {
                const taskIndex = parseInt(li.dataset.taskIndex);
                newTasks.push(tasks[taskIndex]);
            });
            
            tasks = newTasks;
            saveTasks();
        }
    });
}

function showShareModal(taskIndex) {
    const modal = document.getElementById('shareModal');
    const shareLink = document.getElementById('shareLink');
    const includeSubtasks = document.getElementById('includeSubtasks');
    const includeNotes = document.getElementById('includeNotes');
    const includeStatus = document.getElementById('includeStatus');
    const task = tasks[taskIndex];
    
    const updateShareLink = () => {
        const shareData = {
            task: {
                text: task.text,
                description: task.description,
                priority: task.priority,
                category: task.category,
                deadline: task.deadline,
                duration: task.duration,
                completed: includeStatus.checked ? task.completed : false,
                completedDate: includeStatus.checked ? task.completedDate : null,
                subtasks: includeSubtasks.checked ? task.subtasks.map(st => ({
                    ...st,
                    completed: includeStatus.checked ? st.completed : false,
                    completedDate: includeStatus.checked ? st.completedDate : null
                })) : [],
                notes: includeNotes.checked ? task.notes : []
            }
        };
        
        const encodedData = btoa(JSON.stringify(shareData));
        shareLink.value = `${BASE_URL}?share=${encodedData}`;
    };
    
    includeStatus.checked = false;
    includeSubtasks.checked = false;
    includeNotes.checked = false;
    
    includeStatus.onchange = updateShareLink;
    includeSubtasks.onchange = updateShareLink;
    includeNotes.onchange = updateShareLink;
    
    updateShareLink();
    modal.classList.remove('hidden');
}

function closeShareModal() {
    document.getElementById('shareModal').classList.add('hidden');
}

function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');
    
    const copyButton = shareLink.nextElementSibling;
    const originalText = copyButton.textContent;
    copyButton.textContent = 'Copied!';
    setTimeout(() => {
        copyButton.textContent = originalText;
    }, 2000);
}

function showHelpModal() {
    document.getElementById('helpModal').classList.remove('hidden');
}

function closeHelpModal() {
    document.getElementById('helpModal').classList.add('hidden');
}

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        addTask();
    } else if (e.ctrlKey && e.key === 'e') {
        exportTasks();
    } else if (e.ctrlKey && e.key === 'f') {
        document.getElementById('searchInput').focus();
    }
});

document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

document.getElementById('sortSelect').addEventListener('change', renderTasks);
document.getElementById('searchInput').addEventListener('input', searchTasks);

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedTask = urlParams.get('share');
    
    if (sharedTask) {
        try {
            const taskData = JSON.parse(atob(sharedTask));
            showConfirmDialog('Would you like to add this shared task to your list?', () => {
                const newTask = {
                    ...taskData.task,
                    completed: taskData.task.completed || false,
                    completedDate: taskData.task.completedDate || null,
                    favorite: false,
                    createdAt: new Date().toISOString(),
                    subtasks: taskData.task.subtasks || [],
                    notes: taskData.task.notes || [],
                    recurring: 'none'
                };

                if (Array.isArray(newTask.subtasks)) {
                    newTask.subtasks = newTask.subtasks.map(st => ({
                        text: st.text,
                        completed: st.completed || false,
                        completedDate: st.completedDate || null
                    }));
                }

                if (Array.isArray(newTask.notes)) {
                    newTask.notes = newTask.notes.map(note => ({
                        text: note.text,
                        createdAt: note.createdAt || new Date().toISOString()
                    }));
                }

                tasks.push(newTask);
                saveTasks();
                renderTasks();
                window.history.replaceState({}, document.title, window.location.pathname);
            });
        } catch (error) {
            console.error('Invalid share link');
        }
    }
    
    renderTasks();
    initializeFilters();
    renderFilterButtons();
    initializeDragAndDrop();
});

renderTasks();
initializeFilters();
renderFilterButtons();

setInterval(checkRecurringTasks, 60000);
checkRecurringTasks();

