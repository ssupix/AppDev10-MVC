/*
 @class Model
 
 Manages the data of the application.
*/

// Model: Just storing and modifying data. Although it may appear we have events (we do not), we are simply defining what to do with data under several situations: Adding, Editing, Deleting and toggling completed tasks.

//  ====  Things to know, based on what we covered in prior days  === 
// const: Like a variable, but can not be changed.
// JSON.parse : JSON.parse (string to JS Object/Array)
// localStorage.getItem & localStorage.setItem  (get data and write data to local storage)
// push() adds new items to an array
// === NEW: ===
// callback : Wait till a prior function is complete before "calling it"
// _commit a method we are making to write changes to our list (todo)




class Model {

  constructor() {
    // gets a JSON string from local storage and converts to JS object
    this.todos = JSON.parse(localStorage.getItem('todos')) || []
  }

  bindTodoListChanged(callback) {
    // waits for the list to be changed
    this.onTodoListChanged = callback
  }

  // 
  _commit(todos) {
    // two function tied into one waiting to be called
    this.onTodoListChanged(todos)
    localStorage.setItem('todo', JSON.stringify(todos))
  }

  // Start of Adding, Editing, Deleting and toggling
  // at the end you an even trial this in the console:
  // app.model.addTodo('Go to Gym), to see how it works (ie visual layer isn't required.)

  addTodo(todoText) {
    const todo = {
      id       : this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
      text     : todoText,
      complete : false,
    }

    this.todos.push(todo)
    this._commit(this.todos)
  }

  editTodo(id, updateText) {
    this.todos = this.todos.map( todo =>
      todo.id === id ? {id: todo.id, text: updatedText, complete: todo.complete} : todo
    )

    this._commit(this.todo)
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(todo => todo.id !== id)
    this._commit(this.todos)
  }

  toggleTodo(id) {
    this.todos = this.todos.map(todo =>
        todo.id === id ? { id: todo.id, text: todo.text, complete: !todo.complete } : todo
    )

    this._commit(this.todos)
  }
}

/*
@class View

Visual representation of the model.
 */

// View: Through manipulation of the DOM we will generate dynamic objects on the page. Typically this is where JS frameworks such as Angular, ReactJS, or Vue doing most of the work. 



/* 
Common structure/template
// Create an element with an optional CSS class
  createElement(tag, className) {
    const element = document.createElement(tag)
    if (className) element.classList.add(className)

    return element
  }

  // Retrieve an element from the DOM
  getElement(selector) {
    const element = document.querySelector(selector)

    return element
  }

*/ 


// *** The following will create (   createElement()  )
// target <div id="container"> and generating
// <form> <input type="text" name="todo" placeholder="Add Event Here"> <button>

class View {
  constructor() {
    this.app = this.getElement('#container')
    this.form = this.createElement('form')
    this.input = this.createElement('input')
    this.input.type = 'text'
    this.input.placeholder = 'Add Event Here' 
    this.input.name = 'todo'
    this.submitButton = this.createElement('button')
    this.submitButton.textContent = '+'
    this.form.append(this.input, this.submitButton)
    // this.tittle = this.createElement('h1)
    // this.title.textContent = 'Todos'
    this.todoList = this.createElement('ul', 'todo-list')
    this.app.append(this.form, this.todoList)

    this._temporaryTodoText = ''
    this._initLocalListeners()
  }

  get _todoText() {
    return this.input.value
  }

  _resetInput() {
    this.input.value = ''
  }

  createElement(tag, className) {
    const element = document.createElement(tag)

    if (className) element.classList.add(className)

      return element
  }

// ++++++++++++++++++++++++++++++++++++  View code complete after this point
  getElement(selector) {
    const element = document.querySelector(selector)

    return element
  }

  // Displays the UL and LI "nodes" or dynamic tasks list
  displayTodos(todos) {
    // Delete all nodes
    while (this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild)
    }

    // Show default message
    if (todos.length === 0) {
      const instruct = this.createElement('p')
      instruct.textContent = '  Type a new event above: then click + or press ENTER'
      this.todoList.append(instruct)
    } else {
      // Create nodes
      todos.forEach(todo => {
        const li = this.createElement('li')
        li.id = todo.id

        const checkbox = this.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.checked = todo.complete

        const span = this.createElement('span')
        span.contentEditable = true
        span.classList.add('editable')

        if (todo.complete) {
          const strike = this.createElement('s')
          strike.textContent = todo.text
          span.append(strike)
        } else {
          span.textContent = todo.text
        }

        const deleteButton = this.createElement('button', 'delete')
        deleteButton.textContent = '-'
        li.append(checkbox, span, deleteButton)

        // Append nodes
        this.todoList.append(li)
      })
    }

    // Debugging   (Continue from here: Review Model / View)
    console.log(todos)
  }

  _initLocalListeners() {
    this.todoList.addEventListener('input', event => {
      if (event.target.className === 'editable') {
        this._temporaryTodoText = event.target.innerText
      }
    })
  }

  bindAddTodo(handler) {
    this.form.addEventListener('submit', event => {
      event.preventDefault()

      if (this._todoText) {
        handler(this._todoText)
        this._resetInput()
      }
    })
  }

  bindDeleteTodo(handler) {
    this.todoList.addEventListener('click', event => {
      if (event.target.className === 'delete') {
        const id = parseInt(event.target.parentElement.id)

        handler(id)
      }
    })
  }

  bindEditTodo(handler) {
    this.todoList.addEventListener('focusout', event => {
      if (this._temporaryTodoText) {
        const id = parseInt(event.target.parentElement.id)

        handler(id, this._temporaryTodoText)
        this._temporaryTodoText = ''
      }
    })
  }

  bindToggleTodo(handler) {
    this.todoList.addEventListener('change', event => {
      if (event.target.type === 'checkbox') {
        const id = parseInt(event.target.parentElement.id)

        handler(id)
      }
    })
  }
}


/**
@class Controller

Links the user input and the view output.

@param model
@param view
*/

/* ===========   
Lastly the controller is the link between the model (the data ) and the view (what the user will see on the page)
The Controller will handle events after they're fired. When you submit a new todo, or click the delete button, or click on the checkbox of a todo, an event will be fired. The view section (above) is currently using bind to "listen" for our main commands of Add Delete Edit and Toggle.
============ */ 



class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view

    //Explicit the binding
    this.model.bindTodoListChanged(this.onTodoListChanged)
    this.view.bindAddTodo(this.handleAddTodo)
    this.view.bindDeleteTodo(this.handleDeleteTodo)
    this.view.bindEditTodo(this.handleEditTodo)
    this.view.bindToggleTodo(this.handleToggleTodo)

    // Display the initial todos when onTodoListChanged is called (after every change)
    this.onTodoListChanged(this.model.todos)
  }

  onTodoListChanged = todo => {
    this.view.displayTodos(todo)
  }

  handleAddTodo = todoText => {
    this.model.addTodo(todoText)
  }

  handleEditTodo = (id, todoText) => {
    this.model.editTodo(id, todoText)
  }

  handleDeleteTodo = (id) => {
    this.model.deleteTodo(id)
  }

  handleToggleTodo = (id) => {
    this.model.toggleTodo(id)
  }

}

// Lastly, this generates a new object, based on the MVC structure

const app = new Controller(new Model(), new View())