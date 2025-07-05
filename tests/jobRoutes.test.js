const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");

describe("Job Routes", () => {
    it("should respond with 401 Unauthorized if no token is provided", async () => {
        const res = await request(app).get("/api/jobs");
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("message", "Unauthorized: No token provided");
    });
});

describe("Authenticated Job Actions", () => {
  let token;

  beforeAll(async () => {
    // Register a user
    await request(app).post("/api/auth/register").send({
      name: "TestUser",
      email: "testuser@example.com",
      password: "test1234"
    });

    // Log in and store token
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "test1234"
    });
    token = res.body.token;
  });

  beforeEach(async () => {
    // Clean jobs collection before each test
    await mongoose.connection.collection("jobs").deleteMany({});
  });

  afterAll(async () => {
    // Clean up database and close connection
    await mongoose.connection.collection("users").deleteMany({});
    await mongoose.connection.collection("jobs").deleteMany({});
    await mongoose.connection.close();
  });

  it("should create a job when authenticated", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        position: "Software Engineer",
        company: "TechCorp",
        location: "Remote",
        status: "applied"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("position", "Software Engineer");
  });

  it("should return all jobs for the authenticated user", async () => {
    await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        position: "QA Engineer",
        company: "TestCo",
        location: "Onsite",
        status: "applied"
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
        status: "applied"
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
        status: "applied"
      });

    const jobId = createRes.body._id;

    const deleteRes = await request(app)
      .delete(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty("message", "Job deleted successfully");
  });
});
