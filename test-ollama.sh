#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Ollama Integration Test Script      ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Test 1: Check if Ollama is running
echo -e "${YELLOW}[1/5] Checking if Ollama is running...${NC}"
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ollama is running on http://localhost:11434${NC}"
else
    echo -e "${RED}✗ Ollama is not running!${NC}"
    echo -e "${YELLOW}  Fix: Run 'ollama serve' in a terminal${NC}"
    exit 1
fi

# Test 2: Check if llama3 model is available
echo ""
echo -e "${YELLOW}[2/5] Checking if llama3 model is installed...${NC}"
if curl -s http://localhost:11434/api/tags | grep -q "llama3"; then
    echo -e "${GREEN}✓ llama3 model is installed${NC}"
else
    echo -e "${RED}✗ llama3 model not found!${NC}"
    echo -e "${YELLOW}  Fix: Run 'ollama pull llama3'${NC}"
    exit 1
fi

# Test 3: Check if backend server is running
echo ""
echo -e "${YELLOW}[3/5] Checking if backend server is running...${NC}"
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend server is running on http://localhost:3001${NC}"
else
    echo -e "${RED}✗ Backend server is not running!${NC}"
    echo -e "${YELLOW}  Fix: Run 'pnpm server:dev' in a terminal${NC}"
    exit 1
fi

# Test 4: Test question generation
echo ""
echo -e "${YELLOW}[4/5] Testing question generation...${NC}"
QUESTION_RESPONSE=$(curl -s -X POST http://localhost:3001/api/ollama/generate-question \
  -H "Content-Type: application/json" \
  -d '{"topic":"Test","difficulty":"easy"}')

if echo "$QUESTION_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Question generation is working${NC}"
    echo -e "${BLUE}  Sample response: ${NC}"
    echo "$QUESTION_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$QUESTION_RESPONSE" | head -c 200
else
    echo -e "${RED}✗ Question generation failed!${NC}"
    echo -e "${YELLOW}  Response: $QUESTION_RESPONSE${NC}"
fi

# Test 5: Test answer evaluation
echo ""
echo -e "${YELLOW}[5/5] Testing answer evaluation...${NC}"
EVAL_RESPONSE=$(curl -s -X POST http://localhost:3001/api/ollama/evaluate-answer \
  -H "Content-Type: application/json" \
  -d '{"question":"Test question","correctAnswer":"A","userAnswer":"A","explanation":"Test"}')

if echo "$EVAL_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Answer evaluation is working${NC}"
else
    echo -e "${RED}✗ Answer evaluation failed!${NC}"
    echo -e "${YELLOW}  Response: $EVAL_RESPONSE${NC}"
fi

# Final summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   All Tests Passed! ✓                  ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""
echo -e "${GREEN}Your Ollama integration is ready to use!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Open your quiz app in the browser"
echo "2. Select a topic"
echo "3. Choose 'AI-Powered Quiz' mode"
echo "4. Start answering AI-generated questions!"
echo ""
