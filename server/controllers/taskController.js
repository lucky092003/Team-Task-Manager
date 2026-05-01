import Task from "../models/Task.js";
import Project from "../models/Project.js";

const canManageTask = (task, req) =>
	req.user.role === "admin" || String(task.createdBy) === req.user.id || String(task.assignedTo) === req.user.id;
const allowedTaskStatuses = new Set(["todo", "in-progress", "done", "blocked"]);
const allowedTaskPriorities = new Set(["low", "medium", "high"]);

const parseDueDate = (dueDate) => {
	if (dueDate === null || dueDate === undefined || dueDate === "") {
		return { value: undefined };
	}

	const parsedDate = new Date(dueDate);
	if (Number.isNaN(parsedDate.getTime())) {
		return { error: "Invalid due date" };
	}

	return { value: parsedDate };
};

const populateTask = (taskQuery) => taskQuery
	.populate("project", "title status")
	.populate("assignedTo", "name email role")
	.populate("createdBy", "name email role");

export const listTasks = async (req, res) => {
	const filter = req.user.role === "admin"
		? {}
		: { $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }] };

	const tasks = await populateTask(Task.find(filter).sort({ createdAt: -1 }));
	res.json(tasks);
};

export const createTask = async (req, res) => {
	const { title, description = "", project, assignedTo = null, status = "todo", priority = "medium", dueDate = null } = req.body;

	if (!title || !project) {
		return res.status(400).json({ msg: "Task title and project are required" });
	}

	if (!title.trim()) {
		return res.status(400).json({ msg: "Task title cannot be empty" });
	}

	if (!allowedTaskStatuses.has(status)) {
		return res.status(400).json({ msg: "Invalid task status" });
	}

	if (!allowedTaskPriorities.has(priority)) {
		return res.status(400).json({ msg: "Invalid task priority" });
	}

	const dueDateValidation = parseDueDate(dueDate);
	if (dueDateValidation.error) {
		return res.status(400).json({ msg: dueDateValidation.error });
	}

	const projectDoc = await Project.findById(project);
	if (!projectDoc) {
		return res.status(404).json({ msg: "Project not found" });
	}

	if (assignedTo && !projectDoc.members.some((memberId) => String(memberId) === String(assignedTo))) {
		return res.status(400).json({ msg: "Assigned user must be a member of the selected project" });
	}

	const task = await Task.create({
		title: title.trim(),
		description: description.trim(),
		project,
		assignedTo: assignedTo || undefined,
		createdBy: req.user.id,
		status,
		priority,
		dueDate: dueDateValidation.value
	});

	const populatedTask = await populateTask(task);
	res.status(201).json(populatedTask);
};

export const updateTask = async (req, res) => {
	const task = await Task.findById(req.params.id);

	if (!task) {
		return res.status(404).json({ msg: "Task not found" });
	}

	if (!canManageTask(task, req)) {
		return res.status(403).json({ msg: "You are not allowed to update this task" });
	}

	const projectDoc = await Project.findById(task.project);

	const { title, description, assignedTo, status, priority, dueDate } = req.body;

	if (title !== undefined) {
		if (!title.trim()) {
			return res.status(400).json({ msg: "Task title cannot be empty" });
		}
		task.title = title.trim();
	}
	if (description !== undefined) task.description = description.trim();
	if (status !== undefined) {
		if (!allowedTaskStatuses.has(status)) {
			return res.status(400).json({ msg: "Invalid task status" });
		}
		task.status = status;
	}
	if (priority !== undefined) {
		if (!allowedTaskPriorities.has(priority)) {
			return res.status(400).json({ msg: "Invalid task priority" });
		}
		task.priority = priority;
	}
	if (dueDate !== undefined) {
		const dueDateValidation = parseDueDate(dueDate);
		if (dueDateValidation.error) {
			return res.status(400).json({ msg: dueDateValidation.error });
		}
		task.dueDate = dueDateValidation.value || null;
	}

	if (assignedTo !== undefined) {
		if (assignedTo && projectDoc && !projectDoc.members.some((memberId) => String(memberId) === String(assignedTo))) {
			return res.status(400).json({ msg: "Assigned user must be a member of the selected project" });
		}
		task.assignedTo = assignedTo || undefined;
	}

	await task.save();
	const populatedTask = await populateTask(task);
	res.json(populatedTask);
};

export const deleteTask = async (req, res) => {
	const task = await Task.findById(req.params.id);

	if (!task) {
		return res.status(404).json({ msg: "Task not found" });
	}

	if (!canManageTask(task, req)) {
		return res.status(403).json({ msg: "You are not allowed to delete this task" });
	}

	await task.deleteOne();
	res.json({ msg: "Task deleted" });
};
