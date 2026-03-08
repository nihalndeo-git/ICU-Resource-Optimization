#!/bin/bash

echo "Compiling Hospital Resource Optimization (Phase 1)..."
# Create a bin directory for the compiled class files
mkdir -p bin

# Compile all java files inside the optimization package
javac -d bin src/main/java/com/hospital/optimization/*.java

if [ $? -eq 0 ]; then
    echo "Compilation successful!"
    echo "--------------------------------------------------"
    echo "Running Simulation..."
    echo ""
    # Run the main class
    java -cp bin com.hospital.optimization.ExperimentRunner
else
    echo "Compilation failed!"
fi
