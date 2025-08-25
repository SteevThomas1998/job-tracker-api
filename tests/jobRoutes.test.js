// tests/jobRoutes.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const { connectDB, disconnectDB } = require("../config/db"); // export these
const User = require("../models/User"); // adjust path/name to your model
const Job = require("../models/Jobs");   // adjust path/name to your model

describe("Job Routes", () => {
  const unique = Date.now();
  const creds = {
    name: "TestUser",
    email: `testuser+${unique}@example.com`,
    password: "test1234",
  };
  let token;

  beforeAll(async () => {
    // Ensure we are on the test DB
    if (!process.env.MONGO_URL && !process.env.MONGO_URI) {
      throw new Error("MONGO_URL not set for tests");
    }
    await connectDB(); // connects to process.env.MONGO_URL
    // Clean relevant collections (start fresh)
    await Promise.all([User.deleteMany({}), Job.deleteMany({})]);

    // Register user
    const reg = await request(app).post("/api/auth/register").send(creds);
    expect([200, 201]).toContain(reg.statusCode);

    // Login
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: creds.email, password: creds.password });

    expect(login.statusCode).toBe(200);
    expect(login.body).toHaveProperty("token");
    token = login.body.token;
  });

  afterAll(async () => {
    await Promise.all([User.deleteMany({}), Job.deleteMany({})]);
    await disconnectDB(); // closes mongoose connection
  });

  it("should respond 401 Unauthorized if no token is provided", async () => {
    const res = await request(app).get("/api/jobs");
    expect(res.statusCode).toBe(401);
    // Keep message assertion only if your middleware matches this string exactly
    // expect(res.body).toHaveProperty("message", "Unauthorized: No token provided");
  });

  it("should create a job when authenticated", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        position: "Software Engineer",
        company: "TechCorp",
        location: "Remote",
        status: "applied",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      position: "Software Engineer",
      company: "TechCorp",
      location: "Remote",
      status: "applied",
    });
    expect(res.body).toHaveProperty("_id");
  });

  it("should return all jobs for the authenticated user", async () => {
    await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        position: "QA Engineer",
        company: "TestCo",
        location: "Onsite",
        status: "applied",
      });

    const res = await request(app)
      .get("/api/jobs")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should update a job for the authenticated user", async () => {
    const createRes = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        position: "Frontend Developer",
        company: "Webify",
        location: "Hybrid",
        status: "applied",
      });

    const jobId = createRes.body._id;

    const updateRes = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "interviewing" });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toHaveProperty("status", "interviewing");
  });

  it("should delete a job for the authenticated user", async () => {
    const createRes = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        position: "DevOps Engineer",
        company: "InfraCorp",
        location: "Remote",
        status: "applied",
      });

    const jobId = createRes.body._id;

    const deleteRes = await request(app)
      .delete(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty("message"); // keep flexible
  });
});