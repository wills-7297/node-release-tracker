import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useSelector } from 'react-redux';

export default function PositionedSnackbar() {
  const {
    toastError
	} = useSelector((state: any) => state.dashboard);

	return (
    <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={!!toastError}
        key={Math.random()}
    >
			<Alert severity="error">
          {toastError}
      </Alert>
		</Snackbar>
  );
}
