#!/bin/bash

echo "🤖 Installing AI Mentor Dependencies..."
echo ""

# Install backend dependencies
echo "📦 Installing backend packages..."
cd backend
npm install axios form-data
npm install --save-dev @types/form-data

echo ""
echo "✅ Backend dependencies installed!"
echo ""

# Install frontend dependency if needed
cd ../frontend
if ! grep -q "scroll-area" package.json; then
  echo "📦 Installing shadcn scroll-area component..."
  npx shadcn-ui@latest add scroll-area --yes
else
  echo "✅ scroll-area already installed"
fi

cd ..

echo ""
echo "🎉 All dependencies installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Make sure OPENAI_API_KEY is set in backend/.env"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Open http://localhost:5173/ai-mentor"
echo ""
