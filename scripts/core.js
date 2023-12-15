const notebook = document.getElementById("notebook");
const definitions = {
    "true": true,
    "false": false,
    "0": false,
    "1": true,
};

const computations = {};

compile();

notebook.addEventListener('change', (event) => {
    compile();
});

function compile() {
    const expressions = notebook.value.split(/\r?\n/);
    for (let i = 0; i < expressions.length; i++) {
        parse(expressions[i]);
    }
    console.log(definitions);
    console.log(computations);
    display();
}

function display() {
    let resultsHtml = "", computationsHtml = "";
    let names = Object.keys(definitions);
    for (let i = 0; i < names.length; i++) {
        if (isDefaultDeclaration(names[i])) {
            continue;
        }

        let value = definitions[names[i]];
        resultsHtml += `<div class="result"><span class="definition">${names[i]}</span> equals <span class="badge ${value ? "true" : "false"}">${value}</span></div>`;
    }

    let expressions = Object.keys(computations);
    for (let i = 0; i < expressions.length; i++) {
        let value = computations[expressions[i]];
        computationsHtml += `<div class="computation"><span class="definition">${expressions[i]}</span> equals <span class="badge ${value ? "true" : "false"}">${value}</span></div>`;
    }

    document.getElementById("results").innerHTML = resultsHtml;
    document.getElementById("computations").innerHTML = computationsHtml;
}

function isDefaultDeclaration(name) {
    return name === "true" || name === "false" || name === "0" || name === "1";
}

function isVariable(term) {
    return !isExpression(term);
}

function isExpression(term) {
    return term.includes(" ");
}

function isComplexExpression(term) {
    return isExpression(term) && term.includes("(") && term.includes(")");
}

function isDeclaration(term) {
    return definitions[term] !== undefined;
}

function parse(expression) {
    expression = expression.trim();
    if (!expression || expression[0] === "#") {
        // The expression is either empty or a comment - no evaluation needed for both.
        return;
    }

    if (expression.includes("=")) {
        let equationParts = expression.split("=");
        let leftSide = equationParts[0].trim();
        let rightSide = equationParts[1].trim();

        if (isVariable(leftSide)) {
            console.log(leftSide);
            definitions[leftSide] = isComplexExpression(rightSide)
                ? parseComplexExpression(rightSide)
                : evaluate(rightSide);
        }
    }
}

function parseComplexExpression(expression) {
    console.log(`Parse ${expression}`);
    const indexes = [];
    let evaluatedExpression = expression;
    for (let i = 0; i < expression.length; i++) {
        if (expression[i] === '(') {
            indexes.push(i);
        } else if (expression[i] === ')') {
            let start = indexes.pop() + 1;
            let subexpression = expression.substring(start, i);
            evaluatedExpression = evaluatedExpression.replace(`(${subexpression})`, isComplexExpression(subexpression) ? parseComplexExpression(subexpression) : evaluate(subexpression));
        }
    }

    if (isComplexExpression(evaluatedExpression)) {
        computations[expression] = parseComplexExpression(evaluatedExpression);
        return parseComplexExpression(evaluatedExpression);
    }

    if (isExpression(evaluatedExpression)) {
        computations[expression] = evaluate(evaluatedExpression);
        return evaluate(evaluatedExpression);
    }

    if (isDeclaration(evaluatedExpression)) {
        computations[expression] = definitions[evaluatedExpression];
        return definitions[evaluatedExpression];
    }

    return evaluatedExpression;
}

function evaluate(expression) {
    if (isDeclaration(expression)) {
        return definitions[expression];
    }

    if (expression[0] === "(" && expression[expression.length - 1] === ")") {
        // Simple expression wrapped in unneeded parentesses, just remove them.
        expression = expression.substring(1, expression.length - 1);
    }

    console.log(`Evaluate ${expression}`);

    let elements = expression.split(' ');

    let elementsWithoutNegation = [];
    for (let i = 0; i < elements.length; i++) {
        if(elements[i] == "not") {
            i = i + 1;
            elementsWithoutNegation.push(!definitions[elements[i]]);
        } else {
            elementsWithoutNegation.push(elements[i]);
        }
    }
    
    let lastEvaluated = definitions[elementsWithoutNegation[0]];
    for (let i = 1; i < elementsWithoutNegation.length; i += 2) {
        console.log(`${elementsWithoutNegation[i + 1]} is ${definitions[elementsWithoutNegation[i + 1]]}`);
        switch (elementsWithoutNegation[i]) {
            case "and":
                lastEvaluated = lastEvaluated && definitions[elementsWithoutNegation[i + 1]];
                break;
            case "or":
                lastEvaluated = lastEvaluated || definitions[elementsWithoutNegation[i + 1]];
                break;
        }
    }

    computations[expression] = lastEvaluated;

    return lastEvaluated;
}
