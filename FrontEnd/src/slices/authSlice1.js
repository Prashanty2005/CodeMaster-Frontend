// slices/problemSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../utils/axiosClient';

// Helper function to get error message
const getErrorMessage = (error) => {
  return error.response?.data?.message || error.message || 'Something went wrong';
};

// Async thunk for fetching all problems
export const getAllProblems = createAsyncThunk(
  'problems/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/problem/getAllProblem');
      return response.data; // Assuming this returns an array of problems
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const getProblemById = createAsyncThunk(
  'problems/getById',
  async (problemId, { rejectWithValue }) => { // Changed parameter name for clarity
    try {
      const response = await axiosClient.get(`/problem/problemById/${problemId}`);
      return response.data; // This returns a single problem object
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// Initial state - UPDATED to include currentProblem
const initialState = {
  problems: [],          // Array of all problems
  currentProblem: null,  // Single problem for editing/viewing
  loading: false,        // Loading state for fetching
  error: null,           // Error message
  lastFetched: null,     // Timestamp of last successful fetch
  total: 0,             // Total count of problems
};

// Create slice
const problemSlice = createSlice({
  name: 'problems',
  initialState,
  reducers: {
    // Reset error state
    resetError: (state) => {
      state.error = null;
    },
    
    // Reset entire state (useful for logout or cleanup)
    resetProblems: () => initialState,
    
    // Clear current problem (when leaving edit page)
    clearCurrentProblem: (state) => {
      state.currentProblem = null;
      state.loading = false;
      state.error = null;
    },
    
    // Manually set problems (if needed for caching)
    setProblems: (state, action) => {
      state.problems = action.payload;
      state.error = null;
      state.loading = false;
    },
    
    // Manually add a single problem to the list
    addProblem: (state, action) => {
      state.problems.unshift(action.payload);
      state.total += 1;
    },
    
    // Manually update a problem in the list
    updateProblemInList: (state, action) => {
      const index = state.problems.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.problems[index] = { ...state.problems[index], ...action.payload };
      }
      // Also update currentProblem if it's the same problem
      if (state.currentProblem && state.currentProblem._id === action.payload._id) {
        state.currentProblem = { ...state.currentProblem, ...action.payload };
      }
    },
    
    // Manually remove a problem from the list
    removeProblemFromList: (state, action) => {
      state.problems = state.problems.filter(p => p._id !== action.payload);
      state.total = Math.max(0, state.total - 1);
      // Clear currentProblem if it's the same problem
      if (state.currentProblem && state.currentProblem._id === action.payload) {
        state.currentProblem = null;
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Handle getAllProblems pending state
      .addCase(getAllProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
      // Handle getAllProblems fulfilled state
      .addCase(getAllProblems.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.problems = action.payload; // This should be an array
        state.total = action.payload.length;
        state.lastFetched = Date.now();
      })
      
      // Handle getAllProblems rejected state
      .addCase(getAllProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch problems';
      })

      // Handle getProblemById pending state
      .addCase(getProblemById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // Handle getProblemById fulfilled state - FIXED
      .addCase(getProblemById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentProblem = action.payload; // Store single problem here
        // DON'T update problems array or total
        state.lastFetched = Date.now();
      })

      // Handle getProblemById rejected state
      .addCase(getProblemById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch problem';
        state.currentProblem = null; // Clear current problem on error
      })
  },
});

// Export actions - ADDED clearCurrentProblem
export const { 
  resetError, 
  resetProblems, 
  clearCurrentProblem, // NEW
  setProblems, 
  addProblem, 
  updateProblemInList, 
  removeProblemFromList 
} = problemSlice.actions;

// Export reducer
export default problemSlice.reducer;