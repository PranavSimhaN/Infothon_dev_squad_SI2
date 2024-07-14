import {
  Alert,
  Button,
  Label,
  Spinner,
  TextInput,
  Select,
} from "flowbite-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

export default function Home() {
  const { currentUser } = useSelector((state) => state.user);
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get("/api/user/getallnews");
        setNews(response.data);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  return !currentUser ? (
    <div className="pb-20 mt-20">
      <div className="flex-row p-5 max-w-3xl mx-auto md:flex-row md:items-center gap-5">
        {/* left */}
        <div className="flex-1">
          <Link to="/" className="font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-purple-500 via-purple-500 to-purple-500 rounded-lg text-white">
              IRIS
            </span>
            VVCE
          </Link>
          <p className="text-xl mt-5">
            IRIS is the official student-led ERP of VVCE developed to digitize
            college administrative processes and various academic and
            non-academic activities.
          </p>
        </div>
        <h1 className="font-bold dark:text-white text-6xl p-5">
          Welcome <span className="text-xl">(Please sign in)</span>
        </h1>
        <div className="flex flex-wrap gap-10 mt-5 p-5">
          <Link to="/sign-in">
            <Button gradientDuoTone="purpleToBlue" className="w-64">
              Sign In
            </Button>
          </Link>
          <Link to="/sign-up">
            <Button gradientDuoTone="purpleToBlue" className="w-64">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  ) : (
    <div className="pb-20 mt-20">
      <div className="flex-row p-5 max-w-3xl mx-auto md:flex-row md:items-center gap-5">
        {/* left */}
        <div className="flex-1">
          <Link to="/" className="font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-purple-500 via-purple-500 to-purple-500 rounded-lg text-white">
              IRIS
            </span>
            VVCE
          </Link>
          <p className="text-xl mt-5">
            IRIS is the official student-led ERP of VVCE developed to digitize
            college administrative processes and various academic and
            non-academic activities.
          </p>
        </div>
        <h1 className="font-bold dark:text-white text-6xl p-5">
          Welcome, <span className="text-4xl">{currentUser.username}</span>
        </h1>
        <div className="flex flex-wrap gap-10 mt-5 pb-2">
          <Link to="/dashboard?tab=profile">
            <Button gradientDuoTone="purpleToBlue" className="w-64">
              Your Dashboard
            </Button>
          </Link>
        </div>
        <div className="flex flex-col md:flex-row px-10 pt-10 max-w-3xl mx-auto gap-5">
          <div className="flex-1">
            <h1 className="font-bold dark:text-white text-3xl p-5">News:</h1>
            {news.map((newsItem) => (
              <a
                key={newsItem._id}
                href={newsItem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-5 mb-3 text-base font-medium text-gray-500 rounded-lg bg-gray-50 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <span className="w-full">{newsItem.sentence}</span>
                <svg
                  className="w-4 h-4 ms-2 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </a>
            ))}
          </div>
          {/* right */}
          
        </div>
      </div>
    </div>
  );
}
