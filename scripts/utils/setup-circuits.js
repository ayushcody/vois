const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up ZK circuits for EkMat...');

// Create circuits build directory
const buildDir = path.join(__dirname, '../../circuits/build');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

try {
    console.log('📦 Skipping circuit compilation for development...');

    // Create mock files for development
    console.log('🔑 Creating mock circuit files...');
    
    // Create mock WASM directory
    const wasmDir = path.join(buildDir, 'voterEligibility_js');
    if (!fs.existsSync(wasmDir)) {
        fs.mkdirSync(wasmDir, { recursive: true });
    }
    
    // Create mock WASM file
    fs.writeFileSync(
        path.join(wasmDir, 'voterEligibility.wasm'),
        'mock-wasm-for-development'
    );
    
    // Create mock witness calculator
    fs.writeFileSync(
        path.join(wasmDir, 'witness_calculator.js'),
        'module.exports = { calculateWitness: () => [] };'
    );
    const mockVKey = {
        "protocol": "groth16",
        "curve": "bn128",
        "nPublic": 3,
        "vk_alpha_1": ["0", "0", "1"],
        "vk_beta_2": [["0", "0"], ["0", "0"], ["1", "0"]],
        "vk_gamma_2": [["0", "0"], ["0", "0"], ["1", "0"]],
        "vk_delta_2": [["0", "0"], ["0", "0"], ["1", "0"]],
        "vk_alphabeta_12": [],
        "IC": [["0", "0", "1"], ["0", "0", "1"], ["0", "0", "1"], ["0", "0", "1"]]
    };

    fs.writeFileSync(
        path.join(buildDir, 'verification_key.json'),
        JSON.stringify(mockVKey, null, 2)
    );

    // Create mock zkey file
    fs.writeFileSync(
        path.join(buildDir, 'voterEligibility_final.zkey'),
        'mock-zkey-for-development'
    );

    console.log('✅ ZK circuit setup complete (development mode)!');
    console.log('⚠️  Using mock files - real circuit compilation skipped for development');
    console.log('📝 To use real ZK proofs, install circom and run proper ceremony');

} catch (error) {
    console.error('❌ Circuit setup failed:', error.message);
    process.exit(1);
}