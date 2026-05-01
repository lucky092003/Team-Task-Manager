import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Signup = () => {
	const navigate = useNavigate();
	const { token, login } = useContext(AuthContext);
	const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
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
			const { data } = await API.post("/auth/signup", form);
			login(data.token, data.user);
			navigate("/dashboard", { replace: true });
		} catch (err) {
			setError(err.response?.data?.msg || "Unable to sign up");
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="auth-layout">
			<div className="auth-panel">
				<p className="eyebrow">Start here</p>
				<h1>Create account.</h1>
				<p className="muted">Start managing tasks.</p>

				<form className="auth-form" onSubmit={handleSubmit}>
					<label>
						Name
						<input type="text" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
					</label>
					<label>
						Email
						<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
					</label>
					<label>
						Password
						<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
					</label>
					<label>
						Role
						<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
							<option value="member">Member</option>
							<option value="admin">Admin</option>
						</select>
					</label>
					{error ? <p className="form-error">{error}</p> : null}
					<button className="btn primary" disabled={loading} type="submit">
						{loading ? "Creating account..." : "Create account"}
					</button>
				</form>

				<p className="auth-footer">
					Have an account? <Link to="/login">Log in</Link>
				</p>
			</div>
		</section>
	);
};

export default Signup;
