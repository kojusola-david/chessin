import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

export default function SignUp() {
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { setUser } = useAuth()
    const navigate = useNavigate();

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const result = await response.json();

            if (response.ok) {
                console.log("Registration Success:", result);
                setUser(result.user)
                navigate('/'); 
            } else {
                setError(result.message || "Registration failed");
            }
        } catch (err) {
            setError("Cannot connect to server.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <h2>Create Chess Account</h2>
            {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    name="email"
                    placeholder="Email (e.g. you@gmail.com)" 
                    onChange={handleChange}
                    required 
                />
                <input 
                    type="text" 
                    name="name"
                    placeholder="Full Name (optional)" 
                    onChange={handleChange}
                />
                <input 
                    type="text" 
                    name="username"
                    placeholder="Username" 
                    onChange={handleChange}
                    required 
                />
                <input 
                    type="password" 
                    name="password"
                    placeholder="Password" 
                    onChange={handleChange}
                    required
                />
                
                <button type="submit" disabled={loading}>
                    {loading ? "Joining the club..." : "Sign Up"}
                </button>
            </form>
            
            <p>Already a user? <Link to='/login'>Login</Link></p>
        </div>
    );
}