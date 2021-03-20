const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExist = users.find(user => user.username === username)

  if (!userExist) {
    return response.status(404).json({ error: 'User not exist' });
  }
  request.user = userExist
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExist = users.find(user => user.username === username)

  if (userExist) {
    return response.status(400).json({ error: 'User already exist' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const user = request.user

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const user = request.user;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const user = request.user;

  const todoExist = user.todos.find(todo => todo.id === id);


  if (!todoExist) {
    return response.status(404).json({ error: "Todo not exist" })
  }

  const updateTodo = {
    ...todoExist,
    title,
    deadline: new Date(deadline),
  }

  user.todos.map((todo, key) => {
    if (todo.id === id) {
      user.todos[key] = updateTodo
    }
  })

  return response.status(200).json(updateTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  const todoExist = user.todos.find(todo => todo.id === id);

  if (!todoExist) {
    return response.status(404).json({ error: "Todo not exist" })
  }

  const updateTodo = {
    ...todoExist,
    done: true
  }

  user.todos.map((todo, key) => {
    if (todo.id === id) {
      user.todos[key] = updateTodo
    }
  })

  return response.status(200).json(updateTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  const todoExist = user.todos.find(todo => todo.id === id);

  if (!todoExist) {
    return response.status(404).json({ error: "Todo not exist" })
  }


  user.todos.map((todo, key) => {
    if (todo.id === id) {
      user.todos.splice(key, 1)
    }
  })


  return response.status(204).json(user.todos)
});

module.exports = app;