import { AuthProvider } from './shared/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div>
        <h1>Todo App</h1>
        <p>Auth system ready - login/register components coming next</p>
      </div>
    </AuthProvider>
  );
}

export default App;
