let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

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

function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
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
        li.className = `priority-${task.priority}`;
        if (task.completed) li.classList.add('completed');
        
        const deadlineClass = isDeadlineNear(task.deadline) ? 'deadline-near' : '';
        const deadlineText = task.deadline ? `<span class="deadline-tag ${deadlineClass}">${formatDeadline(task.deadline)}</span>` : '';
        
        li.innerHTML = `
            <span class="category-tag category-${task.category}">${task.category}</span>
            ${deadlineText}
            <span class="task-text" onclick="toggleTask(${index})">${task.text}</span>
            <button onclick="editTask(${index})">Edit</button>
            <button onclick="deleteTask(${index})">Delete</button>
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
