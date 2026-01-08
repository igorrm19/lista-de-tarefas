const STORAGE_KEY = 'taskmaster_tasks';

let tasks = [];
let currentFilter = 'all';
let searchQuery = '';

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const taskCounter = document.getElementById('taskCounter');
const clearCompletedBtn = document.getElementById('clearCompleted');

function loadTasks() {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getFilteredTasks() {
    let filtered = tasks;
    
    if (searchQuery.trim()) {
        filtered = filtered.filter(task => 
            task.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    if (currentFilter === 'active') {
        filtered = filtered.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filtered = filtered.filter(task => task.completed);
    }
    
    return filtered;
}

function updateCounter() {
    const activeCount = tasks.filter(t => !t.completed).length;
    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    
    if (totalCount === 0) {
        taskCounter.textContent = 'Nenhuma tarefa';
    } else if (activeCount === 0) {
        taskCounter.textContent = 'Todas concluídas!';
    } else if (activeCount === 1) {
        taskCounter.textContent = '1 tarefa restante';
    } else {
        taskCounter.textContent = `${activeCount} tarefas restantes`;
    }
    
    clearCompletedBtn.disabled = completedCount === 0;
}

function renderTasks() {
    taskList.innerHTML = '';
    
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        const emptyState = document.createElement('li');
        emptyState.className = 'empty-state';
        if (tasks.length === 0) {
            emptyState.textContent = 'Nenhuma tarefa ainda. Adicione uma acima!';
        } else if (searchQuery.trim()) {
            emptyState.textContent = 'Nenhuma tarefa corresponde à sua busca.';
        } else {
            emptyState.textContent = 'Nenhuma tarefa neste filtro.';
        }
        taskList.appendChild(emptyState);
        updateCounter();
        return;
    }
    
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.dataset.id = task.id;
        
        const text = document.createElement('span');
        text.className = 'task-text';
        text.textContent = task.text;
        text.dataset.id = task.id;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Excluir';
        deleteBtn.dataset.id = task.id;
        
        li.appendChild(checkbox);
        li.appendChild(text);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
    
    updateCounter();
}

function addTask(text) {
    const newTask = {
        id: generateId(),
        text: text.trim(),
        completed: false
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

function editTask(id, newText) {
    const task = tasks.find(t => t.id === id);
    if (task && newText.trim()) {
        task.text = newText.trim();
        saveTasks();
        renderTasks();
    }
}

function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
}

function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    renderTasks();
}

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value;
    if (text.trim()) {
        addTask(text);
        taskInput.value = '';
    }
});

taskList.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    
    if (e.target.classList.contains('task-checkbox')) {
        toggleTask(id);
    } else if (e.target.classList.contains('delete-btn')) {
        deleteTask(id);
    }
});

taskList.addEventListener('dblclick', (e) => {
    if (e.target.classList.contains('task-text')) {
        const id = e.target.dataset.id;
        const task = tasks.find(t => t.id === id);
        if (task && !task.completed) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'task-input-edit';
            input.value = task.text;
            
            const textElement = e.target;
            textElement.replaceWith(input);
            input.focus();
            input.select();
            
            const finishEdit = () => {
                const newText = input.value;
                const span = document.createElement('span');
                span.className = 'task-text';
                span.textContent = task.text;
                span.dataset.id = id;
                input.replaceWith(span);
                
                if (newText !== task.text) {
                    editTask(id, newText);
                }
            };
            
            input.addEventListener('blur', finishEdit);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    finishEdit();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    const span = document.createElement('span');
                    span.className = 'task-text';
                    span.textContent = task.text;
                    span.dataset.id = id;
                    input.replaceWith(span);
                }
            });
        }
    }
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTasks();
});

clearCompletedBtn.addEventListener('click', clearCompleted);

loadTasks();
renderTasks();

