import { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
	const { token, user, logout } = useContext(AuthContext);

	return (
		<header className="topbar">
			<div>
				<Link className="brand" to="/">
					Team Task Manager
				</Link>
				<p className="brand-subtitle">Simple team task app.</p>
			</div>

			<nav className="nav-links">
				{token ? (
					<>
						<NavLink to="/dashboard">Dashboard</NavLink>
						<NavLink to="/projects">Projects</NavLink>
						<NavLink to="/tasks">Tasks</NavLink>
						<span className="nav-user">{user?.name || "Member"} · {user?.role || "member"}</span>
						<button className="btn ghost small" onClick={logout} type="button">Logout</button>
					</>
				) : (
					<>
						<NavLink to="/login">Login</NavLink>
						<NavLink to="/signup">Signup</NavLink>
					</>
				)}
			</nav>
		</header>
	);
};

export default Navbar;
