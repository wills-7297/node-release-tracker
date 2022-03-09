import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import { useForm } from "react-hook-form";
import HttpRequestClient from "../utils/request";

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const onSubmit = async (data) => {
    console.log(data)

    const res = await HttpRequestClient.post(
      "/add/feed-proposal",
      data
    );
    if(res.code===200){
      handleClose();
    }else{
      // TODO: error alert
    }
  };

  return (
    <div>
      <Button color="inherit" onClick={handleClickOpen}>
        <AddIcon />
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>添加节点监控</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您将申请添加一条链的节点监控。
          </DialogContentText>
          <Box
            component="form"
            noValidate
            autoComplete="off"
          >
            <div>
              <TextField
                {...register("nodeName", { required: true })}
                error={errors?.nodeName?.type==="required"}
                autoFocus
                label="链code"
                required
                fullWidth
                variant="standard"
                helperText="例如: btc"
              />
              <TextField
                {...register("nodeFullName", { required: true })}
                error={errors?.nodeFullName?.type==="required"}
                label="链全称"
                required
                fullWidth
                variant="standard"
                helperText="例如: Bitcoin"
              />
              <TextField
                {...register("feedUrl", { required: true })}
                error={errors?.feedUrl?.type==="required"}
                label="github节点链接"
                required
                fullWidth
                variant="standard"
                helperText="例如: https://github.com/bitcoin/bitcoin/releases"
              />
              <TextField
                {...register("larkUrl", { required: true })}
                error={errors?.larkUrl?.type==="required"}
                label="lark链接"
                required
                fullWidth
                variant="standard"
                helperText="例如: https://open.larksuite.com/open-apis/bot/v2/hook/4374b8b5-bd42-4ff1-b020-194e33fa728a"
              />
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={()=>{
            handleSubmit(onSubmit)();
          }}>提交</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
