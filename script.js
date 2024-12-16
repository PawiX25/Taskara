let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function addTask() {
    const input = document.getElementById('taskInput');
    const priority = document.getElementById('prioritySelect').value;
    const category = document.getElementById('categorySelect').value;
    const task = input.value.trim();
    
    if (task) {
        tasks.push({ 
            text: task, 
            completed: false,
            priority: priority,
            category: category
        });
        saveTasks();
        renderTasks();
        input.value = '';
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

function sortTasks(tasks, method) {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    const categoryOrder = { work: 1, personal: 2, shopping: 3, other: 4 };

    switch (method) {
        case 'priority':
            return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        case 'category':
            return [...tasks].sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category]);
        default:
            return tasks;
    }
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    const sortMethod = document.getElementById('sortSelect').value;
    taskList.innerHTML = '';
    
    const sortedTasks = sortTasks(tasks, sortMethod);
    
    sortedTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `priority-${task.priority}`;
        if (task.completed) li.classList.add('completed');
        
        li.innerHTML = `
            <span class="category-tag category-${task.category}">${task.category}</span>
            <span class="task-text" onclick="toggleTask(${index})">${task.text}</span>
            <button onclick="deleteTask(${index})">Delete</button>
        `;
        taskList.appendChild(li);
    });
}

document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

document.getElementById('sortSelect').addEventListener('change', renderTasks);

renderTasks();
