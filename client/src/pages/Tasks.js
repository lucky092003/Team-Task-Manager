import { useContext, useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const statusLabels = {
	todo: "To do",
	"in-progress": "In progress",
	done: "Done",
	blocked: "Blocked"
};

const Tasks = () => {
	const { user } = useContext(AuthContext);
	const [tasks, setTasks] = useState([]);
	const [projects, setProjects] = useState([]);
	const [users, setUsers] = useState([]);
	const [form, setForm] = useState({ title: "", description: "", project: "", assignedTo: "", status: "todo", priority: "medium", dueDate: "" });
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");

	const loadTasks = async () => {
		const { data } = await API.get("/tasks");
		setTasks(data);
	};

	useEffect(() => {
		const loadPage = async () => {
			try {
				const [projectRes, taskRes] = await Promise.all([API.get("/projects"), API.get("/tasks")]);
				setProjects(projectRes.data);
				setTasks(taskRes.data);

				if (user?.role === "admin") {
					const usersRes = await API.get("/auth/users");
					setUsers(usersRes.data);
				}
			} catch {
				setError("Unable to load tasks");
			}
		};

		loadPage();
	}, [user]);

	const assignableUsers = useMemo(() => {
		const selectedProject = projects.find((project) => project._id === form.project);
		if (!selectedProject) return users;
		return users.filter((member) => selectedProject.members.some((projectMember) => projectMember._id === member.id));
	}, [form.project, projects, users]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");
		setMessage("");

		try {
			await API.post("/tasks", {
				...form,
				assignedTo: form.assignedTo || undefined,
				dueDate: form.dueDate || undefined
			});
			setForm({ title: "", description: "", project: "", assignedTo: "", status: "todo", priority: "medium", dueDate: "" });
				setMessage("Task created");
			await loadTasks();
		} catch (err) {
			setError(err.response?.data?.msg || "Unable to create task");
		}
	};

	const updateTaskStatus = async (taskId, status) => {
		setError("");

		try {
			const { data } = await API.put(`/tasks/${taskId}`, { status });
			setTasks((current) => current.map((task) => (task._id === taskId ? data : task)));
		} catch (err) {
			setError(err.response?.data?.msg || "Unable to update task");
		}
	};

	return (
		<section className="page-grid">
			<div className="hero-card compact">
				<p className="eyebrow">Tasks</p>
				<h1>Tasks</h1>
				<p className="muted">Create tasks and update status.</p>
			</div>

			{user?.role === "admin" ? (
				<section className="panel-card">
					<div className="panel-header">
						<h2>New task</h2>
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
						<div className="form-grid two">
							<label>
								Project
								<select value={form.project} onChange={(event) => setForm({ ...form, project: event.target.value, assignedTo: "" })}>
									<option value="">Select project</option>
									{projects.map((project) => (
										<option key={project._id} value={project._id}>{project.title}</option>
									))}
								</select>
							</label>
							<label>
								Assignee
								<select value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}>
									<option value="">Unassigned</option>
									{assignableUsers.map((member) => (
										<option key={member.id} value={member.id}>{member.name}</option>
									))}
								</select>
							</label>
						</div>
						<div className="form-grid three">
							<label>
								Status
								<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
									{Object.entries(statusLabels).map(([value, label]) => (
										<option key={value} value={value}>{label}</option>
									))}
								</select>
							</label>
							<label>
								Priority
								<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
									<option value="low">Low</option>
									<option value="medium">Medium</option>
									<option value="high">High</option>
								</select>
							</label>
							<label>
								Due date
								<input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
							</label>
						</div>
						{error ? <p className="form-error">{error}</p> : null}
						{message ? <p className="form-success">{message}</p> : null}
						<button className="btn primary" type="submit">Create task</button>
					</form>
				</section>
			) : null}

			<section className="panel-card">
				<div className="panel-header">
					<h2>Tasks</h2>
				</div>
				<div className="stack-list">
					{tasks.map((task) => {
						const overdue = task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date();

						return (
							<article className="list-item task-item" key={task._id}>
								<div>
									<h3>{task.title}</h3>
									<p>
										{task.project?.title || "No project"} · {task.assignedTo?.name || "Unassigned"}
									</p>
									<div className="inline-meta">
										<span className={overdue ? "pill danger" : "pill"}>
											{overdue ? `Overdue · ${new Date(task.dueDate).toLocaleDateString()}` : task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
										</span>
										<span className="pill">{task.priority}</span>
									</div>
								</div>

								<div className="task-actions">
									<select value={task.status} onChange={(event) => updateTaskStatus(task._id, event.target.value)}>
										{Object.entries(statusLabels).map(([value, label]) => (
											<option key={value} value={value}>{label}</option>
										))}
									</select>
									<span className="pill">{statusLabels[task.status] || task.status}</span>
								</div>
							</article>
						);
					})}
				</div>
			</section>
		</section>
	);
};

export default Tasks;
