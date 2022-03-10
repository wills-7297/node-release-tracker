import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import HttpRequestClient from "../utils/request";

export const fetchNodeList = createAsyncThunk(
  "fetch/nodeList",
  async () => {
    // TODO: handle error
    const res = await HttpRequestClient.get("/list/subscriptions");
    const array = res?.data?.filter(ele=>ele.node_name);
    array.sort((a, b) => {
      return a.node_name.normalize().localeCompare(b.node_name.normalize());
    });
    return array;
  }
);

export const addFeedProposal = createAsyncThunk(
  "add/feed-proposal",
  async (data, thunkAPI) => {
    const res = await HttpRequestClient.post("/add/feed-proposal", data);
    if(res?.data?.code !== 200){
      thunkAPI.dispatch(addFeedProposalError(res?.data?.message));
      setTimeout(() => {
        thunkAPI.dispatch(closeErrorToast());
      }, 5000);
    }
    return res;
  }
);

export const deleteFeedProposal = createAsyncThunk(
  "delete/feed-proposal",
  async (data, thunkAPI) => {
    const res = await HttpRequestClient.post("/delete/feed-proposal", data);
    if(res?.data?.code !== 200){
      thunkAPI.dispatch(deleteFeedProposalError(res?.data?.message));
      setTimeout(() => {
        thunkAPI.dispatch(closeErrorToast());
      }, 5000);
    }
    return res;
  }
);

export const confirmStatus = createAsyncThunk(
  "confirm/status",
  async (data: any, thunkAPI) => {
    const { endpoint, nodeName } = data;
    const res = await HttpRequestClient.post(
      endpoint,
      {nodeName}
    );
    // no side-effects inside reducers
    if(res?.code===200){
      thunkAPI.dispatch(fetchNodeList());
    }else{
      thunkAPI.dispatch(confirmStatusError(res?.data?.message));
      setTimeout(() => {
        thunkAPI.dispatch(closeErrorToast());
      }, 5000);
    }
    return res;
  }
);

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    nodeList: [],
    addFeedProposalError: "",
    deleteFeedProposalError: "",
    confirmStatusError: "",
  },
  reducers: {
    closeErrorToast(state){
      state.addFeedProposalError = "",
      state.deleteFeedProposalError = "",
      state.confirmStatusError = ""
    },
    addFeedProposalError(state, action){
      state.addFeedProposalError = action.payload;
    },
    deleteFeedProposalError(state, action){
      state.deleteFeedProposalError = action.payload;
    },
    confirmStatusError(state, action){
      state.confirmStatusError = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchNodeList.fulfilled, (state, action) => {
      // Add user to the state array
      state.nodeList = action.payload;
    }),
    builder
      .addCase(addFeedProposal.rejected, (state, action) => {
        state.addFeedProposalError = action?.error?.message;
      }),
    builder
      .addCase(deleteFeedProposal.rejected, (state, action) => {
        state.deleteFeedProposalError = action?.error?.message;
      }),
    builder
      .addCase(confirmStatus.rejected, (state, action) => {
        state.deleteFeedProposalError = action?.error?.message;
      })
  },
});

// Action creators are generated for each case reducer function
export const {
  closeErrorToast, addFeedProposalError, deleteFeedProposalError, confirmStatusError
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
