# Tomasulo Algorithm Simulator

A web-based simulator for the Tomasulo algorithm, implemented using React and Material-UI.

## Features

- Visual simulation of the Tomasulo algorithm
- Support for basic MIPS instructions (LD, ADD, SUB, MUL, DIV)
- Real-time display of reservation stations and register status
- Memory content visualization
- Step-by-step execution mode
- Support for custom instruction sequences

## Supported Instructions

- `LD Rd, offset`: Load data from memory
- `ADD Rd, Rs, Rt`: Add two registers
- `SUB Rd, Rs, Rt`: Subtract two registers
- `MUL Rd, Rs, Rt`: Multiply two registers
- `DIV Rd, Rs, Rt`: Divide two registers

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Sora-o-tobu/tomasulo-simulator.git
cd tomasulo-simulator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment

1. Build the Docker image:
```bash
docker build -t tomasulo-simulator .
```

2. Run the container:
```bash
docker run -d -p 80:80 tomasulo-simulator
```

## Usage

1. Enter your MIPS instructions in the input area, one instruction per line
2. Click "Load Instructions" to load the instructions into the simulator
3. Use "Single Step" to execute instructions one by one
4. Use "Reset" to clear the simulator state
5. Monitor the execution process through the reservation stations and register status tables

## Example

```
LD R1, 0
ADD R2, R1, R1
MUL R3, R2, R2
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- React.js
- Material-UI
- GitHub Pages
