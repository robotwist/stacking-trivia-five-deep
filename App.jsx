import vanGogh from './stacks/van-gogh.json';
import GameStack from './components/GameStack';

function App() {
  return (
    <div>
      <h1 className="text-center text-2xl font-bold mt-4">Go the Deepest</h1>
      <GameStack stack={vanGogh} />
    </div>
  );
}

export default App;
