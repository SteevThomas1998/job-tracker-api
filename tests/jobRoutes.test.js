// tests/jobRoutes.test.js
const request = require("supertest");
const app = require("../server");
const { connectDB, disconnectDB } = require("../config/db");
const User = require("../models/User");
const Job = require("../models/Jobs");

describe("Job Routes", () => {
  const unique = Date.now();
  const creds = {
    name: "TestUser",
    email: `testuser+${unique}@example.com`,
    password: "test1234",
  };
  let token;

  beforeAll(async () => {
    if (!process.env.MONGO_URL && !process.env.MONGO_URI) {
      throw new Error("MONGO_URL not set for tests");
    }
    await connectDB();

    // start clean
    await Promise.all([User.deleteMany({}), Job.deleteMany({})]);

    // register
    const reg = await request(app).post("/api/auth/register").send(creds);
    expect([200, 201]).toContain(reg.statusCode);

    // login
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: creds.email, password: creds.password });

    expect(login.statusCode).toBe(200);
    expect(login.body).toHaveProperty("token");
    token = login.body.token;
  });

  afterAll(async () => {
    await Promise.all([User.deleteMany({}), Job.deleteMany({})]);
    await disconnectDB();
  });

  it("should respond 401 Unauthorized if no token is provided", async () => {
    const res = await request(app).get("/api/jobs");
    expect(res.statusCode).toBe(401);
    // If your middleware returns a specific message, you can assert it here.
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
        description: "First job",
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

  it("should return paginated jobs for the authenticated user", async () => {
    // create another job to ensure list has > 0
    await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        position: "QA Engineer",
        company: "TestCo",
        location: "Onsite",
        status: "applied",
        description: "Second job",
      });

    const res = await request(app)
      .get("/api/jobs")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    // ✅ API returns { items, page, limit, total }
    expect(res.body).toHaveProperty("items");
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);

    expect(res.body).toHaveProperty("page");
    expect(res.body).toHaveProperty("limit");
    expect(res.body).toHaveProperty("total");
    expect(typeof res.body.page).toBe("number");
    expect(typeof res.body.limit).toBe("number");
    expect(typeof res.body.total).toBe("number");
  });

  it("should update a job for the authenticated user", async () => {
    // create a job
    const createRes = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        position: "Frontend Developer",
        company: "Webify",
        location: "Hybrid",
        status: "applied",
        description: "Third job",
      });

    expect(createRes.statusCode).toBe(201);
    const jobId = createRes.body._id;

    // update it
    const updateRes = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "interviewing" });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toHaveProperty("_id", jobId);
    expect(updateRes.body).toHaveProperty("status", "interviewing");
  });

  it("should delete a job for the authenticated user", async () => {
    // create a job to delete
    const createRes = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        position: "DevOps Engineer",
        company: "InfraCorp",
        location: "Remote",
        status: "applied",
        description: "Fourth job",
      });

    expect(createRes.statusCode).toBe(201);
    const jobId = createRes.body._id;

    // delete it
    const deleteRes = await request(app)
      .delete(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty("message");
  });
});