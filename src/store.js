import { createStore, compose, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import reducer from "./reducer";
import { print1, print2, print3, loggerMiddleware } from './exampleAddons/middleware'
import {
  sayHiOnDispatch,
  includeMeaningOfLife
} from './exampleAddons/enhancers'

const composedEnhancer = composeWithDevTools(
  applyMiddleware(thunkMiddleware),
  // compose(sayHiOnDispatch, includeMeaningOfLife)
)

let preLoadedState
const persistedTodosString = localStorage.getItem('todos')

if (persistedTodosString) {
  preLoadedState = {
    todos: JSON.parse(persistedTodosString)
  }
}

const store = createStore(reducer, composedEnhancer)
export default store
