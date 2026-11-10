
const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

let expression = "";

// Listen for button clicks
buttons.forEach(function(button) {
    button.addEventListener("click", function() {

        const value = button.dataset.value;
        const action = button.dataset.action;

        if (action === "clear") {
            expression = "";
            display.value = "";

        } else if (action === "delete") {
            expression = expression.slice(0, -1);
            display.value = expression;

        } else if (action === "percent") {
            // Convert the last number into a percentage
            const match = expression.match(/(\d+\.?\d*|\.\d+)$/);

            if (match) {
                const number = Number(match[0]);
                expression = expression.slice(0, -match[0].length)
                    + String(number / 100);
                display.value = expression;
            }

        } else if (action === "calculate") {
            calculateResult();

        } else if (value !== undefined) {
            addValue(value);
        }
    });
});

// Add numbers and operators
function addValue(value) {

    const operators = ["+", "-", "*", "/"];

    // Prevent multiple operators together
    if (operators.includes(value)) {
        if (expression === "") {
            if (value !== "-") return;
        } else if (operators.includes(expression.slice(-1))) {
            if (value !== "-") return;
        }
    }

    // Prevent multiple decimal points in one number
    if (value === ".") {
        const lastNumber = expression.split(/[+\-*/]/).pop();

        if (lastNumber.includes(".")) return;
    }

    expression += value;
    display.value = expression;
}

// Calculate expression safely using a small parser
function evaluateExpression(input) {

    const tokens = input.match(
        /(?:\d+\.?\d*|\.\d+)|[()+\-*/]/g
    );

    if (!tokens || tokens.join("") !== input) {
        throw new Error("Invalid expression");
    }

    let index = 0;

    function primary() {
        const token = tokens[index];

        if (token === "(") {
            index++;
            const result = addition();

            if (tokens[index] !== ")") {
                throw new Error("Missing bracket");
            }

            index++;
            return result;
        }

        if (!token || !/^(?:\d+\.?\d*|\.\d+)$/.test(token)) {
            throw new Error("Invalid number");
        }

        index++;
        return Number(token);
    }

    function unary() {
        if (tokens[index] === "-") {
            index++;
            return -unary();
        }

        if (tokens[index] === "+") {
            index++;
            return unary();
        }

        return primary();
    }

    function multiplication() {
        let result = unary();

        while (
            tokens[index] === "*" ||
            tokens[index] === "/"
        ) {
            const operator = tokens[index++];
            const next = unary();

            if (operator === "*") {
                result *= next;
            } else {
                if (next === 0) {
                    throw new Error("Cannot divide by zero");
                }
                result /= next;
            }
        }

        return result;
    }

    function addition() {
        let result = multiplication();

        while (
            tokens[index] === "+" ||
            tokens[index] === "-"
        ) {
            const operator = tokens[index++];
            const next = multiplication();

            if (operator === "+") {
                result += next;
            } else {
                result -= next;
            }
        }

        return result;
    }

    const result = addition();

    if (index !== tokens.length || !Number.isFinite(result)) {
        throw new Error("Invalid calculation");
    }

    return result;
}

// Display calculation result
function calculateResult() {
    if (!expression) return;

    try {
        const result = evaluateExpression(expression);

        display.value = Number(result.toPrecision(12));
        expression = display.value;

    } catch (error) {
        display.value = error.message === "Cannot divide by zero"
            ? "Cannot divide by zero"
            : "Error";

        expression = "";
    }
}

// Keyboard Support
document.addEventListener("keydown", function(event) {

    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        addValue(key);

    } else if (["+", "-", "*", "/"].includes(key)) {
        addValue(key);

    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculateResult();

    } else if (key === "Backspace") {
        expression = expression.slice(0, -1);
        display.value = expression;

    } else if (key === "Escape") {
        expression = "";
        display.value = "";
    }
});
