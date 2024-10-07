import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  iframeNo: {
    type: Number,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  timeFrame: {
    type: Number,
    required: true,
  },
  textContent: {
    type: String,
    required: true,
  },
});

const bannerSchema = new mongoose.Schema({
  bannerSize: {
    type: String,
    required: true,
  },
  bannerLink: {
    type: String,
    required: true,
  },
});

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
    minlength: 3,
  },
  projectId: {
    type: mongoose.Schema.Types.Mixed,
  },
  version: {
    type: [String],
  },
  banners: [bannerSchema],
  comments: {
    type: [commentSchema],
    default: [],
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  __v: {
    type: Number,
  },
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
