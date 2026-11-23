
import './style.css'

// Tipe status tugas
type TaskStatus = 'Belum Selesai' | 'Selesai'

// Tipe filter tugas
type TaskFilter = 'all' | 'pending' | 'completed'

// Struktur data tugas
interface Task {
  id: number
  title: string
  status: TaskStatus
}

// Menyimpan daftar tugas
// Mengambil data dari Local Storage menggunakan Generics
function loadFromStorage<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key)

  return data ? (JSON.parse(data) as T) : defaultValue
}

// Menyimpan daftar tugas
const tasks: Task[] = loadFromStorage<Task[]>('tasks', [])
// Menyimpan data ke Local Storage
function saveTasks(): void {
  localStorage.setItem('tasks', JSON.stringify(tasks))
}

// Mengambil elemen HTML
const app = document.querySelector<HTMLDivElement>('#app')!
const appName = import.meta.env.VITE_APP_NAME || 'Task Management'

app.innerHTML = `
  <header class="header">
    <h1>${appName}</h1>
    <p>Kelola tugas kuliahmu dengan lebih teratur.</p>
  </header>

  <main class="container">
    <section class="task-form">
      <h2>Tambah Tugas</h2>

      <form id="task-form">
        <input
          type="text"
          id="task-title"
          placeholder="Nama tugas..."
          required
        />
        <button type="submit">Tambah Tugas</button>
      </form>
    </section>

    <section class="task-list">
      <h2>Daftar Tugas</h2>

      <div class="task-filter">
        <button id="filter-all">Semua</button>
        <button id="filter-pending">Belum Selesai</button>
        <button id="filter-completed">Selesai</button>
      </div>

      <div id="task-summary"></div>
      <div id="tasks"></div>
    </section>
  </main>
`

// Mengambil elemen form dan daftar tugas
const form = document.querySelector<HTMLFormElement>('#task-form')!
const taskInput = document.querySelector<HTMLInputElement>('#task-title')!
const tasksContainer = document.querySelector<HTMLDivElement>('#tasks')!
const summary = document.querySelector<HTMLDivElement>('#task-summary')!

// Status filter saat ini
let currentFilter: TaskFilter = 'all'

// Memperbarui tampilan tombol filter
function updateFilterButtons(): void {
  document.querySelectorAll('.task-filter button').forEach((button) => {
    button.classList.remove('active')
  })

  const activeButton = document.querySelector(
    currentFilter === 'all'
      ? '#filter-all'
      : currentFilter === 'pending'
        ? '#filter-pending'
        : '#filter-completed'
  )

  activeButton?.classList.add('active')
}

// Menampilkan daftar tugas
function renderTasks(): void {
  tasksContainer.innerHTML = ''

  // Menghitung ringkasan tugas
  const completed = tasks.filter(
    (task) => task.status === 'Selesai'
  ).length

  summary.textContent = `Total: ${tasks.length} tugas | Selesai: ${completed} | Belum selesai: ${tasks.length - completed}`

  // Kondisi jika belum ada tugas sama sekali
  if (tasks.length === 0) {
    const message = document.createElement('p')
    message.className = 'empty-message'
    message.textContent = 'Belum ada tugas. Yuk, tambahkan tugas pertamamu!'
    tasksContainer.appendChild(message)
    return
  }

  // Menyaring tugas berdasarkan filter
  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === 'pending') {
      return task.status === 'Belum Selesai'
    }

    if (currentFilter === 'completed') {
      return task.status === 'Selesai'
    }

    return true
  })

  // Kondisi jika hasil filter kosong
  if (filteredTasks.length === 0) {
    const message = document.createElement('p')
    message.className = 'empty-message'

    message.textContent =
      currentFilter === 'pending'
        ? 'Tidak ada tugas yang belum selesai.'
        : 'Belum ada tugas yang selesai.'

    tasksContainer.appendChild(message)
    return
  }

  // Menampilkan setiap tugas
  filteredTasks.forEach((task) => {
    const taskElement = document.createElement('div')
    taskElement.className = 'task-item'

    const taskTitle = document.createElement('span')
    taskTitle.textContent = task.title

    if (task.status === 'Selesai') {
      taskTitle.classList.add('task-completed')
    }

    // Tombol status
    const statusButton = document.createElement('button')
    statusButton.textContent = task.status

    statusButton.className =
      task.status === 'Selesai'
        ? 'status-selesai'
        : 'status-belum'

    statusButton.addEventListener('click', () => {
      task.status =
        task.status === 'Belum Selesai'
          ? 'Selesai'
          : 'Belum Selesai'

      saveTasks()
      renderTasks()
    })

    // Tombol edit
    const editButton = document.createElement('button')
    editButton.textContent = 'Edit'

    editButton.addEventListener('click', () => {
      const newTitle = prompt('Masukkan nama tugas baru:', task.title)

      if (newTitle === null) return

      if (newTitle.trim() === '') {
        alert('Nama tugas tidak boleh kosong!')
        return
      }

      if (newTitle.trim().length > 100) {
        alert('Nama tugas maksimal 100 karakter!')
        return
      }

      task.title = newTitle.trim()
      saveTasks()
      renderTasks()
    })

    // Tombol hapus
    const deleteButton = document.createElement('button')
    deleteButton.textContent = 'Hapus'

    deleteButton.addEventListener('click', () => {
      const index = tasks.findIndex((item) => item.id === task.id)

      if (index !== -1) {
        tasks.splice(index, 1)
      }

      saveTasks()
      renderTasks()
    })

    // Memasukkan elemen ke dalam daftar
    taskElement.appendChild(taskTitle)
    taskElement.appendChild(statusButton)
    taskElement.appendChild(editButton)
    taskElement.appendChild(deleteButton)

    tasksContainer.appendChild(taskElement)
  })
}

// Event tombol filter
document.querySelector('#filter-all')!.addEventListener('click', () => {
  currentFilter = 'all'
  updateFilterButtons()
  renderTasks()
})

document.querySelector('#filter-pending')!.addEventListener('click', () => {
  currentFilter = 'pending'
  updateFilterButtons()
  renderTasks()
})

document.querySelector('#filter-completed')!.addEventListener('click', () => {
  currentFilter = 'completed'
  updateFilterButtons()
  renderTasks()
})

// Menambahkan tugas
form.addEventListener('submit', (event: SubmitEvent) => {
  event.preventDefault()

  const title = taskInput.value.trim()

  if (title === '') {
    alert('Nama tugas tidak boleh kosong!')
    return
  }

  if (title.length > 100) {
    alert('Nama tugas maksimal 100 karakter!')
    return
  }

  const newTask: Task = {
    id: Date.now(),
    title: title,
    status: 'Belum Selesai'
  }

  tasks.push(newTask)

  saveTasks()
  renderTasks()

  taskInput.value = ''
})

// Menampilkan data saat halaman dibuka
updateFilterButtons()
renderTasks()
