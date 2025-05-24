// 指令类型枚举
export const InstructionType = {
  ADD: 'ADD',
  SUB: 'SUB',
  MUL: 'MUL',
  DIV: 'DIV',
  LD: 'LD',
  SD: 'SD'
};

// 指令类
export class Instruction {
  constructor(type, dest, src1, src2, immediate = null) {
    this.type = type;
    this.dest = dest;
    this.src1 = src1;
    this.src2 = src2;
    this.immediate = immediate;
    this.status = 'ISSUE'; // ISSUE, EXECUTE, WRITEBACK, COMMIT
    this.issueTime = null;
    this.execTime = null;
    this.writeTime = null;
    this.commitTime = null;
  }
}

// 解析MIPS指令
export function parseInstruction(instruction) {
  const parts = instruction.trim().split(/\s*,\s*|\s+/);
  const opcode = parts[0].toUpperCase();
  
  switch (opcode) {
    case 'ADD':
      return new Instruction(InstructionType.ADD, parts[1], parts[2], parts[3]);
    case 'SUB':
      return new Instruction(InstructionType.SUB, parts[1], parts[2], parts[3]);
    case 'MUL':
      return new Instruction(InstructionType.MUL, parts[1], parts[2], parts[3]);
    case 'DIV':
      return new Instruction(InstructionType.DIV, parts[1], parts[2], parts[3]);
    case 'LD':
      return new Instruction(InstructionType.LD, parts[1], null, null, parts[2]);
    case 'SD':
      return new Instruction(InstructionType.SD, parts[1], null, null, parts[2]);
    default:
      throw new Error(`不支持的指令: ${opcode}`);
  }
}

// 解析多条指令
export function parseInstructions(instructions) {
  return instructions
    .split('\n')
    .filter(line => line.trim())
    .map(line => parseInstruction(line));
} 