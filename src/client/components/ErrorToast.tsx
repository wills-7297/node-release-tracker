import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useSelector, useDispatch } from 'react-redux';
import { closeErrorToast } from './dashboardSlice';

export default function PositionedSnackbar(props) {
  const addFeedProposalError = useSelector((state: any) => state.dashboard.addFeedProposalError);
  const dispatch = useDispatch();
	React.useEffect(() => {
		setTimeout(() => {
			dispatch(closeErrorToast());
		}, 3000);
  }, [addFeedProposalError]);


	return (
    <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={!!addFeedProposalError}
        key={Math.random()}
    >
			<Alert severity="error">
          {addFeedProposalError}
      </Alert>
		</Snackbar>
  );
}
