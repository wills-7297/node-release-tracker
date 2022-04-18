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
import { deleteFeedProposal, confirmStatus, setReminderDate } from './dashboardSlice';
import { debounce } from "../utils/utils";
import { useDispatch } from 'react-redux';
import { Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

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
    setDeleteItem({node_full_name: ""});
  };

  const handleDeleteConfirm = async ()=>{
    // @ts-ignore
    dispatch(deleteFeedProposal({nodeFullName: deleteItem.node_full_name}));

    handleDeleteClose();
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
    setEditItem({node_name: ""});
  };

  const dispatch = useDispatch();
  const handleEditConfirm = async () => {
    // @ts-ignore
    dispatch(confirmStatus({nodeName: editItem.node_name, radioValue}));

    handleEditClose();
  }
  const radioGroupRef = React.useRef(null);

  // Notice Dialog state
  const [reminderOpen, setReminderOpen] = React.useState(false);
  const [reminderItem, setReminderItem] = React.useState({reminder_date: "", reminded: null, node_full_name:"", reminder_text:""});
  const [reminderText, setReminderText] = React.useState("");
  const handleReminderOpen = (item) => {
    setReminderOpen(true);
    setReminderItem(item);
  }

  const handleReminderClose = () => {
    setReminderOpen(false);
    setReminderItem({reminder_date: "", reminded: null, node_full_name:"", reminder_text:""});
    setReminderDateValue(null);
  }

  const handleReminderConfirm = async ()=>{
    // @ts-ignore
    dispatch(setReminderDate({reminderDate: reminderDateValue.getTime(), nodeName: reminderItem.node_name, reminded: 0, reminderText}));

    handleReminderClose();
  }
  const [reminderDateValue, setReminderDateValue] = React.useState(null);

  const currentTime = new Date().getTime();
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
      // type: 'date',
      valueGetter: (params) => {
        const value = params.row.current_feed;
        let currentFeed = value ? JSON.parse(value) : {};
        return currentFeed.pubDate;
      },
      renderCell: (params) => {
        let text = "";
        if(params.value){
          const date = new Date(params.value).getTime();
        
          const diffInDays = Math.floor((currentTime - date)/1000/60/60/24);
          if(diffInDays>365){
            text = Math.floor(diffInDays/365) + " 年以前";
          }else{
            text = diffInDays + " 天以前";
          }
        }
        return text;
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
          handleReminderOpen={handleReminderOpen}
        />
      ]
    },
  ];

  // console.log(nodeList)
  let unconfirmed = 0;
  let waiting = 0;
  let total = nodeList.length;
  nodeList.forEach(ele=>{
    const status = JSON.parse(ele.status);
    if(status?.value==="UNCONFIRMED"){
      unconfirmed++;
    }
    if(status?.value==="WAITING"){
      waiting++;
    }
  });

  return (
    <React.Fragment>
      <div style={{display: "flex"}}>
        <div style={{flex: "4"}}>
          <Title>节点版本</Title>
        </div>
        <Typography component="p" variant="subtitle1" style={{flex: "1"}}>
          未确认：{`${unconfirmed} / ${total}`}
        </Typography>
        <Typography component="p" variant="subtitle1" style={{flex: "1"}}>
          待处理：{`${waiting} / ${total}`}
        </Typography>
      </div>
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
      {/* Reminder Dialog */}
      <Dialog
        sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
        maxWidth="xs"
        open={reminderOpen}
        onClose={handleReminderClose}
      >
        <DialogTitle>设置提醒</DialogTitle>
        <DialogContent dividers>
          <div style={{marginBottom: "15px"}}>
            链名称：{reminderItem.node_full_name}
          </div>
          <div>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label={"提醒日期"}
                value={reminderDateValue}
                onChange={(newValue) => {
                  setReminderDateValue(newValue);
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </div>
          <TextField
            autoFocus
            margin="dense"
            id="reminder_text"
            label="提醒文字 (可选填)"
            fullWidth
            variant="standard"
            value={reminderText}
            onChange={ele=>{
              setReminderText(ele.target.value)
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleReminderClose}>
            取消
          </Button>
          <Button onClick={debounce(handleReminderConfirm)}>
            确认
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
