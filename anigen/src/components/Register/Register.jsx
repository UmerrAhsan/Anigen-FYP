import React, { useState } from "react";
import axios from "axios";
const Register = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const registerUser = (e) => {
    e.preventDefault();
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const { name, email, password, confirmPassword } = user;
    if (!(name && email && password)) {
      setSuccess(false);
      setMessage("All fields are required");
    } else {
      if (!emailPattern.test(email)) {
        setSuccess(false);
        setMessage("Invalid email format");
      } else if (password.length < 8) {
        setSuccess(false);
        setMessage("Password should be atleast 8 character long!");
      } else if (password !== confirmPassword) {
        setSuccess(false);
        setMessage("Password and confirm password do not match!");
      } else if (name && email && password && password === confirmPassword) {
        setMessage("");
        axios
          .post(process.env.REACT_APP_BACKENDURL + "/r", user)
          .then((res) => {
            if (res.data.message === "Successfully Registered") {
              setSuccess(true);
              setMessage("Signup successful!");
            } else if (res.data.message === "User already registered") {
              setSuccess(false);
              setMessage("User Already Exists");
            }
          })
          .catch((err) => {
            console.log(err);
            setSuccess(false);
            setMessage("Network Error");
          });
      } else {
        setSuccess(false);
        setMessage("Error");
      }
    }
  };
  return (
    <div>
      <div className="container shadow my-5">
        <div className="row">
          <div className="col-md-6 mt-5">
            <img
              src="/assets/bbb.jpg"
              alt="Contact"
              className="mt-5"
              style={{ position: "relative", top: "-4%", width: "105%" }}
            />
          </div>
          <div className="col-md-6 p-5">
            <h1 className="display-6 fw-bolder mb-5">Register</h1>
            {message && (
              <div
                className={`alert alert-${success ? "success" : "danger"}`}
                role="alert"
              >
                {message}
              </div>
            )}
            <form>
              <div class="mb-3">
                <label for="exampleInputName" class="form-label">
                  Name
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="exampleInputName"
                  name="name"
                  style={{ width: "87%" }}
                  value={user.name}
                  placeholder="Your Name"
                  onChange={handleChange}
                />
              </div>
              <div class="mb-3">
                <label for="exampleInputEmail1" class="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  class="form-control"
                  id="exampleInputEmail1"
                  style={{ width: "87%" }}
                  aria-describedby="emailHelp"
                  name="email"
                  value={user.email}
                  placeholder="Your Email"
                  onChange={handleChange}
                />
              </div>
              <div class="mb-3">
                <label for="exampleInputPassword1" class="form-label">
                  Password
                </label>
                <input
                  type="password"
                  class="form-control"
                  id="exampleInputPassword1"
                  style={{ width: "87%" }}
                  name="password"
                  value={user.password}
                  placeholder="Your Password"
                  onChange={handleChange}
                />
              </div>
              <div class="mb-3">
                <label for="exampleInputPassword2" class="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  class="form-control"
                  id="exampleInputPassword2"
                  name="confirmPassword"
                  style={{ width: "87%" }}
                  value={user.confirmPassword}
                  placeholder="Confirm Password"
                  onChange={handleChange}
                />
              </div>
              <button
                type="submit"
                class="btn btn-primary"
                onClick={registerUser}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
