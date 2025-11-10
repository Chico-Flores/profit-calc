// DOM Element References
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');

// Static Expense Inputs
const clickToDial = document.getElementById('clickToDial');
const aceDialer = document.getElementById('aceDialer');
const cadCallReport = document.getElementById('cadCallReport');
const incallRecordings = document.getElementById('incallRecordings');
const broadcastCalls = document.getElementById('broadcastCalls');
const simplicityCrm = document.getElementById('simplicityCrm');
const idiBatching = document.getElementById('idiBatching');
const adminPayroll = document.getElementById('adminPayroll');
const rsaManagement = document.getElementById('rsaManagement');

// Variable Expense Inputs
const localLineCost = document.getElementById('localLineCost');
const localLineCount = document.getElementById('localLineCount');
const dialerLinesCost = document.getElementById('dialerLinesCost');
const dialerLinesCount = document.getElementById('dialerLinesCount');
const overseasSalary = document.getElementById('overseasSalary');
const overseasCount = document.getElementById('overseasCount');
const tijSalary = document.getElementById('tijSalary');
const tijCount = document.getElementById('tijCount');
const rsaSalary = document.getElementById('rsaSalary');
const rsaCount = document.getElementById('rsaCount');

// Revenue Inputs
const totalMonthlySales = document.getElementById('totalMonthlySales');
const agentAverageSalesInput = document.getElementById('agentAverageSalesInput');
const modeTotalSales = document.getElementById('modeTotalSales');
const modeAgentAverage = document.getElementById('modeAgentAverage');
const totalSalesInputDiv = document.getElementById('totalSalesInput');
const agentAverageInputDiv = document.getElementById('agentAverageInput');

// Result Display Elements
const totalStaticExpenses = document.getElementById('totalStaticExpenses');
const totalVariableExpenses = document.getElementById('totalVariableExpenses');
const totalAgents = document.getElementById('totalAgents');
const agentAverageSalesDisplay = document.getElementById('agentAverageSales');
const calculatedTotalSales = document.getElementById('calculatedTotalSales');
const commission = document.getElementById('commission');
const totalExpenses = document.getElementById('totalExpenses');
const totalRemitAmount = document.getElementById('totalRemitAmount');
const netRevenue = document.getElementById('netRevenue');
const breakEvenSales = document.getElementById('breakEvenSales');
const profit = document.getElementById('profit');
const profitItem = document.getElementById('profitItem');

// Constants
const COMMISSION_THRESHOLD = 4000;
const COMMISSION_RATE = 0.10;
const CLIENT_REMIT_RATE = 0.37; // 37% CLIENT Remit
const NET_REVENUE_RATE = 0.55; // 55% after deductions (100% - 37% - 5% - 3%)

/**
 * Format number as currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Get numeric value from input, defaulting to 0 if empty or invalid
 */
function getNumericValue(input) {
    const value = parseFloat(input.value) || 0;
    return Math.max(0, value); // Ensure non-negative
}

/**
 * Get integer value from input, defaulting to 0 if empty or invalid
 */
function getIntegerValue(input) {
    const value = parseInt(input.value) || 0;
    return Math.max(0, value); // Ensure non-negative
}

/**
 * Calculate total static expenses
 */
function calculateTotalStaticExpenses() {
    return getNumericValue(clickToDial) +
           getNumericValue(aceDialer) +
           getNumericValue(cadCallReport) +
           getNumericValue(incallRecordings) +
           getNumericValue(broadcastCalls) +
           getNumericValue(simplicityCrm) +
           getNumericValue(idiBatching) +
           getNumericValue(adminPayroll) +
           getNumericValue(rsaManagement);
}

/**
 * Auto-calculate LOCAL and DIALER Lines based on agent counts
 */
function autoCalculatePhoneLines() {
    const tijCount = getIntegerValue(document.getElementById('tijCount'));
    const rsaCount = getIntegerValue(document.getElementById('rsaCount'));
    const overseasCount = getIntegerValue(document.getElementById('overseasCount'));
    const adminCount = 4; // Always 4 admin members
    
    // LOCAL Lines: TIJ + RSA + Admin (4)
    const calculatedLocalLines = tijCount + rsaCount + adminCount;
    
    // DIALER Lines: TIJ + RSA + Overseas + Admin (4)
    const calculatedDialerLines = tijCount + rsaCount + overseasCount + adminCount;
    
    // Only auto-update if the fields are empty or match the previous calculated value
    // This allows manual override while still auto-calculating when agent counts change
    const currentLocalLines = getIntegerValue(localLineCount);
    const currentDialerLines = getIntegerValue(dialerLinesCount);
    
    // Store the last calculated values to detect if user has manually changed them
    if (!localLineCount.dataset.lastCalculated || 
        currentLocalLines === parseInt(localLineCount.dataset.lastCalculated)) {
        localLineCount.value = calculatedLocalLines;
        localLineCount.dataset.lastCalculated = calculatedLocalLines;
    }
    
    if (!dialerLinesCount.dataset.lastCalculated || 
        currentDialerLines === parseInt(dialerLinesCount.dataset.lastCalculated)) {
        dialerLinesCount.value = calculatedDialerLines;
        dialerLinesCount.dataset.lastCalculated = calculatedDialerLines;
    }
}

/**
 * Calculate total variable expenses
 */
function calculateTotalVariableExpenses() {
    const localLineTotal = getNumericValue(localLineCost) * getIntegerValue(localLineCount);
    const dialerLinesTotal = getNumericValue(dialerLinesCost) * getIntegerValue(dialerLinesCount);
    const overseasTotal = getNumericValue(overseasSalary) * getIntegerValue(overseasCount);
    const tijTotal = getNumericValue(tijSalary) * getIntegerValue(tijCount);
    const rsaTotal = getNumericValue(rsaSalary) * getIntegerValue(rsaCount);
    
    return localLineTotal + dialerLinesTotal + overseasTotal + tijTotal + rsaTotal;
}

/**
 * Calculate total number of agents
 */
function calculateTotalAgents() {
    return getIntegerValue(overseasCount) + 
           getIntegerValue(tijCount) + 
           getIntegerValue(rsaCount);
}

/**
 * Calculate commission based on agent average sales
 */
function calculateCommission(totalSales, totalAgents) {
    if (totalAgents === 0) {
        return 0;
    }
    
    const agentAverage = totalSales / totalAgents;
    
    if (agentAverage > COMMISSION_THRESHOLD) {
        const excessAmount = agentAverage - COMMISSION_THRESHOLD;
        return excessAmount * COMMISSION_RATE * totalAgents;
    }
    
    return 0;
}

/**
 * Get total monthly sales based on input mode
 */
function getTotalMonthlySales() {
    const agents = calculateTotalAgents();
    
    if (modeAgentAverage && modeAgentAverage.checked) {
        // Calculate from agent average
        const agentAvg = getNumericValue(agentAverageSalesInput);
        const totalSales = agentAvg * agents;
        return totalSales;
    } else {
        // Use direct input
        return getNumericValue(totalMonthlySales);
    }
}

/**
 * Main calculation function
 */
function performCalculations() {
    // Get input values
    const staticExpenses = calculateTotalStaticExpenses();
    const variableExpenses = calculateTotalVariableExpenses();
    const agents = calculateTotalAgents();
    
    // Get total monthly sales based on input mode
    const sales = getTotalMonthlySales();
    
    // Calculate commission
    const commissionAmount = calculateCommission(sales, agents);
    
    // Calculate total expenses
    const expenses = staticExpenses + variableExpenses + commissionAmount;
    
    // Calculate remit amount (37% of sales)
    const remitAmount = sales * CLIENT_REMIT_RATE;
    
    // Calculate net revenue
    const netRev = sales * NET_REVENUE_RATE;
    
    // Calculate break-even sales amount
    const breakEven = expenses / NET_REVENUE_RATE;
    
    // Calculate profit/loss
    const profitAmount = netRev - expenses;
    
    // Update display
    totalStaticExpenses.textContent = formatCurrency(staticExpenses);
    totalVariableExpenses.textContent = formatCurrency(variableExpenses);
    totalAgents.textContent = agents;
    
    // Show calculated total sales (especially important when using agent average mode)
    calculatedTotalSales.textContent = formatCurrency(sales);
    
    if (agents > 0) {
        agentAverageSalesDisplay.textContent = formatCurrency(sales / agents);
    } else {
        agentAverageSalesDisplay.textContent = formatCurrency(0);
    }
    
    commission.textContent = formatCurrency(commissionAmount);
    totalExpenses.textContent = formatCurrency(expenses);
    totalRemitAmount.textContent = formatCurrency(remitAmount);
    netRevenue.textContent = formatCurrency(netRev);
    breakEvenSales.textContent = formatCurrency(breakEven);
    profit.textContent = formatCurrency(profitAmount);
    
    // Color code profit/loss
    if (profitAmount > 0) {
        profitItem.classList.add('profit');
        profitItem.classList.remove('loss');
    } else if (profitAmount < 0) {
        profitItem.classList.add('loss');
        profitItem.classList.remove('profit');
    } else {
        profitItem.classList.remove('profit', 'loss');
    }
}

/**
 * Handle revenue mode change
 */
function handleRevenueModeChange() {
    if (modeTotalSales.checked) {
        totalSalesInputDiv.style.display = 'block';
        agentAverageInputDiv.style.display = 'none';
    } else {
        totalSalesInputDiv.style.display = 'none';
        agentAverageInputDiv.style.display = 'block';
    }
    performCalculations();
}

/**
 * Reset all inputs to default values
 */
function resetForm() {
    // Reset static expenses
    clickToDial.value = 200;
    aceDialer.value = 1200;
    cadCallReport.value = 140;
    incallRecordings.value = 70;
    broadcastCalls.value = 1600;
    simplicityCrm.value = 2000;
    idiBatching.value = 5000;
    adminPayroll.value = 12000;
    rsaManagement.value = 1500;
    
    // Reset variable expenses
    localLineCost.value = 60;
    dialerLinesCost.value = 100;
    overseasSalary.value = 720;
    overseasCount.value = 0;
    tijSalary.value = 1300;
    tijCount.value = 0;
    rsaSalary.value = 1100;
    rsaCount.value = 0;
    
    // Auto-calculate phone lines after reset
    autoCalculatePhoneLines();
    
    // Reset revenue
    modeTotalSales.checked = true;
    totalMonthlySales.value = 0;
    agentAverageSalesInput.value = 0;
    handleRevenueModeChange();
}

/**
 * Validate inputs and handle errors
 */
function validateInputs() {
    const agents = calculateTotalAgents();
    
    // Validate based on input mode
    if (modeAgentAverage.checked) {
        const agentAvg = getNumericValue(agentAverageSalesInput);
        if (agentAvg < 0) {
            alert('Agent Average Sales cannot be negative');
            return false;
        }
        if (agents === 0) {
            alert('Please enter at least one agent to calculate using Agent Average mode');
            return false;
        }
    } else {
        const sales = getNumericValue(totalMonthlySales);
        if (sales < 0) {
            alert('Total Monthly Sales cannot be negative');
            return false;
        }
    }
    
    // Check for negative agent counts
    const allCounts = [
        getIntegerValue(localLineCount),
        getIntegerValue(dialerLinesCount),
        getIntegerValue(overseasCount),
        getIntegerValue(tijCount),
        getIntegerValue(rsaCount)
    ];
    
    if (allCounts.some(count => count < 0)) {
        alert('Agent counts cannot be negative');
        return false;
    }
    
    return true;
}

// Event Listeners
calculateBtn.addEventListener('click', () => {
    if (validateInputs()) {
        performCalculations();
    }
});

resetBtn.addEventListener('click', resetForm);

// Revenue mode change listeners
modeTotalSales.addEventListener('change', handleRevenueModeChange);
modeAgentAverage.addEventListener('change', handleRevenueModeChange);

// Auto-calculate phone lines when agent counts change
[overseasCount, tijCount, rsaCount].forEach(input => {
    input.addEventListener('input', () => {
        autoCalculatePhoneLines();
        if (modeAgentAverage.checked) {
            performCalculations();
        }
    });
});

// Track manual changes to phone line counts
localLineCount.addEventListener('input', () => {
    localLineCount.dataset.lastCalculated = localLineCount.value;
});

dialerLinesCount.addEventListener('input', () => {
    dialerLinesCount.dataset.lastCalculated = dialerLinesCount.value;
});

// Recalculate when agent average input changes
agentAverageSalesInput.addEventListener('input', () => {
    if (modeAgentAverage.checked) {
        performCalculations();
    }
});

// Recalculate when total monthly sales input changes
totalMonthlySales.addEventListener('input', () => {
    if (modeTotalSales.checked) {
        performCalculations();
    }
});

// Initialize with default calculations
window.addEventListener('DOMContentLoaded', () => {
    autoCalculatePhoneLines();
    handleRevenueModeChange();
});

