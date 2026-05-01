import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
	const navigate = useNavigate();
	const { token, login } = useContext(AuthContext);
	const [form, setForm] = useState({ email: "", password: "" });
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (token) navigate("/dashboard", { replace: true });
	}, [navigate, token]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");
		setLoading(true);

		try {
			const { data } = await API.post("/auth/login", form);
			login(data.token, data.user);
			navigate("/dashboard", { replace: true });
		} catch (err) {
			setError(err.response?.data?.msg || "Unable to log in");
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="auth-layout">
			<div className="auth-panel">
				<p className="eyebrow">Welcome back</p>
				<h1>Log in.</h1>
				<p className="muted">Manage projects and tasks.</p>

				<form className="auth-form" onSubmit={handleSubmit}>
					<label>
						Email
						<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
					</label>
					<label>
						Password
						<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
					</label>
					{error ? <p className="form-error">{error}</p> : null}
					<button className="btn primary" disabled={loading} type="submit">
						{loading ? "Signing in..." : "Login"}
					</button>
				</form>

				<p className="auth-footer">No account? <Link to="/signup">Sign up</Link></p>
			</div>
		</section>
	);
};

export default Login;
