import { useContext, useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Projects = () => {
	const { user } = useContext(AuthContext);
	const [projects, setProjects] = useState([]);
	const [teamMembers, setTeamMembers] = useState([]);
	const [form, setForm] = useState({ title: "", description: "", members: [] });
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");

	const loadProjects = async () => {
		const { data } = await API.get("/projects");
		setProjects(data);
	};

	useEffect(() => {
		const loadPage = async () => {
			try {
				await loadProjects();
				if (user?.role === "admin") {
					const usersRes = await API.get("/auth/users");
					setTeamMembers(usersRes.data);
				}
			} catch {
				setError("Unable to load projects");
			}
		};

		loadPage();
	}, [user]);

	const memberOptions = useMemo(() => teamMembers.filter((member) => member.id !== user?.id), [teamMembers, user]);

	const toggleMember = (memberId) => {
		setForm((current) => ({
			...current,
			members: current.members.includes(memberId)
				? current.members.filter((id) => id !== memberId)
				: [...current.members, memberId]
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");
		setMessage("");

		try {
			await API.post("/projects", form);
			setForm({ title: "", description: "", members: [] });
				setMessage("Project created");
			await loadProjects();
		} catch (err) {
			setError(err.response?.data?.msg || "Unable to create project");
		}
	};

	return (
		<section className="page-grid">
			<div className="hero-card compact">
				<p className="eyebrow">Projects</p>
				<h1>Projects</h1>
				<p className="muted">Admins create projects. Members view projects.</p>
			</div>

			{user?.role === "admin" ? (
				<section className="panel-card">
					<div className="panel-header">
						<h2>New project</h2>
					</div>
					<form className="stack-form" onSubmit={handleSubmit}>
						<label>
							Title
							<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
						</label>
						<label>
							Description
							<textarea rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
						</label>
						<div>
							<span className="field-label">Members</span>
							<div className="chip-grid">
								{memberOptions.map((member) => (
									<button
										key={member.id}
										className={form.members.includes(member.id) ? "chip active" : "chip"}
										type="button"
										onClick={() => toggleMember(member.id)}
									>
										{member.name}
									</button>
								))}
							</div>
						</div>
						{error ? <p className="form-error">{error}</p> : null}
						{message ? <p className="form-success">{message}</p> : null}
						<button className="btn primary" type="submit">Create project</button>
					</form>
				</section>
			) : null}

			<section className="panel-card">
				<div className="panel-header">
					<h2>Projects</h2>
				</div>
				<div className="stack-list">
					{projects.map((project) => (
						<article className="list-item" key={project._id}>
							<div>
								<h3>{project.title}</h3>
								<p>{project.description || "No description."}</p>
								<small>{project.members?.length || 0} members</small>
							</div>
							<span className="pill">{project.status}</span>
						</article>
					))}
				</div>
			</section>
		</section>
	);
};

export default Projects;
