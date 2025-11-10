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

// Revenue Input
const totalMonthlySales = document.getElementById('totalMonthlySales');

// Result Display Elements
const totalStaticExpenses = document.getElementById('totalStaticExpenses');
const totalVariableExpenses = document.getElementById('totalVariableExpenses');
const totalAgents = document.getElementById('totalAgents');
const agentAverageSales = document.getElementById('agentAverageSales');
const commission = document.getElementById('commission');
const totalExpenses = document.getElementById('totalExpenses');
const netRevenue = document.getElementById('netRevenue');
const breakEvenSales = document.getElementById('breakEvenSales');
const profit = document.getElementById('profit');
const profitItem = document.getElementById('profitItem');

// Constants
const COMMISSION_THRESHOLD = 4000;
const COMMISSION_RATE = 0.15;
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
 * Main calculation function
 */
function performCalculations() {
    // Get input values
    const staticExpenses = calculateTotalStaticExpenses();
    const variableExpenses = calculateTotalVariableExpenses();
    const agents = calculateTotalAgents();
    const sales = getNumericValue(totalMonthlySales);
    
    // Calculate commission
    const commissionAmount = calculateCommission(sales, agents);
    
    // Calculate total expenses
    const expenses = staticExpenses + variableExpenses + commissionAmount;
    
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
    
    if (agents > 0) {
        agentAverageSales.textContent = formatCurrency(sales / agents);
    } else {
        agentAverageSales.textContent = formatCurrency(0);
    }
    
    commission.textContent = formatCurrency(commissionAmount);
    totalExpenses.textContent = formatCurrency(expenses);
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
    localLineCount.value = 0;
    dialerLinesCost.value = 100;
    dialerLinesCount.value = 0;
    overseasSalary.value = 720;
    overseasCount.value = 0;
    tijSalary.value = 1300;
    tijCount.value = 0;
    rsaSalary.value = 1100;
    rsaCount.value = 0;
    
    // Reset revenue
    totalMonthlySales.value = 0;
    
    // Reset results
    performCalculations();
}

/**
 * Validate inputs and handle errors
 */
function validateInputs() {
    const agents = calculateTotalAgents();
    const sales = getNumericValue(totalMonthlySales);
    
    if (sales < 0) {
        alert('Total Monthly Sales cannot be negative');
        return false;
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

// Initialize with default calculations
window.addEventListener('DOMContentLoaded', () => {
    performCalculations();
});

