import { client } from '../../api/client'
import { createSelector } from 'reselect'
import { StatusFilters } from '../filters/filtersSlice'

const initialState = {
  status: 'idle',
  entities: {}
}

export default function todosReducer(state = initialState, action) {
  switch (action.type) {
    case 'todos/todosLoading': {
      return {
        ...state,
        status: 'loading',
      }
    }
    case 'todos/todosLoaded': {
      return {
        ...state,
        status: 'idle',
        entities: action.payload,
      }
    }
    case 'todos/todoAdded': {
      const todo = action.payload
      return {
        ...state,
        entities: {
          ...state.entities,
          [todo.id]: todo
        }
      }
    }
    case 'todos/todoToggled': {
      const todoId = action.payload
      const todo = state.entities[todoId]
      return {
        ...state,
        entities: {
          ...state.entities,
          [todoId]: {
            ...todo,
            completed: !todo.completed
          }
        }
      }
    }
    case 'todos/colorSelected': {
      const { color, todoId } = action.payload
      const todo = state.entities[todoId]
      return {
        ...state,
        entities: {
          ...state.entities,
          [todoId]: {
            ...todo,
            color
          }
        }
      }
    }
    case 'todos/todoDeleted': {
      const newEntities = { ...state.entities }
      delete newEntities[action.payload]
      return {
        ...state,
        entities: newEntities
      }
    }
    case 'todos/allCompleted': {
      const newEntities = { ...state.entities }
      Object.values(newEntities).forEach(todo => {
        newEntities[todo.id] = {
          ...todo,
          completed: true
        }
      })
      return {
        ...state,
        entities: newEntities
      }
    }
    case 'todos/completedCleared': {
      const newEntities = { ...state.entities }
      Object.values(newEntities).forEach(todo => {
        if (todo.completed) {
          delete newEntities[todo.id]
        }
      })
      return {
        ...state,
        entities: newEntities
      }
    }
    default:
      return state
  }
}

export const todoAdded = (todo) => ({ type: 'todos/todoAdded', payload: todo })

export const todoToggled = (todoId) => ({
  type: 'todos/todoToggled',
  payload: todoId,
})

export const todoColorSelected = (todoId, color) => ({
  type: 'todos/colorSelected',
  payload: { todoId, color },
})

export const todoDeleted = (todoId) => ({
  type: 'todos/todoDeleted',
  payload: todoId,
})

export const allTodosCompleted = () => ({ type: 'todos/allCompleted' })

export const completedTodosCleared = () => ({ type: 'todos/completedCleared' })

export const todosLoading = () => ({ type: 'todos/todosLoading' })

export const todosLoaded = (todos) => ({
  type: 'todos/todosLoaded',
  payload: todos,
})


// Thunk function
export const fetchTodos = () => async dispatch => {
  dispatch(todosLoading())
  const response = await client.get('/fakeApi/todos')
  dispatch(todosLoaded(response.todos))
}

export const saveNewTodo = text => async dispatch => {
  const initialState = { text }
  const response = await client.post('/fakeApi/todos', { todo: initialState })
  dispatch(todoAdded(response.todo))
}

const selectTodoEntities = state => state.todos.entities

export const selectTodos = createSelector(selectTodoEntities, entities =>
  Object.values(entities)
)

export const selectTodoById = (state, todoId) => {
  return selectTodoEntities(state)[todoId]
}

export const selectTodoIds = createSelector(
  selectTodos,
  (todos) => todos.map((todo) => todo.id)
)

export const selectFilteredTodos = createSelector(
  // First input selector: all todos
  selectTodos,
  // Second input selector: all filter values
  (state) => state.filters,
  // Output selector: receives both values
  (todos, filters) => {
    const { status, colors } = filters
    const showAllCompletions = status === StatusFilters.All
    if (showAllCompletions && colors.length === 0) {
      return todos
    }
    const completedStatus = status === StatusFilters.Completed
    return todos.filter((todo) => {
      const statusMatches =
        showAllCompletions || todo.completed === completedStatus
      const colorMatches = colors.length === 0 || colors.includes(todo.color)
      return statusMatches && colorMatches
    })
  }
)

export const selectFilteredTodoIds = createSelector(
  selectFilteredTodos,
  (filteredTodos) => filteredTodos.map((todo) => todo.id)
)


