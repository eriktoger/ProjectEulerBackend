const supertest = require("supertest");
const assert = require("assert");
const app = require("../app");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const mongoose = require("mongoose");
const db = process.env.DATABASE_URL_TEST;
const connectDB = require("../db");

describe("Should not pass the middle wear", function () {
  let myToken;
  let payload;
  before(async function () {
    payload = {
      admin: {
        isSuperAdmin: false,
      },
    };

    await jwt.sign(payload, JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
      if (err) {
        throw err;
      } else {
        myToken = token;
      }
    });
  });

  it("it should get 401 because it lacks auth", function (done) {
    supertest(app)
      .get("/admin")
      .expect(401)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        done();
      });
  });

  it("it should get 401 because it lacks auth", function (done) {
    supertest(app)
      .patch("/admin")
      .expect(401)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        done();
      });
  });

  it("it should get 401 because it lacks superauth", function (done) {
    supertest(app)
      .get("/admin")
      .set({ "x-auth-token": myToken })
      .expect(401)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        done();
      });
  });

  it("it should get 401 because it lacks superauth", function (done) {
    supertest(app)
      .post("/admin")
      .set({ "x-auth-token": myToken })
      .expect(401)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        done();
      });
  });

  it("it should get 401 because it lacks superauth", function (done) {
    supertest(app)
      .delete("/admin/1")
      .set({ "x-auth-token": myToken })
      .expect(401)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        done();
      });
  });

  it("it should get 401 because it lacks superauth", function (done) {
    supertest(app)
      .patch("/admin/1")
      .set({ "x-auth-token": myToken })
      .expect(401)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        done();
      });
  });
});

describe("Needs DB and JWT", function () {
  let myToken;
  let payload;
  before(async function () {
    payload = {
      admin: {
        isSuperAdmin: true,
      },
    };

    await jwt.sign(payload, JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
      if (err) {
        throw err;
      } else {
        myToken = token;
      }
    });

    await connectDB(db);
  });

  after(async function () {
    // runs once after the last test in this block
    await mongoose.connection.close();
  });

  it("it should get 200 and array of admins", async function () {
    await supertest(app)
      .get("/admin")
      .set({ "x-auth-token": myToken })
      .expect(200)
      .then((res) => {
        assert.strictEqual(res.body[0].name, "erik");
      });
  });

  it("Add, Login, Change Password, Toggle isSuperAdmin and Remove Admin", async function () {
    let id;
    let newToken;
    await supertest(app)
      .post("/admin")
      .set({ "x-auth-token": myToken })
      .send({ name: "erik2", password: "erik2", isSuperAdmin: true })
      .expect(200)
      .then((res) => {
        id = res.body.id;
        assert.strictEqual(res.body.msg, "Admin created");
      });

    await supertest(app)
      .post("/admin/login")
      .send({ name: "erik2", password: "erik2" })
      .expect(200)
      .then((res) => {
        newToken = res.body.token;
      });

    await supertest(app)
      .patch(`/admin/${id}`)
      .set({ "x-auth-token": myToken })
      .expect(200)
      .then((res) => {
        assert.strictEqual(res.body.msg, "Is super admin toggled");
        assert.strictEqual(res.body.isSuperAdmin, false);
      });

    await supertest(app)
      .patch("/admin")
      .set({ "x-auth-token": newToken, admin: { id } })
      .send({ name: "erik2", password: "erik2" })
      .expect(200)
      .then((res) => {
        assert.strictEqual(res.body.msg, "Password changed");
      });

    await supertest(app)
      .delete(`/admin/${id}`)
      .set({ "x-auth-token": myToken })
      .expect(200)
      .then((res) => {
        assert.strictEqual(res.body.msg, "Admin deleted");
      });
  });
});
