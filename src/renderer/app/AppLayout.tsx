import { Box } from '@mui/material';
import type { FC } from 'react';
import { Outlet } from 'react-router-dom';
import { DEMO_TOUR } from '../shared/config/brand';
import { DemoTour } from './DemoTour/DemoTour';
import { Sidebar } from './Sidebar';
import { Updater } from './Updater';

export const AppLayout: FC = () => {
  return (
    <>
      <Updater />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
      {DEMO_TOUR && <DemoTour />}
    </>
  );
};
