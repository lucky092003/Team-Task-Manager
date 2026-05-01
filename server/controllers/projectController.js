import Project from "../models/Project.js";
import User from "../models/User.js";

const canManageProject = (project, req) => req.user.role === "admin" || String(project.createdBy) === req.user.id;
const allowedProjectStatuses = new Set(["active", "on-hold", "completed"]);

export const listProjects = async (req, res) => {
	const filter = req.user.role === "admin"
		? {}
		: { $or: [{ createdBy: req.user.id }, { members: req.user.id }] };

	const projects = await Project.find(filter)
		.populate("members", "name email role")
		.populate("createdBy", "name email role")
		.sort({ createdAt: -1 });

	res.json(projects);
};

export const createProject = async (req, res) => {
	const { title, description = "", members = [], status = "active" } = req.body;

	if (!title || !title.trim()) {
		return res.status(400).json({ msg: "Project title is required" });
	}

	if (!allowedProjectStatuses.has(status)) {
		return res.status(400).json({ msg: "Invalid project status" });
	}

	const uniqueMemberIds = [...new Set(Array.isArray(members) ? members.filter(Boolean) : [])];
	if (uniqueMemberIds.length) {
		const validMembers = await User.find({ _id: { $in: uniqueMemberIds } }).select("_id");
		if (validMembers.length !== uniqueMemberIds.length) {
			return res.status(400).json({ msg: "One or more project members are invalid" });
		}
	}

	const project = await Project.create({
		title: title.trim(),
		description: description.trim(),
		status,
		members: uniqueMemberIds,
		createdBy: req.user.id
	});

	const populatedProject = await project.populate("members", "name email role");
	res.status(201).json(populatedProject);
};

export const updateProject = async (req, res) => {
	const project = await Project.findById(req.params.id);

	if (!project) {
		return res.status(404).json({ msg: "Project not found" });
	}

	if (!canManageProject(project, req)) {
		return res.status(403).json({ msg: "You are not allowed to update this project" });
	}

	const { title, description, members, status } = req.body;

	if (title !== undefined) {
		if (!title.trim()) {
			return res.status(400).json({ msg: "Project title cannot be empty" });
		}
		project.title = title.trim();
	}
	if (description !== undefined) project.description = description.trim();
	if (status !== undefined) {
		if (!allowedProjectStatuses.has(status)) {
			return res.status(400).json({ msg: "Invalid project status" });
		}
		project.status = status;
	}

	if (members !== undefined) {
		const uniqueMemberIds = [...new Set(Array.isArray(members) ? members.filter(Boolean) : [])];
		if (uniqueMemberIds.length) {
			const validMembers = await User.find({ _id: { $in: uniqueMemberIds } }).select("_id");
			if (validMembers.length !== uniqueMemberIds.length) {
				return res.status(400).json({ msg: "One or more project members are invalid" });
			}
		}
		project.members = uniqueMemberIds;
	}

	await project.save();
	const populatedProject = await project.populate("members", "name email role").populate("createdBy", "name email role");
	res.json(populatedProject);
};

export const deleteProject = async (req, res) => {
	const project = await Project.findById(req.params.id);

	if (!project) {
		return res.status(404).json({ msg: "Project not found" });
	}

	if (!canManageProject(project, req)) {
		return res.status(403).json({ msg: "You are not allowed to delete this project" });
	}

	await project.deleteOne();
	res.json({ msg: "Project deleted" });
};
