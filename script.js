const taskInput = document.getElementById('task-input');
const dueDateInput = document.getElementById('due-date');
const priorityInput = document.getElementById('priority');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const themeToggle = document.getElementById('theme-toggle');
const undoBtn = document.getElementById('undo-btn');
const searchInput = document.getElementById('search-input');
const completedCount = document.getElementById('completed-count');
const totalCount = document.getElementById('total-count');
const progressBar = document.getElementById('progress-bar');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let deletedTasks = [];
let history = [];

updateTaskList();

addTaskBtn.addEventListener('click', addTask);
undoBtn.addEventListener('click', undoLastDelete);
searchInput.addEventListener('input', filterTasks);

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
});

function addTask() {
    const taskName = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    const priority = priorityInput.value;

    if (!taskName) return;

    history.push(JSON.parse(JSON.stringify(tasks)));

    const newTask = { id: Date.now(), name: taskName, dueDate, priority, completed: false };
    tasks.push(newTask);
    saveAndRenderTasks();
    taskInput.value = '';
}

function saveAndRenderTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTaskList();
    updateUndoButtonState();
    updateStats();
}

function updateTaskList(filteredTasks = tasks) {
    taskList.innerHTML = '';
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = task.priority;
        if (task.completed) li.classList.add('completed');

        const overdue = task.dueDate && new Date(task.dueDate) < new Date();
        if (overdue) li.classList.add('overdue');

        li.innerHTML = `
            <span>${task.name} (Due: ${task.dueDate || 'N/A'})</span>
            <div>
                <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
                <button onclick="completeTask(${task.id})">Complete</button>
            </div>
        `;

        taskList.appendChild(li);
    });
}

function completeTask(id) {
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed;

    history.push(JSON.parse(JSON.stringify(tasks)));
    saveAndRenderTasks();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    const newName = prompt('Edit task name:', task.name);
    if (newName) {
        task.name = newName;
        history.push(JSON.parse(JSON.stringify(tasks)));
        saveAndRenderTasks();
    }
}

function deleteTask(id) {
    history.push(JSON.parse(JSON.stringify(tasks)));

    const deletedTask = tasks.find(t => t.id === id);
    deletedTasks.push(deletedTask);

    tasks = tasks.filter(t => t.id !== id);
    saveAndRenderTasks();
}

function undoLastDelete() {
    const lastDeletedTask = deletedTasks.pop();
    if (lastDeletedTask) {
        tasks.push(lastDeletedTask);
        saveAndRenderTasks();
    }
}

function updateStats() {
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    completedCount.textContent = `Completed: ${completedTasks}`;
    totalCount.textContent = `Total Tasks: ${totalTasks}`;

    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    progressBar.value = progressPercentage;

    const progressText = `Progress: ${Math.round(progressPercentage)}%`;
    progressBar.setAttribute('aria-valuenow', Math.round(progressPercentage));
    document.getElementById('progress').textContent = progressText;
}

function filterTasks() {
    const query = searchInput.value.toLowerCase();
    const filteredTasks = tasks.filter(task =>
        task.name.toLowerCase().includes(query) ||
        (task.dueDate && task.dueDate.includes(query))
    );
    updateTaskList(filteredTasks);
}

function updateUndoButtonState() {
    undoBtn.disabled = deletedTasks.length === 0;
}
