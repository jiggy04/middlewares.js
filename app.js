require("dotenv").config()



const express = require('express');
const app = express();
const cors = require("cors")
const logRequest = require('./middlewares/logger')
const validateTodo = require('./middlewares/validator')
const errorhandler = require('./middlewares/errorHandler')

app.use(express.json()); // Parse JSON bodies
const corsOptions = {
  origin: 'http://localhost:4000'
};

app.use(cors(corsOptions));
app.use(logRequest);

let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: false },
];

// GET All – Read
app.get('/todos', (req, res, next) => {
  res.status(200).json(todos); // Send array as JSON
});

app.get('/todos/active', (req, res, next) => {
  const active = todos.filter(t => !t.completed);
  res.json(active); // Custom Read!
});



app.get('/todos/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
    if(isNaN(id)){
      throw new Error("Invalid ID")
    }
  const single_todo = todos.find(t => t.id === id)
  if(!single_todo){
    return res.status(404).json({error: "Item not Found"})
  }
  res.status(200).json(single_todo); // Send array as JSON
  } catch (error) {
    next(error)
  }
});

// POST New – Create
app.post('/todos', validateTodo, (req, res, next) => {
 try{
 const newTodo = { id: todos.length + 1, ...req.body }; // Auto-ID
  if(!req.body.task)
    return res.json({info: "Please specify your task"})
  todos.push(newTodo);
  res.status(201).json(newTodo); // Echo back
 } catch (error) {
  next(error)

 }

});

// PATCH Update – Partial
app.patch('/todos/:id', (req, res, next) => {
  try {
      const todo = todos.find((t) => t.id === parseInt(req.params.id)); // Array.find()
  if (!todo) return res.status(404).json({ message: 'Todo not found' });
  Object.assign(todo, req.body); // Merge: e.g., {completed: true}
  res.status(200).json(todo);
  } catch (error) {
    next(error)
  }

});

// DELETE Remove
app.delete('/todos/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
  const initialLength = todos.length;
  todos = todos.filter((t) => t.id !== id); // Array.filter() – non-destructive
  if (todos.length === initialLength)
    return res.status(404).json({ error: 'Not found' });
  res.status(204).send(); // Silent success
  } catch (error) {
    next(error)
  }
});

app.get('/todos/completed', (req, res, next) => {
  try {
    const completed = todos.filter((t) => t.completed);
  res.json(completed); // Custom Read!
  } catch (error) {
    next(error)
  }
});

app.use(errorhandler);


const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
