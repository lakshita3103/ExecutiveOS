import Workspace from "../models/Workspace.js";
import asyncHandler from "../utils/asyncHandler.js";

const WORKSPACE_FIELDS = [
  "theme",
  "focusTaskId",
  "assistantMessages",
  "tasks",
  "events",
  "notes",
  "documents",
  "transactions",
];

export const getWorkspace = asyncHandler(async (req, res) => {
  let workspace = await Workspace.findOne({ user: req.userId });

  // Defensive: a user created before this endpoint existed, or one whose
  // workspace doc was somehow lost, still gets a working (empty) one
  // instead of a 404 the client would have to special-case.
  if (!workspace) {
    workspace = await Workspace.create({ user: req.userId });
  }

  res.json(workspace.toPublicJSON());
});

export const saveWorkspace = asyncHandler(async (req, res) => {
  const updates = {};
  for (const field of WORKSPACE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const workspace = await Workspace.findOneAndUpdate(
    { user: req.userId },
    { $set: updates },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.json(workspace.toPublicJSON());
});

export default { getWorkspace, saveWorkspace };