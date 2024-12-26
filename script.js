let taskLists = JSON.parse(localStorage.getItem('taskLists')) || [{
    id: 'default',
    name: 'My Tasks',
    tasks: JSON.parse(localStorage.getItem('tasks')) || [],
    categories: JSON.parse(localStorage.getItem('categories')) || [
        { name: 'personal', color: 'green' },
        { name: 'work', color: 'blue' },
        { name: 'shopping', color: 'orange' },
        { name: 'other', color: 'purple' }
    ]
}];

let currentListId = localStorage.getItem('currentListId') || 'default';
let currentFilter = 'all';
const BASE_URL = window.location.origin + window.location.pathname;

function getCurrentList() {
    return taskLists.find(list => list.id === currentListId);
}

function saveTasks() {
    localStorage.setItem('taskLists', JSON.stringify(taskLists));
    localStorage.setItem('currentListId', currentListId);
}

function saveCategories() {
    saveTasks();
}

function createNewList(name) {
    if (!name) return;
    const newList = {
        id: 'list_' + Date.now(),
        name: name,
        tasks: [],
        categories: [...getCurrentList().categories]
    };
    taskLists.push(newList);
    currentListId = newList.id;
    saveTasks();
    renderLists();
    renderTasks();
}

function showNewListModal() {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    const okButton = document.getElementById('confirmOk');
    
    titleEl.textContent = 'Create New List';
    messageEl.innerHTML = `
        <input type="text" id="newListInput" 
            class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 dark:text-white mb-2" 
            placeholder="Enter list name">
    `;
    okButton.textContent = 'Create';
    okButton.className = 'px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700';
    modal.classList.remove('hidden');
    
    const input = document.getElementById('newListInput');
    input.focus();

    document.getElementById('confirmCancel').onclick = () => {
        modal.classList.add('hidden');
    };

    okButton.onclick = () => {
        const name = input.value.trim();
        if (name) {
            createNewList(name);
            modal.classList.add('hidden');
        }
    };
}

function deleteList(id) {
    if (taskLists.length === 1) {
        alert('Cannot delete the last list');
        return;
    }
    
    showConfirmDialog('Are you sure you want to delete this list?', () => {
        const index = taskLists.findIndex(list => list.id === id);
        taskLists.splice(index, 1);
        if (currentListId === id) {
            currentListId = taskLists[0].id;
        }
        saveTasks();
        renderLists();
        renderTasks();
    });
}

function renameList(id, event) {
    event.stopPropagation();
    const list = taskLists.find(l => l.id === id);
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    const okButton = document.getElementById('confirmOk');
    
    titleEl.textContent = 'Rename List';
    messageEl.innerHTML = `
        <input type="text" id="renameInput" 
            class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 dark:text-white mb-2" 
            value="${list.name}">
    `;
    okButton.textContent = 'Rename';
    okButton.className = 'px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700';
    modal.classList.remove('hidden');
    
    const input = document.getElementById('renameInput');
    input.focus();
    input.select();

    document.getElementById('confirmCancel').onclick = () => {
        modal.classList.add('hidden');
    };

    okButton.onclick = () => {
        const newName = input.value.trim();
        if (newName) {
            list.name = newName;
            saveTasks();
            renderLists();
            modal.classList.add('hidden');
        }
    };
}

function renderLists() {
    const container = document.getElementById('listSelector');
    container.innerHTML = taskLists.map(list => `
        <div onclick="switchList('${list.id}')" data-list-id="${list.id}" 
            class="flex items-center gap-2 p-2 ${list.id === currentListId ? 
            'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 
            'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300'} 
            rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-[background-color] group shadow-sm cursor-pointer">
            <div class="flex-1 text-left flex items-center gap-2">
                <i class="fas fa-list-ul text-indigo-500 dark:text-indigo-400"></i>
                <span class="transition-none">${list.name}</span>
            </div>
            <div class="flex gap-1">
                <button onclick="renameList('${list.id}', event)" 
                    class="p-1.5 rounded-lg hover:bg-indigo-200/50 dark:hover:bg-indigo-800/50 text-gray-500 dark:text-gray-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteList('${list.id}')" 
                    class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function switchList(id) {
    currentListId = id;
    currentFilter = 'all';
    saveTasks();
    renderTasks();
    renderFilterButtons();
}

let tasks = getCurrentList().tasks;
tasks = tasks.map(task => ({...task, subtasks: task.subtasks || [], notes: task.notes || []}));
let categories = getCurrentList().categories;

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

function showAddTaskModal() {
    const modal = document.getElementById('addTaskModal');
    modal.classList.remove('hidden');
    document.getElementById('taskInput').focus();
}

function closeAddTaskModal() {
    const modal = document.getElementById('addTaskModal');
    modal.classList.add('hidden');
    document.getElementById('taskInput').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('deadlineInput').value = '';
    document.getElementById('durationInput').value = '';
    document.getElementById('prioritySelect').value = 'low';
    document.getElementById('recurringSelect').value = 'none';
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
        getCurrentList().tasks.push({ 
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
        closeAddTaskModal();
    }
}

function toggleTask(index) {
    getCurrentList().tasks[index].completed = !getCurrentList().tasks[index].completed;
    getCurrentList().tasks[index].completedDate = getCurrentList().tasks[index].completed ? new Date().toISOString() : null;
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    showConfirmDialog('Are you sure you want to delete this task?', () => {
        getCurrentList().tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    });
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
    const task = getCurrentList().tasks[index];
    const modal = document.getElementById('editTaskModal');
    
    updateCategoryDropdowns();
    
    document.getElementById('editTaskInput').value = task.text;
    document.getElementById('editTaskDescription').value = task.description || '';
    document.getElementById('editDeadlineInput').value = task.deadline || '';
    document.getElementById('editDurationInput').value = task.duration || '';
    document.getElementById('editPrioritySelect').value = task.priority;
    document.getElementById('editCategorySelect').value = task.category;
    document.getElementById('editRecurringSelect').value = task.recurring || 'none';
    
    modal.classList.remove('hidden');
    document.getElementById('editTaskInput').focus();

    document.getElementById('editTaskForm').onsubmit = (e) => {
        e.preventDefault();
        
        getCurrentList().tasks[index] = {
            ...task,
            text: document.getElementById('editTaskInput').value.trim(),
            description: document.getElementById('editTaskDescription').value.trim(),
            deadline: document.getElementById('editDeadlineInput').value,
            duration: document.getElementById('editDurationInput').value,
            priority: document.getElementById('editPrioritySelect').value,
            category: document.getElementById('editCategorySelect').value,
            recurring: document.getElementById('editRecurringSelect').value,
            modifiedAt: new Date().toISOString()
        };
        
        saveTasks();
        renderTasks();
        closeEditTaskModal();
    };
}

function closeEditTaskModal() {
    const modal = document.getElementById('editTaskModal');
    modal.classList.add('hidden');
    document.getElementById('editTaskForm').reset();
}

function searchTasks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredTasks = getCurrentList().tasks.filter(task => {
        const textMatch = task.text.toLowerCase().includes(searchTerm);
        const categoryMatch = task.category.toLowerCase().includes(searchTerm);
        const descriptionMatch = task.description && task.description.toLowerCase().includes(searchTerm);
        const subtaskMatch = task.subtasks.some(st => st.text.toLowerCase().includes(searchTerm));
        const notesMatch = task.notes.some(note => note.text.toLowerCase().includes(searchTerm));
        return textMatch || categoryMatch || descriptionMatch || subtaskMatch || notesMatch;
    });
    renderTaskList(filteredTasks);
}

function updateStatistics() {
    const total = getCurrentList().tasks.length;
    const completed = getCurrentList().tasks.filter(task => task.completed).length;
    const totalSubtasks = getCurrentList().tasks.reduce((acc, task) => acc + task.subtasks.length, 0);
    const completedSubtasks = getCurrentList().tasks.reduce((acc, task) => 
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
    container.innerHTML = getCurrentList().categories.map((category, index) => `
        <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            <div class="flex items-center gap-2">
                <span class="capitalize px-2 py-1 rounded-full text-xs font-medium dark:bg-opacity-20" 
                    style="background-color: ${category.color}25; color: ${category.color}">${category.name}</span>
                <input type="color" value="${category.color}" 
                    onchange="updateCategoryColor(${index}, this.value)" 
                    class="w-6 h-6 cursor-pointer bg-transparent border-0">
            </div>
            <button onclick="deleteCategory(${index})" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    updateCategoryDropdowns();
}

function updateCategoryColor(index, color) {
    getCurrentList().categories[index].color = color;
    saveCategories();
    renderExistingFilters();
    renderTasks();
}

function addNewFilter() {
    const name = document.getElementById('newFilterName').value.trim().toLowerCase();
    const color = document.getElementById('newFilterColor').value;
    
    if (name && !getCurrentList().categories.find(c => c.name === name)) {
        getCurrentList().categories.push({ name, color });
        saveCategories();
        renderExistingFilters();
        renderFilterButtons();
        document.getElementById('newFilterName').value = '';
    }
}

function deleteCategory(index) {
    showConfirmDialog('Are you sure you want to delete this category? Tasks in this category will not be deleted.', () => {
        getCurrentList().categories.splice(index, 1);
        saveCategories();
        renderExistingFilters();
        renderFilterButtons();
    });
}

function updateCategoryDropdowns() {
    const dropdowns = ['categorySelect', 'editCategorySelect'];
    const options = getCurrentList().categories.map(cat => 
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
    container.innerHTML = `
        <button class="filter-btn w-full text-left px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition capitalize text-sm font-medium" 
                data-category="all">
            <i class="fas fa-tasks mr-2"></i>
            All Tasks
        </button>
        ${getCurrentList().categories.map(category => `
            <button class="filter-btn w-full text-left px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-700/80 hover:bg-indigo-50 dark:hover:bg-gray-600 transition capitalize text-sm font-medium dark:text-gray-200" 
                    data-category="${category.name}">
                <i class="fas fa-tag mr-2" style="color: ${category.color}"></i>
                ${category.name}
            </button>
        `).join('')}
    `;
    
    initializeFilters();
}

function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const allButton = document.querySelector('[data-category="all"]');
    
    filterButtons.forEach(btn => {
        btn.classList.remove('active', 'bg-indigo-600', 'text-white', 'hover:bg-indigo-700');
        btn.classList.add('bg-white/80', 'dark:bg-gray-700/80', 'hover:bg-indigo-50', 'dark:hover:bg-gray-600', 'dark:text-gray-200');
    });
    
    const activeButton = currentFilter === 'all' ? allButton : 
        document.querySelector(`[data-category="${currentFilter}"]`);
    
    if (activeButton) {
        activeButton.classList.remove('bg-white/80', 'dark:bg-gray-700/80', 'hover:bg-indigo-50', 'dark:hover:bg-gray-600', 'dark:text-gray-200');
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
    
    const filteredTasks = filterTasks(tasksToRender || getCurrentList().tasks);
    const sortedTasks = sortTasks(filteredTasks, sortMethod);
    
    if (sortedTasks.length === 0) {
        taskList.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <i class="fas fa-tasks text-4xl mb-4"></i>
                <p class="text-lg font-medium mb-2">No tasks found</p>
                <p class="text-sm">Click the + button to add a new task</p>
            </div>
        `;
        return;
    }
    
    sortedTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.dataset.taskIndex = index;
        const priorityColors = {
            high: 'border-red-500',
            medium: 'border-yellow-500',
            low: 'border-green-500'
        };
        
        const taskCategory = getCurrentList().categories.find(c => c.name === task.category) || { name: task.category, color: '#666666' };
        const categoryStyle = `background-color: ${taskCategory.color}25; color: ${taskCategory.color}`;
        
        li.className = `flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 ${priorityColors[task.priority]}`;
        if (task.completed) li.classList.add('opacity-75');
        
        const deadlineClass = isDeadlineNear(task.deadline) ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
        const deadlineText = task.deadline ? 
            `<span class="px-2 py-1 rounded-full text-xs font-medium ${deadlineClass}">${formatDeadline(task.deadline)}</span>` : '';
        
        const favoriteClass = task.favorite ? 'text-yellow-500' : 'text-gray-300';
        
        const subtasksHtml = `
            <div class="mt-4 pl-8">
                <div class="space-y-2">
                    ${task.subtasks.map((subtask, subtaskIndex) => `
                        <div class="flex items-center gap-2 p-2 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition group">
                            <input type="checkbox" 
                                ${subtask.completed ? 'checked' : ''} 
                                onclick="toggleSubtask(${index}, ${subtaskIndex})"
                                class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500">
                            <span class="flex-1 text-sm ${subtask.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200'}">${subtask.text}</span>
                            <button onclick="deleteSubtask(${index}, ${subtaskIndex})" 
                                class="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50 rounded">
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
                            class="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white/80 dark:bg-gray-700/80 dark:text-white">
                        <i class="fas fa-plus absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs"></i>
                    </div>
                    <button onclick="addSubtask(${index})" 
                        class="px-3 py-2 text-sm bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition flex items-center gap-2">
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
                        <div class="flex items-center gap-2 p-2 bg-yellow-50/50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition group">
                            <div class="flex-1">
                                <p class="text-sm text-gray-700 dark:text-gray-200">${note.text}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">${new Date(note.createdAt).toLocaleString()}</p>
                            </div>
                            <button onclick="deleteNote(${index}, ${noteIndex})" 
                                class="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50 rounded">
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
                            class="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white/80 dark:bg-gray-700/80 dark:text-white">
                        <i class="fas fa-sticky-note absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xs"></i>
                    </div>
                    <button onclick="addNote(${index})" 
                        class="px-3 py-2 text-sm bg-yellow-50 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900 transition flex items-center gap-2">
                        <i class="fas fa-plus text-xs"></i>
                        Add Note
                    </button>
                </div>
            </div>
        `;

        const recurringText = task.recurring && task.recurring !== 'none' ? 
            `<span class="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">↻ ${task.recurring}</span>` : '';

        const descriptionHtml = task.description ? `
            <div class="mt-2 text-sm text-gray-600 dark:text-gray-300 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                ${task.description.replace(/\n/g, '<br>')}
            </div>
        ` : '';

        li.innerHTML = `
            <div class="w-full">
                <div class="flex items-center gap-3">
                    <button class="drag-handle cursor-move text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 px-1">
                        <i class="fas fa-grip-vertical"></i>
                    </button>
                    <button onclick="toggleFavorite(${index})" class="text-xl ${favoriteClass} hover:text-yellow-500 transition">
                        <i class="fas fa-star"></i>
                    </button>
                    <span class="px-2 py-1 rounded-full text-xs font-medium" style="${categoryStyle}">${task.category}</span>
                    ${deadlineText}
                    ${recurringText}
                    <span class="flex-1 cursor-pointer ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'dark:text-white'} hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors" 
                        onclick="toggleTask(${index})" 
                        title="Click to mark as ${task.completed ? 'incomplete' : 'complete'}">${task.text}</span>
                    <button onclick="showShareModal(${index})" class="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900 transition">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <button onclick="editTask(${index})" class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">Edit</button>
                    <button onclick="deleteTask(${index})" class="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900 transition">Delete</button>
                </div>
                ${descriptionHtml}
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
    renderLists();
}

function exportTasks() {
    const data = {
        tasks: getCurrentList().tasks,
        categories: getCurrentList().categories
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
                        getCurrentList().tasks = data.tasks;
                        if (data.categories && Array.isArray(data.categories)) {
                            getCurrentList().categories = data.categories;
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

    getCurrentList().tasks.forEach(task => {
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
    getCurrentList().tasks[index].favorite = !getCurrentList().tasks[index].favorite;
    saveTasks();
    renderTasks();
}

function addSubtask(parentIndex) {
    const input = document.getElementById(`subtask-input-${parentIndex}`);
    const subtaskText = input.value.trim();
    
    if (subtaskText) {
        getCurrentList().tasks[parentIndex].subtasks.push({
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
    const subtask = getCurrentList().tasks[taskIndex].subtasks[subtaskIndex];
    subtask.completed = !subtask.completed;
    subtask.completedDate = subtask.completed ? new Date().toISOString() : null;
    
    const allSubtasksCompleted = getCurrentList().tasks[taskIndex].subtasks.every(st => st.completed);
    if (allSubtasksCompleted) {
        getCurrentList().tasks[taskIndex].completed = true;
        getCurrentList().tasks[taskIndex].completedDate = new Date().toISOString();
    } else {
        getCurrentList().tasks[taskIndex].completed = false;
        getCurrentList().tasks[taskIndex].completedDate = null;
    }
    
    saveTasks();
    renderTasks();
}

function deleteSubtask(taskIndex, subtaskIndex) {
    showConfirmDialog('Are you sure you want to delete this subtask?', () => {
        getCurrentList().tasks[taskIndex].subtasks.splice(subtaskIndex, 1);
        saveTasks();
        renderTasks();
    });
}

function addNote(taskIndex) {
    const input = document.getElementById(`note-input-${taskIndex}`);
    const noteText = input.value.trim();
    
    if (noteText) {
        getCurrentList().tasks[taskIndex].notes.push({
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
        getCurrentList().tasks[taskIndex].notes.splice(noteIndex, 1);
        saveTasks();
        renderTasks();
    });
}

function checkRecurringTasks() {
    const today = new Date();
    
    getCurrentList().tasks.forEach(task => {
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
            
            getCurrentList().tasks.push(newTask);
            task.lastRecurrence = new Date().toISOString();
        }
    });
    
    saveTasks();
    renderTasks();
}

function moveTaskBetweenLists(fromListId, toListId, taskIndex) {
    const fromList = taskLists.find(list => list.id === fromListId);
    const toList = taskLists.find(list => list.id === toListId);
    
    if (fromList && toList) {
        const task = fromList.tasks[taskIndex];
        fromList.tasks.splice(taskIndex, 1);
        toList.tasks.push(task);
        saveTasks();
        renderTasks();
    }
}

function initializeDragAndDrop() {
    const taskList = document.getElementById('taskList');
    const listContainer = document.getElementById('listSelector');
    new Sortable(taskList, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'bg-gray-100',
        group: {
            name: 'tasks',
            pull: true,
            put: true
        },
        onEnd: function(evt) {
            if (evt.to === taskList) {
                const taskArray = Array.from(taskList.children);
                const newTasks = [];
                taskArray.forEach(li => {
                    const taskIndex = parseInt(li.dataset.taskIndex);
                    newTasks.push(getCurrentList().tasks[taskIndex]);
                });
                getCurrentList().tasks = newTasks;
                saveTasks();
            }
        }
    });

    const initializeList = (listEl) => {
        const listId = listEl.dataset.listId;
        if (!listId) return;

        new Sortable(listEl, {
            group: {
                name: 'tasks',
                put: true
            },
            animation: 150,
            ghostClass: 'bg-gray-100',
            onAdd: function(evt) {
                const taskIndex = parseInt(evt.item.dataset.taskIndex);
                const fromListId = currentListId;
                const toListId = listId;
                
                if (fromListId && toListId && fromListId !== toListId) {
                    moveTaskBetweenLists(fromListId, toListId, taskIndex);
                }
                evt.item.remove();
            }
        });
    };

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.dataset.listId) {
                        initializeList(node);
                    }
                });
            }
        });
    });

    observer.observe(listContainer, { childList: true });

    document.querySelectorAll('[data-list-id]').forEach(initializeList);
}

function showShareModal(taskIndex) {
    const modal = document.getElementById('shareModal');
    const shareLink = document.getElementById('shareLink');
    const includeSubtasks = document.getElementById('includeSubtasks');
    const includeNotes = document.getElementById('includeNotes');
    const includeStatus = document.getElementById('includeStatus');
    const task = getCurrentList().tasks[taskIndex];
    
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

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('shown');
}

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        addTask();
    } else if (e.ctrlKey && e.key === 'e') {
        exportTasks();
    } else if (e.ctrlKey && e.key === 'f') {
        document.getElementById('searchInput').focus();
    }
    if (e.key === 'Escape') {
        closeAddTaskModal();
        closeFilterModal();
        closeShareModal();
        closeHelpModal();
        document.getElementById('confirmModal').classList.add('hidden');
        document.getElementById('promptModal').classList.add('hidden');
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

                getCurrentList().tasks.push(newTask);
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
    
    if (window.innerWidth < 1024) {
        const menuButton = document.createElement('button');
        menuButton.className = 'lg:hidden fixed top-4 left-4 p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-lg z-50';
        menuButton.innerHTML = '<i class="fas fa-bars"></i>';
        menuButton.onclick = toggleSidebar;
        document.body.appendChild(menuButton);
    }
});

renderTasks();
initializeFilters();
renderFilterButtons();

setInterval(checkRecurringTasks, 60000);
checkRecurringTasks();

function toggleDarkMode() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark);
    
    document.body.style.transition = 'background-color 0.3s ease';
    
}

function initializeDarkMode() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedPreference = localStorage.getItem('darkMode');
    
    if (storedPreference !== null) {
        document.documentElement.classList.toggle('dark', storedPreference === 'true');
    } else if (prefersDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
    }
    
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('darkMode') === null) {
            document.documentElement.classList.toggle('dark', e.matches);
        }
    });
}

initializeDarkMode();

