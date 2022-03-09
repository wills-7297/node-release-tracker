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
  async (data) => {
    const res = await HttpRequestClient.post("/add/feed-proposal", data);
    return res;
  }
);

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    nodeList: [],
    addFeedProposalError: "",
  },
  reducers: {
    closeErrorToast(state){
      state.addFeedProposalError = ""
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchNodeList.fulfilled, (state, action) => {
      // Add user to the state array
      state.nodeList = action.payload;
    }),
    // test reject case
    builder.addCase(addFeedProposal.fulfilled, (state, action) => {
      const { status, data, statusText } = action?.payload;
      if(status !== 200){
        state.addFeedProposalError = statusText;
      }
      if(data?.code !== 200){
        state.addFeedProposalError = data?.message;
      }
    })
  },
});

// Action creators are generated for each case reducer function
export const { closeErrorToast } = dashboardSlice.actions;

export default dashboardSlice.reducer;
