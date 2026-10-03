import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * One document per user — this intentionally mirrors the shape the
 * client already keeps in `AppContext`'s `data` object (tasks, events,
 * notes, documents, transactions, assistantMessages, theme, focusTaskId).
 *
 * Item fields are typed loosely (Mixed) on purpose: the client owns the
 * exact shape of a task/event/note/etc., and it can evolve (new fields,
 * subtasks, colors, ...) without requiring a matching schema migration
 * here. This endpoint is a per-user save slot, not a place that needs to
 * validate business rules about what a "task" is.
 */
const workspaceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    focusTaskId: {
      type: Schema.Types.Mixed,
      default: null,
    },
    assistantMessages: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    tasks: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    events: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    notes: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    documents: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    transactions: {
      type: [Schema.Types.Mixed],
      default: [],
    },
  },
  { timestamps: true }
);

workspaceSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    theme: this.theme,
    focusTaskId: this.focusTaskId,
    assistantMessages: this.assistantMessages,
    tasks: this.tasks,
    events: this.events,
    notes: this.notes,
    documents: this.documents,
    transactions: this.transactions,
  };
};

export default mongoose.models.Workspace ||
  mongoose.model("Workspace", workspaceSchema);