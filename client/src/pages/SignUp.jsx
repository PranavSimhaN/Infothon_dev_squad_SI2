import {
  Alert,
  Button,
  Label,
  Spinner,
  TextInput,
  Select,
} from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import User from "../../../api/models/user.model";

const departments = ["ECE", "CS", "IT", "MECH", "EEE", "AI", "CHEM", "CIVIL"];
const programs = ["B-TECH", "M-TECH", "MBA", "PHD"];

export default function SignUp() {
  const [student, setstudent] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    department: "",
    program: "",
    confirmPassword: "",
    role: "user",
  });
  const [formData1, setFormData1] = useState({
    username: "",
    email: "",
    password: "",
    department: "",
    program: "",
    confirmPassword: "",
    role: "faculty",
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === "username") {
      setFormData({ ...formData, [id]: value });
    } else {
      setFormData({ ...formData, [id]: value.trim() });
    }
  };

  const handleChange1 = (e) => {
    const { id, value } = e.target;
    if (id === "username") {
      setFormData1({ ...formData1, [id]: value });
    } else {
      setFormData1({ ...formData1, [id]: value.trim() });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.department ||
      !formData.program
    ) {
      console.log(formData);
      return setErrorMessage("Please fill out all fields.");
    }
    if (formData.password !== formData.confirmPassword) {
      return setErrorMessage("Passwords do not match.");
    }
    try {
      setLoading(true);
      setErrorMessage(null);

      // Register student user

      const resStudent = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const dataStudent = await resStudent.json();

      if (!resStudent.ok) {
        setLoading(false);
        return setErrorMessage(
          dataStudent.message || "Error signing up student"
        );
      }

      const res = await fetch(`/api/user/${formData.email}/get-student`);
      const data = await res.json();
      setstudent(data);
      console.log(data);
      if (!data) {
        console.error("Error fetching user");
      }

      // Modify email and username for parent user
      const parentData = {
        ...formData,
        role: "parent",
        email: `${formData.email.split("@")[0]}_parent@${
          formData.email.split("@")[1]
        }`,
        username: `${formData.username}'s Parent`,
        parentemail: data[0]._id,
      };

      // Register parent user
      const resParent = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parentData),
      });

      const dataParent = await resParent.json();
      setLoading(false);

      if (!resParent.ok) {
        return setErrorMessage(dataParent.message || "Error signing up parent");
      }

      navigate("/sign-in");
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };
  const handleSubmit1 = async (e) => {
    e.preventDefault();
    if (
      !formData1.username ||
      !formData1.email ||
      !formData1.password ||
      !formData1.department ||
      !formData1.program
    ) {
      console.log(formData);
      return setErrorMessage("Please fill out all fields.");
    }
    if (formData1.password !== formData1.confirmPassword) {
      return setErrorMessage("Passwords do not match.");
    }
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData1),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        return setErrorMessage(data.message || "Error signing up");
      }
      navigate("/sign-in");
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  const [state, setState] = useState(1);

  const action = (index) => {
    setState(index);
  };

  return (
    <div className="pb-20 mt-20">
      <div className="flex p-5 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* left */}
        <div className="flex-1">
          <Link to="/" className="font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-purple-500 via-purple-500 to-purple-500 rounded-lg text-white">
              IRIS
            </span>
            VVCE
          </Link>
          <p className="text-xl mt-5">
            Register as Student/Faculty by filling out the form.
          </p>
        </div>
        {/* right */}

        <div className="flex-1">
          <div className="justify-center items-center">
            <div className="tabs flex">
              <div
                onClick={() => action(1)}
                className={`${
                  state === 1
                    ? "tab active-tab rounded mr-4"
                    : "tab rounded mr-4"
                }`}
              >
                Student
              </div>
              <div
                onClick={() => action(2)}
                className={`${
                  state === 2 ? "tab active-tab rounded" : "tab rounded"
                }`}
              >
                Faculty
              </div>
            </div>

            <div className="contents">
              <div
                className={`${
                  state === 1 ? "content active-content" : "content"
                }`}
              >
                <form
                  className="flex flex-col gap-4 pt-3"
                  onSubmit={handleSubmit}
                >
                  <div>
                    <Label value="Your Full-name" />
                    <TextInput
                      type="text"
                      placeholder="Full-name"
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="max-w-md">
                    <div className="mb-2 block max-w-md">
                      <Label value="Select your department" />
                    </div>
                    <Select
                      id="department"
                      value={formData.department}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      {departments.map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </Select>

                    <div className="mt-4 mb-2 block max-w-md">
                      <Label value="Select your program" />
                    </div>
                    <Select
                      id="program"
                      value={formData.program}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      {programs.map((program) => (
                        <option key={program} value={program}>
                          {program}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label value="Your email" />
                    <TextInput
                      type="email"
                      placeholder="name@.edu.in"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label value="Your password" />
                    <TextInput
                      type="password"
                      placeholder="Password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label value="Your password" />
                    <TextInput
                      type="password"
                      placeholder="Re-enter Password"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  <Button
                    gradientDuoTone="purpleToPink"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" />
                        <span className="pl-3">Loading...</span>
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </div>
              <div
                className={`${
                  state === 2 ? "content active-content" : "content"
                }`}
              >
                <form
                  className="flex flex-col gap-4 pt-3"
                  onSubmit={handleSubmit1}
                >
                  <div>
                    <Label value="Your username" />
                    <TextInput
                      type="text"
                      placeholder="Username"
                      id="username"
                      value={formData1.username}
                      onChange={handleChange1}
                    />
                  </div>
                  <div className="max-w-md">
                    <div className="mb-2 block">
                      <Label value="Select your department" />
                    </div>
                    <Select
                      id="department"
                      value={formData1.department}
                      onChange={handleChange1}
                    >
                      <option value="">Select</option>
                      {departments.map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </Select>

                    <div className="mt-4 mb-2 block">
                      <Label value="Select your program" />
                    </div>
                    <Select
                      id="program"
                      value={formData1.program}
                      onChange={handleChange1}
                    >
                      <option value="">Select</option>
                      {programs.map((program) => (
                        <option key={program} value={program}>
                          {program}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label value="Your email" />
                    <TextInput
                      type="email"
                      placeholder="name@vvce.edu.in"
                      id="email"
                      value={formData1.email}
                      onChange={handleChange1}
                    />
                  </div>
                  <div>
                    <Label value="Your password" />
                    <TextInput
                      type="password"
                      placeholder="Password"
                      id="password"
                      value={formData1.password}
                      onChange={handleChange1}
                    />
                  </div>
                  <div>
                    <Label value="Your password" />
                    <TextInput
                      type="password"
                      placeholder="Re-enter Password"
                      id="confirmPassword"
                      value={formData1.confirmPassword}
                      onChange={handleChange1}
                    />
                  </div>
                  <Button
                    gradientDuoTone="purpleToPink"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" />
                        <span className="pl-3">Loading...</span>
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>

          <div className="flex gap-2 text-sm mt-5">
            <span>Have an account?</span>
            <Link to="/sign-in" className="text-blue-500">
              Sign In
            </Link>
          </div>
          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
