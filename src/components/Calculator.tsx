import React, { useState, useEffect } from 'react';
import { Calculator as CalculatorIcon, RotateCcw, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';

type Operation = '+' | '-' | '×' | '÷' | null;

interface CalculationHistory {
  expression: string;
  result: string;
  timestamp: Date;
}

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [newNumber, setNewNumber] = useState(true);
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    // Handle keyboard input
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key;
      if (/[0-9.]/.test(key)) {
        handleNumber(key);
      } else if (['+', '-', '*', '/', 'x', '×', '÷'].includes(key)) {
        handleOperation(key === '*' || key === 'x' ? '×' : key === '/' ? '÷' : key as Operation);
      } else if (key === 'Enter' || key === '=') {
        handleEquals();
      } else if (key === 'Escape') {
        handleClear();
      } else if (key === 'Backspace') {
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [display, firstOperand, operation]);

  const saveHistory = (expression: string, result: string) => {
    const newHistory = [
      { expression, result, timestamp: new Date() },
      ...history.slice(0, 9) // Keep last 10 calculations
    ];
    setHistory(newHistory);
    localStorage.setItem('calculatorHistory', JSON.stringify(newHistory));
  };

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num === '.' ? '0.' : num);
      setNewNumber(false);
    } else {
      if (num === '.' && display.includes('.')) return;
      setDisplay(display + num);
    }
  };

  const handleOperation = (op: Operation) => {
    if (operation && firstOperand && !newNumber) {
      handleEquals();
      setFirstOperand(display);
      setOperation(op);
    } else {
      setFirstOperand(display);
      setOperation(op);
      setNewNumber(true);
    }
  };

  const handleEquals = () => {
    if (!operation || !firstOperand || newNumber) return;

    const num1 = parseFloat(firstOperand);
    const num2 = parseFloat(display);
    let result: number;

    switch (operation) {
      case '+':
        result = num1 + num2;
        break;
      case '-':
        result = num1 - num2;
        break;
      case '×':
        result = num1 * num2;
        break;
      case '÷':
        if (num2 === 0) {
          setDisplay('Error');
          setFirstOperand(null);
          setOperation(null);
          setNewNumber(true);
          return;
        }
        result = num1 / num2;
        break;
      default:
        return;
    }

    const formattedResult = result.toString();
    const expression = `${num1} ${operation} ${num2}`;
    
    setDisplay(formattedResult);
    setFirstOperand(null);
    setOperation(null);
    setNewNumber(true);
    
    saveHistory(expression, formattedResult);
  };

  const handleClear = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleAllClear = () => {
    handleClear();
    setMemory(0);
    setHistory([]);
    localStorage.removeItem('calculatorHistory');
  };

  const handleBackspace = () => {
    if (newNumber) return;
    setDisplay(display.length === 1 ? '0' : display.slice(0, -1));
  };

  const handleMemoryOperation = (op: 'M+' | 'M-' | 'MR' | 'MC') => {
    const currentValue = parseFloat(display);
    switch (op) {
      case 'M+':
        setMemory(memory + currentValue);
        setNewNumber(true);
        break;
      case 'M-':
        setMemory(memory - currentValue);
        setNewNumber(true);
        break;
      case 'MR':
        setDisplay(memory.toString());
        setNewNumber(true);
        break;
      case 'MC':
        setMemory(0);
        break;
    }
  };

  const buttonClasses = "h-12 text-lg font-medium transition-colors";
  const numberButtonClasses = `${buttonClasses} bg-white hover:bg-gray-100 text-gray-900`;
  const operationButtonClasses = `${buttonClasses} bg-gray-100 hover:bg-gray-200 text-blue-600`;
  const memoryButtonClasses = `${buttonClasses} bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Calculator</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="relative"
            >
              <History className="h-4 w-4" />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {history.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAllClear}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Display */}
          <div className="bg-gray-50 p-4 rounded-lg text-right">
            <div className="text-gray-500 text-sm h-6">
              {firstOperand && `${firstOperand} ${operation || ''}`}
            </div>
            <div className="text-3xl font-mono truncate">{display}</div>
          </div>

          {showHistory ? (
            <div className="space-y-2">
              {history.length > 0 ? (
                history.map((calc, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => {
                      setDisplay(calc.result);
                      setNewNumber(true);
                      setShowHistory(false);
                    }}
                  >
                    <div className="text-sm text-gray-500">{calc.expression}</div>
                    <div className="text-lg font-medium">{calc.result}</div>
                    <div className="text-xs text-gray-400">
                      {calc.timestamp.toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No calculation history
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {/* Memory Operations */}
              <Button
                className={memoryButtonClasses}
                onClick={() => handleMemoryOperation('MC')}
              >
                MC
              </Button>
              <Button
                className={memoryButtonClasses}
                onClick={() => handleMemoryOperation('MR')}
              >
                MR
              </Button>
              <Button
                className={memoryButtonClasses}
                onClick={() => handleMemoryOperation('M-')}
              >
                M-
              </Button>
              <Button
                className={memoryButtonClasses}
                onClick={() => handleMemoryOperation('M+')}
              >
                M+
              </Button>

              {/* Clear and Backspace */}
              <Button
                className={operationButtonClasses}
                onClick={handleClear}
              >
                C
              </Button>
              <Button
                className={operationButtonClasses}
                onClick={handleAllClear}
              >
                AC
              </Button>
              <Button
                className={operationButtonClasses}
                onClick={handleBackspace}
              >
                ⌫
              </Button>
              <Button
                className={operationButtonClasses}
                onClick={() => handleOperation('÷')}
              >
                ÷
              </Button>

              {/* Numbers and Operations */}
              {[7, 8, 9].map(num => (
                <Button
                  key={num}
                  className={numberButtonClasses}
                  onClick={() => handleNumber(num.toString())}
                >
                  {num}
                </Button>
              ))}
              <Button
                className={operationButtonClasses}
                onClick={() => handleOperation('×')}
              >
                ×
              </Button>

              {[4, 5, 6].map(num => (
                <Button
                  key={num}
                  className={numberButtonClasses}
                  onClick={() => handleNumber(num.toString())}
                >
                  {num}
                </Button>
              ))}
              <Button
                className={operationButtonClasses}
                onClick={() => handleOperation('-')}
              >
                -
              </Button>

              {[1, 2, 3].map(num => (
                <Button
                  key={num}
                  className={numberButtonClasses}
                  onClick={() => handleNumber(num.toString())}
                >
                  {num}
                </Button>
              ))}
              <Button
                className={operationButtonClasses}
                onClick={() => handleOperation('+')}
              >
                +
              </Button>

              <Button
                className={numberButtonClasses}
                onClick={() => handleNumber('0')}
              >
                0
              </Button>
              <Button
                className={numberButtonClasses}
                onClick={() => handleNumber('.')}
              >
                .
              </Button>
              <Button
                className={`${buttonClasses} col-span-2 bg-blue-600 hover:bg-blue-700 text-white`}
                onClick={handleEquals}
              >
                =
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Calculator;