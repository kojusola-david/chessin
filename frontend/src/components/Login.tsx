import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import { useAuth } from "../utils/AuthContext";

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const {setUser} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const result = await response.json();

            if (response.ok) {
                console.log("Login Success:", result);
                setUser(result.user)
                navigate('/'); 
            } else {
                setError(result.message || "Login failed");
            }
        } catch (err) {
            setError("Cannot connect to server. Is it running?");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Chessin Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)} 
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Checking board..." : "Login"}
                </button>
            </form>
            
            <p>Don't have an account? <Link to='/register'>Sign up</Link></p>
        </div>
    );
}