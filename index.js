// Import helper functions from utils and initialData
import { getTasks, createNewTask, saveTaskUpdates, deleteTask } from "./utils"; // Adjust the import path as needed
import { initialData } from "./initialData";

/*************************************************************************************************************************************************
 * FIX BUGS AND IMPROVE FUNCTIONALITY!!!
 ************************************************************************************************************************************************/

// Function checks if local storage already has data; if not, it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}

// Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById("header-board-name"),
  boardsNavLinksDiv: document.getElementById("boards-nav-links-div"),
  filterDiv: document.getElementById("filter-div"),
  hideSideBarBtn: document.getElementById("hide-sidebar-btn"),
  showSideBarBtn: document.getElementById("show-sidebar-btn"),
  themeSwitch: document.getElementById("theme-switch"),
  createNewTaskBtn: document.getElementById("create-new-task-btn"),
  modalWindow: document.getElementById("modal-window"),
  editTaskModal: document.getElementById("edit-task-modal"),
  columnDivs: document.querySelectorAll(".column-div"),
};

let activeBoard = "";

// Extracts unique board names from tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);

  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard || boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
function displayBoards(boards) {
  const boardsContainer = elements.boardsNavLinksDiv;
  boardsContainer.innerHTML = ""; // Clears the container

  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.onclick = () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; // Assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    };
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from local storage
  const filteredTasks = tasks.filter((task) => task.board === boardName);

  elements.columnDivs.forEach((column) => {
    const status = column.getAttribute("data-status");
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container"; // Ensure class is set

    column.appendChild(tasksContainer);

    filteredTasks
      .filter((task) => task.status === status)
      .forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute("data-task-id", task.id);

        // Listen for a click event on each task and open a modal
        taskElement.onclick = () => {
          openEditTaskModal(task);
        };

        tasksContainer.appendChild(taskElement);
      });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.textContent === boardName);
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(
    `.column-div[data-status="${task.status}"]`
  );
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title;
  taskElement.setAttribute("data-task-id", task.id);

  taskElement.onclick = () => {
    openEditTaskModal(task);
  };

  tasksContainer.appendChild(taskElement);
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.onclick = () => toggleModal(false, elements.editTaskModal);

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.onclick = () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Hide the filter overlay
  };

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Hide the filter overlay
  });

  // Show and hide sidebar buttons
  elements.hideSideBarBtn.onclick = () => {
    elements.filterDiv.style.display = "none"; // Hide the filter overlay
    elements.boardsNavLinksDiv.style.display = "none"; // Hide the sidebar
  };

  elements.showSideBarBtn.onclick = () => {
    elements.boardsNavLinksDiv.style.display = "block"; // Show the sidebar
  };

  // Theme switch
  elements.themeSwitch.onclick = () => {
    document.body.classList.toggle("dark-mode");
    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  };
}

// Function to toggle modal visibility
function toggleModal(isVisible, modal = elements.modalWindow) {
  modal.style.display = isVisible ? "block" : "none";
  elements.filterDiv.style.display = isVisible ? "block" : "none"; // Show filter overlay
}

// Open the edit task modal with existing task details
function openEditTaskModal(task) {
  const titleInput = document.getElementById("edit-task-title");
  const descriptionInput = document.getElementById("edit-task-description");
  const statusSelect = document.getElementById("edit-task-status");

  titleInput.value = task.title;
  descriptionInput.value = task.description;
  statusSelect.value = task.status;

  toggleModal(true, elements.editTaskModal);
}

// Function to handle task updates
function updateTask(taskId) {
  const titleInput = document.getElementById("edit-task-title");
  const descriptionInput = document.getElementById("edit-task-description");
  const statusSelect = document.getElementById("edit-task-status");

  const updatedTask = {
    id: taskId,
    title: titleInput.value,
    description: descriptionInput.value,
    status: statusSelect.value,
  };

  saveTaskUpdates(updatedTask);
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

// Function to handle task deletion
function handleDeleteTask(taskId) {
  deleteTask(taskId);
  refreshTasksUI();
}

// Initialize app on page load
initializeData();
fetchAndDisplayBoardsAndTasks();
setupEventListeners();
