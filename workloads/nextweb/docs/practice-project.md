## Things to learn

1. React useState [DONE]
2. React useEffect [DONE]
3. Axios [DONE]
4. React Context, Providers and useContext [DONE]
5. Zustand [DONE]
6. React Hook Forms [DONE]
7. Tanstack Query [DONE]
8. React.memo, useRef, useCallback and useMemo [TODO]

## Practice Project

A personal task tracker (like below) where you can add, edit, filter and sync tasks with a mock back-end
Will only use the components inside `src/components/trial`

┌──────────────────────────────────────────────────────┐
│ 🗒️ Personal Task Tracker 🌙 Light │ ← Header (Context)
├──────────────────────────────────────────────────────┤
│ [All] [To‑Do] [Done] + Add Task │ ← FilterBar + Modal trigger
├──────────────────────────────────────────────────────┤
│ ◻️ Buy groceries │ ← TaskItem (checkbox)
│ ✅ Finish quarterly report │
│ ◻️ Call Mom │
│ … │
└───────────────────────────────────────────────────────┘

---

## 1. Package installations

`pnpm install axios @tanstack/react-query zustand react-hook-form`

## 2. useState and useEffect

- `useState` is a React hook which stores internal memory in a Fiber to retain state across re-renders
  - when the state is updated by the provided setter function, the component is re-rendered automatically
  - this must be called inside a React component function and takes an initial value arg only used during mount
  - useState basically just looks up the current state value from the Fiber node when the function is called again during re-render
    - a re-render happens when the component is marked as dirty because the setter was called somewhere
    - the setter takes a callback with argument as the current state and must generate a new state purely
      - React strict mode calls updaters twice to find bugs where its not pure
      - this requires creating new copies of objects even internally and not just top-level reference

- `useEffect` is a React hook which runs side-effect logic after the component renders
  - things like fetching data and setting up timers fall under side-effects
  - shouldn't have synchronous code updating state as it can cause recurring re-renders
  - the actual callback arg to useEffect shouldn't be async, instead call an async function inside the callback
  - it takes a dependencies array as argument
    - no array passed implies run after every render
    - empty array implies run once after component mount
    - non-empty array implies run when one of the values in the array change
    - if the effect modifies a state and the same state is in the dependencies, it will trigger an infinite loop
  - we can also return a cleanup function
    - if there is a setInterval or something, we can clearInterval for it in the cleanup function

---

## 3. Axios

- This is to do real data fetches like API
  - just do `axios.get(url)` and get data as `response.data`

## 4. React Context API, Providers and useContext

- The React Context API provides a way to pass data in the component tree without prop drilling
  - the context can be directly used as a component to pass values starting with React 19+
- If the context data has to be dynamically updated, then we need to define a Provider
  - the Provider then wraps all components inside layout.tsx and we use the context inside the Provider
  - we can use hooks inside the provider just like a component to maintain state and handle side-effects
- Components can then access the data using `useContext` hook which takes the context as an argument

## 5. Zustand

- Zustand is used for global state management and in ways replaces the React Context API and providers
  - the context API and providers is a dependency injection tool and in some cases may coexist with Zustand
- While React context API triggers re-renders for all components using that context, Zustand is optimized for only those subscribers who see changes
- Define the Store type and then initialize it using `create` along with the function implementations
- When we need to scale out the number of actions and state, we can split by the slices pattern
  - this ought to use interfaces for each slice instead of types
- For use with Next, we need to make sure that the store is initialized per-request instead of globally, for which we create a provider
  - guidelines specify that react server components ought to not use the zustand store and are meant to be stateless

## 6. React Hook Form

- Provides a hook-based form library to handle validation, reset and submit
- We can get all the necessary components out of useForm
- First we use `register` with the spread operator to register the form field with the form
  - internally it sets the value, onChange, onBlur and ref HTML properties
  - however the value set with the defaultValue only happens at mount and doesn't react to changes to global state, so we have to use some other way to propagate the values
- We can use `handleSubmit` to feed the onSubmit event of the HMTL form
  - it takes an onSubmit function as argument, which receives the form state as argument internally
- We can use `reset` to clear the form state automatically
  - with no arguments, it will set the form state back to initial default value
  - with argument of the form's state, it will set it to that specifically
- We can define `formState: {errors, isSubmitting}`
  - `errors` takes care of managing error state and allows setting error messages per field
  - `isSubmitting` can be used to track when the form submit is in progress and may need to disable fields

## 7. Tanstack Query

- Provides utilities for fetching, caching and synchronizing server state on the front-end
- For Next, we need to create a provider for this as well and nest it into `layout.tsx`
  - for prefetching in server components, may need to use a new queryClient per request to avoid data leakage between users (refer https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
- In general for client API calls
  - it provides quick default configs for retries, caching by stale timeout etc
  - for each API, it also provides `onSuccess` callbacks that allow invalidating cache by key
- We create all related Tanstack query hooks within `src/hooks/use{Entity}.ts`
- Then using `useEntity.useSpecificHook` for GETs subscribes the component so that whenever cache is invalidated for that key, it automatically fetches and re-renders
  - so we don't even need to manage it as a `useState` anymore and can directly use the fetch hooks in whichever component needs to subscribe to the data
  - therefore Zustand and Tanstack end up being two separate stores (one for client and second for server)
- For mutations like POST/PUT/DELETE, we define it using `mutateAsync` and then just call it where required with the arguments as defined in the hooks file
- It can basically get rid of all `useEffects` being used for API calls but not others

## 8. React.memo, useRef, useCallback and useMemo

- `useCallback` allows caching a function definition between re-renders
  - its re-defined only if one of the dependencies change
  - shouldn't wrap every function in this as it creates an overhead of comparisons
- `useMemo` allows caching the result of a calculation between re-renders for performance
  - its re-executed only if one of its dependencies change
  - simple operations shouldn't use this as it has a comparison overhead if overused
