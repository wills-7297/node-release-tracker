import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import HttpRequestClient from "../utils/request";

export const fetchNodeList = createAsyncThunk(
  "fetch/nodeList",
  async (_, thunkAPI) => {
    setTimeout(() => {
      thunkAPI.dispatch(closeErrorToast());
    }, 5000);
    const res = await HttpRequestClient.get("/list/subscriptions");
    if(res?.data?.code===200){
      const array = res?.data.data?.filter(ele=>ele.node_name);
      array.sort((a, b) => {
        return a.node_name.normalize().localeCompare(b.node_name.normalize());
      });
      return array;
    }else{
      thunkAPI.dispatch(openErrorToast(res?.data?.message));
      return [];
    }
  }
);

export const addFeedProposal = createAsyncThunk(
  "add/feed-proposal",
  async (data, thunkAPI) => {
    // in case request rejection 500. closeToast anyway.
    setTimeout(() => {
      thunkAPI.dispatch(closeErrorToast());
    }, 5000);
    const res = await HttpRequestClient.post("/add/feed-proposal", data);
    if(res?.data?.code !== 200){
      thunkAPI.dispatch(openErrorToast(res?.data?.message));
    }
    return res;
  }
);

export const deleteFeedProposal = createAsyncThunk(
  "delete/feed-proposal",
  async (data, thunkAPI) => {
    setTimeout(() => {
      thunkAPI.dispatch(closeErrorToast());
    }, 5000);
    const res = await HttpRequestClient.post("/delete/feed-proposal", data);
    if(res?.data?.code !== 200){
      thunkAPI.dispatch(openErrorToast(res?.data?.message));
    }
    return res;
  }
);

export const confirmStatus = createAsyncThunk(
  "confirm/status",
  async (data: any, thunkAPI) => {
    setTimeout(() => {
      thunkAPI.dispatch(closeErrorToast());
    }, 5000);
    const { endpoint, nodeName } = data;
    const res = await HttpRequestClient.post(
      endpoint,
      {nodeName}
    );
    // no side-effects inside reducers
    if(res?.data.code===200){
      thunkAPI.dispatch(fetchNodeList());
    }else{
      thunkAPI.dispatch(openErrorToast(res?.data?.message));
    }
    return res;
  }
);

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    nodeList: [],
    toastError: "",
  },
  reducers: {
    closeErrorToast(state){
      state.toastError = "";
    },
    openErrorToast(state, action){
      state.toastError = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder
      .addCase(fetchNodeList.fulfilled, (state, action) => {
        // Add user to the state array
        state.nodeList = action.payload;
      })
      .addCase(fetchNodeList.rejected, (state, action) => {
        state.toastError = action?.error?.message;
      }),
    builder
      .addCase(addFeedProposal.rejected, (state, action) => {
        state.toastError = action?.error?.message;
      }),
    builder
      .addCase(deleteFeedProposal.rejected, (state, action) => {
        state.toastError = action?.error?.message;
      }),
    builder
      .addCase(confirmStatus.rejected, (state, action) => {
        state.toastError = action?.error?.message;
      })
  },
});

// Action creators are generated for each case reducer function
export const {
  closeErrorToast, openErrorToast
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
