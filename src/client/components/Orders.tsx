import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
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

const statusMap = {
  "SAME": {text: "一致", severity: "success"},
  "UNCONFIRMED": {text: "未确认", severity: "error"},
  "CONFIRMED": {text: "已确认 - 不需升级", severity: "success"},
  "WAITING": {text: "已确认 - 待处理", severity: "warning"},
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

  return (
    <React.Fragment>
      <Title>节点版本</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>链</TableCell>
            <TableCell>链全称</TableCell>
            <TableCell>运维版本</TableCell>
            <TableCell>github最新版本</TableCell>
            <TableCell>维护人</TableCell>
            <TableCell>状态</TableCell>
            <TableCell>
              <AddForm />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {nodeList.map((item) => (
            <TableRow key={item.feed_url}>
              <TableCell>{item.node_name}</TableCell>
              <TableCell>{item.node_full_name}</TableCell>
              <TableCell>{item.op_node_version}</TableCell>
              <TableCell>
                <Link
                  target="_blank"
                  color="inherit"
                  href={item.feed_url.substring(0, item.feed_url.length-5)}
                >
                  {item.github_node_version}
                </Link>
              </TableCell>
              <TableCell>{item.handler}</TableCell>
              <TableCell>
                <Alert
                  severity={statusMap[item.status]?.severity || "warning"}
                  style={{padding: "0px 10px"}}
                >
                  {statusMap[item.status]?.text || "无状态"}
                </Alert>
              </TableCell>
              <TableCell>
                <Dropdown
                  item={item}
                  handleDeleteOpen={handleDeleteOpen}
                  handleEditOpen={handleEditOpen}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
