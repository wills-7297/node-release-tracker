import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useSelector, useDispatch } from 'react-redux';
import { closeErrorToast } from './dashboardSlice';

export default function PositionedSnackbar() {
  const {
		addFeedProposalError,
		deleteFeedProposalError,
	} = useSelector((state: any) => state.dashboard);
  const dispatch = useDispatch();
	React.useEffect(() => {
		const id = setTimeout(() => {
			dispatch(closeErrorToast());
		}, 5000);
		return () => {
			clearTimeout(id);
		};
  }, [addFeedProposalError, deleteFeedProposalError]);

	const message = (addFeedProposalError || deleteFeedProposalError);

	return (
    <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={!!message}
        key={Math.random()}
    >
			<Alert severity="error">
          {message}
      </Alert>
		</Snackbar>
  );
}
