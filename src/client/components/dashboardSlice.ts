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

export const deleteFeedProposal = createAsyncThunk(
  "delete/feed-proposal",
  async (data) => {
    const res = await HttpRequestClient.post("/delete/feed-proposal", data);
    return res;
  }
);

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    nodeList: [],
    addFeedProposalError: "",
    deleteFeedProposalError: "",
  },
  reducers: {
    closeErrorToast(state){
      state.addFeedProposalError = "",
      state.deleteFeedProposalError = ""
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchNodeList.fulfilled, (state, action) => {
      // Add user to the state array
      state.nodeList = action.payload;
    }),
    builder
      .addCase(addFeedProposal.fulfilled, (state, action) => {
        const { data } = action?.payload;
        if(data?.code !== 200){
          state.addFeedProposalError = data?.message;
        }
      })
      .addCase(addFeedProposal.rejected, (state, action) => {
        state.addFeedProposalError = action?.error?.message;
      }),
    builder
      .addCase(deleteFeedProposal.fulfilled, (state, action) => {
        const { data } = action?.payload;
        if(data?.code !== 200){
          state.deleteFeedProposalError = data?.message;
        }
      })
      .addCase(deleteFeedProposal.rejected, (state, action) => {
        state.deleteFeedProposalError = action?.error?.message;
      })
  },
});

// Action creators are generated for each case reducer function
export const { closeErrorToast } = dashboardSlice.actions;

export default dashboardSlice.reducer;
