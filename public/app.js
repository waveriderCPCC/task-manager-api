function saveToken(token) {
  localStorage.setItem("token", token);
}

function getToken() {
  return localStorage.getItem("token");
}

function clearToken() {
  localStorage.removeItem("token");
}

function setSessionStatus() {
  const status = document.getElementById("session-status");
  status.textContent = getToken() ? "Logged in" : "Logged out";
}

function showOutput(data) {
  document.getElementById("output").textContent =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = text;
  }

  return { response, data };
}

/* ---------- SIGNUP ---------- */
document.getElementById("signup-btn").addEventListener("click", async () => {
  const msg = document.getElementById("signup-msg");
  msg.textContent = "";

  const body = {
    name: document.getElementById("signup-name").value,
    age: Number(document.getElementById("signup-age").value || 0),
    email: document.getElementById("signup-email").value,
    password: document.getElementById("signup-password").value,
  };

  try {
    const { response, data } = await apiFetch("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      msg.textContent = typeof data === "string" ? data : "Signup failed";
      return;
    }

    if (data.token) {
      saveToken(data.token);
    }

    setSessionStatus();
    msg.textContent = "Signup successful";
    showOutput(data);
    loadTasks();
  } catch {
    msg.textContent = "Signup error";
  }
});

/* ---------- LOGIN ---------- */
document.getElementById("login-btn").addEventListener("click", async () => {
  const msg = document.getElementById("login-msg");
  msg.textContent = "";

  const body = {
    email: document.getElementById("login-email").value,
    password: document.getElementById("login-password").value,
  };

  try {
    const { response, data } = await apiFetch("/users/login", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      msg.textContent = "Login failed";
      return;
    }

    if (data.token) {
      saveToken(data.token);
    }

    setSessionStatus();
    msg.textContent = "Login successful";
    showOutput(data);
    loadTasks();
  } catch {
    msg.textContent = "Login error";
  }
});

/* ---------- WHO AM I ---------- */
document.getElementById("me-btn").addEventListener("click", async () => {
  try {
    const { response, data } = await apiFetch("/users/me");

    if (!response.ok) {
      showOutput("Please login first");
      return;
    }

    showOutput(data);
  } catch {
    showOutput("Error fetching current user");
  }
});

/* ---------- LOGOUT ---------- */
document.getElementById("logout-btn").addEventListener("click", async () => {
  try {
    const { response } = await apiFetch("/users/logout", {
      method: "POST",
    });

    if (!response.ok) {
      showOutput("Logout failed");
      return;
    }

    clearToken();
    setSessionStatus();
    showOutput("Logged out");
    document.getElementById("task-list").innerHTML = "";
  } catch {
    showOutput("Logout error");
  }
});

/* ---------- LOGOUT ALL ---------- */
document
  .getElementById("logout-all-btn")
  .addEventListener("click", async () => {
    try {
      const { response } = await apiFetch("/users/logoutAll", {
        method: "POST",
      });

      if (!response.ok) {
        showOutput("Logout all failed");
        return;
      }

      clearToken();
      setSessionStatus();
      showOutput("Logged out from all sessions");
      document.getElementById("task-list").innerHTML = "";
    } catch {
      showOutput("Logout all error");
    }
  });

/* ---------- CREATE TASK ---------- */
document
  .getElementById("create-task-btn")
  .addEventListener("click", async () => {
    const msg = document.getElementById("task-msg");
    msg.textContent = "";

    const title = document.getElementById("task-title").value.trim();

    if (!title) {
      msg.textContent = "Please enter a task title";
      return;
    }

    try {
      const { response, data } = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        msg.textContent =
          typeof data === "string" ? data : "Task creation failed";
        return;
      }

      document.getElementById("task-title").value = "";
      msg.textContent = "Task created";
      loadTasks();
    } catch {
      msg.textContent = "Task creation error";
    }
  });

/* ---------- LOAD TASKS ---------- */
document
  .getElementById("refresh-tasks-btn")
  .addEventListener("click", loadTasks);

async function loadTasks() {
  const taskList = document.getElementById("task-list");
  const msg = document.getElementById("task-msg");
  taskList.innerHTML = "";

  if (!getToken()) {
    msg.textContent = "Login to view tasks";
    return;
  }

  try {
    const { response, data } = await apiFetch("/tasks");

    if (!response.ok) {
      msg.textContent = "Could not load tasks";
      return;
    }

    msg.textContent = "";

    if (!Array.isArray(data) || data.length === 0) {
      taskList.innerHTML = "<p>No tasks yet.</p>";
      return;
    }

    data.forEach((task) => {
      const card = document.createElement("div");
      card.className = "task-card";

      card.innerHTML = `
        <div class="task-info">
          <h3>${escapeHtml(task.title || "Untitled Task")}</h3>
          <p class="task-meta">Completed: ${task.completed ? "Yes" : "No"}</p>
         
        </div>
        <div class="task-actions">
          <button class="btn-success" data-action="complete" data-id="${task._id}">
            Mark Complete
          </button>
          <button class="btn-danger" data-action="delete" data-id="${task._id}">
            Delete
          </button>
        </div>
      `;

      taskList.appendChild(card);
    });
  } catch {
    msg.textContent = "Error loading tasks";
  }
}

/* ---------- TASK ACTIONS ---------- */
document
  .getElementById("task-list")
  .addEventListener("click", async (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "complete") {
      await markTaskComplete(id);
    }

    if (action === "delete") {
      await deleteTask(id);
    }
  });

async function markTaskComplete(id) {
  try {
    const { response } = await apiFetch(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ completed: true }),
    });

    if (!response.ok) {
      showOutput("Could not update task");
      return;
    }

    loadTasks();
  } catch {
    showOutput("Task update error");
  }
}

async function deleteTask(id) {
  try {
    const { response } = await apiFetch(`/tasks/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      showOutput("Could not delete task");
      return;
    }

    loadTasks();
  } catch {
    showOutput("Task delete error");
  }
}

/* ---------- HELPERS ---------- */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------- INITIAL ---------- */
setSessionStatus();
loadTasks();
