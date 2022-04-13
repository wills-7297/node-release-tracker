import * as React from 'react';
import Link from '@mui/material/Link';
import { DataGrid } from '@mui/x-data-grid';
import Title from './Title';
import Button from '@mui/material/Button';
import Dropdown from "./Dropdown";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AddForm from "./AddForm";
import Alert from '@mui/material/Alert';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import { deleteFeedProposal, confirmStatus } from './dashboardSlice';
import { debounce } from "../utils/utils";
import { useDispatch } from 'react-redux';

const severityMap = {
  "low" : "success",
  "medium" : "warning",
  "high" : "error",
};

export default function Orders(props) {
  const { nodeList } = props;

  // Delete Dialog state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteItem, setDeleteItem] = React.useState({node_full_name: ""});
  const handleDeleteOpen = (item) => {
    setDeleteOpen(true);
    setDeleteItem(item);
  }
  const handleDeleteClose = () => {
    setDeleteOpen(false);
  };

  const handleDeleteConfirm = async ()=>{
    handleDeleteClose();
    // @ts-ignore
    dispatch(deleteFeedProposal({nodeFullName: deleteItem.node_full_name}));
  }

  // Edit Dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState({node_name: ""});
  const [radioValue, setRadioValue] = React.useState("");
  const handleEditOpen = (item) => {
    setEditOpen(true);
    setEditItem(item);
  }
  const handleEditClose = () => {
    setEditOpen(false);
  };

  const dispatch = useDispatch();
  const handleEditConfirm = async () => {
    handleEditClose();

    // @ts-ignore
    dispatch(confirmStatus({nodeName: editItem.node_name, radioValue}));
  }
  const radioGroupRef = React.useRef(null);

  const columns = [
    { field: 'node_name', headerName: '链', minWidth: 120 },
    { field: 'node_full_name', headerName: '链全称', minWidth: 130 },
    { field: 'op_node_version', headerName: '运维版本', minWidth: 130 },
    {
      field: 'github_node_version',
      headerName: 'github最新版本',
      minWidth: 160,
      renderCell: (params) => (
        <Link
          target="_blank"
          color="inherit"
          href={params.row.feed_url.substring(0, params.row.feed_url.length-5)}
        >
          {params.value}
        </Link>
      )
    },
    { field: 'handler', headerName: '维护人', minWidth: 120 },
    {
      field: 'github_release_date',
      headerName: 'github发布时间',
      minWidth: 160,
      type: 'date',
      valueGetter: (params) => {
        const value = params.row.current_feed;
        let currentFeed = value ? JSON.parse(value) : {};
        const date = new Date(currentFeed.pubDate);
        return date;
      }
    },
    {
      field: 'status',
      headerName: '状态',
      minWidth: 200,
      type: "singleSelect",
      valueOptions: [
        {value: "{\"value\":\"SAME\",\"label\":\"一致\",\"severity\":\"low\"}", label: "一致"},
        {value: "{\"value\":\"UNCONFIRMED\",\"label\":\"未确认\",\"severity\":\"high\"}", label: "未确认"},
        {value: "{\"value\":\"CONFIRMED\",\"label\":\"已确认 - 不需升级\",\"severity\":\"low\"}", label: "已确认 - 不需升级"},
        {value: "{\"value\":\"WAITING\",\"label\":\"已确认 - 待处理\",\"severity\":\"medium\"}", label: "已确认 - 待处理"},
      ],
      renderCell: (params) => {
        const value = params?.value;
        const status = value ? JSON.parse(value): {};
        return (
          <Alert
            severity={severityMap[status?.severity] || "warning"}
            style={{padding: "0px 10px"}}
          >
            {status?.label || "无状态"}
          </Alert>
        )
      }
    },
    {
      field: "actions",
      type: "actions",
      renderHeader: () => (
        <AddForm />
      ),
      getActions: (params) => [
        <Dropdown
          item={params.row}
          handleDeleteOpen={handleDeleteOpen}
          handleEditOpen={handleEditOpen}
        />
      ]
    },
  ];

  // console.log(nodeList)

  return (
    <React.Fragment>
      <Title>节点版本</Title>
      <div style={{ height: "75vh", width: '100%' }}>
        <DataGrid
          rows={nodeList}
          getRowId={(row)=> row.feed_url}
          columns={columns}
          pageSize={100}
          rowsPerPageOptions={[100]}
        />
      </div>
      {/* Delete Dialog */}
      <Dialog
        open={deleteOpen}
        onClose={handleDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"删除这条链?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            您将发出删除 <b>{deleteItem.node_full_name}</b> 的申请。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>否</Button>
          <Button
            onClick={debounce(handleDeleteConfirm)}
            autoFocus
          >
            是
          </Button>
        </DialogActions>
      </Dialog>
      {/* Edit Dialog */}
      <Dialog
        sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
        maxWidth="xs"
        open={editOpen}
        onClose={handleEditClose}
      >
        <DialogTitle>修改状态</DialogTitle>
        <DialogContent dividers>
          <RadioGroup
            ref={radioGroupRef}
            aria-label="ringtone"
            name="ringtone"
            value={radioValue}
            onChange={(event)=>{
              setRadioValue(event.target.value);
            }}
          >
            <FormControlLabel
              value={"noupgrade"}
              key={"noupgrade"}
              control={<Radio />}
              label={"不需要升级"}
            />
            <FormControlLabel
              value={"upgrade"}
              key={"upgrade"}
              control={<Radio />}
              label={"需要升级"}
            />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleEditClose}>
            取消
          </Button>
          <Button onClick={debounce(handleEditConfirm)}>
            确认
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
