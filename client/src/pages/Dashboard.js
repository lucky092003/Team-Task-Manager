import { useContext, useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const statusLabels = {
	todo: "To do",
	"in-progress": "In progress",
	done: "Done",
	blocked: "Blocked"
};

const Dashboard = () => {
	const { user } = useContext(AuthContext);
	const [projects, setProjects] = useState([]);
	const [tasks, setTasks] = useState([]);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadDashboard = async () => {
			try {
				const [projectRes, taskRes] = await Promise.all([
					API.get("/projects"),
					API.get("/tasks")
				]);

				setProjects(projectRes.data);
				setTasks(taskRes.data);
			} catch {
				setError("Unable to load dashboard data");
			}
		};

		loadDashboard();
	}, []);

	const overdueTasks = useMemo(
		() => tasks.filter((task) => task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date()),
		[tasks]
	);

	const statusCounts = useMemo(() => {
		return tasks.reduce((accumulator, task) => {
			accumulator[task.status] = (accumulator[task.status] || 0) + 1;
			return accumulator;
		}, {});
	}, [tasks]);

	return (
		<section className="page-grid">
			<div className="hero-card">
				<p className="eyebrow">Dashboard</p>
				<h1>Project overview.</h1>
				<p className="muted">
					{user ? `Signed in: ${user.name} (${user.role})` : "See status and overdue tasks."}
				</p>
			</div>

			{error ? <div className="notice error">{error}</div> : null}

			<div className="stats-grid">
				<article className="stat-card"><span>Projects</span><strong>{projects.length}</strong></article>
				<article className="stat-card"><span>Tasks</span><strong>{tasks.length}</strong></article>
				<article className="stat-card"><span>Overdue</span><strong>{overdueTasks.length}</strong></article>
				<article className="stat-card"><span>Done</span><strong>{statusCounts.done || 0}</strong></article>
			</div>

			<div className="two-column-layout">
				<section className="panel-card">
					<div className="panel-header">
						<h2>Status</h2>
					</div>
					<div className="status-list">
						{Object.entries(statusLabels).map(([status, label]) => (
							<div key={status} className="status-row">
								<span>{label}</span>
								<strong>{statusCounts[status] || 0}</strong>
							</div>
						))}
					</div>
				</section>

				<section className="panel-card">
					<div className="panel-header">
						<h2>Overdue</h2>
					</div>
					{overdueTasks.length ? (
						<div className="stack-list">
							{overdueTasks.map((task) => (
								<article className="list-item" key={task._id}>
									<div>
										<h3>{task.title}</h3>
										<p>{task.project?.title || "Unassigned project"}</p>
									</div>
									<span className="pill danger">Due {new Date(task.dueDate).toLocaleDateString()}</span>
								</article>
							))}
						</div>
					) : <p className="muted">No overdue tasks.</p>}
				</section>
			</div>

			<section className="panel-card">
				<div className="panel-header">
					<h2>Latest tasks</h2>
				</div>
				<div className="stack-list">
					{tasks.slice(0, 5).map((task) => (
						<article className="list-item" key={task._id}>
							<div>
								<h3>{task.title}</h3>
								<p>
									{task.project?.title || "No project"} · {task.assignedTo?.name || "Unassigned"}
								</p>
							</div>
							<span className="pill">{statusLabels[task.status] || task.status}</span>
						</article>
					))}
				</div>
			</section>
		</section>
	);
};

export default Dashboard;
