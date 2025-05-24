import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, Button, TextField, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Accordion, AccordionSummary, AccordionDetails, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { parseInstructions } from '../utils/instructionParser';
import { TomasuloCore } from '../utils/tomasuloCore';

/**
 * Default instruction sequence for demonstration
 * Shows various instruction types and their dependencies
 */
const DEFAULT_INSTRUCTIONS = `LD R1, 0
ADD R2, R1, R1
MUL R3, R2, R2
SUB R4, R3, R2
DIV R5, R4, R1`;

/**
 * Tomasulo Simulator Component
 * Main component for the Tomasulo algorithm simulator
 */
const TomasuloSimulator = () => {
  // State for instruction input and error handling
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);

  // Configuration state for simulator settings
  const [config, setConfig] = useState({
    addUnits: 3,      // Number of ADD/SUB functional units
    multUnits: 2,     // Number of MUL/DIV functional units
    loadUnits: 2,     // Number of LOAD functional units
    memory: [         // Initial memory contents
      { address: 0, value: 5 },
      { address: 1, value: 10 },
      { address: 2, value: 15 }
    ]
  });

  // Reference to the Tomasulo simulator instance
  const simulatorRef = useRef(new TomasuloCore());

  /**
   * Initialize simulator with current configuration
   */
  const initializeSimulator = useCallback(() => {
    simulatorRef.current = new TomasuloCore({
      addUnits: config.addUnits,
      multUnits: config.multUnits,
      loadUnits: config.loadUnits
    });
    simulatorRef.current.initializeMemory(config.memory);
    setUpdateTrigger(prev => prev + 1);
  }, [config]);

  // Initialize simulator on component mount and config changes
  useEffect(() => {
    initializeSimulator();
  }, [config]);

  /**
   * Handle single step execution
   * Loads instructions if needed and executes one cycle
   */
  const handleStep = useCallback(() => {
    try {
      // Load instructions if none are currently executing
      if (!isExecuting && simulatorRef.current.instructionQueue.length === 0) {
        const instructionsToUse = instructions.trim() || DEFAULT_INSTRUCTIONS;
        if (!instructions.trim()) {
          setInstructions(DEFAULT_INSTRUCTIONS);
        }
        const parsedInstructions = parseInstructions(instructionsToUse);
        simulatorRef.current.loadInstructions(parsedInstructions);
        setIsExecuting(true);
      }

      // Check if all instructions have completed
      if (isExecuting && 
          simulatorRef.current.instructionQueue.length === 0 && 
          !Object.values(simulatorRef.current.reservationStations).flat().some(station => station.busy)) {
        setError('All instructions have been executed.');
        setIsExecuting(false);
        return;
      }

      simulatorRef.current.step();
      setUpdateTrigger(prev => prev + 1);
      setError('');
    } catch (err) {
      setError(err.message);
      setIsExecuting(false);
    }
  }, [instructions, isExecuting]);

  /**
   * Reset simulator to initial state
   */
  const handleReset = useCallback(() => {
    initializeSimulator();
    setError('');
    setIsExecuting(false);
  }, [initializeSimulator]);

  /**
   * Handle configuration changes
   */
  const handleConfigChange = useCallback((field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  /**
   * Handle memory content changes
   */
  const handleMemoryChange = useCallback((index, field, value) => {
    setConfig(prev => ({
      ...prev,
      memory: prev.memory.map((item, i) => 
        i === index ? { ...item, [field]: parseInt(value) || 0 } : item
      )
    }));
  }, []);

  /**
   * Add new memory entry
   */
  const addMemoryEntry = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      memory: [...prev.memory, { address: prev.memory.length, value: 0 }]
    }));
  }, []);

  /**
   * Remove memory entry
   */
  const removeMemoryEntry = useCallback((index) => {
    setConfig(prev => ({
      ...prev,
      memory: prev.memory.filter((_, i) => i !== index)
    }));
  }, []);

  /**
   * Render configuration panel
   */
  const renderConfigPanel = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Configuration</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="number"
            label="ADD/SUB Units"
            value={config.addUnits}
            onChange={(e) => handleConfigChange('addUnits', parseInt(e.target.value) || 0)}
            inputProps={{ min: 1, max: 10 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="number"
            label="MUL/DIV Units"
            value={config.multUnits}
            onChange={(e) => handleConfigChange('multUnits', parseInt(e.target.value) || 0)}
            inputProps={{ min: 1, max: 10 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="number"
            label="LOAD Units"
            value={config.loadUnits}
            onChange={(e) => handleConfigChange('loadUnits', parseInt(e.target.value) || 0)}
            inputProps={{ min: 1, max: 10 }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>Memory Configuration</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Address</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {config.memory.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      type="number"
                      value={entry.address}
                      onChange={(e) => handleMemoryChange(index, 'address', e.target.value)}
                      inputProps={{ min: 0 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={entry.value}
                      onChange={(e) => handleMemoryChange(index, 'value', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => removeMemoryEntry(index)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          variant="outlined"
          onClick={addMemoryEntry}
          sx={{ mt: 1 }}
        >
          Add Memory Entry
        </Button>
      </Box>
    </Box>
  );

  /**
   * Render reservation stations table
   */
  const renderReservationStations = useCallback(() => {
    const stations = simulatorRef.current.reservationStations;
    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>FU</TableCell>
              <TableCell>Busy</TableCell>
              <TableCell>OP</TableCell>
              <TableCell>Vj</TableCell>
              <TableCell>Vk</TableCell>
              <TableCell>Qj</TableCell>
              <TableCell>Qk</TableCell>
              <TableCell>Dest</TableCell>
              <TableCell>Remaining Cycles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(stations).map(([type, stationList]) => (
              stationList.map((station, index) => (
                <TableRow key={`${type}-${index}`}>
                  <TableCell>{station.name}</TableCell>
                  <TableCell>{station.busy ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{station.op || '-'}</TableCell>
                  <TableCell>{station.vj !== null ? station.vj : '-'}</TableCell>
                  <TableCell>{station.vk !== null ? station.vk : '-'}</TableCell>
                  <TableCell>{station.qj || '-'}</TableCell>
                  <TableCell>{station.qk || '-'}</TableCell>
                  <TableCell>{station.dest || '-'}</TableCell>
                  <TableCell>{station.remainingCycles || '-'}</TableCell>
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }, [updateTrigger]);

  /**
   * Render registers table
   */
  const renderRegisters = useCallback(() => {
    const registers = simulatorRef.current.registers;
    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Register</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Qi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registers.map((reg, index) => (
              <TableRow key={index}>
                <TableCell>R{index}</TableCell>
                <TableCell>{reg.value}</TableCell>
                <TableCell>{reg.qi || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }, [updateTrigger]);

  /**
   * Render memory contents table
   */
  const renderMemory = useCallback(() => {
    const memoryContents = simulatorRef.current.getMemoryContents();
    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Address</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {memoryContents.map(({ address, value }) => (
              <TableRow key={address}>
                <TableCell>{address}</TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }, [updateTrigger]);

  /**
   * Render instruction help table
   */
  const renderInstructionHelp = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Supported Instructions:</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Instruction</TableCell>
              <TableCell>Format</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Latency</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>LD</TableCell>
              <TableCell>LD Rd, offset</TableCell>
              <TableCell>Load from memory</TableCell>
              <TableCell>2 cycles</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>ADD</TableCell>
              <TableCell>ADD Rd, Rs, Rt</TableCell>
              <TableCell>Add two registers</TableCell>
              <TableCell>2 cycles</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>SUB</TableCell>
              <TableCell>SUB Rd, Rs, Rt</TableCell>
              <TableCell>Subtract two registers</TableCell>
              <TableCell>2 cycles</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>MUL</TableCell>
              <TableCell>MUL Rd, Rs, Rt</TableCell>
              <TableCell>Multiply two registers</TableCell>
              <TableCell>10 cycles</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>DIV</TableCell>
              <TableCell>DIV Rd, Rs, Rt</TableCell>
              <TableCell>Divide two registers</TableCell>
              <TableCell>40 cycles</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Input Instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder={DEFAULT_INSTRUCTIONS}
            error={!!error}
            helperText={error}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleStep}>
              Step
            </Button>
            <Button variant="outlined" onClick={handleReset}>
              Reset
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Current Cycle: {simulatorRef.current.currentCycle}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary>
              <Typography variant="h6">Configuration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderConfigPanel()}
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary>
              <Typography variant="h6">Reservation Stations</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderReservationStations()}
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary>
              <Typography variant="h6">Register Status</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderRegisters()}
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary>
              <Typography variant="h6">Memory Contents</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderMemory()}
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary>
              <Typography variant="h6">Instruction Help</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderInstructionHelp()}
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TomasuloSimulator; 