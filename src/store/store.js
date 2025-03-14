import { create } from "zustand";

// Safe get/set for localStorage
const isBrowser = typeof window !== "undefined";

const getLocalStorage = (key) => {
  if (isBrowser) {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : [];
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      window.localStorage.removeItem(key);
      return [];
    }
  }
  return [];
};

const setLocalStorage = (key, value) => {
  if (isBrowser) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
};

// Create store
const useStore = create((set, get) => ({
  // Default states (used for SSR hydration)
  counter: 0,

  // New schema structure
  schema: [], // Just an array of objects now

  sectionName: "Custom Section", // Separate name for schema

  // Function to load the counter from localStorage
  loadCounter: () => {
    const counter = getLocalStorage("counter");
    if (counter !== null) {
      set({ counter });
    }
  },
  setSchema: (newSchema) => {
    set(() => ({
      schema: newSchema, // Update the entire schema with the newSchema
    }));
    setLocalStorage("schema", newSchema); // Persist the entire schema to localStorage
  },

  // Function to load the schema from localStorage
  loadSchema: () => {
    const schema = getLocalStorage("schema");
    if (schema) {
      set({ schema });
    }
  },

  // Get current state of the schema
  getSchema: () => get().schema,

  // Increment the counter and update localStorage
  incrementCounter: () => {
    const newCounter = get().counter + 1;
    set({ counter: newCounter });
    setLocalStorage("counter", newCounter);
  },

  // Default items state, if required
  items: [],
  addItem: (item) => {
    const items = get().items;
    const updated = [...items, item];
    set((_) => {
      setLocalStorage("items", JSON.stringify(updated));
      return {
        items: updated,
      };
    });
  },
}));

export default useStore;
