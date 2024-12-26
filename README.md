# Taskara

Taskara is a sleek and intuitive to-do list application designed to help you manage your tasks efficiently. Built with HTML, CSS (Tailwind CSS), and JavaScript, Taskara offers features like task categorization, priority settings, deadlines, and more.

## Features

- **Task Management**
  - Add, edit, and delete tasks
  - Mark tasks as complete/incomplete
  - Add descriptions to tasks
  - Mark tasks as favorites
  - Set priorities (High, Medium, Low)
  - Set deadlines with visual alerts
  - Add duration estimates
  - Drag and drop to reorder tasks

- **Organization**
  - Create custom categories with colors
  - Filter tasks by category
  - Sort by favorites, deadline, priority, or category
  - Search tasks by title or category
  - View task statistics

- **Subtasks**
  - Add subtasks to break down complex tasks
  - Mark subtasks as complete/incomplete
  - Delete subtasks individually

- **Notes**
  - Add multiple notes to any task
  - View note creation timestamps
  - Delete notes individually

- **Recurring Tasks**
  - Set tasks to repeat daily, weekly, or monthly
  - Automatic creation of recurring task instances
  - Track last recurrence date

- **Sharing**
  - Generate shareable links for tasks
  - Choose what to include in shared tasks:
    - Completion status
    - Subtasks
    - Notes

- **Export Options**
  - Export tasks and categories as JSON
  - Export tasks to calendar (ICS format)
  - Import tasks from backup files

- **Appearance**
  - Dark/Light mode toggle
  - Responsive design for mobile devices
  - Backdrop blur effects
  - Smooth animations

- **Keyboard Shortcuts**
  - Ctrl + Enter: Add task
  - Ctrl + E: Export tasks
  - Ctrl + F: Focus search
  - Esc: Close modals

- **List Management**
  - Create multiple task lists
  - Rename and delete lists
  - Switch between different lists
  - Tasks can be moved between lists via drag and drop
  - Lists maintain their own categories

## Getting Started

### Prerequisites

- A modern web browser (e.g., Chrome, Firefox, Edge).

### Installation

1. **Download or Clone the Repository**

   ```bash
   git clone https://github.com/PawiX25/Taskara.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd taskara
   ```

3. **Open the Application**

   - Open the `index.html` file in your preferred web browser.

### Usage

- **Adding a Task**

  1. Enter the task title in the "Enter a new task" input field.
  2. (Optional) Add a description in the "Add description" textarea.
  3. Select a deadline using the date picker.
  4. Choose a category from the dropdown.
  5. Select a priority level.
  6. Click the **Add Task** button.

- **Editing a Task**

  - Click the **Edit** button next to a task to modify its title and description.

- **Deleting a Task**

  - Click the **Delete** button next to a task and confirm the action.

- **Marking a Task as Completed**

  - Click on the task title to toggle its completed state.

- **Filtering Tasks**

  - Use the category buttons at the top to filter tasks by category.

- **Searching Tasks**

  - Enter keywords in the search bar to find tasks by title or category.

- **Sorting Tasks**

  - Use the sort dropdown menu to sort tasks by deadline, priority, or category.

- **Managing Categories**

  - Click on **Manage Categories** to add new categories, change colors, or delete existing ones.

- **Exporting Tasks**

  - Click the **Export** button to download a backup of your tasks and categories.

- **Importing Tasks**

  - Click the **Import** button and select a backup file to restore tasks and categories.

- **Managing Subtasks**
  - Add subtasks using the subtask input field below each task
  - Click the checkbox to mark subtasks complete
  - Click the delete button to remove subtasks

- **Managing Notes**
  - Add notes using the note input field below each task
  - Notes show creation timestamps
  - Click the delete button to remove notes

- **Recurring Tasks**
  - Select recurrence interval when creating a task (Daily/Weekly/Monthly)
  - Tasks automatically recreate based on their interval
  - Original task remains until marked complete

- **Sharing Tasks**
  - Click the share button on any task
  - Choose what to include in the shared task
  - Copy the generated link
  - Recipients can import shared tasks

- **Calendar Export**
  - Click "Export to Calendar" to generate an ICS file
  - Import the file into your preferred calendar app
  - Tasks with deadlines appear as calendar events

- **Theme Toggle**
  - Click the theme button to switch between light and dark mode
  - Theme preference is saved locally

## Built With

- **HTML**
- **CSS** - [Tailwind CSS](https://tailwindcss.com/)
- **JavaScript**
