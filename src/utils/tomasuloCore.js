import { InstructionType } from './instructionParser';

/**
 * Reservation Station class
 * Represents a functional unit reservation station in the Tomasulo algorithm
 */
export class ReservationStation {
  constructor(name, type) {
    this.name = name;          // Name of the reservation station
    this.type = type;          // Type of functional unit (ADD, MULT, LOAD)
    this.busy = false;         // Whether the station is currently in use
    this.op = null;            // Operation to be performed
    this.vj = null;            // First operand value
    this.vk = null;            // Second operand value
    this.qj = null;            // First operand source reservation station
    this.qk = null;            // Second operand source reservation station
    this.dest = null;          // Destination register
    this.instruction = null;   // The instruction being executed
    this.remainingCycles = null; // Remaining execution cycles
    this.immediate = null;     // Immediate value for load instructions
    this.executing = false;    // Whether the instruction is currently executing
  }

  /**
   * Clear the reservation station state
   */
  clear() {
    this.busy = false;
    this.op = null;
    this.vj = null;
    this.vk = null;
    this.qj = null;
    this.qk = null;
    this.dest = null;
    this.instruction = null;
    this.remainingCycles = null;
    this.immediate = null;
    this.executing = false;
  }
}

/**
 * Register Status class
 * Tracks the status of each register in the Tomasulo algorithm
 */
export class RegisterStatus {
  constructor() {
    this.value = 0;    // Current value in the register
    this.qi = null;    // Reservation station producing the value
  }
}

/**
 * Tomasulo Algorithm Core class
 * Implements the core logic of the Tomasulo algorithm for dynamic scheduling
 */
export class TomasuloCore {
  constructor(config = {}) {
    // Extract configuration with default values
    const { addUnits = 3, multUnits = 2, loadUnits = 2 } = config;
    
    // Initialize registers
    this.registers = Array(32).fill().map(() => new RegisterStatus());
    
    // Initialize reservation stations for each functional unit type
    this.reservationStations = {
      add: Array(addUnits).fill().map((_, i) => new ReservationStation(`ADD${i + 1}`, 'ADD')),
      mult: Array(multUnits).fill().map((_, i) => new ReservationStation(`MULT${i + 1}`, 'MULT')),
      load: Array(loadUnits).fill().map((_, i) => new ReservationStation(`LOAD${i + 1}`, 'LOAD'))
    };
    
    this.instructions = [];           // List of all instructions
    this.currentCycle = 0;           // Current clock cycle
    this.instructionQueue = [];       // Queue of instructions waiting to be issued
    this.memory = new Map();         // Memory contents
    this.executedInstructions = new Set(); // Set of completed instructions
  }

  /**
   * Initialize memory with given values
   * @param {Array} addresses - Array of {address, value} pairs
   */
  initializeMemory(addresses) {
    addresses.forEach(({ address, value }) => {
      this.memory.set(address, value);
    });
  }

  /**
   * Get an available reservation station of the specified type
   * @param {string} type - Type of functional unit (ADD, MULT, LOAD)
   * @returns {ReservationStation|null} Available station or null if none available
   */
  getAvailableStation(type) {
    const stations = this.reservationStations[type.toLowerCase()];
    return stations.find(station => !station.busy);
  }

  /**
   * Issue an instruction to a reservation station
   * @param {Object} instruction - The instruction to issue
   * @returns {boolean} Whether the instruction was successfully issued
   */
  issue(instruction) {
    // Check if instruction has already been executed
    if (this.executedInstructions.has(instruction)) {
      return false;
    }

    // Get appropriate reservation station based on instruction type
    const station = this.getAvailableStation(
      instruction.type === InstructionType.ADD || instruction.type === InstructionType.SUB
        ? 'ADD'
        : instruction.type === InstructionType.MUL || instruction.type === InstructionType.DIV
        ? 'MULT'
        : 'LOAD'
    );

    if (!station) return false;

    // Initialize reservation station
    station.busy = true;
    station.op = instruction.type;
    station.instruction = instruction;
    station.dest = instruction.dest;
    station.immediate = instruction.immediate;
    station.remainingCycles = null;

    // Check and set first operand
    if (instruction.src1) {
      const reg1 = this.registers[parseInt(instruction.src1.replace('R', ''))];
      if (reg1.qi) {
        station.qj = reg1.qi;
      } else {
        station.vj = reg1.value;
      }
    }

    // Check and set second operand
    if (instruction.src2) {
      const reg2 = this.registers[parseInt(instruction.src2.replace('R', ''))];
      if (reg2.qi) {
        station.qk = reg2.qi;
      } else {
        station.vk = reg2.value;
      }
    }

    // Update destination register status
    const destReg = this.registers[parseInt(instruction.dest.replace('R', ''))];
    destReg.qi = station.name;

    return true;
  }

  /**
   * Execute instructions in reservation stations
   */
  execute() {
    Object.values(this.reservationStations).flat().forEach(station => {
      if (station.busy && !station.qj && !station.qk) {
        if (!station.executing) {
          // Set execution cycles based on operation type
          switch (station.op) {
            case InstructionType.ADD:
            case InstructionType.SUB:
              station.remainingCycles = 2;
              break;
            case InstructionType.MUL:
              station.remainingCycles = 10;
              break;
            case InstructionType.DIV:
              station.remainingCycles = 40;
              break;
            case InstructionType.LD:
              station.remainingCycles = 2;
              break;
          }
          station.executing = true;
        } else if (station.remainingCycles > 0) {
          // Decrease remaining cycles only if execution has started
          station.remainingCycles--;
        }
      }
    });
  }

  /**
   * Write back results from completed instructions
   */
  writeback() {
    Object.values(this.reservationStations).flat().forEach(station => {
      if (station.busy && station.executing && station.remainingCycles === 0) {
        // Calculate result based on operation type
        let result;
        switch (station.op) {
          case InstructionType.ADD:
            result = station.vj + station.vk;
            break;
          case InstructionType.SUB:
            result = station.vj - station.vk;
            break;
          case InstructionType.MUL:
            result = station.vj * station.vk;
            break;
          case InstructionType.DIV:
            result = station.vj / station.vk;
            break;
          case InstructionType.LD:
            result = this.memory.get(parseInt(station.immediate)) || 0;
            break;
        }

        // Update destination register
        const destReg = this.registers[parseInt(station.dest.replace('R', ''))];
        destReg.value = result;
        destReg.qi = null;

        // Update other reservation stations waiting for this result
        Object.values(this.reservationStations).flat().forEach(otherStation => {
          if (otherStation.busy) {
            let shouldStartExecution = false;
            if (otherStation.qj === station.name) {
              otherStation.vj = result;
              otherStation.qj = null;
              shouldStartExecution = true;
            }
            if (otherStation.qk === station.name) {
              otherStation.vk = result;
              otherStation.qk = null;
              shouldStartExecution = true;
            }
            
            // Start execution if all operands are ready
            if (shouldStartExecution && !otherStation.qj && !otherStation.qk && !otherStation.executing) {
              otherStation.executing = true;
              switch (otherStation.op) {
                case InstructionType.ADD:
                case InstructionType.SUB:
                  otherStation.remainingCycles = 2;
                  break;
                case InstructionType.MUL:
                  otherStation.remainingCycles = 10;
                  break;
                case InstructionType.DIV:
                  otherStation.remainingCycles = 40;
                  break;
                case InstructionType.LD:
                  otherStation.remainingCycles = 2;
                  break;
              }
            }
          }
        });

        // Mark instruction as executed
        if (station.instruction) {
          this.executedInstructions.add(station.instruction);
        }

        station.clear();
      }
    });
  }

  /**
   * Execute one cycle of the Tomasulo algorithm
   */
  step() {
    this.currentCycle++;
    
    // Try to issue new instruction
    if (this.instructionQueue.length > 0) {
      const nextInstruction = this.instructionQueue[0];
      if (this.issue(nextInstruction)) {
        this.instructionQueue.shift();
      }
    }

    this.execute();
    this.writeback();
  }

  /**
   * Reset the simulator to initial state
   */
  reset() {
    this.registers = Array(32).fill().map(() => new RegisterStatus());
    Object.values(this.reservationStations).flat().forEach(station => station.clear());
    this.currentCycle = 0;
    this.instructionQueue = [];
    this.executedInstructions.clear();
  }

  /**
   * Load instructions into the instruction queue
   * @param {Array} instructions - Array of instructions to load
   */
  loadInstructions(instructions) {
    this.instructionQueue = [...instructions];
  }

  /**
   * Get current memory contents
   * @returns {Array} Array of {address, value} pairs
   */
  getMemoryContents() {
    return Array.from(this.memory.entries()).map(([address, value]) => ({
      address,
      value
    }));
  }
} 