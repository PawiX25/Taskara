let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { name: 'personal', color: 'green' },
    { name: 'work', color: 'blue' },
    { name: 'shopping', color: 'orange' },
    { name: 'other', color: 'purple' }
];

let currentFilter = 'all';

function addTask() {
    const input = document.getElementById('taskInput');
    const priority = document.getElementById('prioritySelect').value;
    const category = document.getElementById('categorySelect').value;
    const deadline = document.getElementById('deadlineInput').value;
    const task = input.value.trim();
    
    if (task) {
        tasks.push({ 
            text: task, 
            completed: false,
            priority: priority,
            category: category,
            deadline: deadline
        });
        saveTasks();
        renderTasks();
        input.value = '';
        document.getElementById('deadlineInput').value = '';
    }
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
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
    const newText = prompt('Edit task:', task.text);
    if (newText !== null && newText.trim() !== '') {
        tasks[index].text = newText.trim();
        saveTasks();
        renderTasks();
    }
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
    const pending = total - completed;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
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
    categories.splice(index, 1);
    saveCategories();
    renderExistingFilters();
    renderFilterButtons();
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
        <button class="filter-btn px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition capitalize" 
                data-category="${category.name}">${category.name}</button>
    `).join('');
    
    initializeFilters();
}

function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active', 'bg-indigo-600', 'text-white'));
            btn.classList.add('active', 'bg-indigo-600', 'text-white');
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
        
        li.innerHTML = `
            <span class="px-2 py-1 rounded-full text-xs font-medium" style="${categoryStyle}">${task.category}</span>
            ${deadlineText}
            <span class="flex-1 cursor-pointer ${task.completed ? 'line-through text-gray-500' : ''}" onclick="toggleTask(${index})">${task.text}</span>
            <button onclick="editTask(${index})" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">Edit</button>
            <button onclick="deleteTask(${index})" class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition">Delete</button>
        `;
        taskList.appendChild(li);
    });
    
    updateStatistics();
}

function renderTasks() {
    renderTaskList();
}

document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

document.getElementById('sortSelect').addEventListener('change', renderTasks);
document.getElementById('searchInput').addEventListener('input', searchTasks);

renderTasks();
initializeFilters();
renderFilterButtons();
