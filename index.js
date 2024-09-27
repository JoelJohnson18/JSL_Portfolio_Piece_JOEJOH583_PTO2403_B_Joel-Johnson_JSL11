// Import helper functions from utils and initialData
import { getTasks, createNewTask, saveTaskUpdates, deleteTask } from "./utils"; // Adjust the import path as needed
import { initialData } from "./initialData";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
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
  const filteredTasks = tasks.filter((task) => task.board === boardName); // Fixed equality check

  elements.columnDivs.forEach((column) => {
    const status = column.getAttribute("data-status");
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks
      .filter((task) => task.status === status)
      .forEach((task) => {
        // Fixed equality check
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
    if (btn.textContent === boardName) {
      btn.classList.add("active"); // Fixed method to add class
    } else {
      btn.classList.remove("active"); // Fixed method to remove class
    }
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
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`
    );
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild(taskElement); // Fixed appending element
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.onclick = () => toggleModal(false, elements.editTaskModal); // Fixed to use onclick

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.onclick = () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  };

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.onclick = () => toggleSidebar(false); // Fixed to use onclick
  elements.showSideBarBtn.onclick = () => toggleSidebar(true); // Fixed to use onclick

  // Theme switch event listener
  elements.themeSwitch.addEventListener("change", toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.onclick = () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  };

  // Add new task form submission event listener
  elements.modalWindow.addEventListener("submit", (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? "block" : "none"; // Fixed ternary operator
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 ************************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();

  // Assign user input to the task object
  const task = {
    title: event.target.title.value,
    description: event.target.description.value,
    status: event.target.status.value,
    board: activeBoard,
    id: Date.now(), // Simple ID based on timestamp
  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}

function toggleSidebar(show) {
  elements.filterDiv.style.display = show ? "block" : "none"; // Show/hide sidebar
}

function toggleTheme() {
  const isLightTheme = document.body.classList.toggle("light-theme");
  localStorage.setItem("light-theme", isLightTheme ? "enabled" : "disabled");
}

function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.modalWindow.title.value = task.title;
  elements.modalWindow.description.value = task.description;
  elements.modalWindow.status.value = task.status;

  // Call saveTaskChanges upon click of Save Changes button
  const saveChangesBtn = document.getElementById("save-changes-btn");
  saveChangesBtn.onclick = () => saveTaskChanges(task.id);

  // Delete task using a helper function and close the task modal
  const deleteTaskBtn = document.getElementById("delete-task-btn");
  deleteTaskBtn.onclick = () => {
    deleteTask(task.id);
    toggleModal(false);
    refreshTasksUI();
  };

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  const updatedTask = {
    title: elements.modalWindow.title.value,
    description: elements.modalWindow.description.value,
    status: elements.modalWindow.status.value,
    id: taskId,
  };

  saveTaskUpdates(updatedTask); // Save task updates using a helper function
  toggleModal(false, elements.editTaskModal); // Close the modal and refresh the UI
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener("DOMContentLoaded", function () {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true"; // Retrieve sidebar status
  toggleSidebar(showSidebar); // Show/hide sidebar based on localStorage
  initializeData(); // Initialize data
  fetchAndDisplayBoardsAndTasks(); // Fetch boards and tasks
}
