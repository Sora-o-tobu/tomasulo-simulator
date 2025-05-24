import React, { useState } from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import TomasuloSimulator from './components/TomasuloSimulator';

function App() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Tomasulo Simulator
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          <TomasuloSimulator />
        </Paper>
      </Box>
    </Container>
  );
}

export default App; 